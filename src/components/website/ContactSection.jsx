import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SETTINGS_URL, CONTACT_URL, CATEGORY_URL } from "../../services/endpoints";
import ContactInfo from "../../components/website/ContactInfo";

// ========== API FUNCTIONS ==========
const fetchSettings = async () => {
  const response = await axios.get(SETTINGS_URL);
  return response?.data?.data?.[0] || response?.data?.[0] || response?.data;
};

const fetchCategories = async () => {
  const response = await axios.get(CATEGORY_URL);
  console.log("Categories Response:", response.data);
  
  // Handle different response structures
  if (response?.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  } else if (response?.data && Array.isArray(response.data)) {
    return response.data;
  } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
    return response.data.categories;
  } else if (response?.data?.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return [];
};

const submitContact = async (formData) => {
  const response = await axios.post(CONTACT_URL, formData);
  return response.data;
};

function ContactSection() {
  const queryClient = useQueryClient();
  
  // ========== FORM STATE ==========
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact: "",
    interest_service: "",
    description: "",
  });
  
  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    contact: "",
    interest_service: "",
    description: "",
    general: ""
  });

  // ========== REACT QUERY HOOKS ==========
  
  // Query for Settings
  const { 
    data: settings, 
    isLoading: settingsLoading 
  } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for Categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation for Contact Form
  const contactMutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      // Show success message
      setErrors(prev => ({ 
        ...prev, 
        general: "success✅ Message sent successfully!" 
      }));

      // Reset form
      setFormData({
        full_name: "",
        email: "",
        contact: "",
        interest_service: "",
        description: "",
      });

      // Clear form errors
      setErrors({
        full_name: "",
        email: "",
        contact: "",
        interest_service: "",
        description: "",
        general: "success✅ Message sent successfully!"
      });

      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['contacts'] });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setErrors(prev => ({ ...prev, general: "" }));
      }, 5000);
    },
    onError: (error) => {
      console.error("Submit Error:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: "❌ Something went wrong. Please try again." 
      }));
    },
  });

  // ========== VALIDATION FUNCTIONS ==========
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {
      full_name: "",
      email: "",
      contact: "",
      interest_service: "",
      description: "",
      general: ""
    };
    let isValid = true;

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Mobile number is required";
      isValid = false;
    } else if (!validateMobile(formData.contact)) {
      newErrors.contact = "Mobile number must be exactly 10 digits";
      isValid = false;
    }

    if (!formData.interest_service) {
      newErrors.interest_service = "Please select a service";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ========== EVENT HANDLERS ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "contact") {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorElement = document.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Use React Query mutation
    contactMutation.mutate(formData);
  };

  // ========== HELPER FUNCTIONS ==========
  const getCategoryName = (category) => {
    return category?.name || 
           category?.category_name || 
           category?.title || 
           category?.category || 
           "Unnamed Category";
  };

  const getCategoryId = (category) => {
    return category?.id || 
           category?.category_id || 
           category?.value || 
           category?._id || 
           "";
  };

  // ========== RENDER COMPONENT ==========
  return (
    <section id="contact" className="contact-section section-padding bg-light">
      <div className="container">
        <div className="contact-container">

          {/* ===== LEFT SIDE: CONTACT INFO ===== */}
          <ContactInfo 
            settings={settings} 
            settingsLoading={settingsLoading} 
          />

          {/* ===== RIGHT SIDE: CONTACT FORM ===== */}
          <div className="contact-form-wrapper" id="book-demo">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3>Book a Demo / Contact Us</h3>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.full_name ? "error-input" : ""}
                  required
                />
                {errors.full_name && <span className="field-error">{errors.full_name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={errors.email ? "error-input" : ""}
                    required
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="hint">(10 digits)</span></label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength="10"
                    className={errors.contact ? "error-input" : ""}
                    required
                  />
                  {errors.contact && <span className="field-error">{errors.contact}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Interested Service</label>
                <select
                  name="interest_service"
                  value={formData.interest_service}
                  onChange={handleChange}
                  className={errors.interest_service ? "error-input" : ""}
                  required
                  disabled={categoriesLoading}
                >
                  <option value="" disabled>
                    {categoriesLoading ? "Loading services..." : "Select a Service"}
                  </option>
                  
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      const categoryId = getCategoryId(category);
                      const categoryName = getCategoryName(category);
                      
                      return (
                        <option key={categoryId || categoryName} value={categoryId || categoryName}>
                          {categoryName}
                        </option>
                      );
                    })
                  ) : (
                    !categoriesLoading && (
                      <>
                        <option value="fire">Fire Safety</option>
                        <option value="solar">Solar Systems</option>
                        <option value="water">Water Treatment</option>
                        <option value="cctv">CCTV & Security</option>
                        <option value="demo">General Demo</option>
                      </>
                    )
                  )}
                </select>
                {errors.interest_service && <span className="field-error">{errors.interest_service}</span>}
                {!categoriesLoading && categories.length === 0 && (
                  <span className="field-warning">No services available from API, using default options</span>
                )}
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="How can we help you?"
                  className={errors.description ? "error-input" : ""}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={contactMutation.isPending || categoriesLoading}
              >
                {contactMutation.isPending ? "Sending..." : "Send Request"}
              </button>

              {/* ===== MESSAGES BELOW SUBMIT BUTTON ===== */}
              {errors.general && (
                <div className={`form-message ${errors.general.includes('success') ? 'success' : 'error'}`}>
                  {errors.general}
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ContactSection;