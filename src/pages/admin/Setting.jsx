import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import { SETTINGS_URL } from "../../services/endpoints";
import { FILE_BASE_URL } from "../../services/endpoints";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const Inner = () => {
  // ========== HOOKS INITIALIZATION ==========
  const { toastRef, showToast } = useToast();
  const { 
    get, 
    put, 
    loading, 
    error 
  } = useCrud(SETTINGS_URL);

  // ========== STATE FOR DATA ==========
  const [settingsData, setSettingsData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isFetching = useRef(false);

  // ========== REACT HOOK FORM ==========
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      contact_no: "",
      email: "",
      firewall: "",
      address: "",
      receivemail_id: "",
      facebook: "",
      tweeter: "",
      google: "",
      linkedin: "",
      instagram: "",
      logo: null,
      light_logo: null,
      fav_icon: null,
      login_img: null
    }
  });

  // ========== WATCH FIELDS FOR CKEDITOR ==========
  const description = watch("description");
  const address = watch("address");
  const firewall = watch("firewall");

  // ========== FETCH SETTINGS DATA - ONLY ONCE ==========
  useEffect(() => {
    const fetchSettings = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetching.current) return;
      
      try {
        isFetching.current = true;
        const response = await get("");
        console.log("Fetched settings:", response);
        
        // Handle the response structure from your API
        if (response && response.success && response.data && response.data.length > 0) {
          const data = response.data[0]; // Get first item from data array
          console.log("Settings data:", data); // Log to see actual field names
          setSettingsData(data);
          
          // Only reset form on initial load
          if (isInitialLoad && data) {
            // Create a copy without file fields
            const formData = { ...data };
            // Remove file fields from reset
            delete formData.logo;
            delete formData.light_logo;
            delete formData.fav_icon;
            delete formData.login_img;
            
            reset(formData);
            setIsInitialLoad(false);
          }
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        showToast("Failed to fetch settings", "danger");
      } finally {
        isFetching.current = false;
      }
    };

    fetchSettings();
  }, []); // Empty dependency array - run only once

  // ========== HANDLE FILE INPUT CHANGE ==========
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    // FIX: If name contains dot, replace with underscore
    const fieldName = name.includes('.') ? name.replace('.', '_') : name;
    
    if (files && files[0]) {
      // Validate file size (5MB limit)
      if (files[0].size > 5 * 1024 * 1024) {
        showToast("File size should be less than 5MB", "danger");
        e.target.value = null;
        return;
      }
      
      // Validate file type
      if (!files[0].type.startsWith('image/')) {
        showToast("Please select an image file", "danger");
        e.target.value = null;
        return;
      }
      
      setValue(fieldName, files[0]);
      console.log(`File selected for ${fieldName}:`, files[0].name);
    }
  };

  // ========== FORM SUBMISSION HANDLER ==========
  const onSubmit = async (data) => {
    try {
      console.log("Form submitted:", data);
      
      const formData = new FormData();
      
      // FIX: Use "setting_id" not "settingg_id" (single g)
      const settingsId = settingsData?.settingg_id;
      
      if (!settingsId) {
        showToast("Settings ID not found", "danger");
        console.error("Settings data:", settingsData); // Log to see what's available
        return;
      }
      
      // Append all form fields
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
          // Handle file fields
          if ((key === "logo" || key === "light_logo" || key === "fav_icon" || key === "login_img") && 
              data[key] instanceof File) {
            formData.append(key, data[key]);
            console.log(`Appending file: ${key} = ${data[key].name}`);
          } 
          // Handle text fields
          else if (!(key === "logo" || key === "light_logo" || key === "fav_icon" || key === "login_img")) {
            formData.append(key, data[key]);
            console.log(`Appending text: ${key} = ${data[key]}`);
          }
        }
      });

      // Log FormData contents for debugging
      console.log("📦 Final FormData being sent:");
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  - ${pair[0]}: File - ${pair[1].name} (${(pair[1].size / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`  - ${pair[0]}: ${pair[1]}`);
        }
      }

      // FIX: Make sure the URL is constructed correctly
      // If your API expects /settings/1, then this should work
      console.log(`Sending PUT request to: ${SETTINGS_URL}/${settingsId}`);
      
      // Update settings (PUT request)
      await put(`/${settingsId}`, formData);
      showToast("Settings updated successfully!", "success");

      // Fetch updated data after successful update
      const response = await get("");
      if (response && response.success && response.data && response.data.length > 0) {
        const updatedData = response.data[0];
        setSettingsData(updatedData);
        
        // Update form with new data but preserve file fields
        const formDataWithoutFiles = { ...updatedData };
        delete formDataWithoutFiles.logo;
        delete formDataWithoutFiles.light_logo;
        delete formDataWithoutFiles.fav_icon;
        delete formDataWithoutFiles.login_img;
        
        reset(formDataWithoutFiles);
      }
      
    } catch (err) {
      console.error("Save failed:", err);
      
      // Better error message
      let errorMessage = "Failed to save settings";
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || err.message}`;
      } else if (err.request) {
        console.error("Error request:", err.request);
        errorMessage = "No response from server. Check CORS and network connection.";
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      showToast(errorMessage, "danger");
    }
  };

  // ========== PREVIEW COMPONENT FOR IMAGES ==========
  const ImagePreview = ({ src, alt, style }) => {
    const [imageError, setImageError] = useState(false);
    
    if (!src || imageError) {
      return (
        <div style={{ 
          width: style?.width || "120px", 
          height: "80px", 
          backgroundColor: "#f0f0f0", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          border: "1px solid #ddd",
          borderRadius: "6px"
        }}>
          <span className="text-muted small">No image</span>
        </div>
      );
    }
    
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        onError={() => setImageError(true)}
      />
    );
  };

  // FIX: Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Try different paths based on your server structure
    return `${FILE_BASE_URL}/uploads/vendor/${imagePath}`;
  };

  if (loading && !settingsData && isInitialLoad) {
    return (
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          
          {/* ========== PAGE HEADER SECTION ========== */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Settings Management</h4>
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <span>Home</span>
                    </li>
                    <li className="breadcrumb-item active">Settings</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* ========== SETTINGS FORM ========== */}
          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <div className="row">
              {/* LEFT SIDE - MAIN CONTENT */}
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">General Settings</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Title */}
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Title *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                          placeholder="Enter website title"
                          {...register("title", { required: "Title is required" })}
                        />
                        {errors.title && (
                          <div className="invalid-feedback">{errors.title.message}</div>
                        )}
                      </div>

                      {/* Tagline */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tagline</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter tagline"
                          {...register("tagline")}
                        />
                      </div>

                      {/* Contact No */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Contact No *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.contact_no ? 'is-invalid' : ''}`}
                          placeholder="Enter contact number"
                          {...register("contact_no", { 
                            required: "Contact number is required",
                            pattern: {
                              value: /^[0-9+\-\s()]+$/,
                              message: "Invalid contact number format"
                            }
                          })}
                        />
                        {errors.contact_no && (
                          <div className="invalid-feedback">{errors.contact_no.message}</div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          placeholder="Enter email"
                          {...register("email", { 
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email.message}</div>
                        )}
                      </div>

                      {/* Receive Mail ID */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Receive Mail ID *</label>
                        <input
                          type="email"
                          className={`form-control ${errors.receivemail_id ? 'is-invalid' : ''}`}
                          placeholder="Enter receive mail ID"
                          {...register("receivemail_id", { 
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {errors.receivemail_id && (
                          <div className="invalid-feedback">{errors.receivemail_id.message}</div>
                        )}
                      </div>

                      {/* Description with CKEditor */}
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Description</label>
                        <CKEditor
                          key="description-editor"
                          editor={ClassicEditor}
                          data={description || ""}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            setValue("description", data, { shouldValidate: true });
                          }}
                        />
                      </div>

                      {/* Map Iframe */}
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Map Iframe</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Enter iframe code"
                          {...register("firewall")}
                        />
                      </div>

                      {/* Address with CKEditor */}
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Address</label>
                        <CKEditor
                          key="address-editor"
                          editor={ClassicEditor}
                          data={address || ""}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            setValue("address", data, { shouldValidate: true });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE - SOCIAL MEDIA & IMAGES */}
              <div className="col-lg-4">
                {/* SOCIAL MEDIA CARD */}
                <div className="card shadow-sm mb-3">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Social Media Links</h5>
                  </div>
                  <div className="card-body">
                    {/* Facebook */}
                    <div className="mb-3">
                      <label className="form-label">Facebook</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://facebook.com/..."
                        {...register("facebook")}
                      />
                    </div>

                    {/* Twitter */}
                    <div className="mb-3">
                      <label className="form-label">Twitter</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://twitter.com/..."
                        {...register("tweeter")}
                      />
                    </div>

                    {/* Google */}
                    <div className="mb-3">
                      <label className="form-label">Google</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://google.com/..."
                        {...register("google")}
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="mb-3">
                      <label className="form-label">LinkedIn</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://linkedin.com/..."
                        {...register("linkedin")}
                      />
                    </div>

                    {/* Instagram */}
                    <div className="mb-3">
                      <label className="form-label">Instagram</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://instagram.com/..."
                        {...register("instagram")}
                      />
                    </div>
                  </div>
                </div>

                {/* IMAGES CARD */}
                <div className="card shadow-sm mb-3">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Website Images</h5>
                  </div>
                  <div className="card-body">
                    {/* Logo */}
                    <div className="mb-4">
                      <label className="form-label">Logo</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                        name="logo"
                      />
                      {settingsData?.logo && (
                        <div className="mt-2 text-center">
                          <ImagePreview 
                            src={getImageUrl(settingsData.logo)} 
                            alt="Logo" 
                            style={{ width: "120px", height: "auto" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Light Logo */}
                    <div className="mb-4">
                      <label className="form-label">Light Logo</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                        name="light_logo"
                      />
                      {settingsData?.light_logo && (
                        <div className="mt-2 text-center">
                          <ImagePreview 
                            src={getImageUrl(settingsData.light_logo)} 
                            alt="Light Logo" 
                            style={{ width: "120px", height: "auto" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Fav Icon */}
                    <div className="mb-4">
                      <label className="form-label">Fav Icon</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                        name="fav_icon"
                      />
                      {settingsData?.fav_icon && (
                        <div className="mt-2 text-center">
                          <ImagePreview 
                            src={getImageUrl(settingsData.fav_icon)} 
                            alt="Fav Icon" 
                            style={{ width: "60px", height: "auto" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Login Image */}
                    <div className="mb-4">
                      <label className="form-label">Login Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                        name="login_img"
                      />
                      {settingsData?.login_img && (
                        <div className="mt-2 text-center">
                          <ImagePreview 
                            src={getImageUrl(settingsData.login_img)} 
                            alt="Login Image" 
                            style={{ width: "100%", maxHeight: "150px", objectFit: "cover" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : "Update Settings"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* ========== TOAST NOTIFICATION ========== */}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div
          ref={toastRef}
          className="toast align-items-center text-bg-success border-0"
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">
              Message
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inner;