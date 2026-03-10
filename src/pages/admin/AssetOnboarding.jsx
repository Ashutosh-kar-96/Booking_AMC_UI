import React, { useState } from "react";

const AssetOnboarding = () => {
  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State for dynamic document fields
  const [documents, setDocuments] = useState([
    { doc_type: "", doc_file: null, expiry_date: "" }
  ]);

  // State for photos and videos
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  // Asset form data
  const [formData, setFormData] = useState({
    asset_uid: "",
    category: "",
    asset_name: "",
    manufacturer: "",
    model_no: "",
    serial_no: "",
    site_id: "",
    criticality: "Medium",
    installation_date: "",
    status: "Active",
    uploaded_by: "",
    uploaded_at: ""
  });

  const [editId, setEditId] = useState(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [installationDate, setInstallationDate] = useState("");

  // Category options
  const categoryOptions = [
    "Fire Alarm Panel",
    "CCTV",
    "Solar Inverter",
    "STP",
    "HVAC",
    "Electrical Panel"
  ];

  // Model options
  const modelOptions = [
    "FC722",
    "DS-2CD2T43",
    "SB3.6",
    "AK-234"
  ];

  // Criticality options
  const criticalityOptions = ["Low", "Medium", "High"];

  // Status options
  const statusOptions = ["Active", "Under Maintenance", "Decommissioned"];

  // Sites data
  const sites = [
    { id: 1, name: "Main Office" },
    { id: 2, name: "Branch A" },
    { id: 3, name: "Warehouse" },
    { id: 4, name: "Data Center" }
  ];

  // Technicians data
  const technicians = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mike Johnson" }
  ];

  // Assets data
  const [assets, setAssets] = useState([
    {
      id: 1,
      asset_uid: "AST-001",
      category: "Fire Alarm Panel",
      asset_name: "Fire Alarm Panel",
      manufacturer: "Siemens",
      model_no: "FC722",
      serial_no: "SN123456",
      site_id: 1,
      site_name: "Main Office",
      criticality: "High",
      installation_date: "2024-01-15",
      status: "Active",
      uploaded_by: "John Doe",
      uploaded_at: "Server Room"
    },
    {
      id: 2,
      asset_uid: "AST-002",
      category: "CCTV",
      asset_name: "IP Camera",
      manufacturer: "Hikvision",
      model_no: "DS-2CD2T43",
      serial_no: "SN789012",
      site_id: 2,
      site_name: "Branch A",
      criticality: "Medium",
      installation_date: "2024-02-20",
      status: "Active",
      uploaded_by: "Jane Smith",
      uploaded_at: "Entrance"
    },
    {
      id: 3,
      asset_uid: "AST-003",
      category: "Solar Inverter",
      asset_name: "Solar Inverter",
      manufacturer: "SMA",
      model_no: "SB3.6",
      serial_no: "SN345678",
      site_id: 3,
      site_name: "Warehouse",
      criticality: "Low",
      installation_date: "2023-11-10",
      status: "Under Maintenance",
      uploaded_by: "Mike Johnson",
      uploaded_at: "Roof"
    }
  ]);

  // Menu items
  const menuItems = [
    "Dashboard",
    "Customer",
    "Vendor",
    "Technician",
    "Auditor",
    "Sub Admin",
    "Item Master",
    "Master",
    "Content Management",
    "Coupon",
    "Asset Onboarding"
  ];

  // ================= GENERATE ASSET UID =================
  const generateAssetUid = () => {
    const prefix = "AST";
    const timestamp = Date.now().toString().slice(-3);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  // ================= HANDLE FORM CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "category" && !editId && !formData.asset_uid) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        asset_uid: generateAssetUid()
      }));
    }
  };

  // ================= SUBMIT FORM =================
  const handleSubmit = (e) => {
    e.preventDefault();

    const site = sites.find(s => s.id === parseInt(formData.site_id));
    const technician = technicians.find(t => t.id === parseInt(formData.uploaded_by));
    
    const newAsset = {
      id: editId || assets.length + 1,
      asset_uid: formData.asset_uid || generateAssetUid(),
      category: formData.category,
      asset_name: formData.asset_name,
      manufacturer: formData.manufacturer,
      model_no: formData.model_no,
      serial_no: formData.serial_no,
      site_id: parseInt(formData.site_id),
      site_name: site?.name || "",
      criticality: formData.criticality,
      installation_date: formData.installation_date,
      status: formData.status,
      uploaded_by: technician?.name || formData.uploaded_by,
      uploaded_at: formData.uploaded_at
    };

    if (editId) {
      setAssets(assets.map(asset => asset.id === editId ? newAsset : asset));
      alert("Asset updated successfully!");
    } else {
      setAssets([...assets, newAsset]);
      alert("Asset added successfully!");
    }

    handleReset();
  };

  // ================= EDIT ASSET =================
  const handleEdit = (asset) => {
    setEditId(asset.id);
    const technician = technicians.find(t => t.name === asset.uploaded_by);
    
    setFormData({
      asset_uid: asset.asset_uid,
      category: asset.category,
      asset_name: asset.asset_name,
      manufacturer: asset.manufacturer,
      model_no: asset.model_no,
      serial_no: asset.serial_no,
      site_id: asset.site_id,
      criticality: asset.criticality,
      installation_date: asset.installation_date,
      status: asset.status,
      uploaded_by: technician?.id || "",
      uploaded_at: asset.uploaded_at
    });
  };

  // ================= RESET FORM =================
  const handleReset = () => {
    setEditId(null);
    setFormData({
      asset_uid: "",
      category: "",
      asset_name: "",
      manufacturer: "",
      model_no: "",
      serial_no: "",
      site_id: "",
      criticality: "Medium",
      installation_date: "",
      status: "Active",
      uploaded_by: "",
      uploaded_at: ""
    });
  };

  // ================= DELETE ASSET =================
  const handleDelete = (id) => {
    if (window.confirm("Delete this asset?")) {
      setAssets(assets.filter(asset => asset.id !== id));
      alert("Asset deleted successfully!");
    }
  };

  // ================= FILTER ASSETS =================
  const getFilteredAssets = () => {
    return assets.filter(asset => {
      if (selectedSite && asset.site_id !== parseInt(selectedSite)) return false;
      if (selectedCategory && asset.category !== selectedCategory) return false;
      if (selectedModel && asset.model_no !== selectedModel) return false;
      if (selectedTechnician && asset.uploaded_by !== selectedTechnician) return false;
      if (installationDate && asset.installation_date !== installationDate) return false;
      return true;
    });
  };

  const filteredAssets = getFilteredAssets();

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div 
        className="bg-primary text-white" 
        style={{ 
          width: isSidebarCollapsed ? "70px" : "250px",
          transition: "width 0.3s"
        }}
      >
        {/* Company Logo */}
        <div className="p-3 border-bottom border-secondary">
          <h4 className="mb-0 fw-bold">BOOKAMC</h4>
          <button 
            className="btn btn-sm btn-light mt-2"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-3">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              className={`px-3 py-2 ${item === "Asset Onboarding" ? "bg-white text-primary fw-bold" : "text-white"}`}
              style={{ cursor: "pointer" }}
            >
              {isSidebarCollapsed ? item.charAt(0) : item}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        width: isSidebarCollapsed ? "calc(100% - 70px)" : "calc(100% - 250px)",
        padding: "20px",
        backgroundColor: "#f8f9fa"
      }}>
        {/* Page Title */}
        <h2 className="mb-4">Asset Onboarding</h2>

        {/* Main Row */}
        <div className="row">
          {/* Left Column - Form */}
          <div className="col-md-5 mb-4">
            <div className="card shadow">
              <div className="card-header bg-white">
                <h5 className="mb-0">{editId ? "Edit Asset" : "Add Asset"}</h5>
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Asset UID - Auto-generated */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Asset UID</label>
                    <small className="text-muted ms-2">Auto-generated</small>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={formData.asset_uid}
                      readOnly
                      placeholder="Auto-generated"
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Category</label>
                    <small className="text-muted ms-2">e.g., Fire Alarm Panel</small>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Asset Name */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Asset Name</label>
                    <small className="text-muted ms-2">e.g., Fire Alarm Panel</small>
                    <input
                      type="text"
                      name="asset_name"
                      className="form-control"
                      value={formData.asset_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter asset name"
                    />
                  </div>

                  {/* Manufacturer */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Manufacturer</label>
                    <small className="text-muted ms-2">e.g., Siemens</small>
                    <input
                      type="text"
                      name="manufacturer"
                      className="form-control"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      placeholder="Enter manufacturer"
                    />
                  </div>

                  {/* Model No */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Model No</label>
                    <input
                      type="text"
                      name="model_no"
                      className="form-control"
                      value={formData.model_no}
                      onChange={handleChange}
                      placeholder="Enter model number"
                    />
                  </div>

                  {/* Serial No */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Serial No</label>
                    <small className="text-muted ms-2">Serial number</small>
                    <input
                      type="text"
                      name="serial_no"
                      className="form-control"
                      value={formData.serial_no}
                      onChange={handleChange}
                      placeholder="Enter serial number"
                    />
                  </div>

                  {/* Site */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Site</label>
                    <select
                      name="site_id"
                      className="form-select"
                      value={formData.site_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Site</option>
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Criticality */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Criticality</label>
                    <select
                      name="criticality"
                      className="form-select"
                      value={formData.criticality}
                      onChange={handleChange}
                    >
                      {criticalityOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Installation Date */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Installation Date</label>
                    <input
                      type="date"
                      name="installation_date"
                      className="form-control"
                      value={formData.installation_date}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Uploaded By */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Uploaded By</label>
                    <select
                      name="uploaded_by"
                      className="form-select"
                      value={formData.uploaded_by}
                      onChange={handleChange}
                    >
                      <option value="">Select Technician</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Uploaded At */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Uploaded At</label>
                    <small className="text-muted ms-2">e.g., Server Room</small>
                    <input
                      type="text"
                      name="uploaded_at"
                      className="form-control"
                      value={formData.uploaded_at}
                      onChange={handleChange}
                      placeholder="Enter location"
                    />
                  </div>

                  {/* Form Buttons */}
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary me-2">
                      {editId ? "Update Asset" : "Add Asset"}
                    </button>
                    {editId && (
                      <button type="button" className="btn btn-secondary" onClick={handleReset}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Assets List */}
          <div className="col-md-7">
            <div className="card shadow">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Assets List ({filteredAssets.length})</h5>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search assets..."
                  style={{ width: "200px" }}
                />
              </div>


              {/* Assets Table */}
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Asset UID</th>
                        <th>Category</th>
                        <th>Asset Name</th>
                        <th>Manufacturer</th>
                        <th>Site</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.map(asset => (
                        <tr key={asset.id}>
                          <td><span className="badge bg-secondary">{asset.asset_uid}</span></td>
                          <td>{asset.category}</td>
                          <td>{asset.asset_name}</td>
                          <td>{asset.manufacturer}</td>
                          <td>{asset.site_name}</td>
                          <td>
                            <span className={`badge ${
                              asset.status === 'Active' ? 'bg-success' : 
                              asset.status === 'Under Maintenance' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-warning me-1"
                              onClick={() => handleEdit(asset)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(asset.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetOnboarding;