import { supabase } from '../supabaseClient';
import { getCategoryPriority } from '../utils/categoryHelpers';

// ✅ UPDATED: Enhanced submitComplaint with proper field mapping
export const submitComplaint = async (formData, analysisResult, pnrDetails = null) => {
    try {
        const complaintData = {
            // ✅ FIXED: Map form fields correctly
            title: formData.title,
            description: formData.description,
            email: formData.email,
            phone: formData.phone,
            
            // ✅ FIXED: Handle location properly
            location: formData.location || 'Not specified',
            
            // ✅ FIXED: Handle PNR and journey data correctly
            train_number: pnrDetails?.trainName || formData.pnr || null,
            journey_date: pnrDetails?.journeyDate || null,
            pnr_number: formData.pnr === 'N/A' ? null : formData.pnr,
            
            // ✅ Category detection results
            detected_category: analysisResult?.category,
            detected_subcategory: analysisResult?.subcategory,
            assigned_to: analysisResult?.department,
            confidence_score: analysisResult?.confidence,
            
            // ✅ FIXED: Handle priority properly
            priority: formData.isUrgent ? 'urgent' : (getCategoryPriority(analysisResult?.category) || 'medium'),
            
            // ✅ FIXED: Set default status and user_id
            status: 'Submitted',
            user_id: null, // For anonymous complaints
            
            // ✅ Enhanced metadata
            metadata: {
                matched_keywords: analysisResult?.matchedKeywords || [],
                analysis_confidence: analysisResult?.confidence || 0,
                analysis_timestamp: new Date().toISOString(),
                auto_assigned: !!analysisResult?.category,
                is_urgent: formData.isUrgent || false,
                files_count: formData.files?.length || 0,
                has_pnr: !!(formData.pnr && formData.pnr !== 'N/A'),
                form_version: '1.0',
                submission_source: 'web_form'
            }
        };

        console.log('Submitting complaint with data:', complaintData);

        // Insert complaint
        const { data, error } = await supabase
            .from('complaints')
            .insert([complaintData])
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            throw error;
        }

        // ✅ FIXED: Add initial communication with better error handling
        try {
            await supabase
                .from('communications')
                .insert({
                    complaint_id: data.id,
                    sender_type: 'system',
                    sender_name: 'RailCare System',
                    message: `Complaint submitted successfully and assigned to ${analysisResult?.department || 'General Grievance Cell'} for processing.`,
                    created_at: new Date().toISOString()
                });
        } catch (commError) {
            console.warn('Failed to add initial communication:', commError);
        }

        // ✅ FIXED: Add initial timeline entry
        try {
            await supabase
                .from('complaint_history')
                .insert({
                    complaint_id: data.id,
                    action: 'Complaint Submitted',
                    details: `Your complaint has been successfully submitted with ID: ${data.complaint_number || data.id}`,
                    completed: true,
                    created_at: new Date().toISOString(),
                    changed_by_name: 'System'
                });

            // Add categorization timeline if auto-detected
            if (analysisResult && analysisResult.category) {
                await supabase
                    .from('complaint_history')
                    .insert({
                        complaint_id: data.id,
                        action: 'Category Assigned',
                        details: `Complaint automatically categorized as "${analysisResult.category}" and assigned to ${analysisResult.department}.`,
                        completed: true,
                        created_at: new Date().toISOString(),
                        changed_by_name: 'AI System'
                    });
            }
        } catch (historyError) {
            console.warn('Failed to add timeline entries:', historyError);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error submitting complaint:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to submit complaint. Please try again.'
        };
    }
};

