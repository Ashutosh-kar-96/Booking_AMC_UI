import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";

import useToast from "../../hooks/useToast";
import { CONTACT_URL } from "../../services/endpoints";

const EnquiryStatusHistory = () => {
  const { id } = useParams(); // Get enquiry ID from URL
  const navigate = useNavigate();
  const { toastRef, showToast } = useToast();

  const [statusHistory, setStatusHistory] = useState([]);
  const [enquiryDetails, setEnquiryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Status options mapping based on your comments in the table structure
  const statusOptions = {
    1: { label: "New", color: "info", icon: "ri-star-line", badge: "info" },
    2: { label: "In Progress", color: "primary", icon: "ri-loader-4-line", badge: "primary" },
    3: { label: "Follow Up", color: "warning", icon: "ri-calendar-todo-line", badge: "warning" },
    4: { label: "Converted", color: "success", icon: "ri-checkbox-circle-line", badge: "success" },
    5: { label: "Lost", color: "danger", icon: "ri-close-circle-line", badge: "danger" },
    6: { label: "Junk", color: "secondary", icon: "ri-delete-bin-line", badge: "secondary" },
    7: { label: "On Hold", color: "dark", icon: "ri-pause-circle-line", badge: "dark" }
  };

  // Helper function to format date
  const formatDate = (dateString, format = 'full') => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (format === 'date') {
      return `${day}-${month}-${year}`;
    } else if (format === 'full') {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
    
    return `${year}-${month}-${day}`;
  };

  // Helper function to get status display
  const getStatusDisplay = (statusValue) => {
    return statusOptions[statusValue] || { 
      label: "Unknown", 
      color: "secondary", 
      icon: "ri-question-line", 
      badge: "secondary" 
    };
  };

  // Fetch status history for the specific enquiry ID
  const fetchStatusHistory = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      // First, fetch the main enquiry details from contact table
      try {
        const enquiryResponse = await axios.get(`${CONTACT_URL}/${id}`);
        if (enquiryResponse?.data?.data) {
          setEnquiryDetails(enquiryResponse.data.data);
        } else if (enquiryResponse?.data) {
          setEnquiryDetails(enquiryResponse.data);
        }
      } catch (err) {
        console.log("Enquiry details not found, but continuing with status history");
      }

      // Fetch status history from enquiry_status table using the correct endpoint
      const historyResponse = await axios.get(`${CONTACT_URL}/status/${id}`);
      
      let historyData = [];
      if (historyResponse?.data?.data) {
        historyData = historyResponse.data.data;
      } else if (Array.isArray(historyResponse?.data)) {
        historyData = historyResponse.data;
      } else if (Array.isArray(historyResponse)) {
        historyData = historyResponse;
      }

      // Sort by created_date in descending order (newest first)
      const sortedHistory = historyData.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
      
      setStatusHistory(sortedHistory);

      if (sortedHistory.length === 0) {
        showToast("No status history found for this enquiry", "info");
      }

    } catch (err) {
      console.error("Fetch failed:", err);
      setFetchError(err.message || "Failed to fetch status history");
      showToast("Failed to fetch status history", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStatusHistory();
    }
  }, [id]);

  // Get user name (you can enhance this with a users API call)
  const getUserName = (updatedBy) => {
    return `User #${updatedBy}`;
  };

  // Table columns for status history
  const historyColumns = [
   
    {
      name: "Status ID",
      selector: row => row.id,
      sortable: true,
      width: "90px"
    },
    {
      name: "Enquiry ID",
      selector: row => row.inq_id,
      sortable: true,
      width: "90px"
    },
    {
      name: "Status",
      cell: (row) => {
        const status = getStatusDisplay(row.status);
        return (
          <span className={`badge bg-${status.badge} bg-opacity-25 text-${status.badge} p-2`}>
            <i className={`${status.icon} me-1`}></i>
            {status.label}
          </span>
        );
      },
      sortable: true,
      sortFunction: (a, b) => (a.status || 0) - (b.status || 0),
      width: "150px"
    },
    {
      name: "Remarks",
      selector: row => row.remark || "No remarks",
      wrap: true,
      cell: row => (
        <div className="text-wrap" style={{ maxWidth: "300px" }}>
          {row.remark ? (
            row.remark
          ) : (
            <span className="text-muted fst-italic">No remarks</span>
          )}
        </div>
      )
    },
    {
      name: "Follow-up Date",
      selector: row => row.followup_date || "Not set",
      cell: row => row.followup_date ? (
        <span className="badge bg-info bg-opacity-10 text-info p-2">
          <i className="ri-calendar-line me-1"></i>
          {formatDate(row.followup_date, 'date')}
        </span>
      ) : (
        <span className="text-muted fst-italic">Not set</span>
      ),
      width: "150px"
    },
    {
      name: "Updated By",
      selector: row => getUserName(row.updated_by),
      cell: row => (
        <span>
          <i className="ri-user-line me-1"></i>
          {getUserName(row.updated_by)}
        </span>
      ),
      width: "120px"
    },
    {
      name: "Created Date",
      selector: row => formatDate(row.created_date, 'full'),
      cell: row => (
        <span className="text-muted small">
          <i className="ri-time-line me-1"></i>
          {formatDate(row.created_date, 'full')}
        </span>
      ),
      sortable: true,
      sortFunction: (a, b) => new Date(a.created_date) - new Date(b.created_date),
      width: "180px"
    },
    {
      name: "Last Updated",
      selector: row => formatDate(row.updated_date, 'full'),
      cell: row => (
        <span className="text-muted small">
          <i className="ri-refresh-line me-1"></i>
          {formatDate(row.updated_date, 'full')}
        </span>
      ),
      width: "180px"
    }
  ];

  // Summary statistics
  const getStatistics = () => {
    const totalUpdates = statusHistory.length;
    
    // Count by status
    const statusCounts = Object.keys(statusOptions).map(key => ({
      status: parseInt(key),
      label: statusOptions[key].label,
      count: statusHistory.filter(h => h.status === parseInt(key)).length,
      color: statusOptions[key].badge,
      icon: statusOptions[key].icon
    })).filter(s => s.count > 0);

    // Get first and last update
    const firstUpdate = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : null;
    const lastUpdate = statusHistory.length > 0 ? statusHistory[0] : null;

    // Get unique users who updated
    const uniqueUpdaters = [...new Set(statusHistory.map(h => h.updated_by))].length;

    return { totalUpdates, statusCounts, firstUpdate, lastUpdate, uniqueUpdaters };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading status history for Enquiry #{id}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="alert alert-danger">
              <h5>Error Loading Data</h5>
              <p>{fetchError}</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
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

          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                
                <h4 className="mb-sm-0">
                  <button 
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => navigate(-1)}
                    title="Go Back"
                  >
                    <i className="ri-arrow-left-line"></i>
                  </button>
                  Enquiry Status History - #{id}
                </h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <span onClick={() => navigate('/admin/user-enquiries')} style={{ cursor: 'pointer' }}>
                        User Enquiries
                      </span>
                    </li>
                    <li className="breadcrumb-item active">
                      Status History
                    </li>
                  </ol>
                </div>

              </div>
            </div>
          </div>

          {/* Enquiry Details Card - Only show if available */}
          {enquiryDetails && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card border-primary border-opacity-25">
                  <div className="card-header bg-primary bg-opacity-10">
                    <h5 className="mb-0 text-primary">
                      <i className="ri-information-line me-2"></i>
                      Enquiry Details
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <small className="text-muted d-block">Full Name</small>
                        <strong>{enquiryDetails.full_name || 'N/A'}</strong>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">Email</small>
                        <strong>{enquiryDetails.email || 'N/A'}</strong>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Contact</small>
                        <strong>{enquiryDetails.contact || 'N/A'}</strong>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted d-block">Interest/Service</small>
                        <strong>{enquiryDetails.interest_service || 'N/A'}</strong>
                      </div>
                    </div>
                    {enquiryDetails.description && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <small className="text-muted d-block">Description</small>
                          <p className="mb-0">{enquiryDetails.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Status History Table */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="ri-history-line me-2"></i>
                    Status Update History
                  </h5>
                  
                  <div>
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={fetchStatusHistory}
                      disabled={loading}
                    >
                      <i className="ri-refresh-line me-1"></i>
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {statusHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="ri-information-line fs-1 text-muted"></i>
                      <p className="text-muted mt-2">No status updates found for this enquiry</p>
                      <p className="text-muted small">Enquiry ID: {id}</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={historyColumns}
                      data={statusHistory}
                      pagination
                      highlightOnHover
                      striped
                      responsive
                      paginationPerPage={10}
                      paginationRowsPerPageOptions={[10, 25, 50, 100]}
                      defaultSortFieldId={8}
                      defaultSortAsc={false}
                    />
                  )}
                </div>

                <div className="card-footer bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="ri-database-2-line me-1"></i>
                      Showing {statusHistory.length} status update{statusHistory.length !== 1 ? 's' : ''} from enquiry_status table
                    </small>
                    <small className="text-muted">
                      <i className="ri-price-tag-line me-1"></i>
                      inq_id: {id}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
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

export default EnquiryStatusHistory;