import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { submitReport } from '../services/api';
import { getStates, getZonesForState } from '../data/stateZoneMapping';
import { useAuth } from '../contexts/AuthContext';
import ProcessingView from './ProcessingView';
import './ReportForm.css';

const ReportForm = ({ onReportSubmitted }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    state: '',
    zone: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [reportId, setReportId] = useState('');
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [availableZones, setAvailableZones] = useState([]);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const fileInputRef = useRef(null);

  // Debug effect to monitor showProcessing changes
  React.useEffect(() => {
    console.log('ReportForm: showProcessing changed to:', showProcessing);
  }, [showProcessing]);

  React.useEffect(() => {
    console.log('ReportForm: reportId changed to:', reportId);
  }, [reportId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.state) {
      newErrors.state = 'State selection is required';
    }

    if (!formData.zone) {
      newErrors.zone = 'Zone selection is required';
    }

    if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image size must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle state change - update zones and reset zone selection
    if (name === 'state') {
      const zones = getZonesForState(value);
      setAvailableZones(zones);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        zone: '' // Reset zone when state changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear zone error when state changes
    if (name === 'state' && errors.zone) {
      setErrors(prev => ({
        ...prev,
        zone: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG, PNG)');
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('description', formData.description.trim());
      submitData.append('zone', formData.zone);
      submitData.append('userId', currentUser.uid);
      submitData.append('userEmail', currentUser.email);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await submitReport(submitData);
      console.log('ReportForm: Full response:', response);

      if (response.success) {
        console.log('ReportForm: Report submitted successfully, reportId:', response.reportId);
        setReportId(response.reportId);
        console.log('ReportForm: About to set showProcessing to true');
        setShowProcessing(true);
        console.log('ReportForm: showProcessing state after setting:', showProcessing);

        // Don't show toast immediately - let ProcessingView handle the experience
        console.log('ReportForm: Should now render ProcessingView');

        // Don't call callback immediately - wait for processing to complete
        // if (onReportSubmitted) {
        //   onReportSubmitted();
        // }
      } else {
        throw new Error(response.error || 'Failed to submit report');
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      state: '',
      zone: '',
      image: null
    });
    setImagePreview(null);
    setAvailableZones([]);
    setSubmitted(false);
    setShowProcessing(false);
    setProcessingComplete(false);
    setFinalResult(null);
    setReportId('');
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessingComplete = (result) => {
    setProcessingComplete(true);
    setFinalResult(result);
    setSubmitted(true);
    setShowProcessing(false);
    toast.success(`Report successfully assigned to ${result.department}!`);

    // Now it's safe to refresh the dashboard
    if (onReportSubmitted) {
      onReportSubmitted();
    }
  };

  const handleProcessingError = (error) => {
    setShowProcessing(false);
    toast.error(`Processing failed: ${error}`);
  };

  // Show processing view
  console.log('ReportForm render: showProcessing =', showProcessing, 'reportId =', reportId);
  if (showProcessing) {
    console.log('ReportForm: Rendering ProcessingView with reportId:', reportId);
    return (
      <ProcessingView
        reportId={reportId}
        onComplete={handleProcessingComplete}
        onError={handleProcessingError}
      />
    );
  }

  if (submitted) {
    return (
      <div className="success-message">
        <h2>✅ Report Processing Complete!</h2>
        <p>
          Thank you for reporting this civic issue. Your report has been successfully processed
          by our AI agent and forwarded to the appropriate department.
        </p>
        {reportId && (
          <div className="report-id">
            <strong>Report ID:</strong> {reportId}
          </div>
        )}
        {finalResult && (
          <div className="processing-results">
            <div className="result-item">
              <strong>Assigned Department:</strong> {finalResult.department}
            </div>
            <div className="result-item">
              <strong>Email Status:</strong> {finalResult.emailSent ? '✅ Sent successfully' : '❌ Failed to send'}
            </div>
          </div>
        )}
        <button
          onClick={resetForm}
          className="submit-button"
          style={{ marginTop: '20px', background: 'rgba(255,255,255,0.2)' }}
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="report-form">
      <div className="form-group">
        <label htmlFor="description" className="form-label required">
          Issue Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the civic issue in detail. For example: 'There is a large pothole on Main Street that is causing damage to vehicles...'"
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          rows={4}
        />
        <div className={`character-counter ${formData.description.length < 20 ? 'error' : ''}`}>
          {formData.description.length}/20 minimum characters
        </div>
        {errors.description && (
          <div className="error-message">{errors.description}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="state" className="form-label required">
          State
        </label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className={`form-select ${errors.state ? 'error' : ''}`}
        >
          <option value="">Select your state</option>
          {getStates().map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors.state && (
          <div className="error-message">{errors.state}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="zone" className="form-label required">
          Municipal Zone
        </label>
        <select
          id="zone"
          name="zone"
          value={formData.zone}
          onChange={handleInputChange}
          className={`form-select ${errors.zone ? 'error' : ''}`}
          disabled={!formData.state}
        >
          <option value="">
            {!formData.state ? 'Select state first' : 'Select your zone'}
          </option>
          {availableZones.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
        {errors.zone && (
          <div className="error-message">{errors.zone}</div>
        )}
        {!formData.state && (
          <div className="info-message">
            Please select a state first to see available zones
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          Upload Image (Optional)
        </label>
        <div className="file-input-group">
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          <label htmlFor="image" className="file-input-label">
            📷 Choose Image
          </label>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
            Accepted formats: JPG, PNG. Maximum size: 5MB
          </div>
        </div>

        {imagePreview && (
          <div className="file-preview">
            <img src={imagePreview} alt="Preview" />
            <div className="file-info">
              <span>{formData.image?.name}</span>
              <button
                type="button"
                onClick={removeImage}
                style={{
                  marginLeft: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {errors.image && (
          <div className="error-message">{errors.image}</div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-button"
      >
        {isSubmitting && <div className="loading-spinner"></div>}
        {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
      </button>
    </form>
  );
};

export default ReportForm;
