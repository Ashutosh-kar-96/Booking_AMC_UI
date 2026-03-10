import React, { useState } from "react";

const Step1BasicInfo = ({
  formData,
  errors,
  loading,
  auditorLoading,
  organisations,
  states,
  filteredCities,
  handleInputChange,
  handleReset,
  getErrorClass,
  renderError,
  editId,
}) => {
  const [changePassword, setChangePassword] = useState(false);

  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary">
            <h4 className="mb-0 text-white">Basic Information</h4>
          </div>
          <div className="card-body">
            {loading && (
              <div className="alert alert-info">Loading master data...</div>
            )}

            <div className="row">
              {/* Contact Person Details */}
              <div className="col-md-12 mb-4">
                <h5 className="border-bottom pb-2">Contact Person Details</h5>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Full Name (Primary Contact Person) *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("full_name")}`}
                  placeholder="Enter full name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                {renderError("full_name")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Email ID *</label>
                <input
                  type="email"
                  className={`form-control ${getErrorClass("email")}`}
                  placeholder="Enter email address"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                {renderError("email")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  className={`form-control ${getErrorClass("mobile")}`}
                  placeholder="Enter mobile number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                  maxLength="10"
                />
                {renderError("mobile")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Alternate Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter alternate number"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Designation *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("designation")}`}
                  placeholder="Enter designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                {renderError("designation")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Profile Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  name="profileImage"
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("username")}`}
                  placeholder="Enter username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                {renderError("username")}
              </div>

              {/* Password Field */}
              <div className="col-md-4 mb-3">
                <label className="form-label d-flex align-items-center justify-content-between">
                  <span>Password {!editId && "*"}</span>
                  {editId && (
                    <span
                      className="text-primary small"
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => {
                        setChangePassword((v) => !v);
                        // Clear password field when toggling off
                        if (changePassword) {
                          handleInputChange({ target: { name: "password", value: "" } });
                        }
                      }}
                    >
                      {changePassword ? "Keep current password" : "Change password?"}
                    </span>
                  )}
                </label>

                {editId && !changePassword ? (
                  <div
                    className="form-control bg-light text-muted d-flex align-items-center"
                    style={{ letterSpacing: "4px", fontSize: "18px" }}
                  >
                    ••••••••
                  </div>
                ) : (
                  <input
                    type="password"
                    className={`form-control ${getErrorClass("password")}`}
                    placeholder={editId ? "Enter new password" : "Enter password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={auditorLoading}
                    minLength="6"
                  />
                )}
                {renderError("password")}
                {editId && !changePassword && (
                  <small className="text-muted">Current password is kept. Click "Change password?" to update.</small>
                )}
              </div>

              {/* Auditor Business Details */}
              <div className="col-md-12 mb-4 mt-3">
                <h5 className="border-bottom pb-2">Auditor Business Details</h5>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Auditor Type *</label>
                <select
                  className={`form-control ${getErrorClass("auditorType")}`}
                  name="auditorType"
                  value={formData.auditorType}
                  onChange={handleInputChange}
                  disabled={loading || auditorLoading}
                >
                  <option value="">Select Auditor Type</option>
                  {organisations && organisations.length > 0 ? (
                    organisations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {loading ? "Loading auditor types..." : "No auditor types available"}
                    </option>
                  )}
                </select>
                {renderError("auditorType")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Auditor Legal Name *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("auditorLegalName")}`}
                  placeholder="Enter legal name"
                  name="auditorLegalName"
                  value={formData.auditorLegalName}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
                {renderError("auditorLegalName")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Trade Name (if different)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter trade name"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Year of Establishment *</label>
                <input
                  type="number"
                  className={`form-control ${getErrorClass("yearOfEstablishment")}`}
                  name="yearOfEstablishment"
                  value={formData.yearOfEstablishment}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                  disabled={auditorLoading}
                />
                {renderError("yearOfEstablishment")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">GST Registered *</label>
                <select
                  className={`form-control ${getErrorClass("gstRegistered")}`}
                  name="gstRegistered"
                  value={formData.gstRegistered}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {renderError("gstRegistered")}
              </div>

              {/* Address Details */}
              <div className="col-md-12 mb-4 mt-3">
                <h5 className="border-bottom pb-2">Address Details</h5>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Registered Office Address *</label>
                <textarea
                  className={`form-control ${getErrorClass("registeredOfficeAddress")}`}
                  rows="2"
                  placeholder="Enter registered office address"
                  name="registeredOfficeAddress"
                  value={formData.registeredOfficeAddress}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                ></textarea>
                {renderError("registeredOfficeAddress")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Branch / Service Office Address</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Enter branch address"
                  name="branchAddress"
                  value={formData.branchAddress}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                ></textarea>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">State *</label>
                <select
                  className={`form-control ${getErrorClass("state")}`}
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={loading || auditorLoading}
                >
                  <option value="">Select State</option>
                  {states && states.length > 0 ? (
                    states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {loading ? "Loading states..." : "No states available"}
                    </option>
                  )}
                </select>
                {renderError("state")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">City *</label>
                <select
                  className={`form-control ${getErrorClass("city")}`}
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!formData.state || loading || auditorLoading}
                >
                  <option value="">Select City</option>
                  {filteredCities && filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {formData.state ? "No cities available for this state" : "Select a state first"}
                    </option>
                  )}
                </select>
                {renderError("city")}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("pincode")}`}
                  placeholder="Enter pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  disabled={auditorLoading}
                  maxLength="6"
                />
                {renderError("pincode")}
              </div>

              {editId && (
                <div className="col-12 mt-3">
                  <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    Reset Form
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;