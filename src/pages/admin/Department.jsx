import DataTable from "react-data-table-component";
import useExcelDownload from "../../hooks/useExcelDownload";
import useSearch from "../../hooks/useSearch";
import useToast from "../../hooks/useToast";
import useCrud from "../../hooks/useCrud";

import { DEPT_DESIGN_URL } from "../../services/endpoints";
import { useEffect, useState } from "react";

const Inner = () => {

  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } = useCrud(DEPT_DESIGN_URL);

  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    parent: ""
  });

  const [editId, setEditId] = useState(null);

  // 🔥 Convert flat list to tree (for dropdown indent)
  const buildTree = (items, parentId = null, level = 0) => {
    return items
      .filter(item => item.parent_id === parentId)
      .flatMap(item => [
        { ...item, level },
        ...buildTree(items, item.id, level + 1)
      ]);
  };

  const nestedItems = buildTree(data);

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

  // ================= SEARCH =================
  const downloadExcel = useExcelDownload();
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(data, ["name", "parent_name"]);

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      name: "ID",
      selector: row => row.id,
      sortable: true,
      width: "80px"
    },
    {
      name: "Name",
      selector: row => row.name,
      sortable: true
    },
    {
      name: "Parent",
      selector: row => row.parent_name || "—",
      sortable: true
    },
    {
      name: "Status",
      selector: row => row.status === 1 ? "Active" : "Inactive",
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
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (editId) {
        await put(`/${editId}`, {
          name: formData.name,
          parent_id: formData.parent || null,
          status: 1
        });

        showToast("Updated successfully!", "success");

      } else {

        await post("", {
          name: formData.name,
          parent_id: formData.parent || null,
          status: 1
        });

        showToast("Added successfully!", "success");
      }

      const response = await get("");
      setData(response.data || []);

      setFormData({ name: "", parent: "" });
      setEditId(null);

    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      parent: row.parent_id || ""
    });

    setEditId(row.id);
  };

  const handleDelete = async (id) => {

    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await del(`/${id}`);

      showToast("Deleted successfully!", "danger");

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
                <h4 className="mb-sm-0">Department / Designation Master</h4>
              </div>
            </div>
          </div>

          <div className="row">

            {/* LEFT FORM */}
            <div className="col-lg-3">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    {editId ? "Update" : "Save"}
                  </h5>
                </div>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Parent</label>
                      <select
                        name="parent"
                        className="form-control"
                        value={formData.parent}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Parent</option>

                        {nestedItems.map(item => (
                          <option key={item.id} value={item.id}>
                            {"— ".repeat(item.level) + item.name}
                          </option>
                        ))}

                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                      {editId ? "Update" : "Save"}
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
                    List ({filteredData.length} items)
                  </h5>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => downloadExcel(filteredData, "dept-design")}
                    >
                      Download Excel
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search..."
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
                    noDataComponent="No records found"
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