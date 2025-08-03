import React, { useState, useEffect } from 'react';
import { X, Brain, Clock, CheckCircle, AlertCircle, Mail, FileText, MapPin, Calendar } from 'lucide-react';
import './ReportDetailsModal.css';

const ReportDetailsModal = ({ report, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !report) return null;

    console.log('🔍 DEBUGGING: Report object in modal:', report);
    console.log('🔍 DEBUGGING: Has processingDetails?', !!report.processingDetails);

    const getStepIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={16} className="step-icon completed" />;
            case 'processing':
                return <Clock size={16} className="step-icon processing" />;
            case 'error':
                return <AlertCircle size={16} className="step-icon error" />;
            default:
                return <Clock size={16} className="step-icon pending" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'complaint filed': return 'status-filed';
            case 'in progress': return 'status-progress';
            case 'resolved': return 'status-resolved';
            case 'processing': return 'status-processing';
            default: return 'status-pending';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        <FileText size={24} />
                        <h2>Report Details</h2>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="modal-tabs">
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FileText size={16} />
                        Overview
                    </button>
                    {report.processingDetails && (
                        <>
                            <button
                                className={`tab-button ${activeTab === 'ai-analysis' ? 'active' : ''}`}
                                onClick={() => setActiveTab('ai-analysis')}
                            >
                                <Brain size={16} />
                                AI Analysis
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'processing' ? 'active' : ''}`}
                                onClick={() => setActiveTab('processing')}
                            >
                                <Clock size={16} />
                                Processing Steps
                            </button>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="modal-content">
                    {activeTab === 'overview' && (
                        <div className="overview-content">
                            <div className="report-summary">
                                <div className="summary-row">
                                    <span className="label">Report ID:</span>
                                    <span className="value report-id">{report.id}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Status:</span>
                                    <span className={`status-badge ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">
                                        <Calendar size={16} />
                                        Submitted:
                                    </span>
                                    <span className="value">{formatDate(report.createdAt)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">
                                        <MapPin size={16} />
                                        Location:
                                    </span>
                                    <span className="value">{report.zone}</span>
                                </div>
                                {report.department && (
                                    <div className="summary-row">
                                        <span className="label">Department:</span>
                                        <span className="value department">{report.department}</span>
                                    </div>
                                )}
                            </div>

                            <div className="report-description">
                                <h3>Description</h3>
                                <p>{report.description}</p>
                            </div>

                            {report.imageUrl && (
                                <div className="report-image">
                                    <h3>Attached Image</h3>
                                    <img src={report.imageUrl} alt="Report attachment" />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ai-analysis' && report.processingDetails?.aiAnalysis && (
                        <div className="ai-analysis-content">
                            <div className="analysis-card">
                                <div className="analysis-header">
                                    <Brain size={24} />
                                    <h3>AI Analysis Results</h3>
                                    <div className="confidence-badge">
                                        Confidence: {
                                            typeof report.processingDetails.aiAnalysis.confidence === 'number' &&
                                                report.processingDetails.aiAnalysis.confidence >= 0 &&
                                                report.processingDetails.aiAnalysis.confidence <= 1
                                                ? `${Math.round(report.processingDetails.aiAnalysis.confidence * 100)}%`
                                                : 'N/A'
                                        }
                                    </div>
                                </div>

                                <div className="reasoning-section">
                                    <h4>AI Reasoning</h4>
                                    <p className="reasoning-text">
                                        {report.processingDetails.aiAnalysis.reasoning}
                                    </p>
                                </div>

                                <div className="keywords-section">
                                    <h4>Identified Keywords</h4>
                                    <div className="keywords-list">
                                        {report.processingDetails.aiAnalysis.keywords?.map((keyword, index) => (
                                            <span key={index} className="keyword-tag">{keyword}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="alternatives-section">
                                    <h4>Alternative Departments Considered</h4>
                                    {console.log('🔍 DEBUGGING: Alternatives in AI Analysis:', report.processingDetails.aiAnalysis.alternatives)}
                                    {report.processingDetails.aiAnalysis.alternatives && report.processingDetails.aiAnalysis.alternatives.length > 0 ? (
                                        <div className="alternatives-list">
                                            {console.log('🔍 DEBUGGING: Alternatives in AI Analysis:', report.processingDetails.aiAnalysis.alternatives)}
                                            {report.processingDetails.aiAnalysis.alternatives.map((alt, index) => {
                                                // Handle both old and new data structures
                                                const departmentName = alt.departmentName || alt.department || 'Unknown Department';
                                                const hasScore = alt.score !== undefined && alt.score !== null && !isNaN(Number(alt.score));
                                                const hasReasoning = alt.reasoning && alt.reasoning.trim().length > 0;

                                                return (
                                                    <div key={index} className="alternative-item">
                                                        <span className="alt-department">
                                                            {departmentName}
                                                        </span>
                                                        {hasReasoning ? (
                                                            <span className="alt-reasoning" style={{ fontSize: '0.9em', color: '#718096', fontStyle: 'italic' }}>
                                                                {alt.reasoning}
                                                            </span>
                                                        ) : hasScore ? (
                                                            <span className="alt-score" style={{ fontSize: '0.9em', color: '#F59E0B' }}>
                                                                Score: {Math.round(Number(alt.score) * 100)}%
                                                            </span>
                                                        ) : (
                                                            <span className="alt-reasoning" style={{ fontSize: '0.9em', color: '#718096', fontStyle: 'italic' }}>
                                                                No additional details provided
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="no-alternatives">
                                            <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                                                No alternative departments were considered. The AI determined this was the most appropriate department with high confidence.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="processing-method">
                                    <h4>Processing Method</h4>
                                    <span className="method-badge">
                                        {report.processingDetails.aiAnalysis.processingMethod === 'vertex_ai' ? 'Google Vertex AI' : 'Simulated AI'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'processing' && report.processingDetails?.processingSteps && (
                        <div className="processing-content">
                            <div className="processing-timeline">
                                <h3>Processing Timeline</h3>
                                <div className="timeline-list">
                                    {report.processingDetails.processingSteps.map((step, index) => (
                                        <div key={index} className={`timeline-item ${step.status}`}>
                                            <div className="timeline-icon">
                                                {getStepIcon(step.status)}
                                            </div>
                                            <div className="timeline-content">
                                                <h4>{step.step}</h4>
                                                <p>{step.message}</p>
                                                {step.keywords && (
                                                    <div className="step-keywords">
                                                        <strong>Keywords:</strong> {step.keywords.join(', ')}
                                                    </div>
                                                )}
                                                {step.departmentCount && (
                                                    <div className="step-info">
                                                        <strong>Departments Analyzed:</strong> {step.departmentCount}
                                                    </div>
                                                )}
                                                <div className="step-time">
                                                    {formatDate(step.timestamp)}
                                                </div>
                                            </div>
                                            <div className="timeline-progress">
                                                {step.progress}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {report.processingDetails.emailDetails && (
                                <div className="email-details">
                                    <h3>
                                        <Mail size={20} />
                                        Email Notification
                                    </h3>
                                    <div className="email-info">
                                        <div className="email-status">
                                            {report.processingDetails.emailDetails.sent ? (
                                                <span className="email-sent">✅ Successfully sent</span>
                                            ) : (
                                                <span className="email-failed">❌ Failed to send</span>
                                            )}
                                        </div>
                                        {report.processingDetails.emailDetails.messageId && (
                                            <div className="message-id">
                                                <strong>Message ID:</strong> {report.processingDetails.emailDetails.messageId}
                                            </div>
                                        )}
                                        <div className="email-time">
                                            <strong>Sent at:</strong> {formatDate(report.processingDetails.emailDetails.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsModal;
