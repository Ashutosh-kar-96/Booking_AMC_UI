import React from "react";

const Step4Qualifications = ({
  formData,
  errors,
  auditorLoading,
  sectors,
  handleInputChange,
  handleSectorChange,
  getErrorClass,
  renderError,
}) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary">
            <h4 className="mb-0 text-white">Qualifications & Experience</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Highest Qualification *</label>
                <select
                  name="qualification"
                  value={formData.qualification || ""}
                  onChange={handleInputChange}
                  className={`form-control ${getErrorClass("qualification")}`}
                  disabled={auditorLoading}
                >
                  <option value="">Select Qualification</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
                {renderError("qualification")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Years of Experience in Audit Field *</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience || ""}
                  onChange={handleInputChange}
                  className={`form-control ${getErrorClass("experience")}`}
                  placeholder="Years of Experience"
                  min="0"
                  step="0.5"
                  disabled={auditorLoading}
                />
                {renderError("experience")}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label fw-bold">Sector Experience *</label>
                <p className="text-muted small">Select all sectors you have experience in</p>
              </div>

              {sectors && sectors.length > 0 ? (
                <div className="col-12 mb-4">
                  <div className="row">
                    {sectors
                      .filter(sector => sector.parent_name === null || sector.parent_name === '')
                      .map((sector) => (
                        <div className="col-md-4 col-lg-3 mb-3" key={sector.id}>
                          <div className="form-check border rounded p-3">
                            <input
                              className={`form-check-input ${getErrorClass("sector")}`}
                              type="checkbox"
                              id={`sector-${sector.id}`}
                              value={sector.name}
                              onChange={handleSectorChange}
                              checked={formData.sector?.includes(sector.name) || false}
                              disabled={auditorLoading}
                            />
                            <label className="form-check-label fw-bold" htmlFor={`sector-${sector.id}`}>
                              {sector.name}
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="col-12 text-muted mb-3">Loading sectors...</div>
              )}

              {renderError("sector")}

              <div className="col-md-6 mb-3">
                <label className="form-label">Govt/PSU Audit Experience</label>
                <select
                  name="gov_audit_exp"
                  value={formData.gov_audit_exp || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  disabled={auditorLoading}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="col-12 mt-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold">Professional Summary</h6>
                    <p className="mb-0 text-muted">
                      You have selected {formData.sector?.length || 0} sector(s) with {formData.experience || 0} years of experience.
                      {formData.gov_audit_exp === "Yes" && " You have Government/PSU audit experience."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Qualifications;