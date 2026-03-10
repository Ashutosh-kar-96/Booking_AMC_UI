import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { VENDOR_URL, FILE_BASE_URL, LOCATION_URL, DEPT_DESIGN_URL } from "../../../services/endpoints";

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editLoading, setEditLoading] = useState(null);
  const [cityMap, setCityMap] = useState({});
  const [stateMap, setStateMap] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // Fetch vendors
        const vendorRes = await api.get(VENDOR_URL);
        const vendorData = vendorRes.data;
        const list = Array.isArray(vendorData?.data)
          ? vendorData.data
          : Array.isArray(vendorData)
          ? vendorData
          : [];
        setVendors(list);

        // Fetch locations to build state/city maps
        try {
          const locRes = await api.get(LOCATION_URL);
          const locData = locRes.data;
          const locations = Array.isArray(locData?.data)
            ? locData.data
            : Array.isArray(locData)
            ? locData
            : [];

          const cities = {};
          const states = {};
          locations.forEach((item) => {
            cities[item.id] = item.name;
            if (item.parent_id && item.parent_name) {
              states[item.parent_id] = item.parent_name;
            }
          });
          setCityMap(cities);
          setStateMap(states);
        } catch (e) {
          console.error("Location fetch error:", e);
        }

        // Fetch dept/designation to build vendor type map
        try {
          const deptRes = await api.get(DEPT_DESIGN_URL);
          const deptData = deptRes.data;
          const depts = Array.isArray(deptData?.data)
            ? deptData.data
            : Array.isArray(deptData)
            ? deptData
            : [];

          const depts_map = {};
          depts.forEach((item) => {
            depts_map[item.id] = item.name || item.designation || item.title;
          });
          setDeptMap(depts_map);
        } catch (e) {
          console.error("Dept fetch error:", e);
        }

      } catch (err) {
        console.error("Failed to fetch vendors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleEdit = async (vendorId) => {
    try {
      setEditLoading(vendorId);
      const res = await api.get(`${VENDOR_URL}/${vendorId}`);
      const data = res.data;
      const vendor = data?.data || data;
      navigate("/admin/vendor", { state: { editVendor: vendor } });
    } catch (err) {
      console.error("Failed to fetch vendor details:", err);
      const vendor = vendors.find((v) => v.id === vendorId);
      if (vendor) navigate("/admin/vendor", { state: { editVendor: vendor } });
    } finally {
      setEditLoading(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filtered = search.trim() === ""
    ? vendors
    : vendors.filter((v) => {
        const q = search.toLowerCase().trim();
        return (
          (v.full_name && v.full_name.toLowerCase().includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)) ||
          (v.contact && v.contact.toString().includes(q)) ||
          (v.trade_name && v.trade_name.toLowerCase().includes(q))
        );
      });

  const getStatusBadge = (status) => {
    if (status === 1 || status === "active")
      return <span className="badge bg-success">Active</span>;
    if (status === 0 || status === "inactive")
      return <span className="badge bg-danger">Inactive</span>;
    return <span className="badge bg-warning text-dark">Pending</span>;
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Vendor List</h4>
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item"><span>Home</span></li>
                    <li className="breadcrumb-item active">Vendor List</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">

                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">All Vendors</h5>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/admin/vendor")}
                  >
                    + Add New Vendor
                  </button>
                </div>

                <div className="card-body">

                  {/* Search Bar */}
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="ri-search-line"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, email, mobile..."
                          value={search}
                          onChange={handleSearchChange}
                          autoComplete="off"
                        />
                        {search && (
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setSearch("")}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="col-md-8 d-flex align-items-center">
                      {search && (
                        <small className="text-muted">
                          Showing {filtered.length} of {vendors.length} vendors
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <p className="mt-2 text-muted">Loading vendors...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-search-line fs-1 d-block mb-2"></i>
                      No vendors found for "{search}"
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th>#</th>
                            <th>Profile</th>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Vendor Type</th>
                            <th>Legal Name</th>
                            <th>State</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((vendor, index) => (
                            <tr key={vendor.id}>
                              <td>{index + 1}</td>
                              <td>
                                {vendor.profile_image ? (
                                  <img
                                    src={`${FILE_BASE_URL}/uploads/vendor/${vendor.profile_image}`}
                                    alt="profile"
                                    width="40"
                                    height="40"
                                    style={{ borderRadius: "50%", objectFit: "cover" }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#0d6efd",
                                    display: vendor.profile_image ? "none" : "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    color: "white",
                                    fontSize: 16,
                                    flexShrink: 0,
                                  }}
                                >
                                  {vendor.full_name?.charAt(0)?.toUpperCase() || "V"}
                                </div>
                              </td>
                              <td>{vendor.full_name || "-"}</td>
                              <td>{vendor.contact || "-"}</td>
                              <td>{vendor.email || "-"}</td>
                              <td>{deptMap[vendor.dep_desig_id] || vendor.dep_desig_id || "-"}</td>
                              <td>{vendor.trade_name || "-"}</td>
                              <td>{stateMap[vendor.state] || vendor.state || "-"}</td>
                              <td>{cityMap[vendor.city] || vendor.city || "-"}</td>
                              <td>{getStatusBadge(vendor.status)}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(vendor.id)}
                                  disabled={editLoading === vendor.id}
                                >
                                  {editLoading === vendor.id ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <><i className="ri-edit-line"></i> Edit</>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card-footer text-muted">
                  Total: {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
                  {search && ` (${filtered.length} matching)`}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorList;