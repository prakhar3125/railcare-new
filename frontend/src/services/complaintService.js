import { supabase } from '../supabaseClient';
import { getCategoryPriority } from '../utils/categoryHelpers';

// ✅ UPDATED: Enhanced submitComplaint with proper field mapping
export const submitComplaint = async (formData, analysisResult, pnrDetails = null) => {
    try {
        const complaintData = {
            // Basic complaint info
            title: formData.title,
            description: formData.description,
            email: formData.email,
            phone: formData.phone,
            location: formData.location || 'Not specified',
            
            // PNR and journey data
            train_number: pnrDetails?.trainName || formData.pnr || null,
            journey_date: pnrDetails?.journeyDate || null,
            pnr_number: formData.pnr === 'N/A' ? null : formData.pnr,
            
            // Category detection results
            detected_category: analysisResult?.category,
            detected_subcategory: analysisResult?.subcategory,
            assigned_to: analysisResult?.department,
            confidence_score: analysisResult?.confidence,
            
            // Priority and status
            priority: formData.isUrgent ? 'urgent' : (getCategoryPriority(analysisResult?.category) || 'medium'),
            status: 'Submitted',
            user_id: null, // For anonymous complaints
            
            // Enhanced metadata
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

        // Add initial communication
        try {
            await supabase
                .from('communications')
                .insert({
                    complaint_id: data.id,
                    sender_type: 'system',
                    sender_name: 'RailCare System',
                    message: `Complaint submitted successfully and assigned to ${analysisResult?.department || 'General Grievance Cell'} for processing.`,
                    is_internal: false,
                    created_at: new Date().toISOString()
                });
        } catch (commError) {
            console.warn('Failed to add initial communication:', commError);
        }

        // Add initial timeline entry
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

// ✅ FIXED: Enhanced getComplaintById with proper chat display
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
            .eq('complaint_number', complaintId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Complaint not found' };
            }
            throw error;
        }

        // ✅ FIXED: Proper data transformation with correct sender identification
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
            
            // ✅ FIXED: Proper timeline transformation
            history: data.complaint_history?.map(h => ({
                action: h.action,
                details: h.details,
                remark: h.remark,
                completed: h.completed,
                date: h.created_at ? new Date(h.created_at).toLocaleDateString() + ' at ' + new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
            })).sort((a, b) => new Date(a.date) - new Date(b.date)) || [],
            
            // ✅ FIXED: Proper communications transformation with correct sender labels
            communications: data.communications?.filter(c => !c.is_internal).map(c => ({
                sender: c.sender_type === 'user' ? 'You' : 
                       c.sender_type === 'staff' ? 'Support Agent' : 
                       c.sender_type === 'system' ? 'RailCare System' : 
                       c.sender_name || 'Unknown',
                message: c.message,
                time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                senderType: c.sender_type,
                isFromUser: c.sender_type === 'user',
                timestamp: c.created_at
            })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) || []
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

        // Filter by email OR phone
        if (email && phone) {
            query = query.or(`email.eq.${email},phone.eq.${phone}`);
        } else if (email) {
            query = query.eq('email', email);
        } else if (phone) {
            query = query.eq('phone', phone);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to match your app's expected format
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
            
            // Transform history and communications for dashboard use
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
export const updateComplaintStatus = async (complaintId, newStatus, remark, staffName) => {
    try {
        // Input validation
        if (!complaintId || !newStatus || !staffName) {
            throw new Error('Missing required parameters for status update');
        }

        // Check if input is UUID or complaint number
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(complaintId);
        
        const updateData = { 
            status: newStatus,
            updated_at: new Date().toISOString()
        };

        // Set resolved timestamp for completed statuses
        if (['Resolved', 'Closed'].includes(newStatus)) {
            updateData.resolved_at = new Date().toISOString();
        }

        // Query by appropriate field based on input format
        let query = supabase
            .from('complaints')
            .update(updateData)
            .select()
            .single();

        if (isUUID) {
            query = query.eq('id', complaintId);
        } else {
            query = query.eq('complaint_number', complaintId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Update complaint error:', error);
            throw error;
        }

        const actualComplaintId = data.id; // This is the UUID from the database

        // Add history entry using the actual UUID
        try {
            await supabase
                .from('complaint_history')
                .insert({
                    complaint_id: actualComplaintId,
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
                    complaint_id: actualComplaintId,
                    sender_type: 'staff',
                    sender_name: 'Support Agent', // ✅ FIXED: Clean, simple name
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

// ✅ FIXED: Send message from user to staff with proper sender identification
export const sendUserMessage = async (complaintId, message, senderName = 'Customer') => {
    try {
        // Get the actual complaint UUID
        const { data: complaintData, error: findError } = await supabase
            .from('complaints')
            .select('id')
            .eq('complaint_number', complaintId)
            .single();

        if (findError) throw findError;

        const { data, error } = await supabase
            .from('communications')
            .insert({
                complaint_id: complaintData.id,
                sender_type: 'user', // ✅ Correct type
                sender_name: 'Customer', // ✅ FIXED: Use generic name instead of 'You'
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

// ✅ FIXED: Send message from staff to user with clean sender identification
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
                sender_name: 'Support Agent', // ✅ FIXED: Clean, simple name
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

// ✅ Get recent messages for real-time updates
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
            // Get UUID from complaint_number
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

// ✅ Get complaints with message counts for staff dashboard
export const getComplaintsWithMessageCounts = async () => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select(`
                *,
                communications!inner(count),
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
        console.error('Error fetching complaints with message counts:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Check for new messages since last check
export const checkForNewMessages = async (lastCheckTime) => {
    try {
        const { data, error } = await supabase
            .from('communications')
            .select(`
                id,
                complaint_id,
                sender_type,
                sender_name,
                message,
                created_at,
                complaints!inner(complaint_number, assigned_to)
            `)
            .gt('created_at', lastCheckTime)
            .eq('is_internal', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, data, newMessageCount: data.length };
    } catch (error) {
        console.error('Error checking for new messages:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Mark messages as read by staff
export const markMessagesAsRead = async (complaintId, staffName) => {
    try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(complaintId);
        
        let actualComplaintId = complaintId;
        
        if (!isUUID) {
            const { data: complaintData, error: findError } = await supabase
                .from('complaints')
                .select('id')
                .eq('complaint_number', complaintId)
                .single();

            if (findError) throw findError;
            actualComplaintId = complaintData.id;
        }

        // Add a system message indicating staff viewed the conversation
        const { data, error } = await supabase
            .from('communications')
            .insert({
                complaint_id: actualComplaintId,
                sender_type: 'system',
                sender_name: 'System',
                message: `Messages viewed by ${staffName}`,
                is_internal: true,
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Advanced search function
export const searchComplaints = async (searchParams) => {
    try {
        let query = supabase
            .from('complaints')
            .select(`
                *,
                communications(count),
                complaint_history(count)
            `);

        // Apply filters based on search parameters
        if (searchParams.keyword) {
            query = query.or(`title.ilike.%${searchParams.keyword}%,description.ilike.%${searchParams.keyword}%,complaint_number.ilike.%${searchParams.keyword}%`);
        }

        if (searchParams.status && searchParams.status !== 'all') {
            query = query.eq('status', searchParams.status);
        }

        if (searchParams.priority && searchParams.priority !== 'all') {
            query = query.eq('priority', searchParams.priority);
        }

        if (searchParams.department) {
            query = query.eq('assigned_to', searchParams.department);
        }

        if (searchParams.dateFrom) {
            query = query.gte('created_at', searchParams.dateFrom);
        }

        if (searchParams.dateTo) {
            query = query.lte('created_at', searchParams.dateTo);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error searching complaints:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Get complaints by department with real-time updates
export const getComplaintsByDepartment = async (department, includeSubDepartments = true) => {
    try {
        let query = supabase
            .from('complaints')
            .select(`
                *,
                communications!left(
                    id,
                    sender_type,
                    sender_name,
                    message,
                    created_at,
                    is_internal
                ),
                complaint_history!left(
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

        if (includeSubDepartments) {
            query = query.like('assigned_to', `%${department}%`);
        } else {
            query = query.eq('assigned_to', department);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching complaints by department:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Bulk update complaint status
export const bulkUpdateComplaintStatus = async (complaintIds, newStatus, remark, staffName) => {
    try {
        const results = [];
        
        for (const complaintId of complaintIds) {
            const result = await updateComplaintStatus(complaintId, newStatus, remark, staffName);
            results.push({ complaintId, ...result });
        }

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        return {
            success: failureCount === 0,
            results,
            summary: {
                total: complaintIds.length,
                successful: successCount,
                failed: failureCount
            }
        };
    } catch (error) {
        console.error('Error in bulk update:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Export complaints data
export const exportComplaints = async (filters = {}) => {
    try {
        const searchResult = await searchComplaints(filters);
        
        if (!searchResult.success) {
            throw new Error(searchResult.error);
        }

        // Transform data for export
        const exportData = searchResult.data.map(complaint => ({
            'Complaint ID': complaint.complaint_number || complaint.id,
            'Title': complaint.title,
            'Status': complaint.status,
            'Priority': complaint.priority,
            'Category': complaint.detected_category,
            'Assigned To': complaint.assigned_to,
            'Email': complaint.email,
            'Phone': complaint.phone,
            'Created Date': new Date(complaint.created_at).toLocaleDateString(),
            'Updated Date': complaint.updated_at ? new Date(complaint.updated_at).toLocaleDateString() : 'N/A'
        }));

        return { success: true, data: exportData };
    } catch (error) {
        console.error('Error exporting complaints:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Polling function for staff dashboard updates
export const pollForUpdates = async (lastUpdateTime, department = null) => {
    try {
        let query = supabase
            .from('complaints')
            .select(`
                *,
                communications!left(
                    id,
                    sender_type,
                    sender_name,
                    message,
                    created_at,
                    is_internal
                ),
                complaint_history!left(
                    id,
                    action,
                    details,
                    remark,
                    created_at
                )
            `)
            .gt('updated_at', lastUpdateTime)
            .order('updated_at', { ascending: false });

        if (department) {
            query = query.eq('assigned_to', department);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { 
            success: true, 
            data,
            hasUpdates: data.length > 0,
            updateCount: data.length
        };
    } catch (error) {
        console.error('Error polling for updates:', error);
        return { success: false, error: error.message };
    }
};

// ✅ NEW: Context-aware message formatting for different viewers
export const getComplaintByIdForViewer = async (complaintId, viewerType = 'user') => {
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
            .eq('complaint_number', complaintId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Complaint not found' };
            }
            throw error;
        }

        // Context-aware sender naming
        const getSenderLabel = (communication) => {
            const { sender_type } = communication;
            
            if (viewerType === 'user') {
                // User perspective
                switch (sender_type) {
                    case 'user': return 'You';
                    case 'staff': return 'Support Agent';
                    case 'system': return 'RailCare System';
                    default: return 'Unknown';
                }
            } else {
                // Staff perspective
                switch (sender_type) {
                    case 'user': return 'Customer';
                    case 'staff': return 'Support Agent';
                    case 'system': return 'System';
                    default: return 'Unknown';
                }
            }
        };

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
            // Context-aware communications
            communications: data.communications?.filter(c => !c.is_internal).map(c => ({
                sender: getSenderLabel(c),
                message: c.message,
                time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                senderType: c.sender_type,
                isFromUser: c.sender_type === 'user',
                timestamp: c.created_at
            })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) || []
        };

        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error fetching complaint:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Add timeline entry function
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

// ✅ Health check function
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

// ✅ Get complaint statistics
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
