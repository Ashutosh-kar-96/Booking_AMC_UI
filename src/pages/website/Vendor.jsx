import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { VENDOR_ENQUIRY_URL } from "../../services/endpoints";

const VendorPage = () => {
  // ================= React Hook Form =================
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ================= React Query Mutation =================
  const mutation = useMutation({
    mutationFn: (data) => axios.post(VENDOR_ENQUIRY_URL, data),

    onSuccess: () => {
      reset();
    },

    onError: (error) => {
      console.error("Vendor Submit Error:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    },
  });

  // ================= Submit Handler =================
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <>
      {/* Inner Page Header */}
      <section
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,58,138,0.95), rgba(30,58,138,0.85)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80') center/cover",
          padding: "180px 0 100px",
          textAlign: "center",
          color: "white",
          position: "relative",
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
              padding: "8px 18px",
              fontSize: "14px",
              borderRadius: "30px",
              display: "inline-block",
            }}
          >
            Vendor Network
          </span>

          <h1
            style={{
              fontSize: "3.2rem",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            Partner With Us
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              maxWidth: "650px",
              margin: "0 auto",
              opacity: 0.9,
              lineHeight: "1.6",
            }}
          >
            Join the BookAMC vendor network to supply high-quality materials
            and grow your business with a trusted compliance leader.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="application-form-section">
        <div className="container">
          <div className="form-card">
            <h2>Vendor Application Form</h2>
            <p>
              Please fill out the details below. Our procurement team will
              review your application and get back to you within 3 business
              days.
            </p>

            <form className="app-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acme Supplies Inc."
                    {...register("company_name", { required: true })}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Person *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    {...register("full_name", { required: true })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Business Email *</label>
                  <input
                      type="email"
                      className="form-control"
                      placeholder="contact@company.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />

                    {errors.email && (
                      <small style={{ color: "red" }}>
                        {errors.email.message}
                      </small>
                    )}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter 10 digit mobile number"
                    maxLength="10"
                    {...register("contact", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Mobile number must be exactly 10 digits",
                      },
                    })}
                  />

                  {errors.contact && (
                    <small style={{ color: "red" }}>
                      {errors.contact.message}
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Company Website (Optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://www.yourcompany.com"
                  {...register("company_website")}
                />
              </div>

              <div className="form-group">
                <label>Primary Supply Category *</label>
                <select
                  className="form-control"
                  defaultValue=""
                  {...register("supply_category", { required: true })}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="fire">Fire Safety Equipment</option>
                  <option value="solar">Solar Panels & Inverters</option>
                  <option value="water">
                    Water Treatment Chemicals/Parts
                  </option>
                  <option value="cctv">
                    CCTV Cameras & Networking
                  </option>
                  <option value="other">Other Supplies</option>
                </select>
              </div>

              <div className="form-group">
                <label>Business Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Street layout, Suite, City, State, ZIP"
                  {...register("address", { required: true })}
                />
              </div>

              <div className="form-group">
                <label>Brand Profile / Additional Info</label>
                <textarea
                  className="form-control"
                  placeholder="Tell us about the brands you carry and your distribution capacity..."
                  {...register("description")}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large btn-block"
                style={{ marginTop: "20px" }}
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Submitting..."
                  : "Submit Application"}
              </button>
            </form>

            {mutation.isSuccess && (
              <div style={{ color: "green", marginBottom: "15px" }}>
                Application submitted successfully!
              </div>
            )}


          </div>
        </div>
      </section>
    </>
  );
};

export default VendorPage;