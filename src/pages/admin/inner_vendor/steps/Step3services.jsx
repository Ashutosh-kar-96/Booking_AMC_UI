import React, { useState, useRef, useEffect } from "react";

const Step3Services = ({
  formData,
  errors,
  loading,
  vendorLoading,
  states,
  filteredServiceCities,
  handleInputChange,
  getErrorClass,
  renderError,
}) => {
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStateDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedStates = Array.isArray(formData.serviceState) ? formData.serviceState : [];
  const selectedCities = Array.isArray(formData.serviceCity) ? formData.serviceCity : [];

  const toggleState = (stateId) => {
    const id = String(stateId);
    const current = selectedStates.map(String);
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    handleInputChange({
      target: { name: "serviceState", value: updated, type: "multiselect" },
    });
    // Reset cities when states change
    handleInputChange({
      target: { name: "serviceCity", value: [], type: "multiselect" },
    });
  };

  const toggleCity = (cityId) => {
    const id = String(cityId);
    const current = selectedCities.map(String);
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    handleInputChange({
      target: { name: "serviceCity", value: updated, type: "multiselect" },
    });
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary">
            <h4 className="mb-0 text-white">Services</h4>
          </div>
          <div className="card-body">
            <div className="row">

              {/* Service Categories */}
              <div className="col-12 mb-3">
                <label className="form-label fw-bold">Service Categories *</label>
                {errors.serviceCategories && (
                  <div className="text-danger small">{errors.serviceCategories}</div>
                )}
              </div>
              {[
                { id: "fire",  label: "Fire Fighting" },
                { id: "stp",   label: "STP/ETP" },
                { id: "cctv",  label: "CCTV & Surveillance" },
                { id: "solar", label: "Solar PV Systems" },
              ].map(({ id, label }) => (
                <div className="col-md-3 mb-3" key={id}>
                  <div className="form-check border rounded p-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={id}
                      name={`serviceCategories.${id}`}
                      checked={formData.serviceCategories[id]}
                      onChange={handleInputChange}
                      disabled={vendorLoading}
                    />
                    <label className="form-check-label" htmlFor={id}>{label}</label>
                  </div>
                </div>
              ))}

              {/* Nature of Service */}
              <div className="col-12 mt-3 mb-3">
                <label className="form-label fw-bold">Nature of Service *</label>
                {errors.natureOfService && (
                  <div className="text-danger small">{errors.natureOfService}</div>
                )}
              </div>
              {[
                { id: "installation", label: "Installation" },
                { id: "amc",          label: "AMC" },
                { id: "breakdown",    label: "Breakdown/On-call" },
                { id: "audit",        label: "Audit & Compliance" },
              ].map(({ id, label }) => (
                <div className="col-md-3 mb-3" key={id}>
                  <div className="form-check border rounded p-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={id}
                      name={`natureOfService.${id}`}
                      checked={formData.natureOfService[id]}
                      onChange={handleInputChange}
                      disabled={vendorLoading}
                    />
                    <label className="form-check-label" htmlFor={id}>{label}</label>
                  </div>
                </div>
              ))}

              {/* OEM Authorization */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">OEM Authorization *</label>
                <select
                  className={`form-control ${getErrorClass("oemAuthorization")}`}
                  name="oemAuthorization"
                  value={formData.oemAuthorization}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {renderError("oemAuthorization")}
              </div>

              {/* Service Coverage */}
              <div className="col-12 mt-3 mb-3">
                <h5 className="border-bottom pb-2">Service Coverage</h5>
              </div>

              {/* ── Multi-select State Dropdown ── */}
              <div className="col-md-6 mb-3" ref={dropdownRef}>
                <label className="form-label">State *</label>
                <div className="position-relative">
                  {/* Trigger */}
                  <div
                    className={`form-control d-flex align-items-center justify-content-between ${getErrorClass("serviceState")}`}
                    style={{
                      cursor: loading || vendorLoading ? "not-allowed" : "pointer",
                      minHeight: "38px",
                      backgroundColor: loading || vendorLoading ? "#e9ecef" : "#fff",
                      flexWrap: "wrap",
                      gap: "4px",
                      userSelect: "none",
                    }}
                    onClick={() => !loading && !vendorLoading && setStateDropdownOpen((o) => !o)}
                  >
                    <span style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {selectedStates.length === 0 ? (
                        <span className="text-muted">Select State(s)</span>
                      ) : (
                        states
                          .filter((s) => selectedStates.includes(String(s.id)))
                          .map((s) => (
                            <span key={s.id} className="badge bg-primary d-flex align-items-center" style={{ fontSize: "0.8rem" }}>
                              {s.name}
                              <span
                                className="ms-1"
                                style={{ cursor: "pointer", fontWeight: "bold" }}
                                onClick={(e) => { e.stopPropagation(); toggleState(s.id); }}
                              >×</span>
                            </span>
                          ))
                      )}
                    </span>
                    <span>▾</span>
                  </div>

                  {/* Dropdown list */}
                  {stateDropdownOpen && (
                    <div
                      className="border rounded bg-white shadow position-absolute w-100"
                      style={{ top: "100%", left: 0, zIndex: 1050, maxHeight: "220px", overflowY: "auto" }}
                    >
                      {states && states.length > 0 ? (
                        states.map((state) => {
                          const isChecked = selectedStates.includes(String(state.id));
                          return (
                            <div
                              key={state.id}
                              className="d-flex align-items-center px-3 py-2"
                              style={{ cursor: "pointer", backgroundColor: isChecked ? "#e8f0fe" : "transparent" }}
                              onClick={() => toggleState(state.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleState(state.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="me-2"
                              />
                              <span>{state.name}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-muted">
                          {loading ? "Loading states..." : "No states available"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {renderError("serviceState")}
              </div>

              {/* ── Multi-select City Dropdown ── */}
              <div className="col-md-6 mb-3" ref={cityDropdownRef}>
                <label className="form-label">City *</label>
                <div className="position-relative">
                  {/* Trigger */}
                  <div
                    className={`form-control d-flex align-items-center justify-content-between ${getErrorClass("serviceCity")}`}
                    style={{
                      cursor: !selectedStates.length || loading || vendorLoading ? "not-allowed" : "pointer",
                      minHeight: "38px",
                      backgroundColor: !selectedStates.length || loading || vendorLoading ? "#e9ecef" : "#fff",
                      flexWrap: "wrap",
                      gap: "4px",
                      userSelect: "none",
                    }}
                    onClick={() => selectedStates.length && !loading && !vendorLoading && setCityDropdownOpen((o) => !o)}
                  >
                    <span style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {selectedCities.length === 0 ? (
                        <span className="text-muted">
                          {selectedStates.length ? "Select City(s)" : "Select a state first"}
                        </span>
                      ) : (
                        filteredServiceCities
                          .filter((c) => selectedCities.includes(String(c.id)))
                          .map((c) => (
                            <span key={c.id} className="badge bg-success d-flex align-items-center" style={{ fontSize: "0.8rem" }}>
                              {c.name}
                              <span
                                className="ms-1"
                                style={{ cursor: "pointer", fontWeight: "bold" }}
                                onClick={(e) => { e.stopPropagation(); toggleCity(c.id); }}
                              >×</span>
                            </span>
                          ))
                      )}
                    </span>
                    <span>▾</span>
                  </div>

                  {/* Dropdown list */}
                  {cityDropdownOpen && (
                    <div
                      className="border rounded bg-white shadow position-absolute w-100"
                      style={{ top: "100%", left: 0, zIndex: 1050, maxHeight: "220px", overflowY: "auto" }}
                    >
                      {filteredServiceCities && filteredServiceCities.length > 0 ? (
                        filteredServiceCities.map((city) => {
                          const isChecked = selectedCities.includes(String(city.id));
                          return (
                            <div
                              key={city.id}
                              className="d-flex align-items-center px-3 py-2"
                              style={{ cursor: "pointer", backgroundColor: isChecked ? "#e8f5e9" : "transparent" }}
                              onClick={() => toggleCity(city.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCity(city.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="me-2"
                              />
                              <span>{city.name}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-muted">No cities available</div>
                      )}
                    </div>
                  )}
                </div>
                {renderError("serviceCity")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Maximum Sites Supported per Month *</label>
                <input
                  type="number"
                  className={`form-control ${getErrorClass("maxSitesPerMonth")}`}
                  placeholder="Enter number"
                  name="maxSitesPerMonth"
                  value={formData.maxSitesPerMonth}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("maxSitesPerMonth")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Emergency Response Time (in hours) *</label>
                <input
                  type="number"
                  className={`form-control ${getErrorClass("emergencyResponseTime")}`}
                  placeholder="Enter hours"
                  name="emergencyResponseTime"
                  value={formData.emergencyResponseTime}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("emergencyResponseTime")}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Services;