import React from "react";

const Step2DocumentDetails = ({
  formData,
  errors,
  auditorLoading,
  handleInputChange,
  getErrorClass,
  renderError,
}) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary">
            <h4 className="mb-0 text-white">Document Details</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">GSTIN *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("gstin")}`}
                  placeholder="Enter GSTIN"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                {renderError("gstin")}
                <small className="text-muted">Format: 22AAAAA0000A1Z5</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">PAN Number *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("panNumber")}`}
                  placeholder="Enter PAN number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                  maxLength="10"
                />
                {renderError("panNumber")}
                <small className="text-muted">Format: AAAAA0000A</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">CIN / LLPIN</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter CIN/LLPIN"
                  name="cinLlipin"
                  value={formData.cinLlipin}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                <small className="text-muted">For companies only</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">MSME / Udyam Registration No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter MSME number"
                  name="msmeUdyam"
                  value={formData.msmeUdyam}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">PF Registration No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter PF number"
                  name="pfRegistration"
                  value={formData.pfRegistration}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">ESI Registration No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter ESI number"
                  name="esiRegistration"
                  value={formData.esiRegistration}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Labour License No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter labour license number"
                  name="labourLicense"
                  value={formData.labourLicense}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fire / Electrical License No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter license number"
                  name="fireLicense"
                  value={formData.fireLicense}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">ISO Certification</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter ISO certification details"
                  name="isoCertification"
                  value={formData.isoCertification}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                <small className="text-muted">e.g., ISO 9001:2015</small>
              </div>

              <div className="col-12 mt-3">
                <div className="alert alert-info">
                  <i className="ri-information-line me-2"></i>
                  All documents will be verified during the approval process. 
                  Ensure all numbers are entered correctly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2DocumentDetails;