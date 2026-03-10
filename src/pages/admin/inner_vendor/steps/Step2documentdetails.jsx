import React from "react";

const Step2DocumentDetails = ({
  formData,
  vendorLoading,
  getErrorClass,
  renderError,
  handleInputChange,
}) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
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
                  disabled={vendorLoading}
                />
                {renderError("gstin")}
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
                  disabled={vendorLoading}
                />
                {renderError("panNumber")}
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
                  disabled={vendorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  MSME / Udyam Registration No.
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter MSME number"
                  name="msmeUdyam"
                  value={formData.msmeUdyam}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
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
                  disabled={vendorLoading}
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
                  disabled={vendorLoading}
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
                  disabled={vendorLoading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Fire / Electrical / Environmental License No.
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter license number"
                  name="fireLicense"
                  value={formData.fireLicense}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
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
                  disabled={vendorLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2DocumentDetails;