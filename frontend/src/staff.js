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

const StaffLoginPage = ({ onBack, complaints, navigate, onUpdateComplaint }) => {
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

    const departmentStructure = {
        'Emergency': ['Emergency Response Team', 'Operations Emergency Team'],
        'Safety & Security': ['RPF Security Team', 'Women Safety Cell', 'Account Security Team'],
        'Refund & Financial': ['Finance Refund Team', 'Payment Gateway Support', 'Finance Dispute Team'],
        'Ticketing & Booking': ['Booking Support Team', 'Tatkal Support Team', 'Urgent Ticketing Support'],
        'Catering & Food': ['Catering Quality Team', 'Premium Catering Team', 'IRCTC E-Catering Team'],
        'Technical Issues': ['Web Portal Backend Support', 'IT Support Level 1', 'Payment Gateway Support'],
        'Staff Behavior': ['HR Disciplinary Team', 'Employee Grievance Cell', 'HR Recognition Team'],
        'Cleanliness & Maintenance': ['Coaching Maintenance Team', 'Electrical Team', 'AC Maintenance Team'],
        'Train Operations': ['Operations Analytics Team', 'System Monitoring Team', 'High Density Route Support'],
        'Accessibility': ['Accessibility Support Team', 'Accessibility Digital Team', 'Senior Citizen Support Team'],
        'Station Amenities': ['NR Station Management', 'SR Station Management', 'Commercial Station Section'],
        'Premium Services': ['Premium User Support', 'Premium Catering Team', 'Premium Maintenance Team'],
        'Social Media & PR': ['Social Media Crisis Team', 'Public Relations Crisis Team', 'Content Moderation Team'],
        'Default Assignment': ['General Grievance Cell']
    };
    
 // Replace your existing useEffect with this one
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

        // --- ADD THIS LOGIC TO RESTORE FILTERS ---
        const savedDept = localStorage.getItem('staffSelectedDept');
        const savedSubDept = localStorage.getItem('staffSelectedSubDept');

        if (savedDept) {
            // Set state for department and sub-department directly
            setSelectedDepartment(savedDept);
            if (savedSubDept) {
                setSelectedSubDepartment(savedSubDept);
            }

            // Manually re-apply the filter logic based on restored selections
            let newFilteredComplaints = [];
            if (savedSubDept) {
                 // Filter by sub-department if it exists
                newFilteredComplaints = Object.values(complaints).filter(c => c.assignedTo === savedSubDept);
            } else {
                // Otherwise, filter by the main department
                const subdepartments = departmentStructure[savedDept] || [];
                newFilteredComplaints = Object.values(complaints).filter(complaint =>
                    subdepartments.includes(complaint.assignedTo)
                );
            }
            setFilteredComplaints(newFilteredComplaints);
        }
        // --- END OF ADDED LOGIC ---
    }
}, [complaints]); // Add `complaints` to the dependency array
    const statusOptions = ['Submitted', 'In Progress', 'Resolved', 'Escalated', 'Closed'];

     const handleLogin = (e) => {
        e.preventDefault();
        if (loginData.username === 'admin@railcare.com' && loginData.password === 'admin@railcare.com') {
            const loginTime = new Date().toLocaleString();
            // 1. Persist login state in browser's local storage
            localStorage.setItem('staffIsLoggedIn', 'true');
            localStorage.setItem('staffLoginTime', loginTime);

            setIsLoggedIn(true);
            setLoggedInUser({
                username: loginData.username,
                role: 'Administrator',
                loginTime: loginTime,
                department: 'System Administration'
            });
            // 2. Navigate to the new dashboard URL
            navigate('/staff-dashboard');
        } else {
            alert('Invalid credentials! Please use admin/admin');
        }
    };
    
    // Replace your handleLogout function with this one
// Replace the existing handleLogout function in staff.js with this one:
const handleLogout = (redirectPath = '/staff-login') => {
    // 1. Clear all session and filter data from localStorage
    localStorage.removeItem('staffIsLoggedIn');
    localStorage.removeItem('staffLoginTime');
    localStorage.removeItem('staffSelectedDept');
    localStorage.removeItem('staffSelectedSubDept');

    // 2. Reset all component state to its initial values
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setSelectedDepartment('');
    setSelectedSubDepartment('');
    setFilteredComplaints([]);
    setLoginData({ username: '', password: '' });
    setEditingComplaint(null);
    
    // 3. Navigate to the desired path (either home or the login page)
    navigate(redirectPath);
};

    // Replace your handleDepartmentChange function with this one
