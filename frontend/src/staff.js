import React, { useState, useEffect, useMemo } from 'react';
import { 
    ArrowLeft, 
    Users, 
    Shield, 
    Eye, 
    Filter,
    Search,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    Edit,
    Save,
    X,
    MessageSquare
} from 'lucide-react';
import { getComplaints, updateComplaintStatus } from './services/complaintService';
import { getDepartmentStructure } from './utils/categoryHelpers';

const StaffLoginPage = ({ onBack, navigate }) => {
    // ✅ ALL STATE VARIABLES INSIDE COMPONENT
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: 'admin@railcare.com', password: 'admin@railcare.com' });
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSubDepartment, setSelectedSubDepartment] = useState('');
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newRemark, setNewRemark] = useState('');

    // Supabase state variables
    const [allComplaints, setAllComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Auto-refresh state variables
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
    const [newMessageAlert, setNewMessageAlert] = useState(false);

    // Constants
    const departmentStructure = getDepartmentStructure();
    const statusOptions = ['Submitted', 'In Progress', 'Resolved', 'Escalated', 'Closed'];

    // ✅ FUNCTIONS INSIDE COMPONENT
    const loadComplaints = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getComplaints();
            if (result.success) {
                const transformedComplaints = result.data.map(complaint => ({
                    id: complaint.complaint_number || complaint.id,
                    title: complaint.title,
                    description: complaint.description,
                    email: complaint.email,
                    phone: complaint.phone,
                    location: complaint.location,
                    status: complaint.status,
                    priority: complaint.priority,
                    assignedTo: complaint.assigned_to,
                    category: complaint.detected_category,
                    subcategory: complaint.detected_subcategory,
                    date: complaint.created_at,
                    communications: complaint.communications || [],
                    history: complaint.complaint_history?.map(h => ({
                        action: h.action,
                        details: h.details,
                        remark: h.remark,
                        date: h.created_at,
                        completed: h.completed
                    })) || []
                }));
                setAllComplaints(transformedComplaints);
                setLastRefresh(new Date());
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load complaints');
            console.error('Error loading complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadComplaints();
        setNewMessageAlert(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginData.username === 'admin@railcare.com' && loginData.password === 'admin@railcare.com') {
            const loginTime = new Date().toLocaleString();
            localStorage.setItem('staffIsLoggedIn', 'true');
            localStorage.setItem('staffLoginTime', loginTime);
            setIsLoggedIn(true);
            setLoggedInUser({
                username: loginData.username,
                role: 'Administrator',
                loginTime: loginTime,
                department: 'System Administration'
            });
            navigate('/staff-dashboard');
        } else {
            alert('Invalid credentials! Please use admin/admin');
        }
    };
    
    const handleLogout = (redirectPath = '/staff-login') => {
        // Clear all localStorage
        localStorage.removeItem('staffIsLoggedIn');
        localStorage.removeItem('staffLoginTime');
        localStorage.removeItem('staffSelectedDept');
        localStorage.removeItem('staffSelectedSubDept');

        // Clear all state
        setIsLoggedIn(false);
        setLoggedInUser(null);
        setSelectedDepartment('');
        setSelectedSubDepartment('');
        setFilteredComplaints([]);
        setAllComplaints([]);
        setLoginData({ username: '', password: '' });
        setEditingComplaint(null);

        // Clear auto-refresh interval
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            setAutoRefreshInterval(null);
        }
        
        navigate(redirectPath);
    };

    const handleDepartmentChange = (department) => {
        setSelectedDepartment(department);
        setSelectedSubDepartment('');

        if (department) {
            localStorage.setItem('staffSelectedDept', department);
            localStorage.removeItem('staffSelectedSubDept');
        } else {
            localStorage.removeItem('staffSelectedDept');
            localStorage.removeItem('staffSelectedSubDept');
        }

        if (department && allComplaints.length > 0) {
            const subdepartments = departmentStructure[department] || [];
            const filtered = allComplaints.filter(complaint =>
                subdepartments.includes(complaint.assignedTo)
            );
            setFilteredComplaints(filtered);
        } else {
            setFilteredComplaints([]);
        }
    };

    const handleSubDepartmentChange = (subDepartment) => {
        setSelectedSubDepartment(subDepartment);
        
        if (subDepartment) {
            localStorage.setItem('staffSelectedSubDept', subDepartment);
            const filtered = allComplaints.filter(c => c.assignedTo === subDepartment);
            setFilteredComplaints(filtered);
        } else {
            localStorage.removeItem('staffSelectedSubDept');
            handleDepartmentChange(selectedDepartment);
        }
    };
    
    const handleEditComplaint = (complaint) => {
        setEditingComplaint(complaint.id);
        setNewStatus(complaint.status);
        setNewRemark('');
    };

    const handleSaveChanges = async (complaintId) => {
        try {
            setLoading(true);
            
            const complaint = allComplaints.find(c => c.id === complaintId);
            if (!complaint) {
                alert('Complaint not found');
                return;
            }

            const result = await updateComplaintStatus(
                complaint.id,
                newStatus,
                newRemark.trim(),
                loggedInUser.username
            );

            if (result.success) {
                await loadComplaints();
                setEditingComplaint(null);
                setNewStatus('');
                setNewRemark('');
            } else {
                alert('Failed to update complaint: ' + result.error);
            }
        } catch (error) {
            alert('Error updating complaint: ' + error.message);
            console.error('Error updating complaint:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancelEdit = () => {
        setEditingComplaint(null);
        setNewStatus('');
        setNewRemark('');
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved':
            case 'closed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'in progress':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'submitted':
                return <AlertCircle className="h-4 w-4 text-blue-600" />;
            case 'escalated':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved':
            case 'closed':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'escalated':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // ✅ COMPUTED VALUES
    const filteredAndSearchedComplaints = useMemo(() => {
        return filteredComplaints.filter(complaint => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = complaint.id.toLowerCase().includes(lowerSearchTerm) ||
                                complaint.title.toLowerCase().includes(lowerSearchTerm) ||
                                complaint.description.toLowerCase().includes(lowerSearchTerm);
            const matchesStatus = statusFilter === 'all' ||
                                complaint.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [filteredComplaints, searchTerm, statusFilter]);

    // ✅ EFFECTS - ALL INSIDE COMPONENT
    useEffect(() => {
        const staffIsLoggedIn = localStorage.getItem('staffIsLoggedIn');
        if (staffIsLoggedIn) {
            setIsLoggedIn(true);
            setLoggedInUser({
                username: 'admin@railcare.com',
                role: 'Administrator',
                loginTime: localStorage.getItem('staffLoginTime') || new Date().toLocaleString(),
                department: 'System Administration'
            });

            loadComplaints();

            const savedDept = localStorage.getItem('staffSelectedDept');
            const savedSubDept = localStorage.getItem('staffSelectedSubDept');
            if (savedDept) {
                setSelectedDepartment(savedDept);
                if (savedSubDept) {
                    setSelectedSubDepartment(savedSubDept);
                }
            }
        }
    }, []);

    // Auto-refresh effect
    useEffect(() => {
        if (selectedDepartment && isLoggedIn && !loading) {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }

            const interval = setInterval(async () => {
                try {
                    const result = await getComplaints();
                    if (result.success) {
                        const transformedComplaints = result.data.map(complaint => ({
                            id: complaint.complaint_number || complaint.id,
                            title: complaint.title,
                            description: complaint.description,
                            email: complaint.email,
                            phone: complaint.phone,
                            location: complaint.location,
                            status: complaint.status,
                            priority: complaint.priority,
                            assignedTo: complaint.assigned_to,
                            category: complaint.detected_category,
                            subcategory: complaint.detected_subcategory,
                            date: complaint.created_at,
                            communications: complaint.communications || [],
                            history: complaint.complaint_history?.map(h => ({
                                action: h.action,
                                details: h.details,
                                remark: h.remark,
                                date: h.created_at,
                                completed: h.completed
                            })) || []
                        }));
                        
                        const oldTotalMessages = allComplaints.reduce((sum, c) => sum + (c.communications?.length || 0), 0);
                        const newTotalMessages = transformedComplaints.reduce((sum, c) => sum + (c.communications?.length || 0), 0);
                        
                        if (newTotalMessages > oldTotalMessages) {
                            setNewMessageAlert(true);
                            setTimeout(() => setNewMessageAlert(false), 5000);
                        }
                        
                        setAllComplaints(transformedComplaints);
                        setLastRefresh(new Date());
                    }
                } catch (error) {
                    console.error('Auto-refresh error:', error);
                }
            }, 15000);

            setAutoRefreshInterval(interval);
        }

        return () => {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
        };
    }, [selectedDepartment, isLoggedIn, allComplaints]);

    // Filtering effect
    useEffect(() => {
        if (selectedDepartment && allComplaints.length > 0) {
            let newFilteredComplaints = [];
            if (selectedSubDepartment) {
                newFilteredComplaints = allComplaints.filter(c => c.assignedTo === selectedSubDepartment);
            } else {
                const subdepartments = departmentStructure[selectedDepartment] || [];
                newFilteredComplaints = allComplaints.filter(complaint =>
                    subdepartments.includes(complaint.assignedTo)
                );
            }
            setFilteredComplaints(newFilteredComplaints);
        }
    }, [allComplaints, selectedDepartment, selectedSubDepartment, departmentStructure]);

    // ✅ LOGIN FORM RENDER
    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <button 
                                onClick={() => handleLogout('/')}
                                className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-2 group touch-manipulation"
                                style={{ minHeight: '44px' }}
                            >
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden sm:inline">Back to Home</span>
                                <span className="sm:hidden">Back</span>
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <Shield className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                Staff Login Portal
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Access the complaint management dashboard
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Login ID
                                </label>
                                <input
                                    type="text"
                                    value={loginData.username}
                                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                    placeholder="Enter your login ID"
                                    required
                                    style={{ fontSize: '16px' }} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                    placeholder="Enter your password"
                                    required
                                    style={{ fontSize: '16px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                                style={{ minHeight: '48px' }}
                            >
                                <Shield className="h-5 w-5" />
                                Login to Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ MAIN DASHBOARD RENDER
    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button 
                            onClick={onBack} 
                            className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-2 group touch-manipulation"
                            style={{ minHeight: '44px' }}
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Back to Home</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                        
                        <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Staff Dashboard</h1>
                                <p className="text-xs sm:text-sm text-gray-600">Complaint Management System</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 sm:px-4 py-2 flex-1 sm:flex-none">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                        <span className="text-sm font-bold text-green-800 truncate">
                                            {loggedInUser?.username}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {loggedInUser?.role}
                                        </span>
                                    </div>
                                    <div className="text-xs text-green-600 truncate">
                                        Logged in: {loggedInUser?.loginTime}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleLogout()}
                            className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center space-x-2 touch-manipulation flex-shrink-0"
                            style={{ minHeight: '44px' }}
                        >
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Department Selection */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Department Selection</h2>
                    {lastRefresh && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                                    newMessageAlert 
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse' 
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="text-sm">
                                    {newMessageAlert ? 'New Messages!' : 'Refresh'}
                                </span>
                            </button>
                            <span className="text-xs text-gray-500">
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base touch-manipulation"
                            style={{ fontSize: '16px' }}
                        >
                            <option value="">Choose a department...</option>
                            {Object.keys(departmentStructure).map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Sub-Department</label>
                        <select
                            value={selectedSubDepartment}
                            onChange={(e) => handleSubDepartmentChange(e.target.value)}
                            disabled={!selectedDepartment}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 text-base touch-manipulation"
                            style={{ fontSize: '16px' }}
                        >
                            <option value="">Choose a sub-department...</option>
                            {selectedDepartment && departmentStructure[selectedDepartment].map(subDept => (
                                <option key={subDept} value={subDept}>{subDept}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center justify-center space-x-3">
                        <RefreshCw className="h-5 w-5 animate-spin text-orange-600" />
                        <span className="text-gray-600">Loading complaints...</span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-red-200 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <span className="text-red-800 font-medium">Error loading complaints:</span>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Complaints Table/List */}
            {selectedDepartment && !loading && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {selectedSubDepartment 
                                        ? `${selectedSubDepartment} Complaints` 
                                        : `${selectedDepartment} Department - All Complaints`
                                    }
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                        {filteredAndSearchedComplaints.length} complaints
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search complaints..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base touch-manipulation"
                                style={{ fontSize: '16px' }}
                            >
                                <option value="all">All Status</option>
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors touch-manipulation whitespace-nowrap"
                                style={{ minHeight: '48px' }}
                            >
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complaints Display */}
            {selectedDepartment && !loading && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredAndSearchedComplaints.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAndSearchedComplaints.map((complaint) => (
                                            <React.Fragment key={complaint.id}>
                                                <tr className="hover:bg-gray-50" data-complaint-id={complaint.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <div className="flex items-center space-x-2">
                                                            <span>{complaint.id}</span>
                                                            {complaint.communications && complaint.communications.length > 0 && (
                                                                <div className="relative">
                                                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-[10px]">
                                                                        {complaint.communications.length}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                        <div className="break-words whitespace-normal leading-tight">{complaint.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                                                            {complaint.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingComplaint === complaint.id ? (
                                                            <select 
                                                                value={newStatus} 
                                                                onChange={(e) => setNewStatus(e.target.value)} 
                                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                                            >
                                                                {statusOptions.map(status => (
                                                                    <option key={status} value={status}>{status}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(complaint.status)}
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                                                    {complaint.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(complaint.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {complaint.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            {editingComplaint === complaint.id ? (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleSaveChanges(complaint.id)} 
                                                                        disabled={loading} 
                                                                        className="text-green-600 hover:text-green-900 flex items-center space-x-1 disabled:opacity-50"
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                        <span>Save</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={handleCancelEdit} 
                                                                        className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                        <span>Cancel</span>
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button 
                                                                        onClick={() => navigate(`/dashboard/${complaint.id}?from=staff`)} 
                                                                        className="text-orange-600 hover:text-orange-900 flex items-center space-x-1"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        <span>View</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleEditComplaint(complaint)} 
                                                                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        <span>Edit</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {editingComplaint === complaint.id && (
                                                    <tr>
                                                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Remark</label>
                                                                    <textarea 
                                                                        value={newRemark} 
                                                                        onChange={(e) => setNewRemark(e.target.value)} 
                                                                        placeholder="Enter your remark here..." 
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" 
                                                                        rows="3"
                                                                    />
                                                                </div>
                                                                {complaint.history && complaint.history.filter(step => step.action === 'Investigation & Resolution' && step.remark).length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Remarks:</h4>
                                                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                                                            {complaint.history.filter(step => step.action === 'Investigation & Resolution' && step.remark).map((step, index) => (
                                                                                <div key={index} className="bg-white p-2 rounded border text-xs">
                                                                                    <p className="text-gray-700">{step.remark}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden">
                                <div className="divide-y divide-gray-200">
                                    {filteredAndSearchedComplaints.map((complaint) => (
                                        <div key={complaint.id} className="p-4 space-y-3" data-complaint-id={complaint.id}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-sm font-bold text-gray-900 truncate">{complaint.id}</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                                                            {complaint.priority}
                                                        </span>
                                                        {complaint.communications && complaint.communications.length > 0 && (
                                                            <div className="relative">
                                                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-[10px]">
                                                                    {complaint.communications.length}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{complaint.title}</h3>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-3">
                                                    {getStatusIcon(complaint.status)}
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                                        {complaint.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <span className="text-gray-500 font-medium">Submitted:</span>
                                                    <div className="text-gray-900">{new Date(complaint.date).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 font-medium">Contact:</span>
                                                    <div className="text-gray-900 truncate">{complaint.email}</div>
                                                </div>
                                            </div>
                                            {editingComplaint === complaint.id ? (
                                                <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                                                        <select 
                                                            value={newStatus} 
                                                            onChange={(e) => setNewStatus(e.target.value)} 
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" 
                                                            style={{ fontSize: '16px' }}
                                                        >
                                                            {statusOptions.map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Add Remark</label>
                                                        <textarea 
                                                            value={newRemark} 
                                                            onChange={(e) => setNewRemark(e.target.value)} 
                                                            placeholder="Enter your remark here..." 
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none" 
                                                            rows="3" 
                                                            style={{ fontSize: '16px' }}
                                                        />
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => handleSaveChanges(complaint.id)} 
                                                            disabled={loading} 
                                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation disabled:opacity-50" 
                                                            style={{ minHeight: '44px' }}
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            <span>Save Changes</span>
                                                        </button>
                                                        <button 
                                                            onClick={handleCancelEdit} 
                                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation" 
                                                            style={{ minHeight: '44px' }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                            <span>Cancel</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/${complaint.id}?from=staff`)} 
                                                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors touch-manipulation" 
                                                        style={{ minHeight: '44px' }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span>View Details</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditComplaint(complaint)} 
                                                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors touch-manipulation" 
                                                        style={{ minHeight: '44px' }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span>Edit Status</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 px-4">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                {selectedSubDepartment 
                                    ? `No complaints assigned to ${selectedSubDepartment} match your current filters.` 
                                    : `No complaints found for ${selectedDepartment} department with current filters.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StaffLoginPage;
