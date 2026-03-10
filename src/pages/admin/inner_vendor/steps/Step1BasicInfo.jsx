import React from "react";

const Step1BasicInfo = ({
  formData,
  errors,
  loading,
  vendorLoading,
  organisations,
  states,
  filteredCities,
  handleInputChange,
  handleReset,
  getErrorClass,
  renderError,
}) => {
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

              <div className="col-md-3 mb-3">
                <label className="form-label">
                  Full Name (Primary Contact Person) *
                </label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("full_name")}`}
                  placeholder="Enter full name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("full_name")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Email ID *</label>
                <input
                  type="email"
                  className={`form-control ${getErrorClass("email")}`}
                  placeholder="Enter email address"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("email")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  className={`form-control ${getErrorClass("mobile")}`}
                  placeholder="Enter mobile number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                  maxLength="10"
                />
                {renderError("mobile")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Alternate Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter alternate number"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Designation *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("designation")}`}
                  placeholder="Enter designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("designation")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Profile Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  name="profileImage"
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("username")}`}
                  placeholder="Enter username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("username")}
              </div>

              {/* Business Details */}
              <div className="col-md-12 mb-4 mt-3">
                <h5 className="border-bottom pb-2">Business Details</h5>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Vendor Type *</label>
                <select
                  className={`form-control ${getErrorClass("vendorType")}`}
                  name="vendorType"
                  value={formData.vendorType}
                  onChange={handleInputChange}
                  disabled={loading || vendorLoading}
                >
                  <option value="">Select Vendor Type</option>
                  {organisations && organisations.length > 0 ? (
                    organisations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {loading
                        ? "Loading organizations..."
                        : "No organizations available"}
                    </option>
                  )}
                </select>
                {renderError("vendorType")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Vendor Legal Name *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("vendorLegalName")}`}
                  placeholder="Enter legal name"
                  name="vendorLegalName"
                  value={formData.vendorLegalName}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("vendorLegalName")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Trade Name (if different)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter trade name"
                  name="tradeName"
                  value={formData.tradeName}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
              </div>

              <div className="col-md-3 mb-3">
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
                />
                {renderError("yearOfEstablishment")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">GST Registered *</label>
                <select
                  className={`form-control ${getErrorClass("gstRegistered")}`}
                  name="gstRegistered"
                  value={formData.gstRegistered}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
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
                <label className="form-label">
                  Registered Office Address *
                </label>
                <textarea
                  className={`form-control ${getErrorClass("registeredOfficeAddress")}`}
                  rows="2"
                  placeholder="Enter registered office address"
                  name="registeredOfficeAddress"
                  value={formData.registeredOfficeAddress}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                ></textarea>
                {renderError("registeredOfficeAddress")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Branch / Service Office Address
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Enter branch address"
                  name="branchAddress"
                  value={formData.branchAddress}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                ></textarea>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">State *</label>
                <select
                  className={`form-control ${getErrorClass("state")}`}
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={loading || vendorLoading}
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

              <div className="col-md-3 mb-3">
                <label className="form-label">City *</label>
                <select
                  className={`form-control ${getErrorClass("city")}`}
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!formData.state || loading || vendorLoading}
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
                      {formData.state
                        ? "No cities available for this state"
                        : "Select a state first"}
                    </option>
                  )}
                </select>
                {renderError("city")}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("pincode")}`}
                  placeholder="Enter pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                  maxLength="6"
                />
                {renderError("pincode")}
              </div>

              <div className="col-12 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;