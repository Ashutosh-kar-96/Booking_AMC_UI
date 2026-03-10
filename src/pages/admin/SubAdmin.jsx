import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { USERS_URL, DEPT_DESIGN_URL } from "../../services/endpoints";

const Inner = () => {
  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } = useCrud(USERS_URL);
  const deptApi = useCrud(DEPT_DESIGN_URL);
  const downloadExcel = useExcelDownload();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [deptFetchError, setDeptFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");

  // Updated formData with fixed user_type = "2" (Subadmin)
  const [formData, setFormData] = useState({
    full_name: "",
    user_type: "2", // Fixed to Subadmin (hidden)
    email: "",
    contact: "",
    profile_image: "",
    role: "",
    status: "1",
    user_name: "",
    password: "",
    department_id: "", // New field for department
    designation_id: "" // New field for designation
  });

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log("Fetching users from:", USERS_URL);
      const response = await get("");
      console.log("API Response:", response);
      
      // Filter users to show only Subadmins (user_type = 2)
      if (response && response.data) {
        const allUsers = Array.isArray(response.data) ? response.data : [];
        // Filter to show only subadmins
        const subadmins = allUsers.filter(user => user.user_type === 2);
        setUsers(subadmins);
        console.log("Subadmins set from response.data:", subadmins);
      } else if (Array.isArray(response)) {
        const subadmins = response.filter(user => user.user_type === 2);
        setUsers(subadmins);
        console.log("Subadmins set from response array:", subadmins);
      } else if (response && response.users) {
        const subadmins = Array.isArray(response.users) 
          ? response.users.filter(user => user.user_type === 2) 
          : [];
        setUsers(subadmins);
        console.log("Subadmins set from response.users:", subadmins);
      } else {
        console.error("Unexpected response structure:", response);
        setUsers([]);
        setFetchError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Fetch failed details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setFetchError(err.message || "Failed to fetch users");
      showToast("Failed to fetch users", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= FETCH DEPARTMENTS =================
  const fetchDepartments = async () => {
    setIsDeptLoading(true);
    setDeptFetchError(null);
    
    try {
      console.log("Fetching departments from:", DEPT_DESIGN_URL);
      const response = await deptApi.get("");
      console.log("Departments Full Response:", response);
      
      let items = [];
      
      // Check different possible response structures
      if (response && response.data) {
        console.log("Response has data property:", response.data);
        items = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        console.log("Response is an array:", response);
        items = response;
      } else if (response && response.records) {
        console.log("Response has records property:", response.records);
        items = Array.isArray(response.records) ? response.records : [];
      } else if (response && response.items) {
        console.log("Response has items property:", response.items);
        items = Array.isArray(response.items) ? response.items : [];
      } else if (response && response.result) {
        console.log("Response has result property:", response.result);
        items = Array.isArray(response.result) ? response.result : [];
      } else {
        console.log("Unknown response structure, trying to use response as is:", response);
        // If response is an object with numeric keys, convert to array
        if (response && typeof response === 'object') {
          const possibleArray = Object.values(response);
          if (possibleArray.length > 0 && possibleArray.every(item => typeof item === 'object')) {
            items = possibleArray;
          }
        }
      }

      console.log("Processed items:", items);

      if (items.length === 0) {
        console.warn("No items found in response");
        // For testing, let's add sample data if no data is returned
        // Comment this out in production
        const sampleData = [
          { id: 1, name: "IT Department", parent_id: null, status: 1 },
          { id: 2, name: "HR Department", parent_id: null, status: 1 },
          { id: 3, name: "Finance Department", parent_id: null, status: 1 },
          { id: 4, name: "Software Engineer", parent_id: 1, status: 1 },
          { id: 5, name: "System Administrator", parent_id: 1, status: 1 },
          { id: 6, name: "HR Manager", parent_id: 2, status: 1 },
          { id: 7, name: "Accountant", parent_id: 3, status: 1 }
        ];
        items = sampleData;
      }

      // Filter to get only departments (parent_id is null or 0)
      const depts = items.filter(item => 
        item.parent_id === null || 
        item.parent_id === 0 || 
        item.parent_id === "null" || 
        item.parent_id === "0"
      );
      console.log("Filtered departments:", depts);
      setDepartments(depts);
      
      // Get all designations (parent_id is not null and not 0)
      const desigs = items.filter(item => 
        item.parent_id !== null && 
        item.parent_id !== 0 && 
        item.parent_id !== "null" && 
        item.parent_id !== "0"
      );
      console.log("Filtered designations:", desigs);
      setDesignations(desigs);
      
    } catch (err) {
      console.error("Failed to fetch departments - Full error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setDeptFetchError(err.message || "Failed to fetch departments");
      showToast("Failed to fetch departments", "warning");
      
      // For testing, set sample data if API fails
      const sampleData = [
        { id: 1, name: "IT Department", parent_id: null, status: 1 },
        { id: 2, name: "HR Department", parent_id: null, status: 1 },
        { id: 3, name: "Finance Department", parent_id: null, status: 1 },
        { id: 4, name: "Software Engineer", parent_id: 1, status: 1 },
        { id: 5, name: "System Administrator", parent_id: 1, status: 1 },
        { id: 6, name: "HR Manager", parent_id: 2, status: 1 },
        { id: 7, name: "Accountant", parent_id: 3, status: 1 }
      ];
      
      const depts = sampleData.filter(item => item.parent_id === null);
      setDepartments(depts);
      
      const desigs = sampleData.filter(item => item.parent_id !== null);
      setDesignations(desigs);
      
    } finally {
      setIsDeptLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // ================= FETCH DESIGNATIONS BY DEPARTMENT =================
  const getDesignationsByDepartment = (deptId) => {
    if (!deptId) return [];
    console.log("Filtering designations for department:", deptId);
    console.log("Available designations:", designations);
    const filtered = designations.filter(desig => {
      const parentId = parseInt(desig.parent_id);
      const deptIdNum = parseInt(deptId);
      return parentId === deptIdNum;
    });
    console.log("Filtered designations:", filtered);
    return filtered;
  };

  // Handle department change to filter designations
  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    console.log("Department selected:", deptId);
    setSelectedDept(deptId);
    setSelectedDesignation(""); // Reset designation selection
    setFormData({ 
      ...formData, 
      department_id: deptId,
      designation_id: "" // Clear designation when department changes
    });
  };

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(users, ["full_name", "email", "user_name", "role"]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert string values to appropriate types for database
      const submitData = {
        full_name: formData.full_name,
        user_type: 2, // Always send as 2 (Subadmin)
        email: formData.email,
        contact: formData.contact ? parseInt(formData.contact) : null,
        profile_image: formData.profile_image,
        role: formData.role,
        status: parseInt(formData.status),
        user_name: formData.user_name,
        password: formData.password,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        designation_id: formData.designation_id ? parseInt(formData.designation_id) : null
      };

      // Remove password if empty during edit
      if (editId && !submitData.password) {
        delete submitData.password;
      }

      console.log("Submitting data:", submitData);

      if (editId) {
        await put(`/${editId}`, submitData);
        showToast("Subadmin updated successfully!", "success");
      } else {
        await post("", submitData);
        showToast("Subadmin added successfully!", "success");
      }

      fetchUsers();
      handleReset();

    } catch (err) {
      console.error("Save failed:", err);
      showToast(err.response?.data?.message || err.message || "Operation failed", "danger");
    }
  };

  // ================= EDIT =================
  const handleEdit = (row) => {
    setEditId(row.id);
    setSelectedDept(row.department_id || "");
    setSelectedDesignation(row.designation_id || "");

    setFormData({
      full_name: row.full_name || "",
      user_type: "2", // Fixed to 2
      email: row.email || "",
      contact: row.contact?.toString() || "",
      profile_image: row.profile_image || "",
      role: row.role || "",
      status: row.status?.toString() || "1",
      user_name: row.user_name || "",
      password: "",
      department_id: row.department_id?.toString() || "",
      designation_id: row.designation_id?.toString() || ""
    });
  };

  // ================= RESET FORM =================
  const handleReset = () => {
    setEditId(null);
    setSelectedDept("");
    setSelectedDesignation("");
    setFormData({
      full_name: "",
      user_type: "2", // Fixed to 2
      email: "",
      contact: "",
      profile_image: "",
      role: "",
      status: "1",
      user_name: "",
      password: "",
      department_id: "",
      designation_id: ""
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subadmin?")) return;

    try {
      await del(`/${id}`);
      showToast("Subadmin deleted!", "danger");
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(err.response?.data?.message || err.message || "Delete failed", "danger");
    }
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statuses = {
      0: "Inactive",
      1: "Active",
      2: "Deleted"
    };
    return statuses[status] || "Unknown";
  };

  // Helper function to get department name by ID
  const getDepartmentName = (deptId) => {
    if (!deptId) return "N/A";
    const dept = departments.find(d => d.id === parseInt(deptId));
    return dept ? dept.name : "N/A";
  };

  // Helper function to get designation name by ID
  const getDesignationName = (desigId) => {
    if (!desigId) return "N/A";
    const desig = designations.find(d => d.id === parseInt(desigId));
    return desig ? desig.name : "N/A";
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
      name: "Username",
      selector: row => row.user_name || "N/A",
      sortable: true
    },
    {
      name: "Email",
      selector: row => row.email || "N/A",
      sortable: true
    },
    {
      name: "Contact",
      selector: row => row.contact || "N/A"
    },
    {
      name: "Department",
      selector: row => getDepartmentName(row.department_id),
      sortable: true
    },
    {
      name: "Designation",
      selector: row => getDesignationName(row.designation_id),
      sortable: true
    },
    {
      name: "Role",
      selector: row => row.role || "N/A"
    },
    {
      name: "Status",
      selector: row => getStatusLabel(row.status),
      sortable: true,
      cell: row => (
        <span className={`badge ${row.status === 1 ? 'bg-success' : row.status === 0 ? 'bg-warning' : 'bg-danger'}`}>
          {getStatusLabel(row.status)}
        </span>
      )
    },
    {
      name: "Created",
      selector: row => row.created_date ? new Date(row.created_date).toLocaleDateString() : "N/A",
      sortable: true
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit(row)}
            type="button"
            disabled={row.status === 2}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.id)}
            type="button"
            disabled={row.status === 2}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // Debug: Log users state whenever it changes
  useEffect(() => {
    console.log("Current subadmins state:", users);
    console.log("Current departments:", departments);
    console.log("Current designations:", designations);
    console.log("Filtered data:", filteredData);
  }, [users, departments, designations, filteredData]);

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* PAGE HEADER */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Subadmin Management</h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item active">Subadmins</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row g-3">
            {/* LEFT FORM */}
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{editId ? "Edit Subadmin" : "Add Subadmin"}</h5>
                  {editId && (
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={handleReset}
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="card-body">
                    {/* Hidden user_type field (always 2) */}
                    <input type="hidden" name="user_type" value="2" />
                    
                    <div className="mb-2">
                      <label className="form-label">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="full_name"
                        className="form-control"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Contact</label>
                      <input
                        type="number"
                        name="contact"
                        className="form-control"
                        value={formData.contact}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        name="profile_image"
                        className="form-control"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            console.log("Selected file:", file);
                            // You can handle file upload here
                          }
                        }}
                      />
                    </div>

                    {/* Department Dropdown */}
                    <div className="mb-2">
                      <label className="form-label">Department <span className="text-danger">*</span></label>
                      {isDeptLoading ? (
                        <div className="text-muted">Loading departments...</div>
                      ) : (
                        <select
                          name="department_id"
                          className="form-select"
                          value={formData.department_id}
                          onChange={handleDepartmentChange}
                          required
                        >
                          <option value="">Select Department</option>
                          {departments.length > 0 ? (
                            departments.map(dept => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No departments available</option>
                          )}
                        </select>
                      )}
                      {deptFetchError && (
                        <small className="text-danger">{deptFetchError}</small>
                      )}
                    </div>

                    {/* Designation Dropdown (dependent on department) */}
                    <div className="mb-2">
                      <label className="form-label">Designation <span className="text-danger">*</span></label>
                      <select
                        name="designation_id"
                        className="form-select"
                        value={formData.designation_id}
                        onChange={handleChange}
                        required
                        disabled={!formData.department_id || isDeptLoading}
                      >
                        <option value="">Select Designation</option>
                        {formData.department_id && getDesignationsByDepartment(formData.department_id).length > 0 ? (
                          getDesignationsByDepartment(formData.department_id).map(desig => (
                            <option key={desig.id} value={desig.id}>
                              {desig.name}
                            </option>
                          ))
                        ) : (
                          formData.department_id && <option value="" disabled>No designations for this department</option>
                        )}
                      </select>
                      {!formData.department_id && (
                        <small className="text-muted">Please select a department first</small>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        name="role"
                        className="form-control"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="e.g., Manager, Supervisor"
                      />
                    </div>
                    
                    <div className="mb-2">
                      <label className="form-label">Username <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="user_name"
                        className="form-control"
                        value={formData.user_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">
                        Password {editId ? "(Leave blank to keep current)" : ""} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required={!editId}
                        minLength="6"
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>

                  </div>

                  <div className="card-footer">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : (editId ? "Update Subadmin" : "Save Subadmin")}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT TABLE */}
            <div className="col-md-8">
              <div className="card shadow-sm">
                {/* SEARCH + DOWNLOAD */}
                <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <h5 className="mb-0">
                    Subadmins ({filteredData?.length || 0})
                  </h5>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        console.log("Exporting data:", filteredData);
                        downloadExcel(filteredData, "subadmins");
                      }}
                      type="button"
                      disabled={!filteredData?.length}
                    >
                      <i className="ri-download-line me-1"></i>
                      Export Excel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        fetchUsers();
                        fetchDepartments();
                      }}
                      type="button"
                      disabled={isLoading || isDeptLoading}
                    >
                      <i className="ri-refresh-line me-1"></i>
                      Refresh
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search subadmins..."
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
                      <p className="mt-2">Loading subadmins...</p>
                    </div>
                  )}
                  
                  {fetchError && !isLoading && (
                    <div className="alert alert-danger">
                      <strong>Error:</strong> {fetchError}
                      <button 
                        className="btn btn-sm btn-outline-danger ms-3" 
                        onClick={() => {
                          fetchUsers();
                          fetchDepartments();
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  {error && !isLoading && (
                    <div className="alert alert-warning">
                      API Error: {error}
                    </div>
                  )}

                  {!isLoading && !fetchError && !error && users.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No subadmins found</p>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => {
                          fetchUsers();
                          fetchDepartments();
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                  )}

                  {!isLoading && !fetchError && users.length > 0 && (
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

export default Inner;