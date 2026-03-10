import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import WebsiteLayout from "../layouts/WebsiteLayout";
import VendorLayout from "../layouts/VendorLayout";

// Website pages
import Home from "../pages/website/Home";
import About from "../pages/website/about";
import Contact from "../pages/website/Contact";
import Vendor from "../pages/website/Vendor";
import Technician from "../pages/website/Technician";
import Login from "../pages/website/Login";

// Admin pages user_type= 1 and 2
import AdminProfile from "../pages/admin/Profile";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminInnerPage from "../pages/admin/InnerPage";
import AdminSetting from "../pages/admin/Setting";
import AdminCustomer from "../pages/admin/Customer";

import AdminVendor  from "../pages/admin/inner_vendor/Vendor";
import AdminVendorList  from "../pages/admin/inner_vendor/VendorList";

import AdminTechnician from "../pages/admin/Technician";

import AdminAuditor  from "../pages/admin/inner_auditor/Auditor";
import AdminAuditorList from "../pages/admin/inner_auditor/AuditorList";

import AdminSubAdmin from "../pages/admin/SubAdmin";
import AdminItemMaster from "../pages/admin/ItemMaster";
import AdminLocation from "../pages/admin/Location";
import AdminCategory from "../pages/admin/Category";
import AdminSubCategory from "../pages/admin/SubCategory";
import AdminDepartment from "../pages/admin/Department";
import AdminDesignation from "../pages/admin/Designation";
import AdminOrganization from "../pages/admin/OrganizationType";
import AdminOccupation from "../pages/admin/OccupationType";
import AdminEquipment from "../pages/admin/Equipment";
import AdminPage from "../pages/admin/Page";
import AdminTestimonial from "../pages/admin/Testimonial";
import AdminBanner from "../pages/admin/Banner";
import AdminAssetOnboarding from "../pages/admin/AssetOnboarding";
import AdminEnquiry from "../pages/admin/Enquiry";

import AdminUserEnquiry from "../pages/admin/UserEnquiry";
import AdminTechnicianEnquiry from "../pages/admin/TechnicianEnquiry";
import AdminVendorEnquiry from "../pages/admin/VendorEnquiry";
import AdminEnquiryView from "../pages/admin/EnquiryView";



// Vendor pages user_type=3
import VendorDashboard from "../pages/vendor/Dashboard";
import VendorInnerPage from "../pages/vendor/InnerPage";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= WEBSITE ROUTES ================= */}
      <Route path="/" element={<WebsiteLayout />}>
        <Route index element={<Home />} />
        <Route path=":slug" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="apply-vendor" element={<Vendor />} />
        <Route path="apply-technician" element={<Technician />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={[1, 2]}>
        <AdminLayout />
      </PrivateRoute>}>

        <Route path="profile" element={<AdminProfile />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inner-page" element={<AdminInnerPage />} />
        <Route path="settings" element={<AdminSetting />} />
        <Route path="customer" element={<AdminCustomer />} />
        <Route path="vendor" element={<AdminVendor />} />
        <Route path="vendor-list" element={<AdminVendorList />} />
        
        <Route path="technician" element={<AdminTechnician />} />
        
        <Route path="auditor" element={<AdminAuditor/>} />
        <Route path="auditorlist" element={<AdminAuditorList/>} />

        <Route path="sub-admin" element={<AdminSubAdmin />} />
        <Route path="item-master" element={<AdminItemMaster />} />
        <Route path="location" element={<AdminLocation />} />
        <Route path="category" element={<AdminCategory />} />
        <Route path="sub-category" element={<AdminSubCategory />} />
        <Route path="department" element={<AdminDepartment />} />
        <Route path="designation" element={<AdminDesignation />} />
        <Route path="organization-type" element={<AdminOrganization />} />
        <Route path="occupation-type" element={<AdminOccupation />} />
        <Route path="equipment" element={<AdminEquipment />} />
        <Route path="pages" element={<AdminPage />} />
        <Route path="testimonial" element={<AdminTestimonial />} />
        <Route path="banners" element={<AdminBanner />} />
        <Route path="assetonboarding" element={<AdminAssetOnboarding />} />
        <Route path="enquiry" element={<AdminEnquiry />} />

        <Route path="userenquiry" element={<AdminUserEnquiry/>} />
        <Route path="technicianenquiry" element={<AdminTechnicianEnquiry/>} />
        <Route path="vendorenquiry" element={<AdminVendorEnquiry/>} />
        <Route path="enquiryview/:id" element={<AdminEnquiryView/>} />



      </Route>


      {/* ================= VENDOR ROUTES ================= */}
      <Route path="/vendor" element={<PrivateRoute allowedRoles={[3]}>
        <VendorLayout />
      </PrivateRoute>}>
        <Route index element={<VendorDashboard />} />
        <Route path="inner-page" element={<VendorInnerPage />} />
      </Route>

      {/* ================= 404 FALLBACK ================= */}
      <Route path="*" element={<div>Page Not Found</div>} />

    </Routes>
  );
}

export default AppRoutes;