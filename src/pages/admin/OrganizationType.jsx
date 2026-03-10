import DataTable from "react-data-table-component";
import useExcelDownload from "../../hooks/useExcelDownload";
import useSearch from "../../hooks/useSearch";
import useToast from "../../hooks/useToast";
import useCrud from "../../hooks/useCrud";

import { ORGANISATION_URL } from "../../services/endpoints";
import { useEffect, useState } from "react";

const Inner = () => {

  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } = useCrud(ORGANISATION_URL);

  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    status: 1
  });

  const [editId, setEditId] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("");
        setData(response.data || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    fetchData();
  }, [get]);

  // ================= SEARCH + EXCEL =================
  const downloadExcel = useExcelDownload();
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(data, ["name"]);

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      name: "ID",
      selector: row => row.id,
      sortable: true,
      width: "80px"
    },
    {
      name: "Organization Name",
      selector: row => row.name,
      sortable: true
    },
    {
      name: "Status",
      selector: row => row.status === 1 ? "Active" : "Inactive",
      sortable: true
    },
    {
      name: "Created Date",
      selector: row =>
        row.created_date
          ? new Date(row.created_date).toLocaleDateString()
          : "—",
      sortable: true
    },
    {
      name: "Action",
      cell: row => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // ================= FORM =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "status" ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (editId) {
        await put(`/${editId}`, formData);
        showToast("Organization updated successfully!", "success");
      } else {
        await post("", formData);
        showToast("Organization added successfully!", "success");
      }

      const response = await get("");
      setData(response.data || []);

      setFormData({ name: "", status: 1 });
      setEditId(null);

    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      status: row.status
    });

    setEditId(row.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) {
      return;
    }

    try {
      await del(`/${id}`);
      showToast("Organization deleted successfully!", "danger");

      const response = await get("");
      setData(response.data || []);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ================= UI =================
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Organization Master</h4>
              </div>
            </div>
          </div>

          <div className="row">

            {/* LEFT FORM */}
            <div className="col-lg-3">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    {editId ? "Update Organization" : "Save Organization"}
                  </h5>
                </div>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                      <label className="form-label">Organization Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter organization name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                      {editId ? "Update Organization" : "Save Organization"}
                    </button>

                  </form>
                </div>
              </div>
            </div>

            {/* RIGHT TABLE */}
            <div className="col-lg-9">
              <div className="card shadow-sm">

                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Organization List ({filteredData.length} items)
                  </h5>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => downloadExcel(filteredData, "organizations")}
                    >
                      Download Excel
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="card-body">
                  {loading && <p>Loading...</p>}
                  {error && <p className="text-danger">{error}</p>}

                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    persistTableHead
                    noDataComponent="No organizations found"
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div
          ref={toastRef}
          className="toast align-items-center text-bg-success border-0"
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">Message</div>
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