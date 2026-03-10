import React from "react";
import ContactSection from "../../components/website/ContactSection";
import MapSection from "../../components/website/MapSection";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted");
  };

  return (
    <>
      {/* Inner Page Header */}
      <section
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(30,58,138,0.95), rgba(30,58,138,0.85)), url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=1920&q=80') center/cover",
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
            Get in Touch
          </span>

          <h1 style={{ fontSize: "3.5rem", marginBottom: "20px" }}>
            Contact Us
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              maxWidth: "600px",
              margin: "0 auto",
              opacity: 0.9,
            }}
          >
            We're here to help with your maintenance and compliance needs.
            Reach out to our expert team today.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      
        
       <ContactSection />
       <MapSection/>
    </>
  );
};

export default Contact;