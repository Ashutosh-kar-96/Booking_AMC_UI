import React from "react";

const Step5Experience = ({
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
            <h4 className="mb-0 text-white">Experience</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Years of Experience in this Field *
                </label>
                <input
                  type="number"
                  className={`form-control ${getErrorClass("yearsOfExperience")}`}
                  placeholder="Enter years"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("yearsOfExperience")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Govt / PSU Experience *</label>
                <select
                  className={`form-control ${getErrorClass("govtPsuExperience")}`}
                  name="govtPsuExperience"
                  value={formData.govtPsuExperience}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {renderError("govtPsuExperience")}
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Key Clients (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="List major clients you have served (comma separated)"
                  name="keyClients"
                  value={formData.keyClients}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                ></textarea>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Similar Project Details</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Brief description of similar projects completed"
                  name="similarProjects"
                  value={formData.similarProjects}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Experience;