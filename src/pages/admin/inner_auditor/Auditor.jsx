import React from "react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import useApi from "../../../hooks/useCrud";
import api from "../../../services/api"; // for FormData PUT (Step 5)

import {
  AUDITOR_URL,
  CATEGORY_URL,
  LOCATION_URL,
  ORGANISATION_URL,
} from "../../../services/endpoints";

// Step Components
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2DocumentDetails from "./steps/Step2documentdetails";
import Step3Domains from "./steps/Step3Domains";
import Step4Qualification from "./steps/Step4Qualification";

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

  // Auditor Business Details
  auditorType: "",
  auditorLegalName: "",
  tradeName: "",
  yearOfEstablishment: "",
  gstRegistered: "",

  // Address Details
  registeredOfficeAddress: "",
  branchAddress: "",
  state: "",
  city: "",
  pincode: "",

  // Step 2 — Document Details
  gstin: "",
  panNumber: "",
  cinLlipin: "",
  msmeUdyam: "",
  pfRegistration: "",
  esiRegistration: "",
  labourLicense: "",
  fireLicense: "",
  isoCertification: "",

  // Step 3 — Domains
  auditDomains: {
    fire: false,
    stp: false,
    electrical: false,
    solar: false,
  },

  // Domain authorization details
  // Fire
  fire_certi_no: "",
  fire_issuing_authority: "",
  fire_past_audits: "",
  fire_valid_from: "",
  fire_valid_to: "",
  // STP
  stp_certi_no: "",
  stp_issuing_authority: "",
  stp_valid_from: "",
  stp_valid_to: "",
  stp_experience: "",
  // Electrical
  electrical_certi_no: "",
  electrical_issuing_authority: "",
  electrical_valid_from: "",
  electrical_valid_to: "",
  // Solar
  solar_certi_no: "",
  solar_issuing_authority: "",
  solar_valid_from: "",
  solar_valid_to: "",
  solar_experience: "",
  solar_empanelment: "",

  // Service Geography
  serviceState: [],
  serviceCity: [],
  audit_type: "",
  max_audit_per_month: "",

  // Step 4 — Qualifications
  qualification: "",
  experience: "",
  sector: "",
  gov_audit_exp: "",
  mandatory_checkbox: "",

  // Step 5 — File Uploads
  pan_image: null,
  id_proof_img: null,
  photo: null,
  sample_audit_report: null,
  iso_audit_certi: null,
  police_verification: null,
  state_license: null,
  // Per-domain cert images
  certi_img_fire: null,
  certi_img_stp: null,
  certi_img_electrical: null,
  certi_img_solar: null,
};

// Domain → category_id mapping (adjust to match your DB)
const DOMAIN_CATEGORY_MAP = {
  fire: 1,
  stp: 2,
  electrical: 3,
  solar: 4,
};

// ─── Step Names ────────────────────────────────────────────────────────────────
const STEP_NAMES = [
  "Basic Info",
  "Document Details",
  "Domains",
  "Qualifications",
  "Documents Upload",
];

const TOTAL_STEPS = STEP_NAMES.length;

