import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/admin/Header.jsx";
import Sidebar from "../components/admin/Sidebar.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const AdminLayout = () => {

  useEffect(() => {
    const loadAssets = async () => {
      // Dynamically load CSS
      await import("../assets/admin/css/bootstrap.min.css");
      await import("../assets/admin/css/icons.min.css");
      await import("../assets/admin/css/app.min.css");
     
      
      
      // Dynamically load JS
      //await import("../assets/admin/libs/bootstrap/js/bootstrap.bundle.min.js");
    };

    loadAssets();
  }, []);

  return (
    <div className="admin-wrapper">
      <Header />
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;


