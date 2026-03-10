import React, { useEffect, useState } from "react";
import axios from "axios";

const Inner = () => {

  const [coupon, setCoupon] = useState([]);
  const [cities, setCities] = useState([]);
  const [edit, setEdit] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    city_id: "",
    discount_type: "1",
    discount_value: "",
    valid_upto: "",
    used_upto: "",
    no_of_use_user: "",
    price_cart: "",
    image: null,
    status: "1",
  });

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 🔹 CHANGE API URL
  const COUPON_API = "http://localhost:5000/api/coupon";
  const CITY_API = "http://localhost:5000/api/city";

  // ================= FETCH =================
  const fetchCoupon = async () => {
    try {
      const res = await axios.get(COUPON_API, config);
      setCoupon(res.data.data || res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get(CITY_API, config);
      setCities(res.data.data || res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCoupon();
    fetchCities();
  }, []);

  // ================= HANDLE CHANGE =================
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

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      if (edit) {
        await axios.put(`${COUPON_API}/${formData.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(COUPON_API, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchCoupon();
      setEdit(null);

      setFormData({
        id: "",
        name: "",
        code: "",
        city_id: "",
        discount_type: "1",
        discount_value: "",
        valid_upto: "",
        used_upto: "",
        no_of_use_user: "",
        price_cart: "",
        image: null,
        status: "1",
      });

    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  // ================= EDIT =================
  const handleEdit = (row) => {
    setEdit(row);

    setFormData({
      id: row._id,
      name: row.name,
      code: row.code,
      city_id: row.city_id,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
      valid_upto: row.valid_upto?.split("T")[0],
      used_upto: row.used_upto,
      no_of_use_user: row.no_of_use_user,
      price_cart: row.price_cart,
      image: null,
      status: row.status,
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`${COUPON_API}/${id}`, config);
      fetchCoupon();
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row g-3">

            {/* FORM */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5>{edit ? "Edit Coupon" : "Add Coupon"}</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="card-body">

                    <div className="mb-2">
                      <label>Coupon Name</label>
                      <input type="text" name="name" className="form-control"
                        value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="mb-2">
                      <label>Coupon Code</label>
                      <input type="text" name="code" className="form-control"
                        value={formData.code} onChange={handleChange} required />
                    </div>

                    <div className="mb-2">
                      <label>Select City</label>
                      <select name="city_id" className="form-select"
                        value={formData.city_id} onChange={handleChange}>
                        <option value="">Select City</option>
                        {cities.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.city_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label>Discount Type</label>
                      <select name="discount_type" className="form-select"
                        value={formData.discount_type} onChange={handleChange}>
                        <option value="1">Flat</option>
                        <option value="2">%</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <label>Discount Value</label>
                      <input type="number" name="discount_value" className="form-control"
                        value={formData.discount_value} onChange={handleChange} />
                    </div>

                    <div className="mb-2">
                      <label>Valid Upto</label>
                      <input type="date" name="valid_upto" className="form-control"
                        value={formData.valid_upto} onChange={handleChange} />
                    </div>

                    <div className="mb-2">
                      <label>No. Of Uses</label>
                      <input type="number" name="used_upto" className="form-control"
                        value={formData.used_upto} onChange={handleChange} />
                    </div>

                    <div className="mb-2">
                      <label>No. Of Use Per User</label>
                      <input type="number" name="no_of_use_user" className="form-control"
                        value={formData.no_of_use_user} onChange={handleChange} />
                    </div>

                    <div className="mb-2">
                      <label>Apply On Cart Price</label>
                      <input type="number" name="price_cart" className="form-control"
                        value={formData.price_cart} onChange={handleChange} />
                    </div>

                    <div className="mb-2">
                      <label>Image</label>
                      <input type="file" name="image"
                        className="form-control"
                        onChange={handleChange} />
                    </div>

                    <div className="mb-2">
                      <label>Status</label>
                      <select name="status" className="form-select"
                        value={formData.status} onChange={handleChange}>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>

                  </div>

                  <div className="card-footer text-end">
                    <button className="btn btn-primary">
                      {edit ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* TABLE */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5>Coupon List</h5>
                </div>

                <div className="card-body table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Coupon</th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Valid</th>
                        <th>Uses</th>
                        <th>Cart</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupon.length > 0 ? (
                        coupon.map((row, index) => (
                          <tr key={row._id}>
                            <td>{index + 1}</td>
                            <td>{row.name}</td>
                            <td>{row.code}</td>
                            <td>{row.discount_type == 1 ? "Flat" : "%"}</td>
                            <td>{row.discount_value}</td>
                            <td>{row.valid_upto?.split("T")[0]}</td>
                            <td>{row.used_upto}</td>
                            <td>{row.price_cart}</td>
                            <td>{row.status == 1 ? "Active" : "Inactive"}</td>
                            <td>
                              <button className="btn btn-warning btn-sm me-2"
                                onClick={() => handleEdit(row)}>
                                Edit
                              </button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(row._id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center">
                            No Coupons Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Inner;