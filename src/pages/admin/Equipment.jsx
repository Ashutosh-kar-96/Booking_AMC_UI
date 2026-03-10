import DataTable from "react-data-table-component";
import useExcelDownload from "../../hooks/useExcelDownload";
import useSearch from "../../hooks/useSearch";
import useToast from "../../hooks/useToast";
import useCrud from "../../hooks/useCrud";

import { EQUIPMENT_URL, CATEGORY_URL } from "../../services/endpoints";
import { useEffect, useMemo, useState } from "react";

const Inner = () => {
  const { toastRef, showToast } = useToast();

  const equipmentCrud = useCrud(EQUIPMENT_URL);
  const categoryCrud = useCrud(CATEGORY_URL);

  const { get, post, put, delete: del, loading, error } = equipmentCrud;

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    status: 1
  });

  const [editId, setEditId] = useState(null);

  // ================= SAFE RESPONSE EXTRACTOR =================
  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const equipmentRes = await get("");
        setData(extractArray(equipmentRes));

        const categoryRes = await categoryCrud.get("");
        setCategories(extractArray(categoryRes));

      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    fetchData();
  }, []);

  // ================= BUILD CATEGORY TREE =================
  const buildTree = (items, parentId = null, level = 0) => {
    return items
      .filter(item => item.parent_id === parentId)
      .flatMap(item => [
        { ...item, level },
        ...buildTree(items, item.id, level + 1)
      ]);
  };

  const nestedCategories = useMemo(
    () => buildTree(categories),
    [categories]
  );

  // ================= CATEGORY LOOKUP MAP (FAST) =================
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

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
      name: "Equipment Name",
      selector: row => row.name,
      sortable: true
    },
    {
      name: "Category",
      selector: row => categoryMap[row.category_id] || "—",
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

  // ================= FORM HANDLING =================
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
      const payload = {
        name: formData.name,
        category_id: formData.category_id || null,
        status: formData.status
      };

      if (editId) {
        await put(`/${editId}`, payload);
        showToast("Equipment updated successfully!", "success");
      } else {
        await post("", payload);
        showToast("Equipment added successfully!", "success");
      }

      const response = await get("");
      setData(extractArray(response));

      setFormData({ name: "", category_id: "", status: 1 });
      setEditId(null);

    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      category_id: row.category_id || "",
      status: row.status
    });
    setEditId(row.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) {
      return;
    }

    try {
      await del(`/${id}`);
      showToast("Equipment deleted successfully!", "danger");

      const response = await get("");
      setData(extractArray(response));

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ================= UI =================
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          <div className="row">
            <div className="col-12">
              <h4 className="mb-3">Equipment Master</h4>
            </div>
          </div>

          <div className="row">

            {/* FORM */}
            <div className="col-lg-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>{editId ? "Update Equipment" : "Save Equipment"}</h5>

                  <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                      <label>Equipment Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label>Category</label>
                      <select
                        name="category_id"
                        className="form-control"
                        value={formData.category_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>

                        {nestedCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {"— ".repeat(cat.level) + cat.name}
                          </option>
                        ))}

                      </select>
                    </div>

                    <div className="mb-3">
                      <label>Status</label>
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

                    <button className="btn btn-primary w-100">
                      {editId ? "Update" : "Save"}
                    </button>

                  </form>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="col-lg-9">
              <div className="card shadow-sm">
                <div className="card-body">

                  <div className="d-flex justify-content-between mb-3">
                    <h5>Equipment List ({filteredData.length})</h5>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          downloadExcel(filteredData, "equipment")
                        }
                      >
                        Download Excel
                      </button>

                      <input
                        type="text"
                        className="form-control"
                        style={{ width: 250 }}
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) =>
                          setSearchTerm(e.target.value)
                        }
                      />
                    </div>
                  </div>

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
                  />

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className="toast-container position-fixed top-0 end-0 p-3">
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
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Inner;