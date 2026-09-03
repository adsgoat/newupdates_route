'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Modal, message } from 'antd'; // Add Ant components
import ReusableSelect from '@/components/newuser/select';
import SubmitButton from '@/components/common/submitbutton';
import SearchInput from '@/components/common/searchinput';


const UploadComponent = forwardRef(({ onSubmit, isLoading = false, theme, email }, ref) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [networkOptions, setNetworkOptions] = useState(["All"]);

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
  };
  const getNetworks = async () => {
    const data = await fetch("/api/newuser/data");
    return await data.json();
  }

  // Fetch networks data on component mount
  useEffect(() => {
    const networksData = async () => {
      const data = await getNetworks();

      const options = [
        { Network: "All" },
        ...data.filter((item) => item?.Network)
      ];

      setNetworkOptions(options);

      // Select All by default
      setSelectedNetwork(["All"]);
    };

    networksData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image: null });
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Expose resetForm to parent
  useImperativeHandle(ref, () => ({
    resetForm
  }));

  const handleSubmit = (e) => {
    console.log("SUBMIT CLICKED");
    e.preventDefault();

    if (!validateForm()) return;

    Modal.confirm({
      //   title: 'Confirm Submission',
      content: 'Are you sure you want to submit this notification?',
      okText: 'Yes',
      cancelText: 'No',
      icon: null,
      className:
        theme === "dark"
          ? "notification-confirm-modal-dark"
          : "notification-confirm-modal-light",
      onOk: async () => {
        console.log("YES CLICKED - API STARTING");
        try {
          const formDataToSend = new FormData();
          formDataToSend.append('title', formData.title);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('email', email);
          formDataToSend.append('network', selectedNetwork);
          formDataToSend.append('networks', JSON.stringify(selectedNetwork));

          if (formData.image) {
            formDataToSend.append('image', formData.image);
          }

          const res = await fetch("/api/newuser/notificationupdate", {
            method: "POST",
            body: formDataToSend,
          });

          const result = await res.json();

          if (result.success) {
            message.success("Notification submitted successfully!");
            resetForm();
          } else {
            message.error("Something went wrong.");
          }
        } catch (err) {
          console.error('Error submitting form:', err);
          message.error('Error submitting form.');
        }
      }
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };



  const handleMediaChange = (file) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image or video file' }));
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // Optional: limit to 20MB
      setErrors(prev => ({ ...prev, image: 'File size must be less than 20MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result);
    reader.readAsDataURL(file);

    setErrors(prev => ({ ...prev, image: undefined }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || null;
    handleMediaChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleMediaChange(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`upload-form-wrapper full-screen-wrapper ${theme === 'dark' ? 'dark-theme' : ''
        }`}
      style={{
        width: "100%",
        height: "calc(100vh - 67px)",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: theme === "dark" ? "#232323" : "#fff",
        color: theme === "dark" ? "#fff" : "#333",
        boxSizing: "border-box",
        marginTop:"-10px"
      }}
    >
      <div className="form-container" style={{
        backgroundColor: theme === "dark" ? "#2a2727" : "#fff",
      }}>
        <h1 style={{ color: theme === 'dark' ? '#fff' : '#333' }} className="form-title">Notification</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label
              htmlFor="title"
              style={{ color: theme === "dark" ? "#fff" : "#333" }}
            >
              Title
            </label>
            <SearchInput
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter your title"
              theme={theme}
              width="100%"
              height={27}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" style={{ color: theme === "dark" ? "#fff" : "#333" }}
            >Description</label>
            <textarea
              id="description"
              value={formData.description}
              style={{
                color: theme === "dark" ? "#fff" : "#333",
                backgroundColor: theme === "dark" ? "#191919" : "#fff",
                borderColor: theme === "dark" ? "#555" : "#d9d9d9",
              }}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter your description"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="network" style={{ color: theme === "dark" ? "#fff" : "#333" }}
            >Action</label>
            <ReusableSelect
              id="network"
              value={selectedNetwork}
              onChange={handleNetworkChange}
              placeholder={
                <span
                  style={{
                    color: theme === "dark" ? "#fff" : "#333",
                  }}
                >
                  Select networ
                </span>
              }
              mode="multiple"
              width="100%"
              size="small"
              height={27}
              theme={theme}
              options={networkOptions.map((option) => ({
                value: option.Network,
                label: option.Network,
              }))}
            />
          </div>

          <div className="form-group">
            <label style={{ color: theme === "dark" ? "#fff" : "#333" }}
            >Image</label>
            {!imagePreview && (
              <div
                className="image-upload-box"
                onClick={openFileDialog}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  backgroundColor: theme === "dark" ? "#232323" : "#fff"
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <p style={{
                  color: theme === 'dark' ? '#fff' : '#333'

                }}>Click to upload or drag and drop</p>
                <p style={{
                  color: theme === 'dark' ? '#fff' : '#333'

                }} >PNG, JPG, GIF </p>
              </div>
            )}
            {imagePreview && (
              <div className="image-preview-wrapper">
                {formData.image?.type.startsWith('image/') ? (
                  <img style={{ maxHeight: '120px', objectFit: 'cover', cursor: 'pointer' }} src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <video
                    controls
                    src={imagePreview}
                    className="image-preview"
                    // style={{ maxHeight: '200px', objectFit: 'cover' }}
                    style={{ maxHeight: '120px', objectFit: 'cover', cursor: 'pointer' }}
                  />
                )}
                <div className="image-info">
                  <span>{formData.image?.name}</span>
                  <span>({Math.round((formData.image?.size || 0) / 1024)} KB)</span>
                  <SubmitButton
                    type="button"
                    text="Remove"
                    onClick={removeImage}
                  >

                  </SubmitButton>
                </div>
              </div>
            )}

            {errors.image && <span className="form-error">{errors.image}</span>}
          </div>

          <button type="submit" disabled={isLoading}>Submit</button>
        </form>
      </div>
    </div>
  );
});

export default UploadComponent;