// ─── Inner Component ───────────────────────────────────────────────────────────
const Inner = () => {
  const { toastRef, showToast } = useToast();
  const location = useLocation();

  const { get: getCategory } = useApi(CATEGORY_URL);
  const { get: getLocation } = useApi(LOCATION_URL);
  const { get: getOrganisation } = useApi(ORGANISATION_URL);
  const {
    get: getAuditor,
    loading: auditorLoading,
  } = useApi(AUDITOR_URL);

  // Master data
  const [organisations, setOrganisations] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredServiceCities, setFilteredServiceCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null); // stores user_id after Step 1
  const editIdRef = useRef(null); // sync ref to avoid async state issues
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Fetch Master Data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
          setCategories(extractList(catResponse));
        } catch (catError) {
          console.error("Error fetching categories:", catError);
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

  // Filter service cities by service state
  useEffect(() => {
    if (formData.serviceState?.length > 0 && cities.length > 0) {
      setFilteredServiceCities(
        cities.filter((c) =>
          formData.serviceState.some((sid) => String(c.state_id) === String(sid))
        ),
      );
    } else {
      setFilteredServiceCities([]);
    }
  }, [formData.serviceState, cities]);

  // ─── Validation ─────────────────────────────────────────────────────────────
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
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (!formData.username) newErrors.username = "Username is required";

    if (!editId) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (!formData.auditorType) newErrors.auditorType = "Auditor type is required";
    if (!formData.auditorLegalName) newErrors.auditorLegalName = "Legal name is required";
    if (!formData.yearOfEstablishment) {
      newErrors.yearOfEstablishment = "Year of establishment is required";
    } else if (!/^\d{4}$/.test(formData.yearOfEstablishment)) {
      newErrors.yearOfEstablishment = "Enter a valid year (YYYY)";
    }
    if (!formData.gstRegistered) newErrors.gstRegistered = "GST registered status is required";
    if (!formData.registeredOfficeAddress) newErrors.registeredOfficeAddress = "Registered office address is required";
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
    if (!Object.values(formData.auditDomains).some(Boolean))
      newErrors.auditDomains = "Select at least one audit domain";
    if (!formData.serviceState?.length) newErrors.serviceState = "Service state is required";
    if (!formData.serviceCity?.length) newErrors.serviceCity = "Service city is required";
    if (!formData.audit_type) newErrors.audit_type = "Audit type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase4 = () => {
    const newErrors = {};
    if (!formData.qualification) newErrors.qualification = "Qualification is required";
    if (!formData.experience) newErrors.experience = "Experience is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCase5 = () => {
    const newErrors = {};
    if (!formData.pan_image) newErrors.pan_image = "PAN image is required";
    if (!formData.id_proof_img) newErrors.id_proof_img = "ID proof is required";
    if (!formData.photo) newErrors.photo = "Photograph is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Input Handler ───────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
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

  // ─── Multi Select Handler ───────────────────────────────────────────────────
  const handleMultiSelectChange = (e, name, directValue) => {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (directValue !== undefined) {
      // Called from badge remove button
      setFormData((prev) => ({ ...prev, [name]: directValue }));
      return;
    }
    const selected = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => o.value);
    setFormData((prev) => ({ ...prev, [name]: selected }));
  };

  // ─── API Error Helper ────────────────────────────────────────────────────────
  const getApiError = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

  // ─── Step Submit Handlers ────────────────────────────────────────────────────

  // Step 1 — Basic Info + Profile Image → POST (create) or PUT (update)
  const submitCase1 = async () => {
    if (!validateCase1()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    try {
      const toInt = (val) => { const n = parseInt(val, 10); return isNaN(n) ? null : n; };
      const statusMap = { active: 1, inactive: 0, pending: 2 };

      const auditorData = new FormData();
      auditorData.append("full_name", formData.full_name);
      auditorData.append("email", formData.email);
      if (formData.password && formData.password.trim() !== "") {
        auditorData.append("password", formData.password);
      }
      auditorData.append("user_name", formData.username);
      auditorData.append("contact", formData.mobile);
      auditorData.append("alt_contact_no", formData.alternateMobile || "");
      auditorData.append("designation", formData.designation);
      auditorData.append("user_type", toInt(formData.auditorType));
      auditorData.append("auditor_type_id", toInt(formData.auditorType));
      auditorData.append("dep_desig_id", toInt(formData.auditorType));
      auditorData.append("status", statusMap[formData.status] ?? 1);
      auditorData.append("legal_name", formData.auditorLegalName);
      auditorData.append("trade_name", formData.tradeName || formData.auditorLegalName);
      auditorData.append("year_estb", toInt(formData.yearOfEstablishment));
      auditorData.append("gst", formData.gstRegistered === "Yes" ? 1 : 0);
      auditorData.append("regd_office_add", formData.registeredOfficeAddress);
      auditorData.append("branch_add", formData.branchAddress || formData.registeredOfficeAddress);
      auditorData.append("state_id", toInt(formData.state));
      auditorData.append("city_id", toInt(formData.city));
      auditorData.append("pin", formData.pincode);
      if (formData.profileImage) {
        auditorData.append("profile_image", formData.profileImage);
      }

      if (editIdRef.current || editId) {
        // PUT /api/auditor/:user_id
        await api.put(`${AUDITOR_URL}/${editIdRef.current || editId}`, auditorData);
        showToast("success", "Basic information updated successfully!");
      } else {
        // POST /api/auditor  → returns { success, id: auditor_id, user_id }
        const response = await api.post(AUDITOR_URL, auditorData);
        const newUserId =
          response?.data?.user_id ||
          response?.data?.id ||
          response?.user_id ||
          null;

        if (newUserId) {
          setEditId(newUserId);
          editIdRef.current = newUserId;
        } else {
          // Fallback: match by email from list
          try {
            const listRes = await getAuditor("");
            const list = Array.isArray(listRes?.data)
              ? listRes.data
              : Array.isArray(listRes?.data?.data)
                ? listRes.data.data
                : [];
            const matched = list.find((a) => a.email === formData.email);
            if (matched?.user_id) { setEditId(matched.user_id); editIdRef.current = matched.user_id; }
          } catch (fetchErr) {
            console.warn("Could not fetch auditor list to get new ID:", fetchErr);
          }
        }
        showToast("success", "Basic information saved! Continue to next steps.");
      }
      return true;
    } catch (error) {
      console.error("submitCase1 error:", error);
      showToast("error", getApiError(error, "Failed to save basic information"));
      return false;
    }
  };

  // Step 2 — Document Details → PUT /:user_id
  const submitCase2 = async () => {
    if (!validateCase2()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    const currentId = editIdRef.current || editId;
    if (!currentId) { showToast("error", "Please complete step 1 first"); return false; }
    try {
      await api.put(`${AUDITOR_URL}/${currentId}`, {
        gstin: formData.gstin,
        pan_no: formData.panNumber,
        cin: formData.cinLlipin || null,
        msme: formData.msmeUdyam || null,
        pf: formData.pfRegistration || null,
        esi: formData.esiRegistration || null,
        labour_lic: formData.labourLicense || null,
        fire_lic: formData.fireLicense || null,
        iso: formData.isoCertification || null,
      });
      showToast("success", "Document details saved successfully!");
      return true;
    } catch (error) {
      showToast("error", getApiError(error, "Failed to save document details"));
      return false;
    }
  };

  // Step 3 — Domains + Authorizations + Service Geography → PUT /:user_id
  // domain_authorizations sent as JSON string per backend controller
  const submitCase3 = async () => {
    if (!validateCase3()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    const currentId = editIdRef.current || editId;
    if (!currentId) { showToast("error", "Please complete step 1 first"); return false; }
    try {
      const toInt = (val) => { const n = parseInt(val, 10); return isNaN(n) ? null : n; };

      // Build domain_authorizations array for selected domains
      const domainAuthList = [];
      if (formData.auditDomains.fire) {
        domainAuthList.push({
          category_id: DOMAIN_CATEGORY_MAP.fire,
          certi_no: formData.fire_certi_no || null,
          issuing_authority: formData.fire_issuing_authority || null,
          validate_form: formData.fire_valid_from || null,
          validate_to: formData.fire_valid_to || null,
          past_audits: toInt(formData.fire_past_audits),
          experience_years: null,
          empanelment_details: null,
          approval_empln_no: null,
        });
      }
      if (formData.auditDomains.stp) {
        domainAuthList.push({
          category_id: DOMAIN_CATEGORY_MAP.stp,
          certi_no: formData.stp_certi_no || null,
          issuing_authority: formData.stp_issuing_authority || null,
          validate_form: formData.stp_valid_from || null,
          validate_to: formData.stp_valid_to || null,
          past_audits: null,
          experience_years: toInt(formData.stp_experience),
          empanelment_details: null,
          approval_empln_no: null,
        });
      }
      if (formData.auditDomains.electrical) {
        domainAuthList.push({
          category_id: DOMAIN_CATEGORY_MAP.electrical,
          certi_no: formData.electrical_certi_no || null,
          issuing_authority: formData.electrical_issuing_authority || null,
          validate_form: formData.electrical_valid_from || null,
          validate_to: formData.electrical_valid_to || null,
          past_audits: null,
          experience_years: null,
          empanelment_details: null,
          approval_empln_no: null,
        });
      }
      if (formData.auditDomains.solar) {
        domainAuthList.push({
          category_id: DOMAIN_CATEGORY_MAP.solar,
          certi_no: formData.solar_certi_no || null,
          issuing_authority: formData.solar_issuing_authority || null,
          validate_form: formData.solar_valid_from || null,
          validate_to: formData.solar_valid_to || null,
          past_audits: null,
          experience_years: toInt(formData.solar_experience),
          empanelment_details: formData.solar_empanelment || null,
          approval_empln_no: null,
        });
      }

      // Must use FormData because cert images are also handled per domain
      const step3Data = new FormData();
      step3Data.append("select_domain", Object.entries(formData.auditDomains)
        .filter(([, v]) => v)
        .map(([k]) => DOMAIN_CATEGORY_MAP[k])
        .join(","));
      step3Data.append("domain_authorizations", JSON.stringify(domainAuthList));
      step3Data.append("service_state", Array.isArray(formData.serviceState) ? formData.serviceState.join(",") : formData.serviceState || "");
      step3Data.append("service_city", Array.isArray(formData.serviceCity) ? formData.serviceCity.join(",") : formData.serviceCity || "");
      step3Data.append("max_audit_per_month", toInt(formData.max_audit_per_month) ?? "");
      step3Data.append("audit_type", formData.audit_type || "");

      // Append per-domain cert images if selected
      if (formData.certi_img_fire)
        step3Data.append(`certi_img_${DOMAIN_CATEGORY_MAP.fire}`, formData.certi_img_fire);
      if (formData.certi_img_stp)
        step3Data.append(`certi_img_${DOMAIN_CATEGORY_MAP.stp}`, formData.certi_img_stp);
      if (formData.certi_img_electrical)
        step3Data.append(`certi_img_${DOMAIN_CATEGORY_MAP.electrical}`, formData.certi_img_electrical);
      if (formData.certi_img_solar)
        step3Data.append(`certi_img_${DOMAIN_CATEGORY_MAP.solar}`, formData.certi_img_solar);

      await api.put(`${AUDITOR_URL}/${currentId}`, step3Data);
      showToast("success", "Domains & authorizations saved successfully!");
      return true;
    } catch (error) {
      showToast("error", getApiError(error, "Failed to save domain details"));
      return false;
    }
  };

  // Step 4 — Qualifications → PUT /:user_id
  const submitCase4 = async () => {
    if (!validateCase4()) {
      showToast("error", "Please fill all required fields correctly");
      return false;
    }
    const currentId = editIdRef.current || editId;
    if (!currentId) { showToast("error", "Please complete step 1 first"); return false; }
    try {
      const toInt = (val) => { const n = parseInt(val, 10); return isNaN(n) ? null : n; };
      await api.put(`${AUDITOR_URL}/${currentId}`, {
        qualification: formData.qualification || null,
        experience: toInt(formData.experience),
        sector: toInt(formData.sector),
        gov_audit_exp: toInt(formData.gov_audit_exp),
        mandatory_checkbox: toInt(formData.mandatory_checkbox),
      });
      showToast("success", "Qualifications saved successfully!");
      return true;
    } catch (error) {
      showToast("error", getApiError(error, "Failed to save qualifications"));
      return false;
    }
  };

  // Step 5 — File Uploads → PUT /:user_id (multipart)
  const submitCase5 = async () => {
    if (!validateCase5()) {
      showToast("error", "Please upload all required documents");
      return false;
    }
    const currentId = editIdRef.current || editId;
    if (!currentId) { showToast("error", "Please complete step 1 first"); return false; }
    try {
      const fileData = new FormData();
      if (formData.pan_image)           fileData.append("pan_image", formData.pan_image);
      if (formData.id_proof_img)        fileData.append("id_proof_img", formData.id_proof_img);
      if (formData.photo)               fileData.append("photo", formData.photo);
      if (formData.sample_audit_report) fileData.append("sample_audit_report", formData.sample_audit_report);
      if (formData.iso_audit_certi)     fileData.append("iso_audit_certi", formData.iso_audit_certi);
      if (formData.police_verification) fileData.append("police_verification", formData.police_verification);
      if (formData.state_license)       fileData.append("state_license", formData.state_license);

      await api.put(`${AUDITOR_URL}/${currentId}`, fileData);
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
  ];

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
    const submit = STEP_SUBMITTERS[currentStep - 1];
    const success = submit ? await submit() : true;
    if (success) {
      setCompletedSteps((prev) => ({ ...prev, [currentStep]: true }));
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    } finally {
      setIsSubmitting(false);
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

  // ─── Edit / Reset ─────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setFormData({
      // user table
      full_name: row.full_name || "",
      email: row.email || "",
      mobile: row.contact || "",
      alternateMobile: row.alt_contact_no || "",
      designation: row.designation || "",
      profileImage: null,
      status: row.status === 1 ? "active" : row.status === 0 ? "inactive" : "pending",
      username: row.user_name || "",
      password: "",

      // auditor table
      auditorType: row.auditor_type_id || "",
      auditorLegalName: row.legal_name || "",
      tradeName: row.trade_name || "",
      yearOfEstablishment: row.year_estb || "",
      gstRegistered: row.gst == 1 ? "Yes" : "No",
      registeredOfficeAddress: row.regd_office_add || "",
      branchAddress: row.branch_add || "",
      state: row.state_id || "",
      city: row.city_id || "",
      pincode: row.pin || "",

      // Step 2
      gstin: row.gstin || "",
      panNumber: row.pan_no || "",
      cinLlipin: row.cin || "",
      msmeUdyam: row.msme || "",
      pfRegistration: row.pf || "",
      esiRegistration: row.esi || "",
      labourLicense: row.labour_lic || "",
      fireLicense: row.fire_lic || "",
      isoCertification: row.iso || "",

      // Step 3 — reset domains & auth (files always null on edit)
      auditDomains: INITIAL_FORM_DATA.auditDomains,
      fire_certi_no: "", fire_issuing_authority: "", fire_past_audits: "",
      fire_valid_from: "", fire_valid_to: "",
      stp_certi_no: "", stp_issuing_authority: "", stp_valid_from: "",
      stp_valid_to: "", stp_experience: "",
      electrical_certi_no: "", electrical_issuing_authority: "",
      electrical_valid_from: "", electrical_valid_to: "",
      solar_certi_no: "", solar_issuing_authority: "", solar_valid_from: "",
      solar_valid_to: "", solar_experience: "", solar_empanelment: "",
      serviceState: row.service_state ? row.service_state.toString().split(",") : [],
      serviceCity: row.service_city ? row.service_city.toString().split(",") : [],
      audit_type: row.audit_type || "",
      max_audit_per_month: row.max_audit_per_month || "",

      // Step 4
      qualification: row.qualification || "",
      experience: row.experience || "",
      sector: row.sector || "",
      gov_audit_exp: row.gov_audit_exp || "",
      mandatory_checkbox: row.mandatory_checkbox || "",

      // Step 5 — always null on edit
      pan_image: null, id_proof_img: null, photo: null,
      sample_audit_report: null, iso_audit_certi: null,
      police_verification: null, state_license: null,
      certi_img_fire: null, certi_img_stp: null,
      certi_img_electrical: null, certi_img_solar: null,
    });
    setEditId(row.user_id);
    editIdRef.current = row.user_id;
    setCurrentStep(1);
    setCompletedSteps({});
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditId(null);
    editIdRef.current = null;
    setCurrentStep(1);
    setCompletedSteps({});
    setErrors({});
  };

  useEffect(() => {
    if (location.state?.editAuditor) {
      handleEdit(location.state.editAuditor);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getErrorClass = (fieldName) => (errors[fieldName] ? "is-invalid" : "");
  const renderError = (fieldName) =>
    errors[fieldName] ? (
      <div className="invalid-feedback">{errors[fieldName]}</div>
    ) : null;

  const sharedStepProps = {
    formData,
    errors,
    auditorLoading,
    handleInputChange,
    handleMultiSelectChange,
    getErrorClass,
    renderError,
  };

  // ─── Progress Bar ─────────────────────────────────────────────────────────────
  const renderProgressSteps = () => (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
          <h4 className="mb-sm-0">
            {editId ? "Edit Auditor" : "Auditor Registration"}
          </h4>
          <div className="page-title-right">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><span>Home</span></li>
              <li className="breadcrumb-item active">Auditor Management</li>
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
            style={{ minWidth: "700px" }}
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
                    style={{ cursor: isClickable ? "pointer" : "default", flex: 1 }}
                    onClick={() => isClickable && handleStepClick(stepNumber)}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: isCompleted ? "#198754" : isActive ? "#0d6efd" : "#e9ecef",
                        color: isActive || isCompleted ? "white" : "#6c757d",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        transition: "all 0.3s ease",
                        transform: isActive ? "scale(1.1)" : "none",
                        boxShadow: isActive ? "0 4px 8px rgba(13, 110, 253, 0.3)" : "none",
                      }}
                    >
                      {isCompleted ? "✓" : stepNumber}
                    </div>
                    <div
                      className="text-center"
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: isActive ? "600" : "500",
                        color: isActive ? "#0d6efd" : isCompleted ? "#198754" : "#6c757d",
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
            editId={editId}
          />
        );
      case 2:
        return <Step2DocumentDetails {...sharedStepProps} />;
      case 3:
        return (
          <Step3Domains
            {...sharedStepProps}
            loading={loading}
            states={states}
            filteredServiceCities={filteredServiceCities}
          />
        );
      case 4:
        return (
          <Step4Qualification
            {...sharedStepProps}
            categories={categories}
          />
        );
      case 5:
        return (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">Documents Upload</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">PAN Image *</label>
                      <input type="file" name="pan_image" onChange={handleInputChange} className={`form-control ${getErrorClass("pan_image")}`} accept="image/*,.pdf" />
                      {renderError("pan_image")}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ID Proof *</label>
                      <input type="file" name="id_proof_img" onChange={handleInputChange} className={`form-control ${getErrorClass("id_proof_img")}`} accept="image/*,.pdf" />
                      {renderError("id_proof_img")}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Photograph *</label>
                      <input type="file" name="photo" onChange={handleInputChange} className={`form-control ${getErrorClass("photo")}`} accept="image/*" />
                      {renderError("photo")}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Sample Audit Report</label>
                      <input type="file" name="sample_audit_report" onChange={handleInputChange} className="form-control" accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ISO Audit Certificate</label>
                      <input type="file" name="iso_audit_certi" onChange={handleInputChange} className="form-control" accept="image/*,.pdf" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Police Verification</label>
                      <input type="file" name="police_verification" onChange={handleInputChange} className="form-control" accept="image/*,.pdf" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">State License</label>
                      <input type="file" name="state_license" onChange={handleInputChange} className="form-control" accept="image/*,.pdf" />
                    </div>
                    <div className="col-12 mt-3">
                      <div className="alert alert-info">
                        <strong>Document Guidelines:</strong> PDF/JPEG/PNG format only. Max 5MB per file.
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

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          {/* Toast */}
          <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
            <div
              ref={toastRef}
              className="toast align-items-center text-bg-success border-0"
              role="alert"
            >
              <div className="d-flex">
                <div className="toast-body">Message</div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" />
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {renderProgressSteps()}

          <div className="row">
            <div className="col-12">
              {renderStepContent()}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-4 pt-3 mb-4">
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
                    Step {currentStep} of {TOTAL_STEPS}
                  </span>

                  {currentStep === TOTAL_STEPS ? (
                    <button
                      type="button"
                      className="btn btn-success px-4"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save & Continue →"}
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