import React, { useState, useEffect } from 'react';
import './ProcessingView.css';

const ProcessingView = ({ reportId, onComplete, onError }) => {
    console.log('ProcessingView: Component mounted/rendered with reportId:', reportId);

    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [aiReasoning, setAiReasoning] = useState(null);
    const [finalDepartment, setFinalDepartment] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionData, setCompletionData] = useState(null);

    useEffect(() => {
        console.log('ProcessingView: useEffect triggered with reportId:', reportId);
        if (!reportId) {
            console.log('ProcessingView: No reportId provided, returning early');
            return;
        }

        console.log('ProcessingView: Starting SSE connection for reportId:', reportId);

        // Connect to SSE stream
        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/reports/process-stream/${reportId}`
        );

        console.log('ProcessingView: EventSource URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/reports/process-stream/${reportId}`);

        eventSource.onopen = () => {
            console.log('ProcessingView: SSE connection opened');
            setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('ProcessingView: Received SSE data:', data);

                if (data.type === 'connected') {
                    setIsConnected(true);
                } else if (data.type === 'step') {
                    setCurrentStep(data);
                    setProgress(data.progress || 0);

                    // Add step to history
                    setSteps(prevSteps => {
                        const newSteps = [...prevSteps];
                        const existingIndex = newSteps.findIndex(step => step.step === data.step);

                        if (existingIndex >= 0) {
                            newSteps[existingIndex] = data;
                        } else {
                            newSteps.push(data);
                        }

                        return newSteps;
                    });

                    // Handle special data
                    if (data.aiReasoning) {
                        setAiReasoning({
                            reasoning: data.aiReasoning,
                            confidence: data.confidence,
                            keywords: data.keywords
                        });
                    }

                    if (data.department && data.status === 'completed') {
                        setFinalDepartment(data.department);
                    }

                    // Handle completion
                    if (data.progress >= 100) {
                        if (data.status === 'completed') {
                            setIsCompleted(true);
                            setCompletionData({
                                department: data.department,
                                emailSent: data.emailSent
                            });
                            // Close SSE connection but don't auto-close the view
                            setTimeout(() => {
                                eventSource.close();
                            }, 1000);
                        } else if (data.status === 'error') {
                            setTimeout(() => {
                                eventSource.close();
                                onError && onError(data.error || 'Processing failed');
                            }, 2000);
                        }
                    }
                }
            } catch (error) {
                console.error('Error parsing SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            setIsConnected(false);
            eventSource.close();
            onError && onError('Connection lost during processing');
        };

        // Cleanup
        return () => {
            eventSource.close();
        };
    }, [reportId]);

    const getStepIcon = (status) => {
        switch (status) {
            case 'completed':
                return '✅';
            case 'processing':
                return '⏳';
            case 'error':
                return '❌';
            default:
                return '⚪';
        }
    };

    const handleClose = () => {
        if (isCompleted && completionData && onComplete) {
            onComplete(completionData);
        }
    };

    const getStepClass = (status) => {
        switch (status) {
            case 'completed':
                return 'step-completed';
            case 'processing':
                return 'step-processing';
            case 'error':
                return 'step-error';
            default:
                return 'step-pending';
        }
    };

    return (
        <div className="processing-view">
            <div className="processing-header">
                <h2>🤖 AI Processing Your Report</h2>
                <p>Our AI agent is analyzing your civic issue and routing it to the appropriate department</p>
                <div className="connection-status">
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                </div>
            </div>

            <div className="progress-section">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="progress-text">{progress}% Complete</div>
            </div>

            <div className="steps-section">
                <h3>Processing Steps</h3>
                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div key={index} className={`step-item ${getStepClass(step.status)}`}>
                            <div className="step-icon">
                                {getStepIcon(step.status)}
                            </div>
                            <div className="step-content">
                                <h4>{step.step}</h4>
                                <p>{step.message}</p>
                                {step.keywords && (
                                    <div className="step-keywords">
                                        <strong>Keywords:</strong> {step.keywords.join(', ')}
                                    </div>
                                )}
                                {step.departmentCount && (
                                    <div className="step-info">
                                        <strong>Analyzing {step.departmentCount} departments</strong>
                                    </div>
                                )}
                            </div>
                            <div className="step-time">
                                {new Date(step.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {aiReasoning && (
                <div className="ai-reasoning-section">
                    <h3>🧠 AI Analysis</h3>
                    <div className="reasoning-card">
                        <div className="reasoning-header">
                            <span className="confidence-badge">
                                Confidence: {Math.round(aiReasoning.confidence * 100)}%
                            </span>
                        </div>
                        <div className="reasoning-content">
                            <h4>AI Reasoning:</h4>
                            <p>{aiReasoning.reasoning}</p>
                        </div>
                        {aiReasoning.keywords && (
                            <div className="reasoning-keywords">
                                <h4>Identified Keywords:</h4>
                                <div className="keywords-list">
                                    {aiReasoning.keywords.map((keyword, index) => (
                                        <span key={index} className="keyword-tag">{keyword}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {finalDepartment && (
                <div className="final-department-section">
                    <h3>🏢 Assigned Department</h3>
                    <div className="department-card">
                        <div className="department-icon">🏛️</div>
                        <div className="department-info">
                            <h4>{finalDepartment}</h4>
                            <p>Your report has been successfully forwarded to this department</p>
                        </div>
                    </div>
                </div>
            )}

            {currentStep && currentStep.status === 'processing' && (
                <div className="current-activity">
                    <div className="activity-indicator">
                        <div className="spinner"></div>
                        <span>{currentStep.message}</span>
                    </div>
                </div>
            )}

            {isCompleted && (
                <div className="completion-section">
                    <div className="completion-card">
                        <div className="completion-icon">🎉</div>
                        <h3>Processing Complete!</h3>
                        <p>Your report has been successfully processed and forwarded to the appropriate department.</p>
                        {completionData?.emailSent && (
                            <p className="email-status">✅ Notification email has been sent.</p>
                        )}
                        <button className="close-button" onClick={handleClose}>
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessingView;
