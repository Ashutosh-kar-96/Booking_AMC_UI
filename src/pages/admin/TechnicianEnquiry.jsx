import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { TECH_URL } from "../../services/endpoints";

const TechnicianEnquiryList = () => {
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
  
  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
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

  // Status options with integer values
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
    status: 1,
    remark: "",
    followup_date: "",
    updated_by: currentUser?.id || ""
  });

  // Form state for technician fields
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact: "",
    specialization: "",
    experience: "",
    city: "",
    certificate: "",
    description: "",
    availability: "",
    expected_salary: ""
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Certificate file state
  const [certificateFile, setCertificateFile] = useState(null);

  // ================= FETCH TECHNICIAN ENQUIRIES =================
  const fetchTechnicianEnquiries = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log("Fetching technician enquiries from:", TECH_URL);
      const response = await axios.get(TECH_URL);
      console.log("API Response:", response);
      
      let enquiryData = [];
      if (response?.data?.data) {
        enquiryData = response.data.data;
      } else if (response?.data) {
        enquiryData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        enquiryData = response;
      }
      
      setEnquiries(Array.isArray(enquiryData) ? enquiryData : []);
      console.log("Technician enquiries set:", enquiryData);

    } catch (err) {
      console.error("Fetch failed:", err);
      setFetchError(err.message || "Failed to fetch technician enquiries");
      showToast("Failed to fetch technician enquiries", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianEnquiries();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(enquiries, ["full_name", "email", "specialization", "city", "description"]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ================= FILE CHANGE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCertificateFile(file);
    if (file) {
      setFormData({ ...formData, certificate: file.name });
    }
  };

  // ================= STATUS MODAL HANDLERS =================
  const handleOpenStatusModal = (row) => {
    setSelectedEnquiry(row);
    setStatusData({
      status: row.status || 1,
      remark: "",
      followup_date: "",
      updated_by: currentUser?.id || ""
    });
    setValidationErrors({});
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
    if (name === 'status') {
      setStatusData({ ...statusData, [name]: parseInt(value, 10) });
    } else {
      setStatusData({ ...statusData, [name]: value });
    }
    
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: null });
    }
  };

  // Validate the status form
  const validateStatusForm = () => {
    const errors = {};
    
    if (statusData.followup_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(statusData.followup_date)) {
        errors.followup_date = "Please enter a valid date in YYYY-MM-DD format";
      } else {
        const date = new Date(statusData.followup_date);
        if (isNaN(date.getTime())) {
          errors.followup_date = "Please enter a valid date";
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // View technician details
  const handleViewDetails = (row) => {
    navigate(`/admin/enquiryview/${row.id}`, { 
      state: { 
        technicianData: row
      } 
    });
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!selectedEnquiry) return;
    
    if (!validateStatusForm()) {
      showToast("Please fix the validation errors", "warning");
      return;
    }
  
    try {
      const statusPayload = {
        inq_id: selectedEnquiry.id,
        status: statusData.status,
        remark: statusData.remark,
        followup_date: statusData.followup_date || null,
        updated_by: statusData.updated_by || currentUser?.id || null
      };
  
      console.log("Updating status with payload:", statusPayload);
      
      await axios.post(`${TECH_URL}/status`, statusPayload);
      
      const statusLabel = getStatusLabel(statusData.status);
      showToast(`Status updated to ${statusLabel} successfully!`, "success");
      
      fetchTechnicianEnquiries();
      handleCloseStatusModal();
  
    } catch (err) {
      console.error("Status update failed:", err);
      
      let errorMessage = "Status update failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showToast(errorMessage, "danger");
      
      if (err.response?.data) {
        console.error("Server response:", err.response.data);
      }
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append("full_name", formData.full_name);
      submitData.append("email", formData.email || "");
      submitData.append("contact", formData.contact || "");
      submitData.append("specialization", formData.specialization || "");
      submitData.append("experience", formData.experience || "");
      submitData.append("city", formData.city || "");
      submitData.append("description", formData.description || "");
      submitData.append("availability", formData.availability || "");
      submitData.append("expected_salary", formData.expected_salary || "");
      
      if (certificateFile) {
        submitData.append("certificate", certificateFile);
      }

      console.log("Submitting data:", submitData);

      if (editId) {
        await axios.put(`${TECH_URL}/${editId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showToast("Technician enquiry updated successfully!", "success");
      } else {
        await axios.post(TECH_URL, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showToast("Technician enquiry added successfully!", "success");
      }

      fetchTechnicianEnquiries();
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
      specialization: row.specialization || "",
      experience: row.experience?.toString() || "",
      city: row.city || "",
      certificate: row.certificate || "",
      description: row.description || "",
      availability: row.availability || "",
      expected_salary: row.expected_salary || ""
    });
    setCertificateFile(null);
  };

  // ================= RESET FORM =================
  const handleReset = () => {
    setEditId(null);
    setFormData({
      full_name: "",
      email: "",
      contact: "",
      specialization: "",
      experience: "",
      city: "",
      certificate: "",
      description: "",
      availability: "",
      expected_salary: ""
    });
    setCertificateFile(null);
    const fileInput = document.getElementById('certificateFile');
    if (fileInput) fileInput.value = '';
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this technician enquiry?")) return;

    try {
      await axios.delete(`${TECH_URL}/${id}`);
      showToast("Technician enquiry deleted!", "danger");
      fetchTechnicianEnquiries();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(err.response?.data?.message || err.message || "Delete failed", "danger");
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (statusValue) => {
    const option = getStatusOption(statusValue);
    
    const badgeStyles = {
      1: 'badge bg-info bg-opacity-25 text-info',
      2: 'badge bg-primary bg-opacity-25 text-primary',
      3: 'badge bg-warning bg-opacity-25 text-warning',
      4: 'badge bg-success bg-opacity-25 text-success',
      5: 'badge bg-danger bg-opacity-25 text-danger',
      6: 'badge bg-secondary bg-opacity-25 text-secondary',
      7: 'badge bg-dark bg-opacity-25 text-dark'
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
      name: "Specialization",
      selector: row => row.specialization || "N/A",
      sortable: true,
      wrap: true,
      cell: row => (
        <span className="badge bg-info bg-opacity-25 text-dark">
          {row.specialization || "N/A"}
        </span>
      )
    },
    {
      name: "Experience",
      selector: row => row.experience ? `${row.experience} years` : "N/A",
      sortable: true,
      width: "120px",
      cell: row => (
        row.experience ? (
          <span className="badge bg-success">
            {row.experience} {row.experience === 1 ? 'year' : 'years'}
          </span>
        ) : "N/A"
      )
    },
    {
      name: "City",
      selector: row => row.city || "N/A",
      sortable: true,
      width: "120px"
    },
    {
      name: "Description",
      selector: row => row.description || "N/A",
      wrap: true,
      cell: row => (
        <span title={row.description}>
          {row.description && row.description.length > 30 
            ? row.description.substring(0, 30) + "..." 
            : row.description || "N/A"}
        </span>
      )
    },
    {
      name: "Certificate",
      cell: row => (
        row.certificate ? (
          <a 
            href={row.certificate_url || row.certificate} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            <i className="ri-file-copy-line"></i> View
          </a>
        ) : "N/A"
      ),
      width: "100px"
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
            onClick={() => handleViewDetails(row)}
            type="button"
            title="View Details"
          >
            <i className="ri-eye-line"></i>
          </button>
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit(row)}
            type="button"
            title="Edit technician"
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.id)}
            type="button"
            title="Delete technician"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ),
      width: "120px"
    }
  ];

  // Summary statistics for technicians
  const getStatistics = () => {
    const total = enquiries.length;
    
    const specializations = enquiries.reduce((acc, curr) => {
      if (curr.specialization) {
        acc[curr.specialization] = (acc[curr.specialization] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topSpecialization = Object.entries(specializations)
      .sort((a, b) => b[1] - a[1])[0];
    
    const withExperience = enquiries.filter(e => e.experience && e.experience > 0).length;
    const withCertificate = enquiries.filter(e => e.certificate).length;
    const experiencedTechs = enquiries.filter(e => e.experience && e.experience >= 5).length;
    
    const statusCounts = statusOptions.map(opt => ({
      status: opt.value,
      label: opt.label,
      count: enquiries.filter(e => e.status === opt.value).length,
      color: opt.color,
      icon: opt.icon
    }));

    return { 
      total, 
      withExperience, 
      withCertificate,
      experiencedTechs,
      topSpecialization: topSpecialization ? topSpecialization[0] : 'None',
      topSpecializationCount: topSpecialization ? topSpecialization[1] : 0,
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
                <h4 className="mb-sm-0">Technician Enquiry Management</h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item active">Technician Enquiries</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-3">
            <div className="col-xl-3 col-md-6">
              <div className="card bg-primary bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-primary">Total Technicians</h6>
                      <h3>{stats.total}</h3>
                    </div>
                    <i className="ri-tools-line fs-1 text-primary opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-info bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-info">With Experience</h6>
                      <h3>{stats.withExperience}</h3>
                    </div>
                    <i className="ri-briefcase-line fs-1 text-info opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-success">With Certificate</h6>
                      <h3>{stats.withCertificate}</h3>
                    </div>
                    <i className="ri-file-copy-line fs-1 text-success opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-warning bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-warning">5+ Years Exp</h6>
                      <h3>{stats.experiencedTechs}</h3>
                    </div>
                    <i className="ri-star-line fs-1 text-warning opacity-50"></i>
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

          {/* Top Specialization Card */}
          {stats.topSpecialization !== 'None' && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card bg-secondary bg-opacity-10 border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="ri-medal-line fs-2 text-secondary me-3"></i>
                      <div>
                        <h6 className="text-secondary mb-1">Top Specialization</h6>
                        <h4 className="mb-0">{stats.topSpecialization} <small className="text-muted fs-6">({stats.topSpecializationCount} technicians)</small></h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-3">
            {/* TABLE */}
            <div className="col-md-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <h5 className="mb-0">
                    Technician Enquiries ({filteredData?.length || 0})
                  </h5>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        downloadExcel(filteredData, "technician_enquiries");
                      }}
                      type="button"
                      disabled={!filteredData?.length}
                    >
                      <i className="ri-download-line me-1"></i>
                      Export Excel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={fetchTechnicianEnquiries}
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
                      placeholder="Search technicians..."
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
                      <p className="mt-2">Loading technician enquiries...</p>
                    </div>
                  )}
                  
                  {fetchError && !isLoading && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {fetchError}
                      <button 
                        className="btn btn-sm btn-outline-danger ms-3" 
                        onClick={fetchTechnicianEnquiries}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && enquiries.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No technician enquiries found</p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={fetchTechnicianEnquiries}
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

      {/* STATUS UPDATE MODAL */}
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
            <div className="toast-body"></div>
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

export default TechnicianEnquiryList;