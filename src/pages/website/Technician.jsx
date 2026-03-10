import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TECH_URL, CATEGORY_URL } from "../../services/endpoints";

const TechnicianPage = () => {
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    certifications: "",
    address: "",
    message: "",
  });

  // ================= FETCH CATEGORIES =================
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get(CATEGORY_URL);
      return res.data?.data || res.data || [];
    },
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData({
        ...formData,
        phone: value.replace(/\D/g, "").slice(0, 10),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // ================= MUTATION =================
  const mutation = useMutation({
    mutationFn: (data) => axios.post(TECH_URL, data),

    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Application submitted successfully!",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        certifications: "",
        address: "",
        message: "",
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
    },

    onError: (error) => {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Please try again.";

      setMessage({
        type: "error",
        text: `❌ ${errorMsg}`,
      });
    },
  });

  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      contact: formData.phone,
      specialization: formData.specialization,
      experience: formData.experience,
      certificate: formData.certifications,
      city: formData.address,
      description: formData.message,
    };

    mutation.mutate(payload);
  };

  return (
    <>
      {/* Header */}
      <section
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,58,138,0.95), rgba(30,58,138,0.85)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80') center/cover",
          padding: "180px 0 100px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div className="container">
          <span
            className="badge"
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              marginBottom: "20px",
            }}
          >
            Apply for Technician
          </span>

          <h1 style={{ fontSize: "3.5rem", marginBottom: "20px" }}>
            Join Our Expert Team
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              maxWidth: "600px",
              margin: "0 auto",
              opacity: 0.9,
            }}
          >
            Become a certified technician with BookAMC. Benefit from consistent
            jobs, professional growth, and be part of an elite service network.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="application-form-section">
        <div className="container">
          <div className="form-card">
            <h2>Technician Application Form</h2>
            <p>
              Register your skills with us. Our technical recruitment team will
              review your profile and contact you for an assessment.
            </p>

            {/* Message */}
            {message.text && (
              <div
                style={{
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "4px",
                  backgroundColor:
                    message.type === "success" ? "#d4edda" : "#f8d7da",
                  color:
                    message.type === "success" ? "#155724" : "#721c24",
                  border: `1px solid ${
                    message.type === "success"
                      ? "#c3e6cb"
                      : "#f5c6cb"
                  }`,
                }}
              >
                {message.text}
              </div>
            )}

            <form className="app-form" onSubmit={handleSubmit}>
              {/* Name Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Contact Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="1234567890"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Specialization Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Specialization *</label>
                  <select
                    name="specialization"
                    className="form-control"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select an area
                    </option>

                    {categories.length > 0
                      ? categories.map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.name || cat.category_name}
                          >
                            {cat.name || cat.category_name}
                          </option>
                        ))
                      : (
                        <>
                          <option value="fire">Fire Safety Specialist</option>
                          <option value="solar">Solar Systems Technician</option>
                          <option value="water">Plumbing & Water Treatment</option>
                          <option value="cctv">CCTV & Network Installations</option>
                          <option value="hvac">HVAC Technician</option>
                          <option value="electrician">Electrician</option>
                        </>
                      )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Years of Experience *</label>
                  <select
                    name="experience"
                    className="form-control"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select experience
                    </option>
                    <option value="1-3">1 - 3 Years</option>
                    <option value="3-5">3 - 5 Years</option>
                    <option value="5-10">5 - 10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
              </div>

              {/* Certifications */}
              <div className="form-group">
                <label>Relevant Certifications / Licenses *</label>
                <input
                  type="text"
                  name="certifications"
                  className="form-control"
                  placeholder="List certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label>Current City / Operating Region *</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="City, State"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Summary */}
              <div className="form-group">
                <label>Brief Summary of Experience</label>
                <textarea
                  name="message"
                  className="form-control"
                  placeholder="Tell us about your projects..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large btn-block"
                style={{ marginTop: "20px" }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default TechnicianPage;