import React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import useApi from "../../../hooks/useCrud";
import api from "../../../services/api"; // for FormData PUT in Step 7

import {
  CATEGORY_URL,
  LOCATION_URL,
  EQUIPMENT_URL,
  ORGANISATION_URL,
  VENDOR_URL,
} from "../../../services/endpoints";

// Step Components
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2DocumentDetails from "./steps/Step2DocumentDetails";
import Step3Services from "./steps/Step3Services";
import Step4TechnicianDetails from "./steps/Step4TechnicianDetails";
import Step5Experience from "./steps/Step5Experience";
import Step6BankingDetails from "./steps/Step6BankingDetails";
import Step7DocumentsUpload from "./steps/Step7DocumentsUpload";

// ─── Initial Form State ────────────────────────────────────────────────────────
const INITIAL_FORM_DATA = {
  // Contact Person Details
  full_name: "",
  email: "",
  mobile: "",
  alternateMobile: "",
  designation: "",
  profileImage: null,
  status: "active",
  username: "",
  password: "",

  // Business Details
  vendorType: "",
  vendorLegalName: "",
  tradeName: "",
  yearOfEstablishment: "",
  gstRegistered: "",

  // Address Details
  registeredOfficeAddress: "",
  branchAddress: "",
  state: "",
  city: "",
  pincode: "",

  // Document Details
  gstin: "",
  panNumber: "",
  cinLlipin: "",
  msmeUdyam: "",
  pfRegistration: "",
  esiRegistration: "",
  labourLicense: "",
  fireLicense: "",
  isoCertification: "",

  // Services
  serviceCategories: { fire: false, stp: false, cctv: false, solar: false },
  natureOfService: {
    installation: false,
    amc: false,
    breakdown: false,
    audit: false,
  },
  oemAuthorization: "",
  // serviceState: "",
  serviceState: [],
  // serviceCity: "",
  serviceCity: [],
  maxSitesPerMonth: "",
  emergencyResponseTime: "",

  // Technician Details
  numberOfTechnicians: "",
  certifiedTechnicians: "",
  certifications: {
    fireLicence: false,
    electricalSupervisor: false,
    stpOperator: false,
    solarInstaller: false,
    cctvTechnician: false,
  },
  tools: {
    multimeter: false,
    thermalCamera: false,
    pressureGauge: false,
    flowMeter: false,
    cableTester: false,
    powerTools: false,
    safetyEquipment: false,
    specializedTest: false,
  },
  certificationDocuments: null,

  // Experience
  yearsOfExperience: "",
  govtPsuExperience: "",
  keyClients: "",
  similarProjects: "",

  // Banking Details
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  cancelledCheque: null,
  paymentCycle: "",

  // Documents Upload
  gstCertificate: null,
  panCard: null,
  incorporationCertificate: null,
  addressProof: null,
  workmenInsurance: null,
  liabilityInsurance: null,
  isoCertificate: null,
  generalInsurance: null,
  vendorAgreement: null,
};

// ─── Step Names ────────────────────────────────────────────────────────────────
const STEP_NAMES = [
  "Basic Info",
  "Documents",
  "Services",
  "Technician",
  "Experience",
  "Banking",
  "Documents Upload",
];
// add here
const TOTAL_STEPS = STEP_NAMES.length;

// ─── Inner Component ───────────────────────────────────────────────────────────
const Inner = () => {
  // const { toastRef, showToast } = useToast();
  const { toastRef, showToast } = useToast();
  const location = useLocation();

  const { get: getCategory } = useApi(CATEGORY_URL);
  const { get: getLocation } = useApi(LOCATION_URL);
  // const { get: getEquipment } = useApi(EQUIPMENT_URL);
  const { get: getOrganisation } = useApi(ORGANISATION_URL);
  const {
    post: postVendor,
    put: putVendor,
    get: getVendor,
    loading: vendorLoading,
  } = useApi(VENDOR_URL);

  // Master data
  const [organisations, setOrganisations] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredServiceCities, setFilteredServiceCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState({});

  // ─── Fetch Master Data ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // hook get() returns axios response.data directly
        // so result shape is: { success, message, data: [...] }  OR  { success, message, data: { data: [...] } }
        const extractList = (res) =>
          Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : Array.isArray(res)
                ? res
                : [];

        const orgResponse = await getOrganisation("");
        setOrganisations(extractList(orgResponse));

        const locResponse = await getLocation("");
        const locationData = extractList(locResponse);
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
        setCities(
          locationData.map((item) => ({
            id: item.id,
            name: item.name,
            state_id: item.parent_id,
            state_name: item.parent_name,
            status: item.status,
          })),
        );

        try {
          const catResponse = await getCategory("");
          // categories available if needed: extractList(catResponse)
        } catch (catError) {
          console.error("Error fetching categories:", catError);
        }
        try {
          const eqResponse = await api.get(EQUIPMENT_URL);
          console.log("equipment:", eqResponse.data);
          setEquipment(eqResponse.data?.data || []);
        } catch (eqError) {
          console.log("Equipment error:", eqError);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        showToast("error", "Failed to load some master data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter cities by address state
  useEffect(() => {
    if (formData.state && cities.length > 0) {
      setFilteredCities(
        cities.filter((c) => String(c.state_id) === String(formData.state)),
      );
    } else {
      setFilteredCities([]);
    }
  }, [formData.state, cities]);

  useEffect(() => {
    if (formData.serviceState?.length > 0 && cities.length > 0) {
      setFilteredServiceCities(
        cities.filter((c) =>
          formData.serviceState.some(
            (sid) => String(c.state_id) === String(sid),
          ),
        ),
      );
    } else {
      setFilteredServiceCities([]);
    }
  }, [formData.serviceState, cities]);

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateCase1 = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (!formData.username) newErrors.username = "Username is required";

    if (!editId) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (!formData.vendorType) newErrors.vendorType = "Vendor type is required";
    if (!formData.vendorLegalName)
      newErrors.vendorLegalName = "Vendor legal name is required";
    if (!formData.yearOfEstablishment) {
      newErrors.yearOfEstablishment = "Year of establishment is required";
    } else if (!/^\d{4}$/.test(formData.yearOfEstablishment)) {
      newErrors.yearOfEstablishment = "Enter a valid year (YYYY)";
    }
    if (!formData.gstRegistered)
      newErrors.gstRegistered = "GST registered status is required";
    if (!formData.registeredOfficeAddress)
      newErrors.registeredOfficeAddress =
        "Registered office address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase2 = () => {
    const newErrors = {};
    if (!formData.gstin) newErrors.gstin = "GSTIN is required";
    if (!formData.panNumber) newErrors.panNumber = "PAN number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase3 = () => {
    const newErrors = {};
    if (!Object.values(formData.serviceCategories).some(Boolean))
      newErrors.serviceCategories = "Select at least one service category";
    if (!Object.values(formData.natureOfService).some(Boolean))
      newErrors.natureOfService = "Select at least one nature of service";
    if (!formData.oemAuthorization)
      newErrors.oemAuthorization = "OEM authorization is required";
    if (!formData.serviceState)
      newErrors.serviceState = "Service state is required";
    if (!formData.serviceCity)
      newErrors.serviceCity = "Service city is required";
    if (!formData.maxSitesPerMonth)
      newErrors.maxSitesPerMonth = "Maximum sites per month is required";
    if (!formData.emergencyResponseTime)
      newErrors.emergencyResponseTime = "Emergency response time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase4 = () => {
    const newErrors = {};
    if (!formData.numberOfTechnicians)
      newErrors.numberOfTechnicians = "Number of technicians is required";
    if (!formData.certifiedTechnicians)
      newErrors.certifiedTechnicians =
        "Number of certified technicians is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase5 = () => {
    const newErrors = {};
    if (!formData.yearsOfExperience)
      newErrors.yearsOfExperience = "Years of experience is required";
    if (!formData.govtPsuExperience)
      newErrors.govtPsuExperience = "Govt/PSU experience is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase6 = () => {
    const newErrors = {};
    if (!formData.accountHolderName)
      newErrors.accountHolderName = "Account holder name is required";
    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.accountNumber)
      newErrors.accountNumber = "Account number is required";
    if (!formData.ifscCode) newErrors.ifscCode = "IFSC code is required";
    if (!formData.cancelledCheque)
      newErrors.cancelledCheque = "Cancelled cheque is required";
    if (!formData.paymentCycle)
      newErrors.paymentCycle = "Payment cycle is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase7 = () => {
    const newErrors = {};
    if (!formData.gstCertificate)
      newErrors.gstCertificate = "GST certificate is required";
    if (!formData.panCard) newErrors.panCard = "PAN card is required";
    if (!formData.vendorAgreement)
      newErrors.vendorAgreement = "Vendor agreement is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Input Handler ────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    // if (type === "file") {
    //   setFormData((prev) => ({ ...prev, [name]: files[0] }));
    // } else if (type === "checkbox" && name.includes(".")) {
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "multiselect") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (type === "checkbox" && name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: checked },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ─── Step Submit Handlers ──────────────────────────────────────────────────────
  // Helper: safe error message from API response
  const getApiError = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

  const submitCase1 = async () => {
    if (!validateCase1()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    try {
      // ── Helper: safely parse int, returns null if empty ──
      const toInt = (val) => {
        const n = parseInt(val, 10);
        return isNaN(n) ? null : n;
      };

      // status in DB is int: 1=active, 0=inactive, 2=pending
      const statusMap = { active: 1, inactive: 0, pending: 2 };

      // const vendorData = {
      //   // ── user table fields ──────────────────────────────
      //   full_name: formData.full_name,
      //   email: formData.email,
      //   password: formData.password,
      //   user_name: formData.username,
      //   contact: formData.mobile,
      //   alt_contact_no: formData.alternateMobile || null,
      //   designation: formData.designation,
      //   user_type: toInt(formData.vendorType),
      //   dep_desig_id: toInt(formData.vendorType),
      //   status: statusMap[formData.status] ?? 1,

      //   // ── vendor table fields ────────────────────────────
      //   trade_name: formData.tradeName || formData.vendorLegalName,
      //   year_estb: toInt(formData.yearOfEstablishment), // int
      //   gst: formData.gstRegistered === "Yes" ? 1 : 0,
      //   regd_office_add: formData.registeredOfficeAddress,
      //   branch_add: formData.branchAddress || formData.registeredOfficeAddress,
      //   state: toInt(formData.state), // int FK
      //   city: toInt(formData.city), // int FK
      //   pin: formData.pincode,
      // };

      const vendorData = new FormData();
      vendorData.append("full_name", formData.full_name);
      vendorData.append("email", formData.email);
      // vendorData.append("password", formData.password);
      if (formData.password && formData.password.trim() !== "") {
        vendorData.append("password", formData.password);
      }
      vendorData.append("user_name", formData.username);
      vendorData.append("contact", formData.mobile);
      vendorData.append("alt_contact_no", formData.alternateMobile || "");
      vendorData.append("designation", formData.designation);
      vendorData.append("user_type", toInt(formData.vendorType));
      vendorData.append("dep_desig_id", toInt(formData.vendorType));
      vendorData.append("status", statusMap[formData.status] ?? 1);
      vendorData.append(
        "trade_name",
        formData.tradeName || formData.vendorLegalName,
      );
      vendorData.append("year_estb", toInt(formData.yearOfEstablishment));
      vendorData.append("gst", formData.gstRegistered === "Yes" ? 1 : 0);
      vendorData.append("regd_office_add", formData.registeredOfficeAddress);
      vendorData.append(
        "branch_add",
        formData.branchAddress || formData.registeredOfficeAddress,
      );
      vendorData.append("state", toInt(formData.state));
      vendorData.append("city", toInt(formData.city));
      vendorData.append("pin", formData.pincode);
      if (formData.profileImage) {
        vendorData.append("profile_image", formData.profileImage);
      }

      // if (editId) {
      //   // ── EDIT MODE: PUT to update existing vendor ───────
      //   await putVendor(`/${editId}`, vendorData);
      //   showToast("success", "Basic information updated successfully!");
      // } else {
      //   // ── CREATE MODE: POST to create new vendor ─────────
      //   const response = await postVendor("", vendorData);

      if (editId) {
        await api.put(`${VENDOR_URL}/${editId}`, vendorData);
        showToast("success", "Basic information updated successfully!");
      } else {
        const response = await api.post(VENDOR_URL, vendorData);

        // hook post() returns axios response.data directly
        // so shape is: { success, message, id? } — NOT wrapped in .data again
        const directId =
          response?.id || response?.vendor_id || response?.data?.id || null;

        if (directId) {
          setEditId(directId);
        } else {
          // Fallback: fetch vendor list and match by email to get the new id
          try {
            // hook get() returns axios response.data directly
            // shape: { success, data: [...] } or { success, data: { data: [...] } }
            const listRes = await getVendor("");
            const list = Array.isArray(listRes?.data)
              ? listRes.data
              : Array.isArray(listRes?.data?.data)
                ? listRes.data.data
                : Array.isArray(listRes)
                  ? listRes
                  : [];
            const matched = list.find((v) => v.email === formData.email);
            if (matched?.id) {
              setEditId(matched.id);
              console.log("✅ New vendor ID set:", matched.id);
            } else {
              console.warn(
                "⚠️ Vendor created but ID not found. Update backend to return id in POST /vendor response.",
              );
            }
          } catch (fetchErr) {
            console.warn(
              "⚠️ Could not fetch vendor list to get new ID:",
              fetchErr,
            );
          }
        }

        showToast(
          "success",
          "Basic information saved! Continue to next steps.",
        );
      }
      return true;
    } catch (error) {
      console.error("❌ submitCase1 error:", error);
      showToast(
        "error",
        getApiError(error, "Failed to save basic information"),
      );
      return false;
    }
  };

  const submitCase2 = async () => {
    if (!validateCase2()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    if (!editId) {
      showToast("error", "Please complete step 1 first");
      return false;
    }
    try {
      // Matches vendor table columns exactly
      await putVendor(`/${editId}`, {
        gstin: formData.gstin,
        pan: formData.panNumber,
        cin: formData.cinLlipin || null,
        msme: formData.msmeUdyam || null,
        pf: formData.pfRegistration || null,
        esi: formData.esiRegistration || null,
        labour_lic: formData.labourLicense || null,
        env_lic: formData.fireLicense || null,
        iso: formData.isoCertification || null,
      });
      showToast("success", "Document details saved successfully!");
      return true;
    } catch (error) {
      showToast("error", getApiError(error, "Failed to save document details"));
      return false;
    }
  };

  const submitCase3 = async () => {
    if (!validateCase3()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    if (!editId) {
      showToast("error", "Please complete step 1 first");
      return false;
    }
    try {
      // category_id → comma-separated string of selected keys
      const categoryIdMap = { fire: 1, stp: 2, cctv: 3, solar: 4 };
      const selectedCategories = Object.entries(formData.serviceCategories)
        .filter(([, v]) => v)
        .map(([k]) => categoryIdMap[k])
        .join(",");

      const natureIdMap = { installation: 1, amc: 2, breakdown: 3, audit: 4 };
      const selectedNature = Object.entries(formData.natureOfService)
        .filter(([, v]) => v)
        .map(([k]) => natureIdMap[k])
        .join(",");

      await putVendor(`/${editId}`, {
        category_id: selectedCategories,
        nature_service: selectedNature,
        oem: formData.oemAuthorization === "Yes" ? 1 : 0,
        service_co_area: formData.serviceCity || null,
        max_site: formData.maxSitesPerMonth || null,
        emergency_res_time: formData.emergencyResponseTime || null,
      });
      showToast("success", "Services details saved successfully!");
      return true;
    } catch (error) {
      showToast("error", getApiError(error, "Failed to save services details"));
      return false;
    }
  };

  const submitCase4 = async () => {
    if (!validateCase4()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    if (!editId) {
      showToast("error", "Please complete step 1 first");
      return false;
    }
    try {
      const selectedCerts = Object.entries(formData.certifications)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(",");

      const selectedTools = Object.entries(formData.tools)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(",");

      await putVendor(`/${editId}`, {
        no_technician: formData.numberOfTechnicians || null,
        certi_technician: formData.certifiedTechnicians || null,
        certi_details: selectedCerts || null,
        tool_equipment: selectedTools || null,
      });
      showToast("success", "Technician details saved successfully!");
      return true;
    } catch (error) {
      showToast(
        "error",
        getApiError(error, "Failed to save technician details"),
      );
      return false;
    }
  };

  const submitCase5 = async () => {
    if (!validateCase5()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    if (!editId) {
      showToast("error", "Please complete step 1 first");
      return false;
    }
    try {
      await putVendor(`/${editId}`, {
        years_exp: formData.yearsOfExperience || null,
        gov_exp: formData.govtPsuExperience === "Yes" ? 1 : 0,
        key_client: formData.keyClients || null,
        similar_pro_details: formData.similarProjects || null,
      });
      showToast("success", "Experience details saved successfully!");
      return true;
    } catch (error) {
      showToast(
        "error",
        getApiError(error, "Failed to save experience details"),
      );
      return false;
    }
  };

  const submitCase6 = async () => {
    if (!validateCase6()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    if (!editId) {
      showToast("error", "Please complete step 1 first");
      return false;
    }
    try {
      await putVendor(`/${editId}`, {
        account_holder: formData.accountHolderName,
        bank_name: formData.bankName,
        acc_no: formData.accountNumber,
        ifsc_code: formData.ifscCode,
        payment_cycle: formData.paymentCycle,
      });
      showToast("success", "Banking details saved successfully!");
      return true;
    } catch (error) {
      showToast("error", error.message || "Failed to save banking details");
      return false;
    }
  };

  const submitCase7 = async () => {
    if (!validateCase7()) {
      showToast("error", "Please upload all required documents");
      return false;
    }
    if (!editId) {
      showToast("error", "Please complete step 1 first");
      return false;
    }
    try {
      // Files must be sent as multipart/form-data
      // Backend expects these exact field names for req.files
      const fileData = new FormData();
      if (formData.gstCertificate)
        fileData.append("gst_certi", formData.gstCertificate);
      if (formData.panCard) fileData.append("pan_card", formData.panCard);
      if (formData.incorporationCertificate)
        fileData.append("company_inn_certi", formData.incorporationCertificate);
      if (formData.addressProof)
        fileData.append("address_prof", formData.addressProof);
      if (formData.workmenInsurance)
        fileData.append("workmen_insurance", formData.workmenInsurance);
      if (formData.liabilityInsurance)
        fileData.append("public_insurance", formData.liabilityInsurance);
      if (formData.isoCertificate)
        fileData.append("iso_certi", formData.isoCertificate);
      if (formData.generalInsurance)
        fileData.append("insurance_policy", formData.generalInsurance);
      if (formData.vendorAgreement)
        fileData.append("vendor_agreement", formData.vendorAgreement);
      if (formData.cancelledCheque)
        fileData.append("cancelled_cheque", formData.cancelledCheque);
      if (formData.certificationDocuments)
        fileData.append("Certi_doc", formData.certificationDocuments);

      // Use static api import — axios auto-sets multipart boundary when data is FormData
      await api.put(`${VENDOR_URL}/${editId}`, fileData);
      showToast("success", "Application submitted successfully!");
      return true;
    } catch (error) {
      showToast("error", getApiError(error, "Failed to submit application"));
      return false;
    }
  };

  const STEP_SUBMITTERS = [
    submitCase1,
    submitCase2,
    submitCase3,
    submitCase4,
    submitCase5,
    submitCase6,
    submitCase7,
  ];

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const handleNext = async () => {
    const submit = STEP_SUBMITTERS[currentStep - 1];
    const success = submit ? await submit() : true;
    if (success) {
      setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep || completedSteps[step]) setCurrentStep(step);
  };

  // ─── Edit / Reset ──────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    // row is the joined user+vendor record — DB column names used directly
    setFormData({
      // ── user table ───────────────────────────────────────
      full_name: row.full_name || "",
      email: row.email || "",
      mobile: row.contact || "",
      alternateMobile: row.alt_contact_no || "",
      designation: row.designation || "",
      profileImage: null,
      status: row.status || "active",
      username: row.user_name || "",
      password: "",

      // ── vendor table ─────────────────────────────────────
      vendorType: row.user_type || row.dep_desig_id || "",
      vendorLegalName: row.trade_name || "",
      tradeName: row.trade_name || "",
      yearOfEstablishment: row.year_estb || "",
      gstRegistered: row.gst == 1 ? "Yes" : "No",
      registeredOfficeAddress: row.regd_office_add || "",
      branchAddress: row.branch_add || "",
      state: row.state || "",
      city: row.city || "",
      pincode: row.pin || "",

      // Step 2
      gstin: row.gstin || "",
      panNumber: row.pan || "",
      cinLlipin: row.cin || "",
      msmeUdyam: row.msme || "",
      pfRegistration: row.pf || "",
      esiRegistration: row.esi || "",
      labourLicense: row.labour_lic || "",
      fireLicense: row.env_lic || "",
      isoCertification: row.iso || "",

      // Step 3
      serviceCategories: INITIAL_FORM_DATA.serviceCategories,
      natureOfService: INITIAL_FORM_DATA.natureOfService,
      oemAuthorization: row.oem == 1 ? "Yes" : "No",
      // serviceState: "",
      serviceState: [],
      // serviceCity: row.service_co_area || "",
      serviceCity: [],
      maxSitesPerMonth: row.max_site || "",
      emergencyResponseTime: row.emergency_res_time || "",

      // Step 4
      numberOfTechnicians: row.no_technician || "",
      certifiedTechnicians: row.certi_technician || "",
      certifications: INITIAL_FORM_DATA.certifications,
      tools: INITIAL_FORM_DATA.tools,
      certificationDocuments: null,

      // Step 5
      yearsOfExperience: row.years_exp || "",
      govtPsuExperience: row.gov_exp == 1 ? "Yes" : "No",
      keyClients: row.key_client || "",
      similarProjects: row.similar_pro_details || "",

      // Step 6
      accountHolderName: row.account_holder || "",
      bankName: row.bank_name || "",
      accountNumber: row.acc_no || "",
      ifscCode: row.ifsc_code || "",
      cancelledCheque: null,
      paymentCycle: row.payment_cycle || "",

      // Step 7 — files always null on edit
      gstCertificate: null,
      panCard: null,
      incorporationCertificate: null,
      addressProof: null,
      workmenInsurance: null,
      liabilityInsurance: null,
      isoCertificate: null,
      generalInsurance: null,
      vendorAgreement: null,
    });
    setEditId(row.id);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditId(null);
    setCurrentStep(1);
    setCompletedSteps({});
    setErrors({});
  };
  useEffect(() => {
    if (location.state?.editVendor) {
      handleEdit(location.state.editVendor);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getErrorClass = (fieldName) => (errors[fieldName] ? "is-invalid" : "");

  const renderError = (fieldName) =>
    errors[fieldName] ? (
      <div className="invalid-feedback">{errors[fieldName]}</div>
    ) : null;

  // Props shared by every step
  const sharedStepProps = {
    formData,
    errors,
    vendorLoading,
    handleInputChange,
    getErrorClass,
    renderError,
  };

  // ─── Progress Bar ──────────────────────────────────────────────────────────────
  const renderProgressSteps = () => (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
          <h4 className="mb-sm-0">
            {editId ? "Edit Vendor" : "Vendor Registration"}
          </h4>
          <div className="page-title-right">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <span>Home</span>
              </li>
              <li className="breadcrumb-item active">Vendor Management</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="col-12 mt-3">
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
            {STEP_NAMES.map((stepName, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = completedSteps[stepNumber];
              const isClickable = stepNumber <= currentStep || isCompleted;

              return (
                <React.Fragment key={stepName}>
                  {index > 0 && (
                    <div
                      className="flex-grow-1 mx-2"
                      style={{ height: "2px", backgroundColor: "#dee2e6" }}
                    />
                  )}
                  <div
                    className="d-flex flex-column align-items-center"
                    style={{
                      cursor: isClickable ? "pointer" : "default",
                      flex: 1,
                    }}
                    onClick={() => isClickable && handleStepClick(stepNumber)}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
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
                      className="text-center"
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
    </div>
  );

  // ─── Step Renderer ────────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            {...sharedStepProps}
            loading={loading}
            organisations={organisations}
            states={states}
            filteredCities={filteredCities}
            handleReset={handleReset}
          />
        );
      case 2:
        return <Step2DocumentDetails {...sharedStepProps} />;
      case 3:
        return (
          <Step3Services
            {...sharedStepProps}
            loading={loading}
            states={states}
            filteredServiceCities={filteredServiceCities}
          />
        );
      case 4:
        return (
          <Step4TechnicianDetails {...sharedStepProps} equipment={equipment} />
        );
      case 5:
        return <Step5Experience {...sharedStepProps} />;
      case 6:
        return <Step6BankingDetails {...sharedStepProps} />;
      case 7:
        return <Step7DocumentsUpload {...sharedStepProps} />;
      default:
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <h4>Select a step to continue</h4>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          {/* Toast */}
          <div
            className="toast-container position-fixed top-0 end-0 p-3"
            style={{ zIndex: 9999 }}
          >
            <div
              ref={toastRef}
              className="toast align-items-center text-bg-success border-0"
              role="alert"
            >
              <div className="d-flex">
                <div className="toast-body">Message</div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  data-bs-dismiss="toast"
                />
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {renderProgressSteps()}

          <div className="row">
            {/* Form */}
            <div className="col-12">
              {renderStepContent()}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-4 pt-3 mb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || vendorLoading}
                >
                  ← Previous
                </button>

                <div>
                  <span className="text-muted me-3">
                    Step {currentStep} of {TOTAL_STEPS}
                  </span>

                  {currentStep === TOTAL_STEPS ? (
                    <button
                      type="button"
                      className="btn btn-success px-4"
                      onClick={handleNext}
                      disabled={vendorLoading}
                    >
                      {vendorLoading
                        ? "Submitting..."
                        : editId
                          ? "Update Application"
                          : "Submit Application"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={handleNext}
                      disabled={vendorLoading}
                    >
                      {vendorLoading ? "Saving..." : "Save & Continue →"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inner;
