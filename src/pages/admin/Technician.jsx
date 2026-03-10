import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import useToast from "../../hooks/useToast";
import useCrud from "../../hooks/useCrud";
import {
  TECHNICIAN_URL,
  CATEGORY_URL,
  LOCATION_URL,
  ORGANISATION_URL,
} from "../../services/endpoints";

const Inner = () => {
  const { toastRef, showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // CRUD hooks for master data
  const { create: createTechnician } = useCrud(TECHNICIAN_URL);
  const { get: getCategory } = useCrud(CATEGORY_URL);
  const { get: getLocation } = useCrud(LOCATION_URL);
  const { get: getOrganisation } = useCrud(ORGANISATION_URL);

  // Master data states
  const [technicianTypes, setTechnicianTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [serviceCities, setServiceCities] = useState([]);
  const [filteredServiceCities, setFilteredServiceCities] = useState([]);
  const [categories, setCategories] = useState([]);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState({});

  const totalSteps = 5;

  const [formData, setFormData] = useState({
    // User table fields
    full_name: "",
    email: "",
    contact: "",
    role: "",
    user_name: "",
    password: "",
    user_type: "technician",
    dep_desig_id: "",
    profile_image: null,
    status: 1,

    // Technician table fields - Basic Info
    vendor_id: "",
    tech_type: "",
    dob: "",
    gender: "",
    employee: "",
    tech_role: "",

    // Government ID fields
    id_proof_type: "", // Stores which ID type is selected (Aadhaar, Voter ID, etc.)
    id_number: "", // Stores the actual ID number

    // Address fields
    state: "",
    city: "",
    pincode: "",
    branchAddress: "",
    urrl: "",

    // Service Domain & Experience
    service_domain: [],
    fire_exp: "",
    process_knowledge: "",
    camera_brand: "",
    solar_exp: "",
    total_exp: "",
    hands_on_exp: "",
    equp_familarity: [],
    porform: "",
    oem_tranning: "",
    special_skills: "",

    // Safety & Compliance
    safety_tranning_com: "",
    safety_training_completed: "",
    ppe_declaration: false,
    alcohol_free_declaration: false,
    site_safety_compliance: false,
    additional_safety_notes: "",
    //authorization

    auditDomains: {
      fire: false,
      stp: false,
      electrical: false,
      solar: false,
    },
    // Equipment Familiarity (nested structure for HVAC and other systems)
    equipment: {
      // HVAC Systems
      hvac: {
        chillers: false,
        ahu: false,
        fcu: false,
        pumps: false,
        cooling_towers: false,
        boilers: false,
        ventilation: false,
        thermostats: false,
      },
      // Controls & Sensors
      controls: {
        sensors: false,
        controllers: false,
        vfds: false,
        compressors: false,
        condensers: false,
        heat_exchangers: false,
      },
    },

    // Service Location & Availability
    service_state: "",
    service_city_id: "",
    working_days: "",
    shift_performance: "",
    used_by_book_amc: false,
    emg_avilability: false,

    // Documents
    fire_certi: null,
    fire_amc: null,
    stp_certi: null,
    pollution_tranee_pro: null,
    cctv: null,
    electric_lic: null,
    oem_image: null,
    photo: null,
    id_proof: null,
    domain_certi: null,
    police_verification: null,
    medical_fitness: null,
  });

  // Step names for progress bar
  const stepNames = [
    "Basic Info",
    "Experience & Skills",
    "Service Details",
    "Domain",
    "Documents",
    
  ];

  /* ---------------------------
     FETCH MASTER DATA
  ---------------------------- */
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        // Fetch organizations/technician types
        const orgResponse = await getOrganisation("");
        if (orgResponse?.data) {
          const orgData = Array.isArray(orgResponse.data)
            ? orgResponse.data
            : orgResponse.data.data || [];
          setTechnicianTypes(orgData);
          setOrganisations(orgData);
        }

        // Fetch locations (states and cities)
        const locResponse = await getLocation("");
        if (locResponse?.data) {
          const locationData = Array.isArray(locResponse.data)
            ? locResponse.data
            : locResponse.data.data || [];

          setLocations(locationData);

          // Extract unique states
          const stateMap = new Map();
          locationData.forEach((item) => {
            if (item.parent_id && item.parent_name) {
              stateMap.set(item.parent_id, {
                id: item.parent_id,
                name: item.parent_name,
              });
            }
          });
          setStates(Array.from(stateMap.values()));

          // Store all cities
          const citiesList = locationData.map((item) => ({
            id: item.id,
            name: item.name,
            state_id: item.parent_id,
            state_name: item.parent_name,
            status: item.status,
          }));
          setCities(citiesList);
          setServiceCities(citiesList);
        }

        // Fetch categories for service domains
        const catResponse = await getCategory("");
        if (catResponse?.data) {
          const catData = Array.isArray(catResponse.data)
            ? catResponse.data
            : catResponse.data.data || [];
          setCategories(catData);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
        showToast("error", "Failed to load some master data");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Filter cities when state changes for address
  useEffect(() => {
    if (formData.state && cities.length > 0) {
      const filtered = cities.filter(
        (city) => city.state_id === parseInt(formData.state),
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [formData.state, cities]);

  // Filter service cities when state changes
  useEffect(() => {
    if (formData.service_state && serviceCities.length > 0) {
      const filtered = serviceCities.filter(
        (city) => city.state_id === parseInt(formData.service_state),
      );
      setFilteredServiceCities(filtered);
    } else {
      setFilteredServiceCities([]);
    }
  }, [formData.service_state, serviceCities]);

  // ================= STEP NAVIGATION =================
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep || completedSteps[step]) {
      setCurrentStep(step);
    }
  };

  const markStepComplete = (step) => {
    setCompletedSteps({ ...completedSteps, [step]: true });
  };

  // ================= VALIDATION =================
  const validateCurrentStep = () => {
    const errors = {};

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ================= INPUT CHANGE =================
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === "file") {
      if (files[0] && files[0].size > 5 * 1024 * 1024) {
        showToast("error", `${name} exceeds 5MB limit`);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "checkbox") {
      if (name.includes(".")) {
        // Handle nested checkbox (e.g., equipment.hvac.chillers)
        const [parent, child, subChild] = name.split(".");
        if (subChild) {
          setFormData((prev) => ({
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: {
                ...prev[parent]?.[child],
                [subChild]: checked,
              },
            },
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: checked,
            },
          }));
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (type === "select-multiple") {
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDomainChange = (e) => {
    const { value, checked } = e.target;
    let updatedDomains = [...formData.service_domain];

    if (checked) {
      updatedDomains.push(value);
    } else {
      updatedDomains = updatedDomains.filter((item) => item !== value);
    }

    setFormData((prev) => ({ ...prev, service_domain: updatedDomains }));

    if (validationErrors.service_domain) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.service_domain;
        return newErrors;
      });
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields across steps
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      setCurrentStep(step);
      if (!validateCurrentStep()) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      showToast("error", "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();

      // Flatten equipment object for API
      const equipmentList = [];
      Object.entries(formData.equipment.hvac).forEach(([key, value]) => {
        if (value) equipmentList.push(key);
      });
      Object.entries(formData.equipment.controls).forEach(([key, value]) => {
        if (value) equipmentList.push(key);
      });

      // Map form data to API expected fields
      const fieldMappings = {
        full_name: formData.full_name,
        email: formData.email,
        contact: formData.contact,
        role: formData.role,
        user_name: formData.user_name,
        password: formData.password,
        user_type: "technician",
        dep_desig_id: formData.dep_desig_id,
        status: formData.status,

        // Technician fields
        vendor_id: formData.vendor_id,
        tech_type: formData.tech_type,
        dob: formData.dob,
        gender: formData.gender,
        employee: formData.employee,
        tech_role: formData.tech_role,
        id_proof_type: formData.id_proof_type,
        id_number: formData.id_number,

        // Address fields
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        branch_address: formData.branchAddress,
        website: formData.urrl,

        // Experience fields
        fire_exp: formData.fire_exp,
        process_knowledge: formData.process_knowledge,
        camera_brand: formData.camera_brand,
        solar_exp: formData.solar_exp,
        total_exp: formData.total_exp,
        hands_on_exp: formData.hands_on_exp,
        equp_familarity: JSON.stringify(equipmentList),
        porform: formData.porform,
        oem_tranning: formData.oem_tranning,
        special_skills: formData.special_skills,

        // Safety & Compliance fields
        safety_training_completed: formData.safety_training_completed,
        ppe_declaration: formData.ppe_declaration ? "1" : "0",
        alcohol_free_declaration: formData.alcohol_free_declaration ? "1" : "0",
        site_safety_compliance: formData.site_safety_compliance ? "1" : "0",
        additional_safety_notes: formData.additional_safety_notes,

        service_city_id: formData.service_city_id,
        working_days: formData.working_days,
        shift_performance: formData.shift_performance,
        used_by_book_amc: formData.used_by_book_amc ? "1" : "0",
        emg_avilability: formData.emg_avilability ? "1" : "0",
      };

      // Append regular fields
      Object.entries(fieldMappings).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          data.append(key, value);
        }
      });

      // Handle service_domain array
      if (formData.service_domain && formData.service_domain.length > 0) {
        formData.service_domain.forEach((domain, index) => {
          data.append(`service_domain[${index}]`, domain);
        });
      }

      // Add file fields
      const fileFields = {
        profile_image: "profile_image",
        fire_certi: "fire_certi",
        fire_amc: "fire_amc",
        stp_certi: "stp_certi",
        pollution_tranee_pro: "pollution_tranee_pro",
        cctv: "cctv",
        electric_lic: "electric_lic",
        oem_image: "oem_image",
        photo: "photo",
        id_proof: "id_proof",
        domain_certi: "domain_certi",
        police_verification: "police_verification",
        medical_fitness: "medical_fitness",
      };

      Object.entries(fileFields).forEach(([key, fieldName]) => {
        if (formData[key] instanceof File) {
          data.append(fieldName, formData[key]);
        }
      });

      const response = await createTechnician(data);

      if (
        response &&
        (response.status === 200 ||
          response.status === 201 ||
          response.data?.status === "success")
      ) {
        showToast("success", "Technician added successfully!");

        // Reset form
        setFormData({
          full_name: "",
          email: "",
          contact: "",
          role: "",
          user_name: "",
          password: "",
          user_type: "technician",
          dep_desig_id: "",
          profile_image: null,
          status: 1,
          vendor_id: "",
          tech_type: "",
          dob: "",
          gender: "",
          employee: "",
          tech_role: "",
          id_proof_type: "",
          id_number: "",
          state: "",
          city: "",
          pincode: "",
          branchAddress: "",
          urrl: "",
          service_domain: [],
          fire_exp: "",
          process_knowledge: "",
          camera_brand: "",
          solar_exp: "",
          total_exp: "",
          hands_on_exp: "",
          equp_familarity: [],
          porform: "",
          oem_tranning: "",
          special_skills: "",
          safety_training_completed: "",
          ppe_declaration: false,
          alcohol_free_declaration: false,
          site_safety_compliance: false,
          additional_safety_notes: "",
          equipment: {
            hvac: {
              chillers: false,
              ahu: false,
              fcu: false,
              pumps: false,
              cooling_towers: false,
              boilers: false,
              ventilation: false,
              thermostats: false,
            },
            controls: {
              sensors: false,
              controllers: false,
              vfds: false,
              compressors: false,
              condensers: false,
              heat_exchangers: false,
            },
          },
          service_state: "",
          service_city_id: "",
          working_days: "",
          shift_performance: "",
          used_by_book_amc: false,
          emg_avilability: false,
          fire_certi: null,
          fire_amc: null,
          stp_certi: null,
          pollution_tranee_pro: null,
          cctv: null,
          electric_lic: null,
          oem_image: null,
          photo: null,
          id_proof: null,
          domain_certi: null,
          police_verification: null,
          medical_fitness: null,
        });
        setValidationErrors({});
        setCurrentStep(1);
        setCompletedSteps({});
      } else {
        showToast("error", response?.data?.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Save failed:", err);
      showToast(
        "error",
        err.response?.data?.message || "Failed to save technician data",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressSteps = () => {
    return (
      <div>
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
              <h4 className="mb-sm-0">Technician Registration</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <span>Home</span>
                  </li>
                  <li className="breadcrumb-item active">
                    Technician Registration
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div
          className="progress-steps mb-4"
          style={{
            padding: "20px 0",
            background: "white",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            overflowX: "auto",
          }}
        >
          <div
            className="d-flex justify-content-between align-items-center px-4"
            style={{ minWidth: "800px" }}
          >
            {stepNames.map((stepName, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = completedSteps[stepNumber];
              const isClickable = stepNumber <= currentStep || isCompleted;

              return (
                <React.Fragment key={stepName}>
                  {index > 0 && (
                    <div
                      className="progress-line flex-grow-1 mx-2"
                      style={{
                        height: "2px",
                        backgroundColor: "#dee2e6",
                      }}
                    ></div>
                  )}
                  <div
                    className="step-item d-flex flex-column align-items-center"
                    style={{
                      cursor: isClickable ? "pointer" : "default",
                      flex: 1,
                    }}
                    onClick={() => isClickable && handleStepClick(stepNumber)}
                  >
                    <div
                      className="step-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: isCompleted
                          ? "#198754"
                          : isActive
                            ? "#0d6efd"
                            : "#e9ecef",
                        color: isActive || isCompleted ? "white" : "#6c757d",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        transition: "all 0.3s ease",
                        transform: isActive ? "scale(1.1)" : "none",
                        boxShadow: isActive
                          ? "0 4px 8px rgba(13, 110, 253, 0.3)"
                          : "none",
                      }}
                    >
                      {isCompleted ? "✓" : stepNumber}
                    </div>
                    <div
                      className="step-label text-center"
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: isActive ? "600" : "500",
                        color: isActive
                          ? "#0d6efd"
                          : isCompleted
                            ? "#198754"
                            : "#6c757d",
                      }}
                    >
                      {stepName}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary">
                  <h4 className="mb-0 text-white">Basic Information</h4>
                </div>
                <div className="card-body">
                  {loading && (
                    <div className="alert alert-info">
                      Loading master data...
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-12 mb-4">
                      <h5 className="border-bottom pb-2">Personal Details</h5>
                    </div>

                    {/* Full Name */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Full Name (as per ID) *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.full_name ? "is-invalid" : ""}`}
                        placeholder="Enter full name as per ID"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                      />
                      {validationErrors.full_name && (
                        <div className="invalid-feedback">
                          {validationErrors.full_name}
                        </div>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Mobile Number *</label>
                      <input
                        type="tel"
                        className={`form-control ${validationErrors.contact ? "is-invalid" : ""}`}
                        placeholder="Enter mobile number"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                      />
                      {validationErrors.contact && (
                        <div className="invalid-feedback">
                          {validationErrors.contact}
                        </div>
                      )}
                      <small className="text-muted">
                        One mobile number = one technician (no duplicates)
                      </small>
                    </div>

                    {/* Email ID */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Email ID *</label>
                      <input
                        type="email"
                        className={`form-control ${validationErrors.email ? "is-invalid" : ""}`}
                        placeholder="Enter email address"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Date of Birth *</label>
                      <input
                        type="date"
                        className={`form-control ${validationErrors.dob ? "is-invalid" : ""}`}
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                      {validationErrors.dob && (
                        <div className="invalid-feedback">
                          {validationErrors.dob}
                        </div>
                      )}
                    </div>

                    {/* Designation */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Designation *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter designation"
                        name="dep_desig_id"
                        value={formData.dep_desig_id}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Role */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Username */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Username *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.user_name ? "is-invalid" : ""}`}
                        placeholder="Enter username"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleInputChange}
                      />
                      {validationErrors.user_name && (
                        <div className="invalid-feedback">
                          {validationErrors.user_name}
                        </div>
                      )}
                    </div>

                    {/* Password */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className={`form-control ${validationErrors.password ? "is-invalid" : ""}`}
                        placeholder="Enter password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
                    </div>

                    {/* Profile Image */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Profile Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        name="profile_image"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-12 mb-4 mt-3">
                      <h5 className="border-bottom pb-2">Employment Details</h5>
                    </div>

                    {/* Technician Type */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Technician Type *</label>
                      <select
                        className={`form-control ${validationErrors.tech_type ? "is-invalid" : ""}`}
                        name="tech_type"
                        value={formData.tech_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Technician Type</option>
                        <option value="Fire">Fire Technician</option>
                        <option value="Electrical">
                          Electrical Technician
                        </option>
                        <option value="STP">STP Technician</option>
                        <option value="Solar">Solar Technician</option>
                        <option value="CCTV">CCTV Technician</option>
                        <option value="Multi-Skilled">
                          Multi-Skilled Technician
                        </option>
                      </select>
                      {validationErrors.tech_type && (
                        <div className="invalid-feedback">
                          {validationErrors.tech_type}
                        </div>
                      )}
                    </div>

                    {/* Vendor */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Vendor</label>
                      <select
                        className="form-control"
                        name="vendor_id"
                        value={formData.vendor_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Vendor</option>
                        {organisations && organisations.length > 0 ? (
                          organisations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No vendors available
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Employee Type */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Employee Type</label>
                      <select
                        className="form-control"
                        name="employee"
                        value={formData.employee}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Employee Type</option>
                        <option value="Permanent">Full-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">On Call</option>
                      </select>
                    </div>

                    {/* Technician Role */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Technician Role</label>
                      <select
                        className="form-control"
                        name="tech_role"
                        value={formData.tech_role}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Technician Role</option>
                        <option value="Technician">Technician</option>
                        <option value="Senior_Technician">
                          Senior Technician
                        </option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Auditor_available">
                          Auditor (if Available)
                        </option>
                      </select>
                    </div>

                    {/* Gender */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Gender (optional)</label>
                      <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Government ID Section */}
                    <div className="col-12 mb-3 mt-3">
                      <label className="form-label fw-bold">
                        Government ID <span className="text-danger">*</span>
                      </label>
                      <p className="text-muted small mb-2">
                        One of the following ID proofs is mandatory
                      </p>

                      <div className="row">
                        {/* Aadhaar Option */}
                        <div className="col-md-6 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="aadhaar"
                                value="Aadhaar"
                                checked={formData.id_proof_type === "Aadhaar"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="aadhaar"
                              >
                                Aadhaar Number (masked storage)
                              </label>
                            </div>

                            {/* Conditional Aadhaar Number Input */}
                            {formData.id_proof_type === "Aadhaar" && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  className={`form-control ${validationErrors.id_number ? "is-invalid" : ""}`}
                                  placeholder="Enter Aadhaar number"
                                  name="id_number"
                                  value={formData.id_number}
                                  onChange={handleInputChange}
                                  maxLength="12"
                                />
                                {validationErrors.id_number && (
                                  <div className="invalid-feedback">
                                    {validationErrors.id_number}
                                  </div>
                                )}
                                <small className="text-muted">
                                  Enter 12-digit Aadhaar number
                                </small>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Voter ID Option */}
                        <div className="col-md-6 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="voter_id"
                                value="Voter ID"
                                checked={formData.id_proof_type === "Voter ID"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="voter_id"
                              >
                                Voter ID
                              </label>
                            </div>

                            {/* Conditional Voter ID Input */}
                            {formData.id_proof_type === "Voter ID" && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  className={`form-control ${validationErrors.id_number ? "is-invalid" : ""}`}
                                  placeholder="Enter Voter ID number"
                                  name="id_number"
                                  value={formData.id_number}
                                  onChange={handleInputChange}
                                />
                                {validationErrors.id_number && (
                                  <div className="invalid-feedback">
                                    {validationErrors.id_number}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Driving License Option */}
                        <div className="col-md-6 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="driving_license"
                                value="Driving License"
                                checked={
                                  formData.id_proof_type === "Driving License"
                                }
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="driving_license"
                              >
                                Driving License
                              </label>
                            </div>

                            {/* Conditional Driving License Input */}
                            {formData.id_proof_type === "Driving License" && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  className={`form-control ${validationErrors.id_number ? "is-invalid" : ""}`}
                                  placeholder="Enter Driving License number"
                                  name="id_number"
                                  value={formData.id_number}
                                  onChange={handleInputChange}
                                />
                                {validationErrors.id_number && (
                                  <div className="invalid-feedback">
                                    {validationErrors.id_number}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Passport Option */}
                        <div className="col-md-6 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="passport"
                                value="Passport"
                                checked={formData.id_proof_type === "Passport"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="passport"
                              >
                                Passport
                              </label>
                            </div>

                            {/* Conditional Passport Input */}
                            {formData.id_proof_type === "Passport" && (
                              <div className="mt-3">
                                <input
                                  type="text"
                                  className={`form-control ${validationErrors.id_number ? "is-invalid" : ""}`}
                                  placeholder="Enter Passport number"
                                  name="id_number"
                                  value={formData.id_number}
                                  onChange={handleInputChange}
                                />
                                {validationErrors.id_number && (
                                  <div className="invalid-feedback">
                                    {validationErrors.id_number}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Validation message if no ID type selected */}
                      {validationErrors.id_proof_type && (
                        <div className="text-danger small mt-2">
                          {validationErrors.id_proof_type}
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Website *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter website URL"
                        name="urrl"
                        value={formData.urrl}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Branch Address */}
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
                      ></textarea>
                    </div>

                    {/* State */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State *</label>
                      <select
                        className={`form-control ${validationErrors.state ? "is-invalid" : ""}`}
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={loading}
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
                            {loading
                              ? "Loading states..."
                              : "No states available"}
                          </option>
                        )}
                      </select>
                      {validationErrors.state && (
                        <div className="invalid-feedback">
                          {validationErrors.state}
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City *</label>
                      <select
                        className={`form-control ${validationErrors.city ? "is-invalid" : ""}`}
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!formData.state || loading}
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
                      {validationErrors.city && (
                        <div className="invalid-feedback">
                          {validationErrors.city}
                        </div>
                      )}
                    </div>

                    {/* Pincode */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Pincode *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.pincode ? "is-invalid" : ""}`}
                        placeholder="Enter pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                      {validationErrors.pincode && (
                        <div className="invalid-feedback">
                          {validationErrors.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Experience & Skills (Combined with Safety & Compliance)
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary">
                  <h4 className="mb-0 text-white">
                    Experience & Capability Validation
                  </h4>
                </div>
                <div className="card-body">
                  {/* Experience Details Section */}
                  <div className="row mb-4">
                    <div className="col-12 mb-3">
                      <h5 className="border-bottom pb-2">
                        Mandatory Information{" "}
                        <span className="text-danger">*</span>
                      </h5>
                    </div>

                    {/* Total Experience */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Total Experience (years){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className={`form-control ${validationErrors.total_exp ? "is-invalid" : ""}`}
                        placeholder="e.g., 5 or 3.5"
                        name="total_exp"
                        value={formData.total_exp}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">
                        Enter total years of experience (e.g., 5 or 3.5)
                      </small>
                      {validationErrors.total_exp && (
                        <div className="invalid-feedback">
                          {validationErrors.total_exp}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Hands-on Experience (years){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className={`form-control ${validationErrors.total_exp ? "is-invalid" : ""}`}
                        placeholder="e.g., 5 or 3.5"
                        name="total_exp"
                        value={formData.total_exp}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Equipment Familiarity Section */}
                  <div className="row mb-4">
                    <div className="col-12 mb-3">
                      <h5 className="border-bottom pb-2">
                        Equipment Familiarity{" "}
                        <span className="text-danger">*</span>
                      </h5>
                      {validationErrors.equipment && (
                        <div className="text-danger small mb-2">
                          {validationErrors.equipment}
                        </div>
                      )}
                    </div>

                    {/* HVAC Systems */}
                    <div className="col-md-12 mb-4">
                      <div className="card border h-100">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-4">
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="havsystems"
                                  name="equipment.hvac.havsystems"
                                  checked={formData.equipment.hvac.havsystems}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="HVAC Systems"
                                >
                                  HVAC Systems
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="chillers"
                                  name="equipment.hvac.chillers"
                                  checked={formData.equipment.hvac.chillers}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="chillers"
                                >
                                  Chillers
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="ahu"
                                  name="equipment.hvac.ahu"
                                  checked={formData.equipment.hvac.ahu}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="ahu"
                                >
                                  AHU
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="fcu"
                                  name="equipment.hvac.fcu"
                                  checked={formData.equipment.hvac.fcu}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="fcu"
                                >
                                  FCU
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="pumps"
                                  name="equipment.hvac.pumps"
                                  checked={formData.equipment.hvac.pumps}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="pumps"
                                >
                                  Pumps
                                </label>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="cooling_towers"
                                  name="equipment.hvac.cooling_towers"
                                  checked={
                                    formData.equipment.hvac.cooling_towers
                                  }
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="cooling_towers"
                                >
                                  Cooling Towers
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="boilers"
                                  name="equipment.hvac.boilers"
                                  checked={formData.equipment.hvac.boilers}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="boilers"
                                >
                                  Boilers
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="ventilation"
                                  name="equipment.hvac.ventilation"
                                  checked={formData.equipment.hvac.ventilation}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="ventilation"
                                >
                                  Ventilation Systems
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="thermostats"
                                  name="equipment.hvac.thermostats"
                                  checked={formData.equipment.hvac.thermostats}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="thermostats"
                                >
                                  Thermostats
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="sensors"
                                  name="equipment.controls.sensors"
                                  checked={formData.equipment.controls.sensors}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="sensors"
                                >
                                  Sensors
                                </label>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="compressors"
                                  name="equipment.controls.compressors"
                                  checked={
                                    formData.equipment.controls.compressors
                                  }
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="compressors"
                                >
                                  Compressors
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="condensers"
                                  name="equipment.controls.condensers"
                                  checked={
                                    formData.equipment.controls.condensers
                                  }
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="condensers"
                                >
                                  Condensers
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="heat_exchangers"
                                  name="equipment.controls.heat_exchangers"
                                  checked={
                                    formData.equipment.controls.heat_exchangers
                                  }
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="heat_exchangers"
                                >
                                  Heat Exchangers
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="controllers"
                                  name="equipment.controls.controllers"
                                  checked={
                                    formData.equipment.controls.controllers
                                  }
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="controllers"
                                >
                                  Controllers
                                </label>
                              </div>
                              <div className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="vfds"
                                  name="equipment.controls.vfds"
                                  checked={formData.equipment.controls.vfds}
                                  onChange={handleInputChange}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="vfds"
                                >
                                  VFDs
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold">
                      Can Perform Independently?{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-4 mt-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="safety_training_completed"
                          id="safety_yes"
                          value="Yes"
                          checked={formData.safety_training_completed === "Yes"}
                          onChange={handleInputChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="safety_yes"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="safety_training_completed"
                          id="safety_no"
                          value="No"
                          checked={formData.safety_training_completed === "No"}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="safety_no">
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Optional Information */}
                  <div className="row mb-4">
                    <div className="col-12 mb-3">
                      <h5 className="border-bottom pb-2">
                        Optional Information
                      </h5>
                    </div>

                    {/* OEM Brand Training */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        OEM Brand Training
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add OEM brand (e.g., Carrier, Trane, Daikin)"
                        name="oem_tranning"
                        value={formData.oem_tranning}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Special Skills */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Special Skills
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Add special skill (e.g., PLC Programming, BMS Integration)"
                        name="special_skills"
                        value={formData.special_skills}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">
                        PLC, SCADA, BMS, etc.
                      </small>
                    </div>
                  </div>

                  {/* Safety & Compliance Declarations */}
                  <div className="row mt-4">
                    <div className="col-12 mb-3">
                      <h5 className="border-bottom pb-2">
                        Safety & Compliance Declarations{" "}
                        <span className="text-danger">*</span>
                      </h5>
                    </div>

                    {/* Safety Training Completed */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">
                        Safety Training Completed{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-4 mt-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="safety_training_completed"
                            id="safety_yes"
                            value="Yes"
                            checked={
                              formData.safety_training_completed === "Yes"
                            }
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="safety_yes"
                          >
                            Yes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="safety_training_completed"
                            id="safety_no"
                            value="No"
                            checked={
                              formData.safety_training_completed === "No"
                            }
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="safety_no"
                          >
                            No
                          </label>
                        </div>
                      </div>
                      <small className="text-muted">
                        e.g., OSHA, IOSH, or equivalent safety training
                        certification
                      </small>
                      {validationErrors.safety_training_completed && (
                        <div className="text-danger small">
                          {validationErrors.safety_training_completed}
                        </div>
                      )}
                    </div>

                    {/* PPE Usage Declaration */}
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.ppe_declaration ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="ppe_declaration"
                            id="ppe_declaration"
                            checked={formData.ppe_declaration}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="ppe_declaration"
                          >
                            PPE Usage Declaration{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I declare that I and my team will use appropriate
                          Personal Protective Equipment (PPE) including helmet,
                          safety shoes, gloves, safety glasses, and any other
                          required protective gear while on site.
                        </p>
                        {validationErrors.ppe_declaration && (
                          <div className="text-danger small mt-1">
                            {validationErrors.ppe_declaration}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alcohol-free & Drug-free Declaration */}
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.alcohol_free_declaration ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="alcohol_free_declaration"
                            id="alcohol_free_declaration"
                            checked={formData.alcohol_free_declaration}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="alcohol_free_declaration"
                          >
                            Alcohol-free & Drug-free Declaration{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I declare that I and my team will not be under the
                          influence of alcohol or drugs while performing
                          services on client premises.
                        </p>
                        {validationErrors.alcohol_free_declaration && (
                          <div className="text-danger small mt-1">
                            {validationErrors.alcohol_free_declaration}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Site Safety Compliance Acceptance */}
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.site_safety_compliance ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="site_safety_compliance"
                            id="site_safety_compliance"
                            checked={formData.site_safety_compliance}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="site_safety_compliance"
                          >
                            Site Safety Compliance Acceptance{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I agree to comply with all site-specific safety rules,
                          procedures, and regulations. I understand that
                          violation of safety protocols may result in removal
                          from site and legal consequences.
                        </p>
                        {validationErrors.site_safety_compliance && (
                          <div className="text-danger small mt-1">
                            {validationErrors.site_safety_compliance}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Safety Notes */}
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">
                        Additional Safety Notes (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Any additional safety certifications, notes, or special considerations..."
                        name="additional_safety_notes"
                        value={formData.additional_safety_notes}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    {/* Audit Evidence Notice */}
                    <div className="col-12 mt-2">
                      <div className="alert alert-info">
                        <i className="bi bi-shield-check me-2"></i>
                        <strong>Stored as audit evidence:</strong> These
                        declarations will be timestamped, digitally signed, and
                        stored in our secure audit system. They can be used for
                        compliance verification and legal purposes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Service Details
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary">
                  <h4 className="mb-0 text-white">Service Details</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12 mb-4">
                      <h5 className="border-bottom pb-2">Service Location</h5>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Service State</label>
                      <select
                        className="form-control"
                        name="service_state"
                        value={formData.service_state}
                        onChange={handleInputChange}
                        disabled={loading}
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
                            {loading
                              ? "Loading states..."
                              : "No states available"}
                          </option>
                        )}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Service City *</label>
                      <select
                        className={`form-control ${validationErrors.service_city_id ? "is-invalid" : ""}`}
                        name="service_city_id"
                        value={formData.service_city_id}
                        onChange={handleInputChange}
                        disabled={!formData.service_state || loading}
                      >
                        <option value="">Select City</option>
                        {filteredServiceCities &&
                        filteredServiceCities.length > 0 ? (
                          filteredServiceCities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {formData.service_state
                              ? "No cities available"
                              : "Select a state first"}
                          </option>
                        )}
                      </select>
                      {validationErrors.service_city_id && (
                        <div className="invalid-feedback">
                          {validationErrors.service_city_id}
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 mt-4 mb-3">
                      <h5 className="border-bottom pb-2">Availability</h5>
                    </div>
                    <div className="col-md-12 mb-4">
                      <div className="card border h-100">
                        <div className="card-body">
                          {/* ROW 1 - 4 items */}
                          <div className="row">
                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="havsystems"
                                name="equipment.hvac.havsystems"
                                checked={formData.equipment.hvac.havsystems}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="havsystems"
                              >
                                Monday
                              </label>
                            </div>

                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="chillers"
                                name="equipment.hvac.chillers"
                                checked={formData.equipment.hvac.chillers}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="chillers"
                              >
                                Tuesday
                              </label>
                            </div>

                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="ahu"
                                name="equipment.hvac.ahu"
                                checked={formData.equipment.hvac.ahu}
                                onChange={handleInputChange}
                              />
                              <label className="form-check-label" htmlFor="ahu">
                                Wednesday
                              </label>
                            </div>

                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="fcu"
                                name="equipment.hvac.fcu"
                                checked={formData.equipment.hvac.fcu}
                                onChange={handleInputChange}
                              />
                              <label className="form-check-label" htmlFor="fcu">
                                Thursday
                              </label>
                            </div>
                          </div>

                          {/* ROW 2 - 3 items */}
                          <div className="row mt-2">
                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="pumps"
                                name="equipment.hvac.pumps"
                                checked={formData.equipment.hvac.pumps}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="pumps"
                              >
                                Friday
                              </label>
                            </div>
                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="pumps"
                                name="equipment.hvac.pumps"
                                checked={formData.equipment.hvac.pumps}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="pumps"
                              >
                                Saturday
                              </label>
                            </div>
                            <div className="col-md-3 form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="pumps"
                                name="equipment.hvac.pumps"
                                checked={formData.equipment.hvac.pumps}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="pumps"
                              >
                                Sunday
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 mb-3 mt-3">
                      <label className="form-label fw-bold">
                        Shift Preference <span className="text-danger">*</span>
                      </label>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="aadhaar"
                                value="Aadhaar"
                                checked={formData.id_proof_type === "Aadhaar"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="aadhaar"
                              >
                                Day
                              </label>
                            </div>
                            <p className="text-muted small mt-1 mb-0">
                              6AM-6PM
                            </p>
                          </div>
                        </div>

                        {/* Voter ID Option */}
                        <div className="col-md-4 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="voter_id"
                                value="Voter ID"
                                checked={formData.id_proof_type === "Voter ID"}
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="voter_id"
                              >
                                Night
                              </label>
                            </div>
                            <p className="text-muted small mt-1 mb-0">
                              6PM-6AM
                            </p>
                          </div>
                        </div>

                        {/* Driving License Option */}
                        <div className="col-md-4 mb-3">
                          <div className="border rounded p-3">
                            <div className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="id_proof_type"
                                id="driving_license"
                                value="Driving License"
                                checked={
                                  formData.id_proof_type === "Driving License"
                                }
                                onChange={handleInputChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="driving_license"
                              >
                                Emergency
                              </label>
                            </div>
                            <p className="text-muted small mt-1 mb-0">
                              24/7 on-call availability
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label fw-bold">
                        Emergency Availability{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-4 mt-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="safety_training_completed"
                            id="safety_yes"
                            value="Yes"
                            checked={
                              formData.safety_training_completed === "Yes"
                            }
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="safety_yes"
                          >
                            Yes
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="safety_training_completed"
                            id="safety_no"
                            value="No"
                            checked={
                              formData.safety_training_completed === "No"
                            }
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="safety_no"
                          >
                            No
                          </label>
                        </div>
                      </div>
                      <p>
                        Available for emergency callouts outside regular working
                        hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Domains & Authorizations (Merged)
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary">
                  <h4 className="mb-0 text-white">Audit Domains & Authorizations</h4>
                </div>
                <div className="card-body">
                  {/* Domains Selection Section */}
                  <div className="row mb-4">
                    <div className="col-12 mb-3">
                      <h5 className="border-bottom pb-2">Select Audit Domains *</h5>
                    </div>
      
                    <div className="col-md-3 mb-3">
                      <div className={`form-check border rounded p-3 ${validationErrors.auditDomains ? 'border-danger' : ''}`}>
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          id="fire"
                          name="auditDomains.fire"
                          checked={formData.auditDomains.fire}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="fire">🔥 Fire Safety Audit</label>
                      </div>
                    </div>
      
                    <div className="col-md-3 mb-3">
                      <div className="form-check border rounded p-3">
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          id="stp"
                          name="auditDomains.stp"
                          checked={formData.auditDomains.stp}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="stp">💧 STP / Environmental Audit</label>
                      </div>
                    </div>
      
                    <div className="col-md-3 mb-3">
                      <div className="form-check border rounded p-3">
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          id="electrical"
                          name="auditDomains.electrical"
                          checked={formData.auditDomains.electrical}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="electrical">⚡ Electrical / CCTV Safety Audit</label>
                      </div>
                    </div>
      
                    <div className="col-md-3 mb-3">
                      <div className="form-check border rounded p-3">
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          id="solar"
                          name="auditDomains.solar"
                          checked={formData.auditDomains.solar}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="solar">☀ Solar Audit</label>
                      </div>
                    </div>
      
                    {validationErrors.auditDomains && 
                      <div className="col-12 text-danger small">{validationErrors.auditDomains}</div>
                    }
                  </div>
      
                  {/* Authorizations Section - Only shows if domains are selected */}
                  {!Object.values(formData.auditDomains).some(v => v) ? (
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="alert alert-info">
                          Please select domains above to see authorization fields.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="row mt-4">
                      <div className="col-12 mb-3">
                        <h5 className="border-bottom pb-2">Domain Authorizations</h5>
                      </div>
                      
                      {/* Fire Safety Authorization */}
                      {formData.auditDomains.fire && (
                        <div className="col-12 mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 text-primary">🔥 Fire Safety Auditor Authorization</h6>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Fire License Number *</label>
                                  <input
                                    type="text"
                                    name="fire_license"
                                    value={formData.fire_license}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter license number"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Issuing Authority</label>
                                  <input
                                    type="text"
                                    name="fire_issuing_authority"
                                    value={formData.fire_issuing_authority}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter issuing authority"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Past Fire Audits Conducted</label>
                                  <input
                                    type="number"
                                    name="fire_audits_count"
                                    value={formData.fire_audits_count}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Number of audits"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Valid From</label>
                                  <input
                                    type="date"
                                    name="fire_valid_from"
                                    value={formData.fire_valid_from}
                                    onChange={handleInputChange}
                                    className="form-control"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Valid To *</label>
                                  <input
                                    type="date"
                                    name="fire_valid_to"
                                    value={formData.fire_valid_to}
                                    onChange={handleInputChange}
                                    className="form-control"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
      
                      {/* STP/Environmental Authorization */}
                      {formData.auditDomains.stp && (
                        <div className="col-12 mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 text-primary">💧 STP / Environmental Authorization</h6>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">MPCB Auditor Registration No. *</label>
                                  <input
                                    type="text"
                                    name="mpcb_reg_no"
                                    value={formData.mpcb_reg_no}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter registration number"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Certificate Validity *</label>
                                  <input
                                    type="date"
                                    name="stp_validity"
                                    value={formData.stp_validity}
                                    onChange={handleInputChange}
                                    className="form-control"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">STP/ETP Audit Experience (Years) *</label>
                                  <input
                                    type="number"
                                    name="stp_experience"
                                    value={formData.stp_experience}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Years of experience"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
      
                      {/* Electrical/CCTV Authorization */}
                      {formData.auditDomains.electrical && (
                        <div className="col-12 mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 text-primary">⚡ Electrical / CCTV Authorization</h6>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Electrical License No. *</label>
                                  <input
                                    type="text"
                                    name="electrical_license"
                                    value={formData.electrical_license}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter license number"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Issuing Authority</label>
                                  <input
                                    type="text"
                                    name="electrical_issuing_authority"
                                    value={formData.electrical_issuing_authority}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter issuing authority"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Valid Period *</label>
                                  <input
                                    type="text"
                                    name="electrical_validity"
                                    value={formData.electrical_validity}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="e.g., 5 years"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
      
                      {/* Solar Authorization */}
                      {formData.auditDomains.solar && (
                        <div className="col-12 mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 text-primary">☀ Solar Auditor Authorization</h6>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Solar Authorization *</label>
                                  <input
                                    type="text"
                                    name="solar_license"
                                    value={formData.solar_license}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter authorization number"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Solar PV Audit Experience (Years)</label>
                                  <input
                                    type="number"
                                    name="solar_experience"
                                    value={formData.solar_experience}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Years of experience"
                                  />
                                </div>
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">DISCOM/MNRE Empanelment</label>
                                  <input
                                    type="text"
                                    name="solar_empanelment"
                                    value={formData.solar_empanelment}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Empanelment details"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        );
      
      case 5: // Documents
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary">
                  <h4 className="mb-0 text-white">Document Upload</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12 mb-4">
                      <h5 className="border-bottom pb-2">Required Documents</h5>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Photo *</label>
                      <input
                        type="file"
                        name="photo"
                        onChange={handleInputChange}
                        className={`form-control ${validationErrors.photo ? "is-invalid" : ""}`}
                        accept="image/*"
                      />
                      {validationErrors.photo && (
                        <div className="invalid-feedback">
                          {validationErrors.photo}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">ID Proof *</label>
                      <input
                        type="file"
                        name="id_proof"
                        onChange={handleInputChange}
                        className={`form-control ${validationErrors.id_proof ? "is-invalid" : ""}`}
                      />
                      {validationErrors.id_proof && (
                        <div className="invalid-feedback">
                          {validationErrors.id_proof}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Police Verification *
                      </label>
                      <input
                        type="file"
                        name="police_verification"
                        onChange={handleInputChange}
                        className={`form-control ${validationErrors.police_verification ? "is-invalid" : ""}`}
                      />
                      {validationErrors.police_verification && (
                        <div className="invalid-feedback">
                          {validationErrors.police_verification}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Medical Fitness Certificate *
                      </label>
                      <input
                        type="file"
                        name="medical_fitness"
                        onChange={handleInputChange}
                        className={`form-control ${validationErrors.medical_fitness ? "is-invalid" : ""}`}
                      />
                      {validationErrors.medical_fitness && (
                        <div className="invalid-feedback">
                          {validationErrors.medical_fitness}
                        </div>
                      )}
                    </div>

                    <div className="col-md-12 mt-4 mb-3">
                      <h5 className="border-bottom pb-2">
                        Domain Certificates
                      </h5>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fire Certificate</label>
                      <input
                        type="file"
                        name="fire_certi"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fire AMC Certificate</label>
                      <input
                        type="file"
                        name="fire_amc"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">STP Certificate</label>
                      <input
                        type="file"
                        name="stp_certi"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Pollution Training Certificate
                      </label>
                      <input
                        type="file"
                        name="pollution_tranee_pro"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">CCTV Certificate</label>
                      <input
                        type="file"
                        name="cctv"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Electrical License</label>
                      <input
                        type="file"
                        name="electric_lic"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">OEM Certificate</label>
                      <input
                        type="file"
                        name="oem_image"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Domain Certificate</label>
                      <input
                        type="file"
                        name="domain_certi"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Registration Certificate *
                      </label>
                      <input
                        type="file"
                        name="electric_lic"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">GST Certificate *</label>
                      <input
                        type="file"
                        name="oem_image"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Bank Proof (Cancelled Cheque/Passbook) *
                      </label>
                      <input
                        type="file"
                        name="domain_certi"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    <div className="card-header bg-primary">
                      <h4 className="mb-0 text-white">Declaration</h4>
                    </div>
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.ppe_declaration ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="ppe_declaration"
                            id="ppe_declaration"
                            checked={formData.ppe_declaration}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="ppe_declaration"
                          >
                            GST Declaration{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I declare that all GST information provided is
                          accurate and up-to-date
                        </p>
                        {validationErrors.ppe_declaration && (
                          <div className="text-danger small mt-1">
                            {validationErrors.ppe_declaration}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.ppe_declaration ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="ppe_declaration"
                            id="ppe_declaration"
                            checked={formData.ppe_declaration}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="ppe_declaration"
                          >
                            MSME Declaration{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I confirm that all MSME information provided is
                          accurate
                        </p>
                        {validationErrors.ppe_declaration && (
                          <div className="text-danger small mt-1">
                            {validationErrors.ppe_declaration}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.ppe_declaration ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="ppe_declaration"
                            id="ppe_declaration"
                            checked={formData.ppe_declaration}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="ppe_declaration"
                          >
                            Quality Assurance Declaration{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I confirm that our services meet all quality standards
                          and specifications
                        </p>
                        {validationErrors.ppe_declaration && (
                          <div className="text-danger small mt-1">
                            {validationErrors.ppe_declaration}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div
                        className={`border rounded p-3 ${validationErrors.ppe_declaration ? "border-danger" : ""}`}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="ppe_declaration"
                            id="ppe_declaration"
                            checked={formData.ppe_declaration}
                            onChange={handleInputChange}
                          />
                          <label
                            className="form-check-label fw-bold"
                            htmlFor="ppe_declaration"
                          >
                            Confidentiality Declaration{" "}
                            <span className="text-danger">*</span>
                          </label>
                        </div>
                        <p className="text-muted small mt-2 mb-0">
                          I agree to maintain confidentiality of all client
                          information and data
                        </p>
                        {validationErrors.ppe_declaration && (
                          <div className="text-danger small mt-1">
                            {validationErrors.ppe_declaration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      
      default:
        return null;
    }
  };

  return (
    <div
      className="technician-onboarding"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        paddingBottom: "80px",
      }}
    >
      {/* Toast Component */}
      {toastRef && <div ref={toastRef} />}

      {/* Header */}
      <div className="bg-primary text-white py-3 mb-4">
        <div className="main-content">
          <h2 className="mb-0">Technician Onboarding</h2>
          <p className="mb-0 opacity-75">
            Complete all 4 steps to register as a technician
          </p>
        </div>
      </div>

      <div className="container-fluid">
        <div className="main-content">
          {/* Progress Steps */}
          {renderProgressSteps()}

          {/* Current Step Content */}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4 pt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || isSubmitting}
                  >
                    ← Previous
                  </button>

                  <div>
                    <span className="text-muted me-3">
                      Step {currentStep} of {totalSteps}
                    </span>

                    {currentStep === totalSteps ? (
                      <button
                        type="submit"
                        className="btn btn-success px-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={() => {
                          if (validateCurrentStep()) {
                            markStepComplete(currentStep);
                            handleNext();
                          } else {
                            showToast(
                              "error",
                              "Please fill all required fields in this step",
                            );
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        Save & Continue →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Help Sidebar */}
      <div
        className="help-sidebar"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 1000,
        }}
      >
        <button
          className="btn btn-info btn-sm text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#helpPanel"
          style={{ width: "120px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
        >
          Need Help?
        </button>

        <div className="collapse" id="helpPanel">
          <div
            className="card mt-2"
            style={{ width: "280px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <div className="card-body">
              <h6>Quick Tips:</h6>
              <ul className="small mb-0">
                <li>All * fields are mandatory</li>
                <li>You can save and continue later</li>
                <li>Complete all 5 steps to submit</li>
                <li>Keep documents ready before upload</li>
                <li>Max file size: 5MB per document</li>
                <li>Safety declarations are legally binding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inner;
