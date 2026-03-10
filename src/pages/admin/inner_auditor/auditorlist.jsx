import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { AUDITOR_URL, FILE_BASE_URL, LOCATION_URL, DEPT_DESIGN_URL } from "../../../services/endpoints";

const AuditorList = () => {
  const [auditors, setAuditors] = useState([]);
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

        const auditorRes = await api.get(AUDITOR_URL);
        const auditorData = auditorRes.data;
        const list = Array.isArray(auditorData?.data)
          ? auditorData.data
          : Array.isArray(auditorData)
          ? auditorData
          : [];
        setAuditors(list);

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
            if (item.parent_id) {
              // It's a city
              cities[item.id] = item.name;
              if (item.parent_name) {
                states[item.parent_id] = item.parent_name;
              }
            } else {
              // It's a state (no parent_id)
              states[item.id] = item.name;
            }
          });
          setCityMap(cities);
          setStateMap(states);
        } catch (e) {
          console.error("Location fetch error:", e);
        }

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
        console.error("Failed to fetch auditors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleEdit = async (auditorId) => {
    try {
      setEditLoading(auditorId);
      const res = await api.get(`${AUDITOR_URL}/${auditorId}`);
      const data = res.data;
      const auditor = data?.data || data;
      navigate("/admin/auditor", { state: { editAuditor: auditor } });
    } catch (err) {
      console.error("Failed to fetch auditor details:", err);
      const auditor = auditors.find((a) => a.id === auditorId);
      if (auditor) navigate("/admin/auditor", { state: { editAuditor: auditor } });
    } finally {
      setEditLoading(null);
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);

  const filtered = search.trim() === ""
    ? auditors
    : auditors.filter((a) => {
        const q = search.toLowerCase().trim();
        return (
          (a.full_name && a.full_name.toLowerCase().includes(q)) ||
          (a.email && a.email.toLowerCase().includes(q)) ||
          (a.contact && a.contact.toString().includes(q))
        );
      });

  const getStatusBadge = (status) => {
    if (status === 1 || status === "active")
      return <span className="badge bg-success">Active</span>;
    if (status === 0 || status === "inactive")
      return <span className="badge bg-danger">Inactive</span>;
    return <span className="badge bg-warning text-dark">Pending</span>;
  };

  const getStateName = (state_id) => stateMap[state_id] || "-";
  const getCityName = (city_id) => cityMap[city_id] || "-";

  const getProfileImage = (profile_image) => {
    if (!profile_image) return null;
    if (profile_image.startsWith("http")) return profile_image;
      return `${FILE_BASE_URL}/uploads/vendor/${profile_image}`;
  };

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Auditor List</h4>
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item"><span>Home</span></li>
                    <li className="breadcrumb-item active">Auditor List</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">

                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">All Auditors</h5>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate("/admin/auditor")}>
                    + Add New Auditor
                  </button>
                </div>

                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text"><i className="ri-search-line"></i></span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, email, mobile..."
                          value={search}
                          onChange={handleSearchChange}
                          autoComplete="off"
                        />
                        {search && (
                          <button className="btn btn-outline-secondary" onClick={() => setSearch("")}>✕</button>
                        )}
                      </div>
                    </div>
                    <div className="col-md-8 d-flex align-items-center">
                      {search && (
                        <small className="text-muted">Showing {filtered.length} of {auditors.length} auditors</small>
                      )}
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <p className="mt-2 text-muted">Loading auditors...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-search-line fs-1 d-block mb-2"></i>
                      {search ? `No auditors found for "${search}"` : "No auditors found"}
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
                            <th>Type</th>
                            <th>State</th>
                            <th>City</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((auditor, index) => {
                            const imgSrc = getProfileImage(auditor.profile_image);
                            return (
                              <tr key={auditor.id}>
                                <td>{index + 1}</td>
                                <td>
                                  {imgSrc ? (
                                    <img
                                      src={imgSrc}
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
                                      width: 40, height: 40, borderRadius: "50%",
                                      background: "#198754",
                                      display: imgSrc ? "none" : "flex",
                                      alignItems: "center", justifyContent: "center",
                                      fontWeight: "bold", color: "white", fontSize: 16, flexShrink: 0,
                                    }}
                                  >
                                    {auditor.full_name?.charAt(0)?.toUpperCase() || "A"}
                                  </div>
                                </td>
                                <td>{auditor.full_name || "-"}</td>
                                <td>{auditor.contact || "-"}</td>
                                <td>{auditor.email || "-"}</td>
                                <td>{deptMap[auditor.dep_desig_id] || "-"}</td>
                                <td>{getStateName(auditor.state_id)}</td>
                                <td>{getCityName(auditor.city_id)}</td>
                                <td>{getStatusBadge(auditor.status)}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEdit(auditor.id)}
                                    disabled={editLoading === auditor.id}
                                  >
                                    {editLoading === auditor.id ? (
                                      <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                      <><i className="ri-edit-line"></i> Edit</>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card-footer text-muted">
                  Total: {auditors.length} auditor{auditors.length !== 1 ? "s" : ""}
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

export default AuditorList;