import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios"; // Make sure to install axios: npm install axios
import { useNavigate } from "react-router-dom"; // Add this import

import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { CONTACT_URL } from "../../services/endpoints";

const UserEnquiryList = () => {
  const navigate = useNavigate();
  const { toastRef, showToast } = useToast();
  
  const downloadExcel = useExcelDownload();

  const [enquiries, setEnquiries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  
  // Get current user from localStorage (adjust based on your auth system)
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      // Try sessionStorage as fallback
      const sessionUser = sessionStorage.getItem('user');
      if (sessionUser) {
        return JSON.parse(sessionUser);
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
    return null;
  };

  const currentUser = getCurrentUser();

  // Status options with integer values matching your database
  const statusOptions = [
    { value: 1, label: "New", color: "info", icon: "ri-star-line" },
    { value: 2, label: "In Progress", color: "primary", icon: "ri-loader-4-line" },
    { value: 3, label: "Follow Up", color: "warning", icon: "ri-calendar-todo-line" },
    { value: 4, label: "Converted", color: "success", icon: "ri-checkbox-circle-line" },
    { value: 5, label: "Lost", color: "danger", icon: "ri-close-circle-line" },
    { value: 6, label: "Junk", color: "secondary", icon: "ri-delete-bin-line" },
    { value: 7, label: "On Hold", color: "dark", icon: "ri-pause-circle-line" }
  ];

  // Helper function to get status label from integer value
  const getStatusLabel = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.label : "New";
  };

  // Helper function to get status option from integer value
  const getStatusOption = (statusValue) => {
    return statusOptions.find(opt => opt.value === statusValue) || statusOptions[0];
  };

  const [statusData, setStatusData] = useState({
    status: 1, // Default to "New" (value 1)
    remark: "",
    followup_date: "",
    updated_by: currentUser?.id || ""
  });

  // Form state based on your user controller fields
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact: "",
    interest_service: "",
    description: ""
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // ================= FETCH USER ENQUIRIES =================
  const fetchUserEnquiries = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log("Fetching user enquiries from:", CONTACT_URL);
      const response = await axios.get(CONTACT_URL);
      console.log("API Response:", response);
      
      // Handle different response structures
      let enquiryData = [];
      if (response?.data?.data) {
        enquiryData = response.data.data;
      } else if (response?.data) {
        enquiryData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        enquiryData = response;
      }
      
      setEnquiries(Array.isArray(enquiryData) ? enquiryData : []);
      console.log("User enquiries set:", enquiryData);

    } catch (err) {
      console.error("Fetch failed:", err);
      setFetchError(err.message || "Failed to fetch user enquiries");
      showToast("Failed to fetch user enquiries", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserEnquiries();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(enquiries, ["full_name", "email", "interest_service", "description"]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ================= STATUS MODAL HANDLERS =================
  const handleOpenStatusModal = (row) => {
    setSelectedEnquiry(row);
    setStatusData({
      status: row.status || 1, // Default to 1 (New) if no status
      remark: "",
      followup_date: "",
      updated_by: currentUser?.id || ""
    });
    setValidationErrors({}); // Clear any previous validation errors
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedEnquiry(null);
    setStatusData({
      status: 1,
      remark: "",
      followup_date: "",
      updated_by: currentUser?.id || ""
    });
    setValidationErrors({});
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    // For status select, convert to integer
    if (name === 'status') {
      setStatusData({ ...statusData, [name]: parseInt(value, 10) });
    } else {
      setStatusData({ ...statusData, [name]: value });
    }
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: null });
    }
  };

  // Validate the status form
  const validateStatusForm = () => {
    const errors = {};
    
    // Validate followup_date if provided
    if (statusData.followup_date) {
      // Check if it's a valid date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(statusData.followup_date)) {
        errors.followup_date = "Please enter a valid date in YYYY-MM-DD format";
      } else {
        // Check if it's a real date
        const date = new Date(statusData.followup_date);
        if (isNaN(date.getTime())) {
          errors.followup_date = "Please enter a valid date";
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleRoleClick = (row) => {
    // Navigate to role management page with user ID
    navigate(`/admin/enquiryview/${row.id}`, { 
      state: { 
        userName: row.full_name,
        userEmail: row.email,
        userRole: row.role 
      } 
    });
  };
  // Updated status update handler with integer status value
  const handleUpdateStatus = async () => {
    if (!selectedEnquiry) return;
    
    // Validate the form first
    if (!validateStatusForm()) {
      showToast("Please fix the validation errors", "warning");
      return;
    }
  
    try {
      const statusPayload = {
        inq_id: selectedEnquiry.id,
        status: statusData.status, // This is now an integer (1-7)
        remark: statusData.remark,
        followup_date: statusData.followup_date || null,
        updated_by: statusData.updated_by || currentUser?.id || null
      };
  
      console.log("Updating status with payload:", statusPayload);
      
      await axios.post(`${CONTACT_URL}/status`, statusPayload);
      
      const statusLabel = getStatusLabel(statusData.status);
      showToast(`Status updated to ${statusLabel} successfully!`, "success");
      
      // Refresh the list
      fetchUserEnquiries();
      handleCloseStatusModal();
  
    } catch (err) {
      console.error("Status update failed:", err);
      
      // Show more specific error message
      let errorMessage = "Status update failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showToast(errorMessage, "danger");
      
      // Log the full error for debugging
      if (err.response?.data) {
        console.error("Server response:", err.response.data);
      }
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert string values to appropriate types for database
      const submitData = {
        full_name: formData.full_name,
        email: formData.email,
        contact: formData.contact ? parseInt(formData.contact) : null,
        interest_service: formData.interest_service,
        description: formData.description
      };

      console.log("Submitting data:", submitData);

      if (editId) {
        // Update existing enquiry
        await axios.put(`${CONTACT_URL}/${editId}`, submitData);
        showToast("User enquiry updated successfully!", "success");
      } else {
        // Create new enquiry
        await axios.post(CONTACT_URL, submitData);
        showToast("User enquiry added successfully!", "success");
      }

      fetchUserEnquiries();
      handleReset();

    } catch (err) {
      console.error("Save failed:", err);
      showToast(err.response?.data?.message || err.message || "Operation failed", "danger");
    }
  };

  // ================= EDIT =================
  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData({
      full_name: row.full_name || "",
      email: row.email || "",
      contact: row.contact?.toString() || "",
      interest_service: row.interest_service || "",
      description: row.description || ""
    });
  };

  // ================= RESET FORM =================
  const handleReset = () => {
    setEditId(null);
    setFormData({
      full_name: "",
      email: "",
      contact: "",
      interest_service: "",
      description: ""
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user enquiry?")) return;

    try {
      await axios.delete(`${CONTACT_URL}/${id}`);
      showToast("User enquiry deleted!", "danger");
      fetchUserEnquiries();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(err.response?.data?.message || err.message || "Delete failed", "danger");
    }
  };

  // Helper function to get status badge with proper styling
  const getStatusBadge = (statusValue) => {
    const option = getStatusOption(statusValue);
    
    // Status badge styles with light background and colored text
    const badgeStyles = {
      1: 'badge bg-info bg-opacity-25 text-info',       // New
      2: 'badge bg-primary bg-opacity-25 text-primary', // In Progress
      3: 'badge bg-warning bg-opacity-25 text-warning', // Follow Up
      4: 'badge bg-success bg-opacity-25 text-success', // Converted
      5: 'badge bg-danger bg-opacity-25 text-danger',   // Lost
      6: 'badge bg-secondary bg-opacity-25 text-secondary', // Junk
      7: 'badge bg-dark bg-opacity-25 text-dark'        // On Hold
    };

    return (
      <span className={badgeStyles[statusValue] || 'badge bg-secondary bg-opacity-25 text-secondary'}>
        <i className={`${option.icon} me-1`}></i>
        {option.label}
      </span>
    );
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      name: "ID",
      selector: row => row.id,
      sortable: true,
      width: "70px"
    },
    {
      name: "Full Name",
      selector: row => row.full_name || "N/A",
      sortable: true,
      wrap: true
    },
    {
      name: "Email",
      selector: row => row.email || "N/A",
      sortable: true
    },
    {
      name: "Contact",
      selector: row => row.contact || "N/A",
      width: "120px"
    },
    {
      name: "Interest/Service",
      selector: row => row.interest_service || "N/A",
      sortable: true,
      wrap: true,
      cell: row => (
        <span className="badge bg-info bg-opacity-25 text-dark">
          {row.interest_service || "N/A"}
        </span>
      )
    },
    {
      name: "Description",
      selector: row => row.description || "N/A",
      wrap: true,
      cell: row => (
        <span title={row.description}>
          {row.description && row.description.length > 50 
            ? row.description.substring(0, 50) + "..." 
            : row.description || "N/A"}
        </span>
      )
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          {getStatusBadge(row.status)}
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handleOpenStatusModal(row)}
            type="button"
            title="Update Status"
          >
            <i className="ri-edit-box-line"></i>
          </button>
        </div>
      ),
      sortable: true,
      sortFunction: (a, b) => (a.status || 0) - (b.status || 0),
      width: "150px"
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-info btn-sm"
            onClick={() => handleRoleClick(row)}
            type="button"
           
            title="View"
          >
            <i className="ri-shield-user-line me-1"></i>
             
          </button>
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit(row)}
            type="button"
            title="Edit user"
          >
            <i className="ri-pencil-line"></i>
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.id)}
            type="button"
            title="Delete user"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ),
      width: "100px"
    }
  ];

  // Summary statistics for users
  const getStatistics = () => {
    const total = enquiries.length;
    
    // Count by interest/service
    const interests = enquiries.reduce((acc, curr) => {
      if (curr.interest_service) {
        acc[curr.interest_service] = (acc[curr.interest_service] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topInterest = Object.entries(interests)
      .sort((a, b) => b[1] - a[1])[0];
    
    const withEmail = enquiries.filter(e => e.email).length;
    const withContact = enquiries.filter(e => e.contact).length;
    const withDescription = enquiries.filter(e => e.description).length;
    
    // Count by status (using integer values)
    const statusCounts = statusOptions.map(opt => ({
      status: opt.value,
      label: opt.label,
      count: enquiries.filter(e => e.status === opt.value).length,
      color: opt.color,
      icon: opt.icon
    }));

    return { 
      total, 
      withEmail, 
      withContact,
      withDescription,
      topInterest: topInterest ? topInterest[0] : 'None',
      topInterestCount: topInterest ? topInterest[1] : 0,
      statusCounts
    };
  };

  const stats = getStatistics();

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* PAGE HEADER */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">User Enquiry Management</h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item active">User Enquiries</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards - User Specific */}
          <div className="row mb-3">
            <div className="col-xl-3 col-md-6">
              <div className="card bg-primary bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-primary">Total Users</h6>
                      <h3>{stats.total}</h3>
                    </div>
                    <i className="ri-user-line fs-1 text-primary opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-info bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-info">With Email</h6>
                      <h3>{stats.withEmail}</h3>
                    </div>
                    <i className="ri-mail-line fs-1 text-info opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-success">With Contact</h6>
                      <h3>{stats.withContact}</h3>
                    </div>
                    <i className="ri-phone-line fs-1 text-success opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-warning bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-warning">With Description</h6>
                      <h3>{stats.withDescription}</h3>
                    </div>
                    <i className="ri-file-text-line fs-1 text-warning opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Statistics Row */}
          <div className="row mb-3">
            {stats.statusCounts.map((status, index) => (
              <div className="col-xl-2 col-md-4 col-6 mb-2" key={index}>
                <div className={`card bg-${status.color} bg-opacity-10 border-0`}>
                  <div className="card-body py-2">
                    <div className="d-flex align-items-center">
                      <i className={`${status.icon} fs-4 text-${status.color} me-2`}></i>
                      <div>
                        <h6 className={`text-${status.color} mb-0 small`}>{status.label}</h6>
                        <h5 className="mb-0">{status.count}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Interest Card */}
          {stats.topInterest !== 'None' && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card bg-secondary bg-opacity-10 border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="ri-medal-line fs-2 text-secondary me-3"></i>
                      <div>
                        <h6 className="text-secondary mb-1">Most Requested Service</h6>
                        <h4 className="mb-0">{stats.topInterest} <small className="text-muted fs-6">({stats.topInterestCount} users)</small></h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-3">
            {/* RIGHT TABLE */}
            <div className="col-md-12">
              <div className="card shadow-sm">
                {/* SEARCH + DOWNLOAD */}
                <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <h5 className="mb-0">
                    User Enquiries ({filteredData?.length || 0})
                  </h5>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        console.log("Exporting data:", filteredData);
                        downloadExcel(filteredData, "user_enquiries");
                      }}
                      type="button"
                      disabled={!filteredData?.length}
                    >
                      <i className="ri-download-line me-1"></i>
                      Export Excel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={fetchUserEnquiries}
                      type="button"
                      disabled={isLoading}
                    >
                      <i className="ri-refresh-line me-1"></i>
                      Refresh
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="card-body">
                  {isLoading && (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading user enquiries...</p>
                    </div>
                  )}
                  
                  {fetchError && !isLoading && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {fetchError}
                      <button 
                        className="btn btn-sm btn-outline-danger ms-3" 
                        onClick={fetchUserEnquiries}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && enquiries.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No user enquiries found</p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={fetchUserEnquiries}
                      >
                        Refresh
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && enquiries.length > 0 && (
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      pagination
                      highlightOnHover
                      striped
                      responsive
                      paginationPerPage={10}
                      paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS UPDATE MODAL - Updated with integer status values */}
      {showStatusModal && selectedEnquiry && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ri-exchange-line me-2"></i>
                  Update Status - {selectedEnquiry.full_name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseStatusModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Current Status</label>
                  <div className="p-2 bg-light rounded">
                    {getStatusBadge(selectedEnquiry.status)}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="form-label fw-bold">New Status <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    name="status"
                    value={statusData.status}
                    onChange={handleStatusChange}
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="remark" className="form-label fw-bold">Remarks / Notes</label>
                  <textarea
                    className="form-control"
                    id="remark"
                    name="remark"
                    rows="3"
                    value={statusData.remark}
                    onChange={handleStatusChange}
                    placeholder="Add any remarks about this status update..."
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="followup_date" className="form-label fw-bold">Follow-up Date</label>
                  <input
                    type="date"
                    className={`form-control ${validationErrors.followup_date ? 'is-invalid' : ''}`}
                    id="followup_date"
                    name="followup_date"
                    value={statusData.followup_date}
                    onChange={handleStatusChange}
                  />
                  {validationErrors.followup_date && (
                    <div className="invalid-feedback">
                      {validationErrors.followup_date}
                    </div>
                  )}
                  <small className="text-muted">Select a follow-up date</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="updated_by" className="form-label fw-bold">Updated By (User ID)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="updated_by"
                    name="updated_by"
                    value={statusData.updated_by}
                    onChange={handleStatusChange}
                    placeholder="User ID"
                    readOnly={!!currentUser?.id}
                  />
                  <small className="text-muted">
                    {currentUser?.name ? `Currently logged in as: ${currentUser.name}` : 'Enter user ID'}
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseStatusModal}
                >
                  <i className="ri-close-line me-1"></i>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleUpdateStatus}
                >
                  <i className="ri-save-line me-1"></i>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className="toast-container position-fixed top-0 end-0 p-3">
        <div ref={toastRef} className="toast align-items-center text-bg-success border-0">
          <div className="d-flex">
            <div className="toast-body">
              {/* Toast content will be set by showToast */}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEnquiryList;