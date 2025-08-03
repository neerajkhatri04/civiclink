import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserReports } from '../../services/api';
import toast from 'react-hot-toast';
import {
    Plus,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    LogOut,
    Settings,
    BarChart3,
    Calendar,
    MapPin,
    Eye
} from 'lucide-react';
import ReportForm from '../ReportForm';
import ReportDetailsModal from '../ReportDetailsModal';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [userReports, setUserReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user reports
        if (currentUser) {
            fetchUserReports();
        }
    }, [currentUser]);

    const fetchUserReports = async () => {
        try {
            setLoading(true);
            const response = await getUserReports(currentUser.uid);
            if (response.success) {
                setUserReports(response.reports);
            }
        } catch (error) {
            console.error('Error fetching user reports:', error);
            toast.error('Failed to load your reports');
        } finally {
            setLoading(false);
        }
    };

    const getReportStats = () => {
        const pending = userReports.filter(r => r.status?.toLowerCase() === 'processing' || r.status?.toLowerCase() === 'pending').length;
        const inProgress = userReports.filter(r => r.status?.toLowerCase() === 'complaint filed' || r.status?.toLowerCase() === 'in progress').length;
        const resolved = userReports.filter(r => r.status?.toLowerCase() === 'resolved').length;
        const total = userReports.length;

        return { pending, inProgress, resolved, total };
    };

    const stats = getReportStats();

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'in progress': return 'status-progress';
            case 'resolved': return 'status-resolved';
            case 'complaint filed': return 'status-filed';
            default: return 'status-pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock size={16} />;
            case 'in progress': return <AlertCircle size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            case 'complaint filed': return <FileText size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="dashboard-logo">
                        <div className="dashboard-logo-circle">
                            <span>
                                <span style={{ color: '#22D3EE' }}>C</span>
                                <span style={{ color: '#60A5FA' }}>L</span>
                            </span>
                        </div>
                        <h1>CivicLink</h1>
                    </div>
                </div>

                <div className="header-right">
                    <div className="user-menu">
                        <div className="user-info">
                            <div className="user-avatar">
                                <User size={20} />
                            </div>
                            <div className="user-details">
                                <span className="user-name">{userProfile?.fullName || currentUser?.displayName}</span>
                                <span className="user-email">{currentUser?.email}</span>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="dashboard-nav">
                <button
                    className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={20} />
                    Overview
                </button>
                <button
                    className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FileText size={20} />
                    My Reports
                </button>
                <button
                    className={`nav-item ${activeTab === 'new-report' ? 'active' : ''}`}
                    onClick={() => setActiveTab('new-report')}
                >
                    <Plus size={20} />
                    New Report
                </button>
            </nav>

            {/* Content */}
            <main className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="welcome-card">
                            <h2>Welcome back, {userProfile?.fullName?.split(' ')[0] || 'User'}!</h2>
                            <p>Track your civic issue reports and help make your community better.</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.pending}</h3>
                                    <p>Pending Reports</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon progress">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.inProgress}</h3>
                                    <p>In Progress</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon resolved">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.resolved}</h3>
                                    <p>Resolved</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon total">
                                    <FileText size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Reports</p>
                                </div>
                            </div>
                        </div>

                        <div className="recent-activity">
                            <h3>Recent Activity</h3>
                            <div className="activity-list">
                                {userReports.length === 0 ? (
                                    <div className="activity-empty">
                                        <FileText size={48} />
                                        <h3>No reports yet</h3>
                                        <p>You haven't submitted any civic issue reports. Start by creating your first report to help improve your community.</p>
                                        <button
                                            className="btn-primary"
                                            onClick={() => setActiveTab('new-report')}
                                        >
                                            <Plus size={16} />
                                            Create Your First Report
                                        </button>
                                    </div>
                                ) : (
                                    <div className="activity-items">
                                        {userReports.slice(0, 3).map((report) => (
                                            <div key={report.id} className="activity-item">
                                                <div className={`activity-status ${getStatusColor(report.status)}`}>
                                                    {getStatusIcon(report.status)}
                                                </div>
                                                <div className="activity-content">
                                                    <p>{report.description.substring(0, 80)}...</p>
                                                    <span className="activity-date">
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="reports-section">
                        <div className="section-header">
                            <div>
                                <h2>My Reports</h2>
                                <p>View and track all your submitted civic issue reports</p>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={() => setActiveTab('new-report')}
                            >
                                <Plus size={18} />
                                New Report
                            </button>
                        </div>

                        <div className="reports-list">
                            {userReports.length === 0 ? (
                                <div className="reports-empty">
                                    <FileText size={64} />
                                    <h3>No reports yet</h3>
                                    <p>You haven't submitted any civic issue reports. Start by creating your first report to help improve your community.</p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setActiveTab('new-report')}
                                    >
                                        <Plus size={18} />
                                        Create First Report
                                    </button>
                                </div>
                            ) : (
                                userReports.map((report) => (
                                    <div key={report.id} className="report-card">
                                        <div className="report-header">
                                            <div className={`report-status ${getStatusColor(report.status)}`}>
                                                {getStatusIcon(report.status)}
                                                {report.status}
                                            </div>
                                            <div className="report-date">
                                                <Calendar size={14} />
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="report-content">
                                            <h4>{report.title || 'Civic Issue Report'}</h4>
                                            <p>{report.description}</p>

                                            {report.zone && (
                                                <div className="report-location">
                                                    <MapPin size={14} />
                                                    {report.zone}
                                                </div>
                                            )}
                                        </div>

                                        {report.department && (
                                            <div className="report-department">
                                                Assigned to: <strong>{report.department}</strong>
                                            </div>
                                        )}

                                        <div className="report-actions">
                                            <button
                                                className="btn-secondary view-details-btn"
                                                onClick={() => handleViewDetails(report)}
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'new-report' && (
                    <div className="new-report-section">
                        <div className="section-header">
                            <div>
                                <h2>Submit New Report</h2>
                                <p>Report a civic issue in your community and help make it better.</p>
                            </div>
                        </div>
                        <ReportForm onReportSubmitted={fetchUserReports} />
                    </div>
                )}
            </main>

            {/* Report Details Modal */}
            <ReportDetailsModal
                report={selectedReport}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Dashboard;
