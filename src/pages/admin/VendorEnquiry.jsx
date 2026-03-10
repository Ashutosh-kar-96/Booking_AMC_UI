import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { VENDOR_ENQUIRY_URL } from "../../services/endpoints";

const VendorEnquiryList = () => {
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

  // Form state for vendor fields
  const [formData, setFormData] = useState({
    company_name: "",
    full_name: "",
    email: "",
    contact: "",
    company_website: "",
    supply_category: "",
    address: "",
    description: ""
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Supply categories options
  const supplyCategories = [
    "Raw Materials",
    "Finished Products", 
    "Services",
    "Equipment",
    "Technology",
    "Consulting",
    "Logistics",
    "Packaging",
    "Electronics",
    "Furniture",
    "Office Supplies",
    "Construction",
    "Automotive",
    "Healthcare",
    "Food & Beverage",
    "Textiles",
    "Chemicals",
    "Other"
  ];

  // ================= FETCH VENDOR ENQUIRIES =================
  const fetchVendorEnquiries = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log("Fetching vendor enquiries from:", VENDOR_ENQUIRY_URL);
      const response = await axios.get(VENDOR_ENQUIRY_URL);
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
      console.log("Vendor enquiries set:", enquiryData);

    } catch (err) {
      console.error("Fetch failed:", err);
      setFetchError(err.message || "Failed to fetch vendor enquiries");
      showToast("Failed to fetch vendor enquiries", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorEnquiries();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(enquiries, ["company_name", "full_name", "email", "supply_category", "address", "description"]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  // View vendor details
  const handleViewDetails = (row) => {
    navigate(`/admin/enquiryview/${row.id}`, { 
      state: { 
        vendorData: row
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
      
      await axios.post(`${VENDOR_ENQUIRY_URL}/status`, statusPayload);
      
      const statusLabel = getStatusLabel(statusData.status);
      showToast(`Status updated to ${statusLabel} successfully!`, "success");
      
      fetchVendorEnquiries();
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
      // Validate required fields
      if (!formData.company_name || !formData.full_name || !formData.email || !formData.supply_category) {
        showToast("Please fill in all required fields", "warning");
        return;
      }

      const submitData = {
        company_name: formData.company_name,
        full_name: formData.full_name,
        email: formData.email,
        contact: formData.contact ? parseInt(formData.contact) : null,
        company_website: formData.company_website,
        supply_category: formData.supply_category,
        address: formData.address,
        description: formData.description
      };

      console.log("Submitting data:", submitData);

      if (editId) {
        await axios.put(`${VENDOR_ENQUIRY_URL}/${editId}`, submitData);
        showToast("Vendor enquiry updated successfully!", "success");
      } else {
        await axios.post(VENDOR_ENQUIRY_URL, submitData);
        showToast("Vendor enquiry added successfully!", "success");
      }

      fetchVendorEnquiries();
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
      company_name: row.company_name || "",
      full_name: row.full_name || "",
      email: row.email || "",
      contact: row.contact?.toString() || "",
      company_website: row.company_website || "",
      supply_category: row.supply_category || "",
      address: row.address || "",
      description: row.description || ""
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= RESET FORM =================
  const handleReset = () => {
    setEditId(null);
    setFormData({
      company_name: "",
      full_name: "",
      email: "",
      contact: "",
      company_website: "",
      supply_category: "",
      address: "",
      description: ""
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor enquiry?")) return;

    try {
      await axios.delete(`${VENDOR_ENQUIRY_URL}/${id}`);
      showToast("Vendor enquiry deleted!", "danger");
      fetchVendorEnquiries();
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
      name: "Company Name",
      selector: row => row.company_name || "N/A",
      sortable: true,
      wrap: true
    },
    {
      name: "Contact Person",
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
      name: "Website",
      selector: row => row.company_website || "N/A",
      sortable: true,
      cell: row => (
        row.company_website ? (
          <a 
            href={row.company_website.startsWith('http') ? row.company_website : `https://${row.company_website}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-decoration-none"
          >
            <i className="ri-external-link-line me-1"></i>
            {row.company_website.length > 20 
              ? row.company_website.substring(0, 20) + "..." 
              : row.company_website}
          </a>
        ) : "N/A"
      )
    },
    {
      name: "Supply Category",
      selector: row => row.supply_category || "N/A",
      sortable: true,
      wrap: true,
      cell: row => (
        <span className="badge bg-warning bg-opacity-25 text-dark">
          <i className="ri-price-tag-line me-1"></i>
          {row.supply_category || "N/A"}
        </span>
      )
    },
    {
      name: "Address",
      selector: row => row.address || "N/A",
      wrap: true,
      cell: row => (
        <span title={row.address}>
          <i className="ri-map-pin-line me-1 text-muted"></i>
          {row.address && row.address.length > 30 
            ? row.address.substring(0, 30) + "..." 
            : row.address || "N/A"}
        </span>
      )
    },
    {
      name: "Description",
      selector: row => row.description || "N/A",
      wrap: true,
      cell: row => (
        <span title={row.description}>
          <i className="ri-file-text-line me-1 text-muted"></i>
          {row.description && row.description.length > 30 
            ? row.description.substring(0, 30) + "..." 
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
            title="Edit vendor"
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.id)}
            type="button"
            title="Delete vendor"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ),
      width: "120px"
    }
  ];

  // Summary statistics for vendors
  const getStatistics = () => {
    const total = enquiries.length;
    
    // Count by supply category
    const categories = enquiries.reduce((acc, curr) => {
      if (curr.supply_category) {
        acc[curr.supply_category] = (acc[curr.supply_category] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topCategory = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])[0];
    
    const withWebsite = enquiries.filter(e => e.company_website).length;
    const withAddress = enquiries.filter(e => e.address).length;
    const uniqueCategories = Object.keys(categories).length;
    
    const statusCounts = statusOptions.map(opt => ({
      status: opt.value,
      label: opt.label,
      count: enquiries.filter(e => e.status === opt.value).length,
      color: opt.color,
      icon: opt.icon
    }));

    return { 
      total, 
      withWebsite, 
      withAddress,
      uniqueCategories,
      topCategory: topCategory ? topCategory[0] : 'None',
      topCategoryCount: topCategory ? topCategory[1] : 0,
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
                <h4 className="mb-sm-0">
                  <i className="ri-store-line me-2"></i>
                  Vendor Enquiry Management
                </h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <a href="/admin/dashboard">Home</a>
                    </li>
                    <li className="breadcrumb-item active">Vendor Enquiries</li>
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
                      <h6 className="text-primary">Total Vendors</h6>
                      <h3>{stats.total}</h3>
                    </div>
                    <i className="ri-store-line fs-1 text-primary opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-info bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-info">With Website</h6>
                      <h3>{stats.withWebsite}</h3>
                    </div>
                    <i className="ri-global-line fs-1 text-info opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-success">With Address</h6>
                      <h3>{stats.withAddress}</h3>
                    </div>
                    <i className="ri-map-pin-line fs-1 text-success opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-warning bg-opacity-10 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-warning">Categories</h6>
                      <h3>{stats.uniqueCategories}</h3>
                    </div>
                    <i className="ri-price-tag-line fs-1 text-warning opacity-50"></i>
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

          {/* Top Category Card */}
          {stats.topCategory !== 'None' && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card bg-secondary bg-opacity-10 border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="ri-medal-line fs-2 text-secondary me-3"></i>
                      <div>
                        <h6 className="text-secondary mb-1">Top Supply Category</h6>
                        <h4 className="mb-0">{stats.topCategory} <small className="text-muted fs-6">({stats.topCategoryCount} vendors)</small></h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          
          {/* TABLE SECTION */}
          <div className="row g-3">
            <div className="col-md-12">
              <div className="card shadow-sm">
                {/* SEARCH + DOWNLOAD */}
                <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <h5 className="mb-0">
                    <i className="ri-list-check me-2"></i>
                    Vendor Enquiries List ({filteredData?.length || 0})
                  </h5>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        downloadExcel(filteredData, "vendor_enquiries");
                      }}
                      type="button"
                      disabled={!filteredData?.length}
                    >
                      <i className="ri-download-line me-1"></i>
                      Export Excel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={fetchVendorEnquiries}
                      type="button"
                      disabled={isLoading}
                    >
                      <i className={`ri-${isLoading ? 'loader-4-line spin' : 'refresh-line'} me-1`}></i>
                      Refresh
                    </button>

                    <div className="position-relative">
                      <i className="ri-search-line position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
                      <input
                        type="text"
                        className="form-control ps-4"
                        style={{ width: "250px" }}
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  {isLoading && (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading vendor enquiries...</p>
                    </div>
                  )}
                  
                  {fetchError && !isLoading && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {fetchError}
                      <button 
                        className="btn btn-sm btn-outline-danger ms-3" 
                        onClick={fetchVendorEnquiries}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && enquiries.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No vendor enquiries found</p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={fetchVendorEnquiries}
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
                  Update Status - {selectedEnquiry.company_name}
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
                  <label htmlFor="updated_by" className="form-label fw-bold">Updated By</label>
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

      {/* Add this CSS for spinner animation */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VendorEnquiryList;