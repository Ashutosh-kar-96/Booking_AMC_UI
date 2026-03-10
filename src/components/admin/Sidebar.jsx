import React , { useState }from "react";
import { Link, useLocation} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SETTINGS_URL, FILE_BASE_URL } from "../../services/endpoints";


const fetchSettings = async () => {
  const { data } = await axios.get(SETTINGS_URL);
  return data;
};


const Sidebar = () => {
   const location = useLocation();
  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  console.log("API DATA:", settings);
  console.log("ERROR:", error);

  const [openMenus, setOpenMenus] = useState({
      vendorMenu: false,
      auditorrMenu: false,
      masterMenu: false,
      contentMenu: false,
      enquiryMenu: false
 });

 const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

   // Check if any child link is active to keep menu open
    const isChildActive = (paths) => {
      return paths.some(path => location.pathname.includes(path));
    };
  
    // Auto-expand menus based on current route
    React.useEffect(() => {
      setOpenMenus({
        vendorMenu: isChildActive(['/admin/vendor', '/admin/vendorlist']),
        auditorrMenu: isChildActive(['/admin/auditor', '/admin/auditorlist']),
        masterMenu: isChildActive(['/admin/location', '/admin/category', '/admin/department', '/admin/organization-type', '/admin/occupation-type', '/admin/equipment']),
        contentMenu: isChildActive(['/admin/pages', '/admin/testimonial', '/admin/banners']),
        enquiryMenu: isChildActive(['/admin/userenquiry', '/admin/technicianenquiry', '/admin/vendorenquiry'])
      });
    }, [location.pathname]);
    

  // ✅ Extract first setting object (since API returns array)
  const setting = settings?.[0];

  return (
    <div className="app-menu navbar-menu">

      {/* LOGO SECTION */}
      <div className="navbar-brand-box text-center">



        {/* Dark Logo */}
        <Link to="/" className="logo logo-dark">
          <span className="logo-sm">
            <img
              src={
                setting?.logo
                  ? `${FILE_BASE_URL}/uploads/${setting.logo}`
                  : "/assets/images/logo-sm.png"
              }
              alt="logo-sm"
              height="22"
            />
          </span>

          <span className="logo-lg">
            <img
              src={
                setting?.logo
                  ? `${FILE_BASE_URL}/uploads/${setting.logo}`
                  : "/assets/images/logo-sm.png"
              }
              alt="logo-sm"
              height="22"
            />
          </span>
        </Link>

        {/* Light Logo */}
        <Link to="/" className="logo logo-light">
          <span className="logo-sm">
            <img
              src={
                setting?.logo
                  ? `${FILE_BASE_URL}/uploads/${setting.logo}`
                  : "/assets/images/logo-sm.png"
              }
              alt="logo-sm"
              height="22"
            />
          </span>

          <span className="logo-lg">
            <img
              src={
                setting?.logo
                  ? `${FILE_BASE_URL}/uploads/${setting.logo}`
                  : "/assets/images/logo-sm.png"
              }
              alt="logo-sm"
              height="22"
            />
          </span>
        </Link>
      </div>

      {/* SIDEBAR MENU */}
      <div id="scrollbar">
        <div className="container-fluid">
          <ul className="navbar-nav" id="navbar-nav">

            <li className="menu-title">
              <span>Menu</span>
            </li>

            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/dashboard">
                <i className="ri-dashboard-2-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/customer">
                <i className="ri-team-line"></i>
                <span>Customer</span>
              </Link>
            </li>

            {/* <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/vendor">
                <i className="ri-group-line"></i>
                <span>Vendor</span>
              </Link>
            </li> */}

            {/* VENDOR DROPDOWN */}
            <li className="nav-item">
              <a
                className="nav-link menu-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('vendorMenu');
                }}
                aria-expanded={openMenus.vendorMenu}
              >
                <i className="ri-book-open-fill"></i>
                <span>Vendor</span>
                <i className={`ri-arrow-${openMenus.vendorMenu ? 'down' : 'right'}-s-line ms-auto`}></i>
              </a>
              <div className={`collapse menu-dropdown ${openMenus.vendorMenu ? 'show' : ''}`}>
                <ul className="nav nav-sm flex-column">
                  <li className="nav-item">
                    <Link to="/admin/vendor" className="nav-link">
                      Add Vendor
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/vendor-list" className="nav-link">
                       Vendor List
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            

            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/technician">
                <i className="ri-team-fill"></i>
                <span>Technician</span>
              </Link>
            </li>

            {/* <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/auditor">
                <i className="ri-search-eye-line"></i>
                <span>Auditor</span>
              </Link>
            </li> */}

            <li className="nav-item">
              <a
                className="nav-link menu-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('auditorrMenu');
                }}
                aria-expanded={openMenus.auditorrMenu}
              >
                <i className="ri-book-open-fill"></i>
                <span>Auditor</span>
                <i className={`ri-arrow-${openMenus.auditorrMenu ? 'down' : 'right'}-s-line ms-auto`}></i>
              </a>
              <div className={`collapse menu-dropdown ${openMenus.auditorrMenu ? 'show' : ''}`}>
                <ul className="nav nav-sm flex-column">
                  <li className="nav-item">
                    <Link to="/admin/auditor" className="nav-link">
                      Add Auditor
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/auditorlist" className="nav-link">
                       Auditor List
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/sub-admin">
                <i className="ri-admin-fill"></i>
                <span>Sub Admin</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/item-master">
                <i className="ri-archive-line"></i>
                <span>Item Master</span>
              </Link>
            </li>

            {/* MASTER DROPDOWN */}
            <li className="nav-item">
              <a
                className="nav-link menu-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('masterMenu');
                }}
                aria-expanded={openMenus.masterMenu}
              >
                <i className="ri-book-open-fill"></i>
                <span>Master</span>
                <i className={`ri-arrow-${openMenus.masterMenu ? 'down' : 'right'}-s-line ms-auto`}></i>
              </a>
              <div className={`collapse menu-dropdown ${openMenus.masterMenu ? 'show' : ''}`}>
                <ul className="nav nav-sm flex-column">
                  <li className="nav-item">
                    <Link to="/admin/location" className="nav-link">
                      Location Management
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/category" className="nav-link">
                      Category
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/department" className="nav-link">
                      Department/Designation
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/organization-type" className="nav-link">
                      Organization Type
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/occupation-type" className="nav-link">
                      Occupation Type
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/equipment" className="nav-link">
                      Equipment
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* CONTENT MANAGEMENT */}
            <li className="nav-item">
              <a
                className="nav-link menu-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('contentMenu');
                }}
                aria-expanded={openMenus.contentMenu}
              >
                <i className="ri-book-open-fill"></i>
                <span>Content Management</span>
                <i className={`ri-arrow-${openMenus.contentMenu ? 'down' : 'right'}-s-line ms-auto`}></i>
              </a>
              <div className={`collapse menu-dropdown ${openMenus.contentMenu ? 'show' : ''}`}>
                <ul className="nav nav-sm flex-column">
                  <li className="nav-item">
                    <Link to="/admin/pages" className="nav-link">
                      Page
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/testimonial" className="nav-link">
                      Testimonial
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/banners" className="nav-link">
                      Banners
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            
            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/coupon">
                <i className="ri-team-line"></i>
                <span>Coupon</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link menu-link" to="/admin/assetonboarding">
                <i className="ri-team-line"></i>
                <span>Asset Onboarding</span>
              </Link>
            </li>
            {/* ENQUIRY DROPDOWN */}
            <li className="nav-item">
              <a
                className="nav-link menu-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('enquiryMenu');
                }}
                aria-expanded={openMenus.enquiryMenu}
              >
                <i className="ri-book-open-fill"></i>
                <span>Enquiry</span>
                <i className={`ri-arrow-${openMenus.enquiryMenu ? 'down' : 'right'}-s-line ms-auto`}></i>
              </a>
              <div className={`collapse menu-dropdown ${openMenus.enquiryMenu ? 'show' : ''}`}>
                <ul className="nav nav-sm flex-column">
                  <li className="nav-item">
                    <Link to="/admin/userenquiry" className="nav-link">
                      User Enquiry
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/technicianenquiry" className="nav-link">
                      Technician Enquiry
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/vendorenquiry" className="nav-link">
                      Vendor Enquiry
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

          </ul>
        </div>
      </div>

      <div className="sidebar-background"></div>
    </div>
  );
};

export default Sidebar;