const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setSelectedSubDepartment(''); // This resets sub-department

    // Save/Remove selection from localStorage
    if (department) {
        localStorage.setItem('staffSelectedDept', department);
        localStorage.removeItem('staffSelectedSubDept'); // Clear sub-dept selection
    } else {
        localStorage.removeItem('staffSelectedDept');
        localStorage.removeItem('staffSelectedSubDept');
    }

    // Filter complaints based on the new selection
    if (department) {
        const subdepartments = departmentStructure[department] || [];
        const filtered = Object.values(complaints).filter(complaint =>
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
            const filtered = Object.values(complaints).filter(c => c.assignedTo === subDepartment);
            setFilteredComplaints(filtered);
        } else {
            handleDepartmentChange(selectedDepartment);
        }
    };
    
    const handleEditComplaint = (complaint) => {
        setEditingComplaint(complaint.id);
        setNewStatus(complaint.status);
        setNewRemark('');
    };

    const handleSaveChanges = (complaintId) => {
        const originalComplaint = complaints[complaintId];
        if (!originalComplaint) return;

        const currentTime = new Date().toLocaleString('en-US', {
            month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
        });
        const staffName = loggedInUser.username;

        const updatedComplaint = {
            ...originalComplaint,
            status: newStatus,
            history: originalComplaint.history.map(step => {
                if (step.action === 'Investigation & Resolution') {
                    return {
                        ...step,
                        completed: newStatus === 'Resolved' || newStatus === 'Closed',
                        details: `Status: ${newStatus}`,
                        remark: newRemark.trim() ? newRemark.trim() : step.remark,
                        date: step.completed ? step.date : currentTime
                    };
                }
                return step;
            }),
            communications: [
                ...originalComplaint.communications,
                {
                    sender: `Support Agent (${staffName})`,
                    message: `Status updated to "${newStatus}". ${newRemark.trim() ? 'Remark: ' + newRemark.trim() : ''}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]
        };
        onUpdateComplaint(complaintId, updatedComplaint);
        setEditingComplaint(null);
        setNewStatus('');
        setNewRemark('');
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

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center py-8 sm:py-12 px-3 sm:px-4">
                <div className="w-full max-w-md">
                     <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <button 
    onClick={() => handleLogout('/')} // <-- This is the modified line
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

                        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 text-center">
                                <strong>Demo Credentials:</strong><br />
                                Username: admin<br />
                                Password: admin
                            </p>
                        </div> */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
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
    onClick={() => handleLogout()}  // ✅ Calls handleLogout with no arguments, uses default '/staff-login'
    className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center space-x-2 touch-manipulation flex-shrink-0"
    style={{ minHeight: '44px' }}
>
    <XCircle className="h-4 w-4" />
    <span className="hidden sm:inline">Logout</span>
</button>

                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Department Selection</h2>
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

            {selectedDepartment && (
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

            {selectedDepartment && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {filteredAndSearchedComplaints.length > 0 ? (
                        <>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs"><div className="break-words whitespace-normal leading-tight">{complaint.title}</div></td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span></td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editingComplaint === complaint.id ? (
                                                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">
                                                                {statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
                                                            </select>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">{getStatusIcon(complaint.status)}<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>{complaint.status}</span></div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(complaint.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            {editingComplaint === complaint.id ? (
                                                                <>
                                                                    <button onClick={() => handleSaveChanges(complaint.id)} className="text-green-600 hover:text-green-900 flex items-center space-x-1"><Save className="h-4 w-4" /><span>Save</span></button>
                                                                    <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-900 flex items-center space-x-1"><X className="h-4 w-4" /><span>Cancel</span></button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => navigate(`/dashboard/${complaint.id}?from=staff`)}
 className="text-orange-600 hover:text-orange-900 flex items-center space-x-1"><Eye className="h-4 w-4" /><span>View</span></button>
                                                                    <button onClick={() => handleEditComplaint(complaint)} className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"><Edit className="h-4 w-4" /><span>Edit</span></button>
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
                                                                    <textarea value={newRemark} onChange={(e) => setNewRemark(e.target.value)} placeholder="Enter your remark here..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" rows="3"></textarea>
                                                                </div>
                                                                {complaint.history && complaint.history.filter(step => step.action === 'Investigation & Resolution' && step.remark).length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Remarks:</h4>
                                                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                                                            {complaint.history.filter(step => step.action === 'Investigation & Resolution' && step.remark).map((step, index) => (
                                                                                <div key={index} className="bg-white p-2 rounded border text-xs"><p className="text-gray-700">{step.remark}</p></div>
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
                            <div className="lg:hidden">
                                <div className="divide-y divide-gray-200">
                                    {filteredAndSearchedComplaints.map((complaint) => (
                                        <div key={complaint.id} className="p-4 space-y-3" data-complaint-id={complaint.id}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1"><span className="text-sm font-bold text-gray-900 truncate">{complaint.id}</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>{complaint.priority}</span></div>
                                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{complaint.title}</h3>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-3">{getStatusIcon(complaint.status)}<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>{complaint.status}</span></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div><span className="text-gray-500 font-medium">Submitted:</span><div className="text-gray-900">{new Date(complaint.date).toLocaleDateString()}</div></div>
                                                <div><span className="text-gray-500 font-medium">Contact:</span><div className="text-gray-900 truncate">{complaint.email}</div></div>
                                            </div>
                                            {editingComplaint === complaint.id ? (
                                                <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                                                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" style={{ fontSize: '16px' }}>
                                                            {statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Add Remark</label>
                                                        <textarea value={newRemark} onChange={(e) => setNewRemark(e.target.value)} placeholder="Enter your remark here..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none" rows="3" style={{ fontSize: '16px' }}></textarea>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => handleSaveChanges(complaint.id)} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation" style={{ minHeight: '44px' }}><Save className="h-4 w-4" /><span>Save Changes</span></button>
                                                        <button onClick={handleCancelEdit} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors touch-manipulation" style={{ minHeight: '44px' }}><X className="h-4 w-4" /><span>Cancel</span></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => navigate(`/dashboard/${complaint.id}?from=staff`)}
 className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors touch-manipulation" style={{ minHeight: '44px' }}><Eye className="h-4 w-4" /><span>View Details</span></button>
                                                    <button onClick={() => handleEditComplaint(complaint)} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors touch-manipulation" style={{ minHeight: '44px' }}><Edit className="h-4 w-4" /><span>Edit Status</span></button>
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
   