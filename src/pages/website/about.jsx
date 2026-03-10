import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { CMS_URL } from "../../services/endpoints";

import ServicesSection from "../../components/website/ServicesSection";

const About = () => {
  const { slug } = useParams();

  const [cms, setCms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const response = await axios.get(CMS_URL);
        const cmsList = response?.data?.data || [];

        // 🔥 Strong slug generator (handles spaces + brackets + uppercase)
        const selectedCms = cmsList.find((item) => {
          const generatedSlug = item.page_name
            ?.trim()                  // ✅ remove extra spaces
            .toLowerCase()
            .replace(/[()]/g, "")     // remove brackets
            .replace(/\s+/g, "-");    // spaces → dash

          return generatedSlug === slug;
        });

        setCms(selectedCms || null);
      } catch (err) {
        console.error("CMS Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCms();
  }, [slug]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // ================= PAGE NOT FOUND =================
  if (!cms) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2>Page Not Found</h2>
      </div>
    );
  }

  // ================= RENDER PAGE =================
  return (
    <>
      {/* Header Section */}
      <section
        className="page-header"
        style={{
          background: `
            linear-gradient(135deg, rgba(30,58,138,0.95), rgba(30,58,138,0.85)),
            url(${
              cms.image
                ? `https://api.bookamc.com/uploads/vendor/${cms.image}`
                : "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=1920&q=80"
            })
            center/cover
          `,
          padding: "180px 0 100px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div className="container">
          <span className="badge">
            {cms.page_name?.trim()}
          </span>

          <h1>{cms.page_title}</h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="section-padding bg-light">
        <div className="container">
          <div
            style={{
              background: "white",
              padding: "50px",
              borderRadius: "24px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: cms.details,
              }}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />
    </>
  );
};

export default About;