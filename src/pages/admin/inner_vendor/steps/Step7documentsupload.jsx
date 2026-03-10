import React from "react";

const Step7DocumentsUpload = ({
  formData,
  vendorLoading,
  getErrorClass,
  renderError,
  handleInputChange,
}) => {
  const optionalDocs = [
    { name: "incorporationCertificate", label: "Company Incorporation Certificate" },
    { name: "addressProof", label: "Address Proof" },
    { name: "workmenInsurance", label: "Workmen Compensation Insurance" },
    { name: "liabilityInsurance", label: "Public Liability Insurance" },
    { name: "isoCertificate", label: "ISO Certificate (if any)" },
    { name: "generalInsurance", label: "Insurance Policy (General)" },
  ];

  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0 text-white">Documents Upload</h4>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Required Documents */}
              <div className="col-md-6 mb-3">
                <label className="form-label">GST Certificate *</label>
                <input
                  type="file"
                  className={`form-control ${getErrorClass("gstCertificate")}`}
                  name="gstCertificate"
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("gstCertificate")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">PAN Card *</label>
                <input
                  type="file"
                  className={`form-control ${getErrorClass("panCard")}`}
                  name="panCard"
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("panCard")}
              </div>

              {/* Optional Documents */}
              {optionalDocs.map(({ name, label }) => (
                <div className="col-md-6 mb-3" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    type="file"
                    className="form-control"
                    name={name}
                    onChange={handleInputChange}
                    disabled={vendorLoading}
                  />
                </div>
              ))}

              {/* Vendor Agreement - Required */}
              <div className="col-md-12 mb-3">
                <label className="form-label">
                  Vendor Agreement Copy (Signed) *
                </label>
                <input
                  type="file"
                  className={`form-control ${getErrorClass("vendorAgreement")}`}
                  name="vendorAgreement"
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("vendorAgreement")}
              </div>

              {/* Guidelines */}
              <div className="col-12 mt-3">
                <div className="alert alert-info">
                  <h6 className="alert-heading">Document Guidelines:</h6>
                  <ul className="mb-0">
                    <li>All documents must be clear and legible</li>
                    <li>Supported formats: PDF, JPEG, PNG</li>
                    <li>Maximum file size: 5MB per document</li>
                    <li>Ensure documents are valid and not expired</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7DocumentsUpload;