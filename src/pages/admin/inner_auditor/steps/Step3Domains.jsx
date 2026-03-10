import React, { useState, useRef, useEffect } from "react";

// ─── Custom Multi-Select Dropdown ─────────────────────────────────────────────
const MultiSelectDropdown = ({ options = [], selected = [], onChange, disabled, error, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    const strId = String(id);
    const already = selected.some((s) => String(s) === strId);
    onChange(already ? selected.filter((s) => String(s) !== strId) : [...selected, strId]);
  };

  const removeOne = (id, e) => {
    e.stopPropagation();
    onChange(selected.filter((s) => String(s) !== String(id)));
  };

  const selectedLabels = selected
    .map((id) => options.find((o) => String(o.id) === String(id)))
    .filter(Boolean);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className={`form-control d-flex flex-wrap gap-1 align-items-center ${error ? "is-invalid" : ""}`}
        style={{ minHeight: "42px", cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#e9ecef" : "#fff", paddingRight: "30px" }}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-muted small">{placeholder}</span>
        ) : (
          selectedLabels.map((opt) => (
            <span key={opt.id} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
              {opt.name}
              <span onClick={(e) => removeOne(opt.id, e)} style={{ cursor: "pointer", fontWeight: "bold", marginLeft: "2px" }}>×</span>
            </span>
          ))
        )}
        <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "0.7rem", color: "#666" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div className="border rounded bg-white shadow" style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 1050, maxHeight: "220px", overflowY: "auto" }}>
          {options.length === 0 ? (
            <div className="p-2 text-muted small text-center">No options available</div>
          ) : (
            options.map((opt) => {
              const isSelected = selected.some((s) => String(s) === String(opt.id));
              return (
                <div
                  key={opt.id}
                  className={`d-flex align-items-center px-3 py-2 ${isSelected ? "bg-light" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggle(opt.id)}
                >
                  <input type="checkbox" checked={isSelected} onChange={() => toggle(opt.id)} className="form-check-input me-2" onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer" }} />
                  <span style={{ fontSize: "0.875rem" }}>{opt.name}</span>
                </div>
              );
            })
          )}
        </div>
      )}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

const Step3Domains = ({
  formData,
  errors,
  auditorLoading,
  states,
  filteredServiceCities,
  handleInputChange,
  handleMultiSelectChange,
  getErrorClass,
  renderError,
}) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary">
            <h4 className="mb-0 text-white">Audit Domains & Authorizations</h4>
          </div>
          <div className="card-body">
            {/* Domains Selection */}
            <div className="row mb-4">
              <div className="col-12 mb-3">
                <h5 className="border-bottom pb-2">Select Audit Domains *</h5>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`form-check border rounded p-3 ${errors.auditDomains ? 'border-danger' : ''} ${formData.auditDomains?.fire ? 'bg-light' : ''}`}>
                  <input className="form-check-input me-2" type="checkbox" id="fire" name="auditDomains.fire" checked={formData.auditDomains?.fire || false} onChange={handleInputChange} disabled={auditorLoading} />
                  <label className="form-check-label fw-bold" htmlFor="fire">🔥 Fire Safety Audit</label>
                  <p className="text-muted small mt-2 mb-0">Fire safety audits for commercial and industrial buildings</p>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`form-check border rounded p-3 ${errors.auditDomains ? 'border-danger' : ''} ${formData.auditDomains?.stp ? 'bg-light' : ''}`}>
                  <input className="form-check-input me-2" type="checkbox" id="stp" name="auditDomains.stp" checked={formData.auditDomains?.stp || false} onChange={handleInputChange} disabled={auditorLoading} />
                  <label className="form-check-label fw-bold" htmlFor="stp">💧 STP / Environmental Audit</label>
                  <p className="text-muted small mt-2 mb-0">Sewage treatment plants and environmental compliance audits</p>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`form-check border rounded p-3 ${errors.auditDomains ? 'border-danger' : ''} ${formData.auditDomains?.electrical ? 'bg-light' : ''}`}>
                  <input className="form-check-input me-2" type="checkbox" id="electrical" name="auditDomains.electrical" checked={formData.auditDomains?.electrical || false} onChange={handleInputChange} disabled={auditorLoading} />
                  <label className="form-check-label fw-bold" htmlFor="electrical">⚡ Electrical / CCTV Safety Audit</label>
                  <p className="text-muted small mt-2 mb-0">Electrical installations and CCTV system safety audits</p>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className={`form-check border rounded p-3 ${errors.auditDomains ? 'border-danger' : ''} ${formData.auditDomains?.solar ? 'bg-light' : ''}`}>
                  <input className="form-check-input me-2" type="checkbox" id="solar" name="auditDomains.solar" checked={formData.auditDomains?.solar || false} onChange={handleInputChange} disabled={auditorLoading} />
                  <label className="form-check-label fw-bold" htmlFor="solar">☀ Solar Audit</label>
                  <p className="text-muted small mt-2 mb-0">Solar PV installations and renewable energy audits</p>
                </div>
              </div>

              {errors.auditDomains && (
                <div className="col-12 text-danger small mt-2">{errors.auditDomains}</div>
              )}
            </div>

            {/* Authorizations */}
            {!Object.values(formData.auditDomains || {}).some(v => v) ? (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="alert alert-info">
                    <i className="ri-information-line me-2"></i>
                    Please select at least one domain above to see authorization fields.
                  </div>
                </div>
              </div>
            ) : (
              <div className="row mt-4">
                <div className="col-12 mb-3">
                  <h5 className="border-bottom pb-2">Domain Authorizations</h5>
                </div>

                {/* Fire Safety Authorization */}
                {formData.auditDomains?.fire && (
                  <div className="col-12 mb-4">
                    <div className="card border-primary">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 text-primary">🔥 Fire Safety Auditor Authorization</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Fire License Number *</label>
                            <input type="text" name="fire_license" value={formData.fire_license || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("fire_license")}`} placeholder="Enter license number" disabled={auditorLoading} />
                            {renderError("fire_license")}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Issuing Authority</label>
                            <input type="text" name="fire_issuing_authority" value={formData.fire_issuing_authority || ""} onChange={handleInputChange} className="form-control" placeholder="Enter issuing authority" disabled={auditorLoading} />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Past Fire Audits Conducted</label>
                            <input type="number" name="fire_audits_count" value={formData.fire_audits_count || ""} onChange={handleInputChange} className="form-control" placeholder="Number of audits" min="0" disabled={auditorLoading} />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Valid From</label>
                            <input type="date" name="fire_valid_from" value={formData.fire_valid_from || ""} onChange={handleInputChange} className="form-control" disabled={auditorLoading} />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Valid To *</label>
                            <input type="date" name="fire_valid_to" value={formData.fire_valid_to || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("fire_valid_to")}`} disabled={auditorLoading} />
                            {renderError("fire_valid_to")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STP/Environmental Authorization */}
                {formData.auditDomains?.stp && (
                  <div className="col-12 mb-4">
                    <div className="card border-primary">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 text-primary">💧 STP / Environmental Authorization</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">MPCB Auditor Registration No. *</label>
                            <input type="text" name="mpcb_reg_no" value={formData.mpcb_reg_no || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("mpcb_reg_no")}`} placeholder="Enter registration number" disabled={auditorLoading} />
                            {renderError("mpcb_reg_no")}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Certificate Validity *</label>
                            <input type="date" name="stp_validity" value={formData.stp_validity || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("stp_validity")}`} disabled={auditorLoading} />
                            {renderError("stp_validity")}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">STP/ETP Audit Experience (Years) *</label>
                            <input type="number" name="stp_experience" value={formData.stp_experience || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("stp_experience")}`} placeholder="Years of experience" min="0" step="0.5" disabled={auditorLoading} />
                            {renderError("stp_experience")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Electrical/CCTV Authorization */}
                {formData.auditDomains?.electrical && (
                  <div className="col-12 mb-4">
                    <div className="card border-primary">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 text-primary">⚡ Electrical / CCTV Authorization</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Electrical License No. *</label>
                            <input type="text" name="electrical_license" value={formData.electrical_license || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("electrical_license")}`} placeholder="Enter license number" disabled={auditorLoading} />
                            {renderError("electrical_license")}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Issuing Authority</label>
                            <input type="text" name="electrical_issuing_authority" value={formData.electrical_issuing_authority || ""} onChange={handleInputChange} className="form-control" placeholder="Enter issuing authority" disabled={auditorLoading} />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Valid Period</label>
                            <input type="text" name="electrical_validity" value={formData.electrical_validity || ""} onChange={handleInputChange} className="form-control" placeholder="e.g., 5 years" disabled={auditorLoading} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solar Authorization */}
                {formData.auditDomains?.solar && (
                  <div className="col-12 mb-4">
                    <div className="card border-primary">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 text-primary">☀ Solar Auditor Authorization</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Solar Authorization *</label>
                            <input type="text" name="solar_license" value={formData.solar_license || ""} onChange={handleInputChange} className={`form-control ${getErrorClass("solar_license")}`} placeholder="Enter authorization number" disabled={auditorLoading} />
                            {renderError("solar_license")}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Solar PV Audit Experience (Years)</label>
                            <input type="number" name="solar_experience" value={formData.solar_experience || ""} onChange={handleInputChange} className="form-control" placeholder="Years of experience" min="0" step="0.5" disabled={auditorLoading} />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">DISCOM/MNRE Empanelment</label>
                            <input type="text" name="solar_empanelment" value={formData.solar_empanelment || ""} onChange={handleInputChange} className="form-control" placeholder="Empanelment details" disabled={auditorLoading} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Service Geography */}
            <div className="row mt-4">
              <div className="col-12 mb-3">
                <h5 className="border-bottom pb-2">Service Geography</h5>
              </div>

              {/* Multi-select State Dropdown */}
              <div className="col-md-4 mb-3">
                <label className="form-label">Service State *</label>
                <MultiSelectDropdown
                  placeholder="Select States"
                  options={states || []}
                  selected={formData.serviceState || []}
                  onChange={(val) => handleMultiSelectChange(null, "serviceState", val)}
                  disabled={auditorLoading}
                  error={errors.serviceState}
                />
              </div>

              {/* Multi-select City Dropdown */}
              <div className="col-md-4 mb-3">
                <label className="form-label">Service City *</label>
                <MultiSelectDropdown
                  placeholder={formData.serviceState?.length ? "Select Cities" : "Select a state first"}
                  options={filteredServiceCities || []}
                  selected={formData.serviceCity || []}
                  onChange={(val) => handleMultiSelectChange(null, "serviceCity", val)}
                  disabled={!formData.serviceState?.length || auditorLoading}
                  error={errors.serviceCity}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Max Audits Per Month</label>
                <input
                  type="number"
                  name="max_audit_per_month"
                  value={formData.max_audit_per_month || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Maximum audits per month"
                  min="1"
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Audit Type *</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input className={`form-check-input ${getErrorClass("audit_type")}`} type="radio" name="audit_type" id="auditOnsite" value="On-site" checked={formData.audit_type === "On-site"} onChange={handleInputChange} disabled={auditorLoading} />
                    <label className="form-check-label" htmlFor="auditOnsite">On‑site</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className={`form-check-input ${getErrorClass("audit_type")}`} type="radio" name="audit_type" id="auditRemote" value="Remote" checked={formData.audit_type === "Remote"} onChange={handleInputChange} disabled={auditorLoading} />
                    <label className="form-check-label" htmlFor="auditRemote">Remote</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className={`form-check-input ${getErrorClass("audit_type")}`} type="radio" name="audit_type" id="auditBoth" value="Both" checked={formData.audit_type === "Both"} onChange={handleInputChange} disabled={auditorLoading} />
                    <label className="form-check-label" htmlFor="auditBoth">Both</label>
                  </div>
                </div>
                {renderError("audit_type")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Domains;