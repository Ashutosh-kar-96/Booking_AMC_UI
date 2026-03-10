import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { CONTACT_URL, TECH_URL, VENDOR_ENQUIRY_URL } from "../../services/endpoints";

const EnquiryList = () => {
  const { toastRef, showToast } = useToast();
  
  // Initialize CRUD hooks for each endpoint
  const contactApi = useCrud(CONTACT_URL);
  const techApi = useCrud(TECH_URL);
  const vendorApi = useCrud(VENDOR_ENQUIRY_URL);
  
  const downloadExcel = useExcelDownload();

  const [enquiries, setEnquiries] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

  // Form state based on your database structure
  const [formData, setFormData] = useState({
    type: "",
    full_name: "",
    email: "",
    contact: "",
    specialization: "",
    experience: "",
    city: "",
    certificate: "",
    description: ""
  });

  // Type options for dropdown
  const typeOptions = [
    { value: 1, label: "Vendor", api: vendorApi, endpoint: VENDOR_ENQUIRY_URL },
    { value: 2, label: "Technician", api: techApi, endpoint: TECH_URL },
    { value: 3, label: "User", api: contactApi, endpoint: CONTACT_URL }
  ];

  // Get the appropriate API based on type
  const getApiByType = (type) => {
    switch(parseInt(type)) {
      case 1: return vendorApi;
      case 2: return techApi;
      case 3: return contactApi;
      default: return contactApi;
    }
  };

  // ================= FETCH ALL ENQUIRIES =================
  const fetchAllEnquiries = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log("Fetching all enquiries...");
      
      // Fetch from all three endpoints simultaneously
      const [contactRes, techRes, vendorRes] = await Promise.allSettled([
        contactApi.get(""),
        techApi.get(""),
        vendorApi.get("")
      ]);

      console.log("Contact Response:", contactRes);
      console.log("Tech Response:", techRes);
      console.log("Vendor Response:", vendorRes);

      let allEnquiries = [];

      // Process Contact enquiries (type 3 - User)
      if (contactRes.status === 'fulfilled' && contactRes.value) {
        const contactData = extractData(contactRes.value);
        const contactEnquiries = Array.isArray(contactData) 
          ? contactData.map(item => ({ ...item, type: 3 }))
          : [];
        allEnquiries = [...allEnquiries, ...contactEnquiries];
        console.log("Contact enquiries:", contactEnquiries);
      }

      // Process Technician enquiries (type 2)
      if (techRes.status === 'fulfilled' && techRes.value) {
        const techData = extractData(techRes.value);
        const techEnquiries = Array.isArray(techData) 
          ? techData.map(item => ({ ...item, type: 2 }))
          : [];
        allEnquiries = [...allEnquiries, ...techEnquiries];
        console.log("Tech enquiries:", techEnquiries);
      }

      // Process Vendor enquiries (type 1)
      if (vendorRes.status === 'fulfilled' && vendorRes.value) {
        const vendorData = extractData(vendorRes.value);
        const vendorEnquiries = Array.isArray(vendorData) 
          ? vendorData.map(item => ({ ...item, type: 1 }))
          : [];
        allEnquiries = [...allEnquiries, ...vendorEnquiries];
        console.log("Vendor enquiries:", vendorEnquiries);
      }

      // Sort by ID or date (newest first)
      allEnquiries.sort((a, b) => (b.id || 0) - (a.id || 0));
      
      setEnquiries(allEnquiries);
      console.log("All enquiries combined:", allEnquiries);

    } catch (err) {
      console.error("Fetch failed:", err);
      setFetchError(err.message || "Failed to fetch enquiries");
      showToast("Failed to fetch enquiries", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract data from response
  const extractData = (response) => {
    if (!response) return [];
    
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      return response;
    } else if (response.records) {
      return Array.isArray(response.records) ? response.records : [];
    } else if (response.enquiries) {
      return Array.isArray(response.enquiries) ? response.enquiries : [];
    } else if (response.items) {
      return Array.isArray(response.items) ? response.items : [];
    } else if (response.result) {
      return Array.isArray(response.result) ? response.result : [];
    }
    
    return [];
  };

  useEffect(() => {
    fetchAllEnquiries();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(enquiries, ["full_name", "email", "specialization", "city", "description"]);

  // Filter by type if selected
  const getFilteredData = () => {
    let data = filteredData;
    if (selectedType !== "all") {
      data = data.filter(item => item.type === parseInt(selectedType));
    }
    return data;
  };

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type) {
      showToast("Please select enquiry type", "warning");
      return;
    }

    try {
      const api = getApiByType(formData.type);
      
      // Convert string values to appropriate types for database
      const submitData = {
        full_name: formData.full_name,
        email: formData.email,
        contact: formData.contact ? parseInt(formData.contact) : null,
        specialization: formData.specialization,
        experience: formData.experience ? parseInt(formData.experience) : null,
        city: formData.city,
        certificate: formData.certificate,
        description: formData.description
      };

      console.log("Submitting data:", submitData);

      if (editId) {
        await api.put(`/${editId}`, submitData);
        showToast("Enquiry updated successfully!", "success");
      } else {
        await api.post("", submitData);
        showToast("Enquiry added successfully!", "success");
      }

      fetchAllEnquiries();
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
      type: row.type?.toString() || "",
      full_name: row.full_name || "",
      email: row.email || "",
      contact: row.contact?.toString() || "",
      specialization: row.specialization || "",
      experience: row.experience?.toString() || "",
      city: row.city || "",
      certificate: row.certificate || "",
      description: row.description || ""
    });
  };

  // ================= RESET FORM =================
  const handleReset = () => {
    setEditId(null);
    setFormData({
      type: "",
      full_name: "",
      email: "",
      contact: "",
      specialization: "",
      experience: "",
      city: "",
      certificate: "",
      description: ""
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id, type) => {
    if (!window.confirm("Delete this enquiry?")) return;

    try {
      const api = getApiByType(type);
      await api.delete(`/${id}`);
      showToast("Enquiry deleted!", "danger");
      fetchAllEnquiries();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(err.response?.data?.message || err.message || "Delete failed", "danger");
    }
  };

  // Helper function to get type label
  const getTypeLabel = (type) => {
    const types = {
      1: "Vendor",
      2: "Technician",
      3: "User"
    };
    return types[type] || "Unknown";
  };

  // Helper function to get badge color based on type
  const getTypeBadgeColor = (type) => {
    const colors = {
      1: "warning",
      2: "info",
      3: "success"
    };
    return colors[type] || "secondary";
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
      name: "Type",
      selector: row => getTypeLabel(row.type),
      sortable: true,
      cell: row => (
        <span className={`badge bg-${getTypeBadgeColor(row.type)}`}>
          {getTypeLabel(row.type)}
        </span>
      ),
      width: "100px"
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
      wrap: true
    },
    {
      name: "Experience",
      selector: row => row.experience ? `${row.experience} years` : "N/A",
      sortable: true,
      width: "120px"
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
          {row.description && row.description.length > 50 
            ? row.description.substring(0, 50) + "..." 
            : row.description || "N/A"}
        </span>
      )
    },
    {
      name: "Certificate",
      cell: row => (
        row.certificate ? (
          <a 
            href={row.certificate} 
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
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit(row)}
            type="button"
          >
            <i className="ri-pencil-line"></i>
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.id, row.type)}
            type="button"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ),
      width: "100px"
    }
  ];

  // Summary statistics
  const getStatistics = () => {
    const total = enquiries.length;
    const vendors = enquiries.filter(e => e.type === 1).length;
    const technicians = enquiries.filter(e => e.type === 2).length;
    const users = enquiries.filter(e => e.type === 3).length;
    return { total, vendors, technicians, users };
  };

  const stats = getStatistics();
  const displayData = getFilteredData();

  // Debug: Log state changes
  useEffect(() => {
    console.log("Current enquiries state:", enquiries);
    console.log("Filtered data:", displayData);
  }, [enquiries, displayData, selectedType]);

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* PAGE HEADER */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Enquiry Management</h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item active">Enquiries</li>
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
                      <h6 className="text-primary">Total Enquiries</h6>
                      <h3>{stats.total}</h3>
                    </div>
                    <i className="ri-questionnaire-line fs-1 text-primary opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div 
                className="card bg-warning bg-opacity-10 border-0 cursor-pointer"
                onClick={() => setSelectedType(selectedType === 1 ? "all" : 1)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-warning">Vendors</h6>
                      <h3>{stats.vendors}</h3>
                    </div>
                    <i className="ri-store-line fs-1 text-warning opacity-50"></i>
                  </div>
                  {selectedType === 1 && (
                    <span className="badge bg-warning mt-2">Filtered</span>
                  )}
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div 
                className="card bg-info bg-opacity-10 border-0 cursor-pointer"
                onClick={() => setSelectedType(selectedType === 2 ? "all" : 2)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-info">Technicians</h6>
                      <h3>{stats.technicians}</h3>
                    </div>
                    <i className="ri-tools-line fs-1 text-info opacity-50"></i>
                  </div>
                  {selectedType === 2 && (
                    <span className="badge bg-info mt-2">Filtered</span>
                  )}
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div 
                className="card bg-success bg-opacity-10 border-0 cursor-pointer"
                onClick={() => setSelectedType(selectedType === 3 ? "all" : 3)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-success">Users</h6>
                      <h3>{stats.users}</h3>
                    </div>
                    <i className="ri-user-line fs-1 text-success opacity-50"></i>
                  </div>
                  {selectedType === 3 && (
                    <span className="badge bg-success mt-2">Filtered</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="row g-3">
            {/* LEFT FORM */}
           

            {/* RIGHT TABLE */}
            <div className="col-md-12">
              <div className="card shadow-sm">
                {/* SEARCH + DOWNLOAD + FILTER */}
                <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <h5 className="mb-0">
                    Enquiries ({displayData?.length || 0})
                    {selectedType !== "all" && (
                      <span className="badge bg-info ms-2">
                        Filtered: {getTypeLabel(selectedType)}
                      </span>
                    )}
                  </h5>

                  <div className="d-flex gap-2 flex-wrap">
                    {/* Type Filter */}
                    <select
                      className="form-select"
                      style={{ width: "150px" }}
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn btn-success"
                      onClick={() => {
                        console.log("Exporting data:", displayData);
                        downloadExcel(displayData, "enquiries");
                      }}
                      type="button"
                      disabled={!displayData?.length}
                    >
                      <i className="ri-download-line me-1"></i>
                      Export Excel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={fetchAllEnquiries}
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
                      placeholder="Search enquiries..."
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
                      <p className="mt-2">Loading enquiries...</p>
                    </div>
                  )}
                  
                  {fetchError && !isLoading && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {fetchError}
                      <button 
                        className="btn btn-sm btn-outline-danger ms-3" 
                        onClick={fetchAllEnquiries}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && enquiries.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No enquiries found</p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={fetchAllEnquiries}
                      >
                        Refresh
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && enquiries.length > 0 && (
                    <DataTable
                      columns={columns}
                      data={displayData}
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

export default EnquiryList;