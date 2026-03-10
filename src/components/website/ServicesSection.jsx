import React, { useEffect, useState } from "react";
import axios from "axios";
import { CMS_URL } from "../../services/endpoints";
import { Link } from "react-router-dom";

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    3: "fas fa-fire-extinguisher",
    4: "fas fa-solar-panel",
    5: "fas fa-water",
    6: "fas fa-video",
  };

  const createSlug = (text) => {
    return text
      ?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(CMS_URL);
        const cmsData = res?.data?.data || res?.data || [];

        const filteredServices = cmsData.filter((item) =>
          [3, 4, 5, 6].includes(item.id)
        );

        setServices(filteredServices);
      } catch (error) {
        console.error("CMS Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section id="services" className="services-section section-padding bg-light">
      <div className="container">
        <div className="section-header text-center">
          <span className="subtitle">What We Do</span>
          <h2 className="section-title">Our Specialized Services</h2>
          <p className="section-desc">
            Comprehensive maintenance solutions tailored to your specific requirements.
          </p>
        </div>

        {loading && <p className="text-center">Loading services...</p>}

        {!loading && services.length === 0 && (
          <p className="text-center">No services available</p>
        )}

        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service.id}>
              <div className="card-icon bg-blue">
                <i className={iconMap[service.id] || "fas fa-cogs"}></i>
              </div>

              <h3>{service.page_name}</h3>

              <div
                dangerouslySetInnerHTML={{
                  __html: service.page_description || "",
                }}
              />

              <Link
                to={`/${createSlug(service.page_name)}`}
                className="read-more"
              >
                Learn More <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;