// ✅ UPDATED: Enhanced getComplaints with better data handling
export const getComplaints = async () => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select(`
                *,
                communications(
                    id,
                    sender_type,
                    sender_name,
                    message,
                    created_at,
                    is_internal
                ),
                complaint_history(
                    id,
                    action,
                    details,
                    remark,
                    old_status,
                    new_status,
                    changed_by_name,
                    completed,
                    created_at
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return { success: false, error: error.message };
    }
};

// ✅ UPDATED: Enhanced getComplaintById with better error handling
// ✅ SIMPLE FIX: Only search by complaint_number
export const getComplaintById = async (complaintId) => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select(`
                *,
                communications(
                    id,
                    sender_type,
                    sender_name,
                    message,
                    created_at,
                    is_internal
                ),
                complaint_history(
                    id,
                    action,
                    details,
                    remark,
                    old_status,
                    new_status,
                    changed_by_name,
                    completed,
                    created_at
                )
            `)
            // ✅ FIXED: Only search by complaint_number field
            .eq('complaint_number', complaintId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Complaint not found' };
            }
            throw error;
        }

        // Your existing transformation code...
        const transformedData = {
            id: data.complaint_number || data.id,
            title: data.title,
            description: data.description,
            category: data.detected_category || 'General',
            subcategory: data.detected_subcategory,
            status: data.status,
            priority: data.priority,
            date: new Date(data.created_at).toLocaleDateString(),
            pnr: data.pnr_number || 'N/A',
            assignedTo: data.assigned_to,
            email: data.email,
            phone: data.phone,
            history: data.complaint_history?.map(h => ({
                action: h.action,
                details: h.details,
                remark: h.remark,
                completed: h.completed,
                date: h.created_at ? new Date(h.created_at).toLocaleDateString() : null
            })) || [],
            communications: data.communications?.map(c => ({
                sender: c.sender_name || (c.sender_type === 'user' ? 'You' : 'Support Agent'),
                message: c.message,
                time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })) || []
        };

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error fetching complaint:', error);
        return { success: false, error: error.message };
    }
};

// ✅ UPDATED: Enhanced getComplaintsByContact with better filtering
export const getComplaintsByContact = async (email, phone) => {
    try {
        // Input validation
        if (!email && !phone) {
            throw new Error('Please provide either email or phone number');
        }

        let query = supabase
            .from('complaints')
            .select(`
                *,
                communications(
                    id,
                    sender_type,
                    sender_name,
                    message,
                    created_at,
                    is_internal
                ),
                complaint_history(
                    id,
                    action,
                    details,
                    remark,
                    old_status,
                    new_status,
                    changed_by_name,
                    completed,
                    created_at
                )
            `)
            .order('created_at', { ascending: false });

        // ✅ FIXED: Better filtering logic
        if (email && phone) {
            query = query.or(`email.eq.${email},phone.eq.${phone}`);
        } else if (email) {
            query = query.eq('email', email);
        } else if (phone) {
            query = query.eq('phone', phone);
        }

        const { data, error } = await query;

        if (error) throw error;

        // ✅ FIXED: Enhanced data transformation
        const transformedData = data.map(complaint => ({
            id: complaint.complaint_number || complaint.id,
            title: complaint.title,
            description: complaint.description,
            category: complaint.detected_category || 'General',
            subcategory: complaint.detected_subcategory,
            status: complaint.status,
            priority: complaint.priority,
            date: new Date(complaint.created_at).toLocaleDateString(),
            pnr: complaint.pnr_number || 'N/A',
            assignedTo: complaint.assigned_to,
            email: complaint.email,
            phone: complaint.phone,
            
            // ✅ Transform history and communications for dashboard use
            history: complaint.complaint_history?.map(h => ({
                action: h.action,
                details: h.details,
                remark: h.remark,
                completed: h.completed,
                date: h.created_at ? new Date(h.created_at).toLocaleDateString() : null
            })) || [],
            communications: complaint.communications?.filter(c => !c.is_internal) || []
        }));

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error fetching complaints by contact:', error);
        return { success: false, error: error.message };
    }
};

// ✅ UPDATED: Enhanced updateComplaintStatus with better validation
// ✅ FIXED: Updated updateComplaintStatus function
export const updateComplaintStatus = async (complaintId, newStatus, remark, staffName) => {
    try {
        // Input validation
        if (!complaintId || !newStatus || !staffName) {
            throw new Error('Missing required parameters for status update');
        }

        // ✅ FIXED: Check if input is UUID or complaint number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(complaintId);
        
        const updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
        };

        // Set resolved timestamp for completed statuses
        if (['Resolved', 'Closed'].includes(newStatus)) {
            updateData.resolved_at = new Date().toISOString();
        }

        // ✅ FIXED: Query by appropriate field based on input format
        let query = supabase
            .from('complaints')
            .update(updateData)
            .select()
            .single();

        if (isUUID) {
            query = query.eq('id', complaintId);
        } else {
            // For complaint numbers like "RWC20250720000005"
            query = query.eq('complaint_number', complaintId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Update complaint error:', error);
            throw error;
        }

        // ✅ FIXED: Use the actual database ID for related operations
        const actualComplaintId = data.id; // This is the UUID from the database

        // Add history entry using the actual UUID
        try {
            await supabase
                .from('complaint_history')
                .insert({
                    complaint_id: actualComplaintId, // Use UUID here
                    action: 'Investigation & Resolution',
                    details: `Status updated to "${newStatus}"`,
                    remark: remark || null,
                    new_status: newStatus,
                    old_status: data.status,
                    changed_by_name: staffName,
                    completed: ['Resolved', 'Closed'].includes(newStatus),
                    created_at: new Date().toISOString()
                });
        } catch (historyError) {
            console.warn('Failed to add history entry:', historyError);
        }

        // Add communication using the actual UUID
        try {
            await supabase
                .from('communications')
                .insert({
                    complaint_id: actualComplaintId, // Use UUID here
                    sender_type: 'staff',
                    sender_name: `Support Agent (${staffName})`,
                    message: `Status updated to "${newStatus}".${remark ? ' Remark: ' + remark : ''}`,
                    is_internal: false,
                    created_at: new Date().toISOString()
                });
        } catch (commError) {
            console.warn('Failed to add communication:', commError);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating complaint status:', error);
        return { success: false, error: error.message };
    }
};
// ✅ ADD: Send message from user to staff
export const sendUserMessage = async (complaintId, message, senderName = 'You') => {
    try {
        // Get the actual complaint to find the UUID
        const complaintResult = await getComplaintById(complaintId);
        if (!complaintResult.success) {
            throw new Error('Complaint not found');
        }

        // Find the actual database record to get UUID
        const { data: complaintData, error: findError } = await supabase
            .from('complaints')
            .select('id')
            .eq('complaint_number', complaintId)
            .single();

        if (findError) throw findError;

        const { data, error } = await supabase
            .from('communications')
            .insert({
                complaint_id: complaintData.id, // Use actual UUID
                sender_type: 'user',
                sender_name: senderName,
                message: message.trim(),
                is_internal: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error sending user message:', error);
        return { success: false, error: error.message };
    }
};

// ✅ ADD: Send message from staff to user
export const sendStaffMessage = async (complaintId, message, staffName, isInternal = false) => {
    try {
        // Handle both UUID and complaint_number inputs
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(complaintId);
        
        let actualComplaintId = complaintId;
        
        if (!isUUID) {
            // Get UUID from complaint_number
            const { data: complaintData, error: findError } = await supabase
                .from('complaints')
                .select('id')
                .eq('complaint_number', complaintId)
                .single();

            if (findError) throw findError;
            actualComplaintId = complaintData.id;
        }

        const { data, error } = await supabase
            .from('communications')
            .insert({
                complaint_id: actualComplaintId,
                sender_type: 'staff',
                sender_name: `Support Agent (${staffName})`,
                message: message.trim(),
                is_internal: isInternal,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error sending staff message:', error);
        return { success: false, error: error.message };
    }
};

// ✅ ADD: Get recent messages for real-time updates
export const getRecentMessages = async (complaintId, lastMessageTime = null) => {
    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(complaintId);
        
        let query = supabase
            .from('communications')
            .select('*')
            .order('created_at', { ascending: true });

        if (isUUID) {
            query = query.eq('complaint_id', complaintId);
        } else {
            // Need to join with complaints table for complaint_number
            const { data: complaintData, error: findError } = await supabase
                .from('complaints')
                .select('id')
                .eq('complaint_number', complaintId)
                .single();

            if (findError) throw findError;
            query = query.eq('complaint_id', complaintData.id);
        }

        if (lastMessageTime) {
            query = query.gt('created_at', lastMessageTime);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error getting recent messages:', error);
        return { success: false, error: error.message };
    }
};


// ✅ NEW: Add timeline entry function
export const addTimelineEntry = async (complaintId, entry) => {
    try {
        const { error } = await supabase
            .from('complaint_history')
            .insert({
                complaint_id: complaintId,
                action: entry.action || 'Update',
                details: entry.details,
                remark: entry.remark || null,
                completed: entry.completed !== false,
                changed_by_name: entry.changedBy || 'System',
                created_at: new Date().toISOString()
            });

        return { success: !error, error: error?.message };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ✅ NEW: Health check function
export const checkConnection = async () => {
    try {
        const { error } = await supabase
            .from('complaints')
            .select('count', { count: 'exact', head: true })
            .limit(1);
            
        return { connected: !error, error: error?.message };
    } catch (err) {
        return { connected: false, error: err.message };
    }
};

// ✅ NEW: Get complaint statistics
export const getComplaintStats = async () => {
    try {
        const { data, error } = await supabase.rpc('get_complaint_stats');
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching complaint stats:', error);
        return { success: false, error: error.message };
    }
};
