import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SETTINGS_URL } from "../../services/endpoints";

// ===== Fetch Settings =====
const fetchSettings = async () => {
  const response = await axios.get(SETTINGS_URL);
  return response?.data?.data?.[0] || response?.data?.[0] || response?.data;
};

function MapSection() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="map-section  bg-light" style={{ marginTop: "-40px", marginBottom: "60px"}}>
      <div className="container">

        <div
          style={{
            height: "400px",
            backgroundColor: "#e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          {isLoading ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              Loading map...
            </div>
          ) : settings?.iframe ? (
            <div
              style={{ height: "100%" }}
              dangerouslySetInnerHTML={{ __html: settings.iframe }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: "18px",
              }}
            >
              Map Integration Placeholder
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default MapSection;