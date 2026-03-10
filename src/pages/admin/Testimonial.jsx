import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

import useCrud from "../../hooks/useCrud";
import useToast from "../../hooks/useToast";
import useSearch from "../../hooks/useSearch";
import useExcelDownload from "../../hooks/useExcelDownload";

import { TESTIMONIAL_URL, FILE_BASE_URL } from "../../services/endpoints";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const Inner = () => {

  const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } =
    useCrud(TESTIMONIAL_URL);

  const downloadExcel = useExcelDownload();

  const [testimonial, setTestimonial] = useState([]);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    image: null,
    status: "1",
  });

  // ================= IMAGE URL =================
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${FILE_BASE_URL}/uploads/vendor/${imagePath}`;
  };

  // ================= FETCH =================
  const fetchTestimonial = async () => {
    try {
      const response = await get("");
      const result = response?.data?.data || response?.data || [];
      setTestimonial(result);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchTestimonial();
  }, []);

  // ================= SEARCH =================
  const { searchTerm, setSearchTerm, filteredData } =
    useSearch(testimonial, ["name"]);

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
    data.append("name", formData.name);
    data.append("message", formData.message);
    data.append("status", formData.status);

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editId) {
        await put(`/${editId}`, data);
        showToast("Testimonial updated successfully!", "success");
      } else {
        await post("", data);
        showToast("Testimonial added successfully!", "success");
      }

      await fetchTestimonial();

      setFormData({
        name: "",
        message: "",
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
    setEditId(row.testimonial_id);

    setFormData({
      name: row.name || "",
      message: row.message || "",
      image: null,
      status: row.status || "1",
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      await del(`/${id}`);
      showToast("Testimonial deleted successfully!", "danger");
      await fetchTestimonial();
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
            alt="Testimonial"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Message",
      cell: (row) => (
        <div
          dangerouslySetInnerHTML={{ __html: row.message }}
          style={{ maxWidth: "250px" }}
        />
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
            onClick={() => handleDelete(row.testimonial_id)}
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
                  <h5>{editId ? "Edit Testimonial" : "Add Testimonial"}</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="card-body">

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
                      <label className="form-label">Message</label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.message || ""}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData((prev) => ({
                            ...prev,
                            message: data,
                          }));
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
                        testimonial.find(item => item.testimonial_id === editId)?.image && (
                          <div className="mt-2 text-center">
                            <img
                              src={getImageUrl(
                                testimonial.find(item => item.testimonial_id === editId)?.image
                              )}
                              alt="Preview"
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "50%",
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