import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SETTINGS_URL } from "../../services/endpoints";

// ===== Fetch Settings =====
const fetchSettings = async () => {
  const response = await axios.get(SETTINGS_URL);
  return response?.data?.data?.[0] || response?.data?.[0] || response?.data;
};

function ContactInfo() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="contact-info">
      <h2 className="section-title">Get in Touch</h2>
      <p>
        Have questions or need a custom solution? Reach out to us, or
        book a demo directly.
      </p>

      {isLoading && <p>Loading contact info...</p>}

      {!isLoading && settings && (
        <>
          <ul className="contact-details">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>{settings.address || "No address available"}</span>
            </li>
            <li>
              <i className="fas fa-phone-alt"></i>
              <span>{settings.contact_no || "No phone available"}</span>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <span>{settings.email || "No email available"}</span>
            </li>
          </ul>

          <div className="social-links">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
            )}
            {settings.twitter && (
              <a href={settings.twitter} target="_blank" rel="noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
            )}
            {settings.linkdin && (
              <a href={settings.linkdin} target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ContactInfo;