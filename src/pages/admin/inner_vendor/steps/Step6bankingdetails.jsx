import React from "react";

const Step6BankingDetails = ({
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
            <h4 className="mb-0 text-white">Banking Details</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Account Holder Name *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("accountHolderName")}`}
                  placeholder="Enter account holder name"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("accountHolderName")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Bank Name *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("bankName")}`}
                  placeholder="Enter bank name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("bankName")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Account Number *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("accountNumber")}`}
                  placeholder="Enter account number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("accountNumber")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">IFSC Code *</label>
                <input
                  type="text"
                  className={`form-control ${getErrorClass("ifscCode")}`}
                  placeholder="Enter IFSC code"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("ifscCode")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Cancelled Cheque (Upload) *
                </label>
                <input
                  type="file"
                  className={`form-control ${getErrorClass("cancelledCheque")}`}
                  accept="image/*,.pdf"
                  name="cancelledCheque"
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("cancelledCheque")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Preferred Payment Cycle *
                </label>
                <select
                  className={`form-control ${getErrorClass("paymentCycle")}`}
                  name="paymentCycle"
                  value={formData.paymentCycle}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                >
                  <option value="">Select Payment Cycle</option>
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="45">45 Days</option>
                  <option value="60">60 Days</option>
                </select>
                {renderError("paymentCycle")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6BankingDetails;