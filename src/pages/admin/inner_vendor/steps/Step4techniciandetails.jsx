import React from "react";

const Step4TechnicianDetails = ({
  formData,
  vendorLoading,
  getErrorClass,
  renderError,
  handleInputChange,
  equipment,
}) => {
  const certificationOptions = [
    {
      id: "fireLicence",
      name: "certifications.fireLicence",
      label: "Fire Licence",
    },
    {
      id: "electrical",
      name: "certifications.electricalSupervisor",
      label: "Electrical Supervisor Certificate",
      checked: formData.certifications.electricalSupervisor,
    },
    {
      id: "stpOperator",
      name: "certifications.stpOperator",
      label: "STP Operator Certificate",
    },
    {
      id: "solarInstaller",
      name: "certifications.solarInstaller",
      label: "Solar Installer Certificate",
    },
    {
      id: "cctvTech",
      name: "certifications.cctvTechnician",
      label: "CCTV Technician Certificate",
      checked: formData.certifications.cctvTechnician,
    },
  ];

  const toolOptions = [
    { id: "multimeter", name: "tools.multimeter", label: "Multimeter" },
    {
      id: "thermal",
      name: "tools.thermalCamera",
      label: "Thermal Camera",
      checked: formData.tools.thermalCamera,
    },
    {
      id: "pressure",
      name: "tools.pressureGauge",
      label: "Pressure Gauge",
      checked: formData.tools.pressureGauge,
    },
    {
      id: "flow",
      name: "tools.flowMeter",
      label: "Flow Meter",
      checked: formData.tools.flowMeter,
    },
    {
      id: "cable",
      name: "tools.cableTester",
      label: "Cable Tester",
      checked: formData.tools.cableTester,
    },
    {
      id: "power",
      name: "tools.powerTools",
      label: "Power Tools",
      checked: formData.tools.powerTools,
    },
    {
      id: "safety",
      name: "tools.safetyEquipment",
      label: "Safety Equipment",
      checked: formData.tools.safetyEquipment,
    },
    {
      id: "specialized",
      name: "tools.specializedTest",
      label: "Specialized Test Equipment",
      checked: formData.tools.specializedTest,
    },
  ];

  // Helper to resolve checked value from nested formData
  const getChecked = (name) => {
    const [parent, child] = name.split(".");
    return formData[parent]?.[child] ?? false;
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary">
            <h4 className="mb-0 text-white">Technician Details</h4>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Number of Technicians *</label>
                <input
                  type="number"
                  className={`form-control ${getErrorClass("numberOfTechnicians")}`}
                  placeholder="Enter number"
                  name="numberOfTechnicians"
                  value={formData.numberOfTechnicians}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("numberOfTechnicians")}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Certified Technicians Available *
                </label>
                <input
                  type="number"
                  className={`form-control ${getErrorClass("certifiedTechnicians")}`}
                  placeholder="Enter number"
                  name="certifiedTechnicians"
                  value={formData.certifiedTechnicians}
                  onChange={handleInputChange}
                  disabled={vendorLoading}
                />
                {renderError("certifiedTechnicians")}
              </div>

              {/* Certifications */}
              <div className="col-12 mt-3 mb-3">
                <label className="form-label fw-bold">
                  Certification Details Available *
                </label>
              </div>

              {certificationOptions.map(({ id, name, label }) => (
                <div className="col-md-4 mb-3" key={id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={id}
                      name={name}
                      checked={getChecked(name)}
                      onChange={handleInputChange}
                      disabled={vendorLoading}
                    />
                    <label className="form-check-label" htmlFor={id}>
                      {label}
                    </label>
                  </div>
                </div>
              ))}

              {/* Tools & Equipment */}
              {/* <div className="col-12 mt-3 mb-3">
                <label className="form-label fw-bold">
                  Tools & Equipment Available
                </label>
              </div>

              {toolOptions.map(({ id, name, label }) => (
                <div className="col-md-3 mb-2" key={id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={id}
                      name={name}
                      checked={getChecked(name)}
                      onChange={handleInputChange}
                      disabled={vendorLoading}
                    />
                    <label className="form-check-label" htmlFor={id}>
                      {label}
                    </label>
                  </div>
                </div>
              ))} */}

              {/* Tools & Equipment — loaded from equipment table */}
              <div className="col-12 mt-3 mb-3">
                <label className="form-label fw-bold">
                  Tools & Equipment Available
                </label>
              </div>

              {equipment && equipment.length > 0 ? (
                equipment.map((item) => (
                  <div className="col-md-3 mb-2" key={item.id}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`tool_${item.id}`}
                        checked={
                          Array.isArray(formData.tools) &&
                          formData.tools.includes(String(item.id))
                        }
                        onChange={() => {
                          const id = String(item.id);
                          const current = Array.isArray(formData.tools)
                            ? formData.tools
                            : [];
                          const updated = current.includes(id)
                            ? current.filter((t) => t !== id)
                            : [...current, id];
                          handleInputChange({
                            target: {
                              name: "tools",
                              value: updated,
                              type: "multiselect",
                            },
                          });
                        }}
                        disabled={vendorLoading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`tool_${item.id}`}
                      >
                        {item.name}
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-muted">No equipment available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4TechnicianDetails;
