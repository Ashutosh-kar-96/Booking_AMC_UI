import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { SETTINGS_URL } from "../../services/endpoints";
import logoFallback from "../../assets/website/images/bookamc logo.png";

const WebsiteFooter = () => {
  const [settings, setSettings] = useState(null);

  // ================= FETCH SETTINGS =================
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(SETTINGS_URL);

        const settingsData =
          response?.data?.data?.[0] || response?.data?.[0];

        setSettings(settingsData);
      } catch (error) {
        console.error("Footer Settings Fetch Error:", error);
      }
    };

    fetchSettings();
  }, []);

  const logoUrl = settings?.logo
    ? `https://api.bookamc.com/uploads/vendor/${settings.logo}`
    : logoFallback;

  return (
    <footer className="footer">
      <div className="container footer-content">

        {/* Brand Section */}
        <div className="footer-brand">
          <Link to="/" className="logo">
            <img
              src={logoUrl}
              alt="BookAMC Logo"
              style={{ height: "40px", marginBottom: "16px" }}
            />
          </Link>

          <p>
            {settings?.description ||
              "Your ultimate destination for professional maintenance and installation services worldwide."}
          </p>

          <div className="social-links" style={{ marginTop: "20px" }}>
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
            )}
            {settings?.twitter && (
              <a href={settings.twitter} target="_blank" rel="noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
            )}
            {settings?.linkdin && (
              <a href={settings.linkdin} target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Client Login</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-links">
          <h4>Our Services</h4>
          <ul>
            <li><Link to="/fire-safety-amc">Fire Safety AMC</Link></li>
            <li><Link to="/solar-systems-amc">Solar Systems AMC</Link></li>
            <li><Link to="/water-treatment-stp">Water Treatment (STP)</Link></li>
            <li><Link to="/cctv-surveillance">CCTV Surveillance</Link></li>
          </ul>
        </div>

        {/* Join With Us */}
        <div className="footer-links">
          <h4>Join With Us</h4>
          <ul>
            <li><Link to="/apply-vendor">Apply as Vendor</Link></li>
            <li><Link to="/apply-technician">Apply as Technician</Link></li>
          </ul>
        </div>

      </div>

      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} BookAMC Systems Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default WebsiteFooter;