import { useEffect, useState, createContext, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import { SETTINGS_URL } from "../services/endpoints";

import Header from "../components/website/Header.jsx";
import Footer from "../components/website/Footer.jsx";

import "../assets/website/style.css";
import "../assets/website/script.js";

/* ================= CREATE CONTEXT HERE ================= */
export const SettingsContext = createContext(null);

/* ================= CUSTOM HOOK ================= */
export const useSettings = () => useContext(SettingsContext);

const WebsiteLayout = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH SETTINGS ONCE ================= */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(SETTINGS_URL);
        const settingsData =
          response?.data?.data?.[0] || response?.data?.[0];

        setSettings(settingsData);
      } catch (error) {
        console.error("Settings Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /* ================= REINITIALIZE SCRIPTS ================= */
  useEffect(() => {
    if (window.initializeWebsiteScripts) {
      window.initializeWebsiteScripts();
    }
  }, [location.pathname]);

  /* ================= OPTIONAL LOADING STATE ================= */
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2>Loading Website...</h2>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={settings}>
      <div className="website-wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </SettingsContext.Provider>
  );
};

export default WebsiteLayout;