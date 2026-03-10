import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { CMS_URL, FILE_BASE_URL } from "../../services/endpoints";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const Inner = () => {
  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } = useCrud(CMS_URL);
  const downloadExcel = useExcelDownload();

  const [cms, setCms] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    page_name: "",
    page_title: "",
    page_keyword: "",
    page_description: "",
    details: "",
    image: null,
    status: "1",
  });

  // ================= IMAGE PATH =================
  const getCmsImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${FILE_BASE_URL}/uploads/vendor/${imagePath}`;
  };

  // ================= FETCH =================
  const fetchCms = async () => {
    try {
      const response = await get("");
      setCms(response.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchCms();
  }, [get]);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(cms, ["page_name", "page_title"]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("page_name", formData.page_name);
    data.append("page_title", formData.page_title);
    data.append("page_keyword", formData.page_keyword);
    data.append("page_description", formData.page_description);
    data.append("details", formData.details);
    data.append("status", formData.status);

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editId) {
        await put(`/${editId}`, data);
        showToast("CMS updated successfully!", "success");
      } else {
        await post("", data);
        showToast("CMS added successfully!", "success");
      }

      const response = await get("");
      setCms(response.data);

      setFormData({
        page_name: "",
        page_title: "",
        page_keyword: "",
        page_description: "",
        details: "",
        image: null,
        status: "1",
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
      page_name: row.page_name || "",
      page_title: row.page_title || "",
      page_keyword: row.page_keyword || "",
      page_description: row.page_description || "",
      details: row.details || "",
      image: null,
      status: row.status || "1",
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    try {
      await del(`/${id}`);
      showToast("CMS deleted successfully!", "danger");

      const response = await get("");
      setCms(response.data);

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Page Name",
      selector: (row) => row.page_name,
      sortable: true,
    },
    {
      name: "Page Title",
      selector: (row) => row.page_title,
      sortable: true,
    },
    {
      name: "Image",
      cell: (row) =>
        row.image ? (
          <img
            src={getCmsImageUrl(row.image)}
            alt="CMS"
            style={{
              width: "70px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "4px"
            }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      name: "Status",
      selector: (row) => (row.status == 1 ? "Active" : "Inactive"),
    },
    {
      name: "Action",
      cell: (row) => (
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
      ),
    },
  ];

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* ========== PAGE HEADER SECTION ========== */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">CMS Master</h4>
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <span>Home</span>
                    </li>
                    <li className="breadcrumb-item active">CMS Management</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">

            {/* ========== LEFT FORM ========== */}
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5>{editId ? "Edit CMS Page" : "Add CMS Page"}</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="card-body">

                    <div className="mb-2">
                      <label className="form-label">Page Name</label>
                      <input
                        type="text"
                        name="page_name"
                        className="form-control"
                        value={formData.page_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Page Title</label>
                      <input
                        type="text"
                        name="page_title"
                        className="form-control"
                        value={formData.page_title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Page Keyword</label>
                      <input
                        type="text"
                        name="page_keyword"
                        className="form-control"
                        value={formData.page_keyword}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Page Description</label>
                      <textarea
                        name="page_description"
                        className="form-control"
                        rows="2"
                        value={formData.page_description}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Content</label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.details || ""}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData((prev) => ({ ...prev, details: data }));
                        }}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleChange}
                      />

                      {editId &&
                        cms.find(item => item.id === editId)?.image && (
                          <div className="mt-2 text-center">
                            <img
                              src={getCmsImageUrl(cms.find(item => item.id === editId)?.image)}
                              alt="CMS"
                              style={{
                                width: "120px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "6px"
                              }}
                            />
                          </div>
                        )}
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

                  <div className="card-footer text-end">
                    <button className="btn btn-primary w-100">
                      {editId ? "Update Page" : "Save Page"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ========== RIGHT TABLE ========== */}
            <div className="col-md-8">
              <div className="card shadow-sm">

                {/* SEARCH + EXCEL DOWNLOAD */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">CMS Pages ({filteredData.length} items)</h5>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => downloadExcel(filteredData, "cms_pages")}
                    >
                      <i className="ri-download-2-line me-1"></i>
                      Download Excel
                    </button>
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search by page name or title..."
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