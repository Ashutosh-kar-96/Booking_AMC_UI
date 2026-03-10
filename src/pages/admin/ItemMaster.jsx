import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { ITEM_URL, CATEGORY_URL, SUBCATEGORY_URL } from "../../services/endpoints";

const Inner = () => {
  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } = useCrud(ITEM_URL);
  const downloadExcel = useExcelDownload();

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    name: "",
    capacity: "",
    lifeCycle: ""
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(CATEGORY_URL);
        const result = await res.json();
        setCategories(Array.isArray(result?.data) ? result.data : result || []);
      } catch (err) {
        console.error("Category fetch failed:", err);
      }
    };
    fetchCategories();
  }, []);

  // ================= FETCH SUBCATEGORIES =================
  useEffect(() => {
    if (!formData.category) {
      setSubCategories([]);
      return;
    }

    const fetchSubCategories = async () => {
      try {
        const res = await fetch(
          `${SUBCATEGORY_URL}?category_id=${formData.category}`
        );

        const result = await res.json();

        const safeData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        setSubCategories(safeData);
      } catch (err) {
        console.error("Subcategory fetch failed:", err);
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [formData.category]);

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {
    try {
      const response = await get("");

      console.log("Item API Response:", response);

      const safeData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setData(safeData);
    } catch (err) {
      console.error("Item fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } = useSearch(data, [
    "name",
    "category_name",
    "sub_category_name"
  ]);

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px"
    },
    {
      name: "Category",
      selector: row => row.category_name,
      sortable: true
    },
    {
      name: "Sub Category",
      selector: row => row.sub_category_name,
      sortable: true
    },
    {
      name: "Item Name",
      selector: row => row.name,
      sortable: true
    },
    {
      name: "Capacity",
      selector: row => row.capacity,
      sortable: true
    },
    {
      name: "Life Cycle",
      selector: row => row.lifeCycle || row.life_cycle,
      sortable: true
    },
    {
      name: "Action",
      cell: row => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      category_id: formData.category,
      sub_category_id: formData.subCategory,
      name: formData.name,
      capacity: formData.capacity,
      lifeCycle: formData.lifeCycle
    };

    try {
      if (editId) {
        await put(`/${editId}`, payload);
        showToast("Item updated successfully!", "success");
      } else {
        await post("", payload);
        showToast("Item added successfully!", "success");
      }

      fetchItems();

      setFormData({
        category: "",
        subCategory: "",
        name: "",
        capacity: "",
        lifeCycle: ""
      });

      setEditId(null);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (row) => {
    setEditId(row.id);
    setFormData({
      category: row.category_id || "",
      subCategory: row.sub_category_id || "",
      name: row.name || "",
      capacity: row.capacity || "",
      lifeCycle: row.lifeCycle || row.life_cycle || ""
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await del(`/${id}`);
      showToast("Item deleted successfully!", "danger");
      fetchItems();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* HEADER */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Item Master</h4>
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item active">Item Management</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">

            {/* LEFT FORM */}
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5>{editId ? "Edit Item" : "Add Item"}</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="card-body">

                    <div className="mb-2">
                      <label className="form-label">Category</label>
                      <select
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Sub Category</label>
                      <select
                        name="subCategory"
                        className="form-select"
                        value={formData.subCategory}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Sub Category</option>
                        {subCategories.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Capacity</label>
                      <input
                        type="text"
                        name="capacity"
                        className="form-control"
                        value={formData.capacity}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Life Cycle</label>
                      <input
                        type="text"
                        name="lifeCycle"
                        className="form-control"
                        value={formData.lifeCycle}
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  <div className="card-footer text-end">
                    <button className="btn btn-primary w-100">
                      {editId ? "Update Item" : "Save Item"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT TABLE */}
            <div className="col-md-8">
              <div className="card shadow-sm">

                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Item List ({filteredData.length} items)
                  </h5>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => downloadExcel(filteredData, "item_master")}
                    >
                      Download Excel
                    </button>

                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search by name or category..."
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
                    noDataComponent="No items found"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div ref={toastRef} className="toast align-items-center text-bg-success border-0">
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