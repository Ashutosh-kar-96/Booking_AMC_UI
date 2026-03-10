import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../layouts/WebsiteLayout";
import logoFallback from "../../assets/website/images/bookamc logo.png";

const WebsiteHeader = () => {
  const settings = useSettings();
  const [scrolled, setScrolled] = useState(false);

  // ================= SCROLL EFFECT =================
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 80;
      setScrolled(isScrolled);
      
      // Add/remove class to body for padding adjustment
      if (isScrolled) {
        document.body.classList.add('has-fixed-header');
      } else {
        document.body.classList.remove('has-fixed-header');
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove('has-fixed-header');
    };
  }, []);

  // ================= LOGO URL =================
  const normalLogo = settings?.logo
    ? `https://api.bookamc.com/uploads/vendor/${settings.logo}`
    : logoFallback;

  const lightLogo = settings?.light_logo
    ? `https://api.bookamc.com/uploads/vendor/${settings.light_logo}`
    : logoFallback;

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div className="top-bar">
        <div className="container top-bar-container">
          <div className="top-bar-contact">
            <a href={`mailto:${settings?.email || "support@bookamc.com"}`}>
              <i className="fas fa-envelope"></i>{" "}
              {settings?.email || "support@bookamc.com"}
            </a>

            <a href={`tel:${settings?.contact_no || "+18001234567"}`}>
              <i className="fas fa-phone-alt"></i>{" "}
              {settings?.contact_no || "+1 (800) 123-4567"}
            </a>
          </div>

          <div className="top-bar-social">
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
      </div>

      {/* ================= NAVBAR ================= */}
      <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="container nav-container">

          {/* LOGO SWITCH */}
          <div className="logo">
            <Link to="/">
              <img
                src={scrolled ? normalLogo : lightLogo}
                alt="BookAMC Logo"
                className="brand-logo"
              />
            </Link>
          </div>

          {/* NAVIGATION */}
          <nav className="nav-menu">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>

              <li className="dropdown">
                <a href="#services">
                  Services <i className="fas fa-chevron-down text-xs"></i>
                </a>
                <ul className="dropdown-menu">
                  <li><Link to="/fire-safety-amc">Fire Safety AMC</Link></li>
                  <li><Link to="/solar-systems-amc">Solar Systems AMC</Link></li>
                  <li><Link to="/water-treatment-stp">Water Treatment (STP)</Link></li>
                  <li><Link to="/cctv-surveillance">CCTV Surveillance</Link></li>
                </ul>
              </li>

              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </nav>

          {/* ACTION BUTTON */}
          <div className="nav-actions">
            <Link to="/contact" className="btn btn-primary">
              Book a Demo
            </Link>
          </div>

        </div>
      </header>
    </>
  );
};

export default WebsiteHeader;