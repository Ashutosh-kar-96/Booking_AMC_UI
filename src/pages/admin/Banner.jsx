import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { BANNER_URL, FILE_BASE_URL } from "../../services/endpoints";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const Inner = () => {

  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } =
    useCrud(BANNER_URL);

  const downloadExcel = useExcelDownload();

  const [banner, setBanner] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    banner_title: "",
    banner_subtitle: "",
    orderby: "",
    urrl: "",
    description: "",
    image: null,
    status: "1",
  });

  // ================= IMAGE URL =================
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${FILE_BASE_URL}/uploads/vendor/${imagePath}`;
  };

  // ================= FETCH =================
  const fetchBanner = async () => {
    try {
      const response = await get("");
      const result = response?.data?.data || response?.data || [];
      setBanner(result);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(banner, ["banner_title"]);

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
    data.append("banner_title", formData.banner_title);
    data.append("banner_subtitle", formData.banner_subtitle);
    data.append("orderby", formData.orderby);
    data.append("urrl", formData.urrl);
    data.append("description", formData.description);
    data.append("status", formData.status);

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editId) {
        await put(`/${editId}`, data);
        showToast("Banner updated successfully!", "success");
      } else {
        await post("", data);
        showToast("Banner added successfully!", "success");
      }

      await fetchBanner();

      setFormData({
        banner_title: "",
        banner_subtitle: "",
        orderby: "",
        urrl: "",
        description: "",
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
    setEditId(row.banner_id);

    setFormData({
      banner_title: row.banner_title || "",
      banner_subtitle: row.banner_subtitle || "",
      orderby: row.orderby || "",
      urrl: row.urrl || "",
      description: row.description || "",
      image: null,
      status: row.status || "1",
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await del(`/${id}`);
      showToast("Banner deleted successfully!", "danger");
      await fetchBanner();
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
      name: "Image",
      cell: (row) =>
        row.image ? (
          <img
            src={getImageUrl(row.image)}
            alt="Banner"
            style={{
              width: "80px",
              height: "50px",
              objectFit: "cover",
            }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      name: "Title",
      selector: (row) => row.banner_title,
      sortable: true,
    },
    {
      name: "Subtitle",
      selector: (row) => row.banner_subtitle,
    },
    {
      name: "Order",
      selector: (row) => row.orderby,
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
            onClick={() => handleDelete(row.banner_id)}
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
          <div className="row g-3">

            {/* LEFT FORM */}
            <div className="col-md-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5>{editId ? "Edit Banner" : "Add Banner"}</h5>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="card-body">

                      {/* Title */}
                      <div className="mb-2">
                        <label className="form-label">Banner Title</label>
                        <input
                          type="text"
                          name="banner_title"
                          className="form-control"
                          value={formData.banner_title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="mb-2">
                        <label className="form-label">Banner Subtitle</label>
                        <input
                          type="text"
                          name="banner_subtitle"
                          className="form-control"
                          value={formData.banner_subtitle}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Order */}
                      <div className="mb-2">
                        <label className="form-label">Order</label>
                        <input
                          type="number"
                          name="orderby"
                          className="form-control"
                          value={formData.orderby}
                          onChange={handleChange}
                        />
                      </div>

                      {/* URL */}
                      <div className="mb-2">
                        <label className="form-label">URL</label>
                        <input
                          type="text"
                          name="urrl"
                          className="form-control"
                          value={formData.urrl}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Description */}
                      <div className="mb-2">
                      <label className="form-label">Description</label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.description || ""}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData((prev) => ({
                            ...prev,
                            description: data,
                          }));
                        }}
                      />
                    </div>

                      {/* Image */}
                      <div className="mb-2">
                        <label className="form-label">Banner Image</label>
                        <input
                          type="file"
                          name="image"
                          className="form-control"
                          onChange={handleChange}
                        />

                        {editId &&
                          banner.find(item => item.banner_id === editId)?.image && (
                            <div className="text-center mt-2">
                              <img
                                src={getImageUrl(
                                  banner.find(item => item.banner_id === editId)?.image
                                )}
                                alt="Preview"
                                style={{
                                  width: "100px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          )}
                      </div>

                      {/* Status */}
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
                        {editId ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            {/* RIGHT TABLE */}
            <div className="col-md-8">
              <div className="card shadow-sm">
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
        <div
          ref={toastRef}
          className="toast align-items-center text-bg-success border-0"
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