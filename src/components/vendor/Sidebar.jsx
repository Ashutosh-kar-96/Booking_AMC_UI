import React from "react";

const Sidebar = () => {
  return (
    <div className="app-menu navbar-menu">
      
      {/* LOGO */}
      <div className="navbar-brand-box">
        {/* Dark Logo */}
        <a href="/" className="logo logo-dark">
          <span className="logo-sm">
            <img src="/assets/images/logo-sm.png" alt="logo-sm" height="22" />
          </span>
          <span className="logo-lg">
            <img src="/assets/images/logo-dark.png" alt="logo-dark" height="17" />
          </span>
        </a>

        {/* Light Logo */}
        <a href="/" className="logo logo-light">
          <span className="logo-sm">
            <img src="/assets/images/logo-sm.png" alt="logo-sm" height="22" />
          </span>
          <span className="logo-lg">
            <img src="/assets/images/logo-light.png" alt="logo-light" height="17" />
          </span>
        </a>

        <button
          type="button"
          className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
          id="vertical-hover"
        >
          <i className="ri-record-circle-line"></i>
        </button>
      </div>

      {/* USER DROPDOWN */}
      <div className="dropdown sidebar-user m-1 rounded">
        <button
          type="button"
          className="btn material-shadow-none"
          id="sidebar-user-dropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span className="d-flex align-items-center gap-2">
            <img
              className="rounded header-profile-user"
              src="/assets/images/users/avatar-1.jpg"
              alt="avatar"
            />
            <span className="text-start">
              <span className="d-block fw-medium sidebar-user-name-text">
                Anna Adame
              </span>
              <span className="d-block fs-14 sidebar-user-name-sub-text">
                <i className="ri ri-circle-fill fs-10 text-success align-baseline"></i>{" "}
                <span className="align-middle">Online</span>
              </span>
            </span>
          </span>
        </button>

        <div className="dropdown-menu dropdown-menu-end">
          <h6 className="dropdown-header">Welcome Anna!</h6>

          <a className="dropdown-item" href="/profile">
            <i className="mdi mdi-account-circle text-muted fs-16 me-1"></i>
            Profile
          </a>

          <a className="dropdown-item" href="/logout">
            <i className="mdi mdi-logout text-muted fs-16 me-1"></i>
            Logout
          </a>
        </div>
      </div>

      {/* SCROLLBAR */}
      <div id="scrollbar">
        <div className="container-fluid">
          <ul className="navbar-nav" id="navbar-nav">

            <li className="menu-title">
              <span>Menu</span>
            </li>

            {/* MULTI LEVEL MENU */}
            <li className="nav-item">
              <a
                className="nav-link menu-link"
                href="#sidebarMultilevel"
                data-bs-toggle="collapse"
                role="button"
                aria-expanded="false"
              >
                <i className="ri-share-line"></i>
                <span> Multi Level</span>
              </a>

              <div className="collapse menu-dropdown" id="sidebarMultilevel">
                <ul className="nav nav-sm flex-column">

                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      Level 1.1
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      href="#sidebarAccount"
                      className="nav-link"
                      data-bs-toggle="collapse"
                      role="button"
                      aria-expanded="false"
                    >
                      Level 1.2
                    </a>

                    <div className="collapse menu-dropdown" id="sidebarAccount">
                      <ul className="nav nav-sm flex-column">

                        <li className="nav-item">
                          <a href="#" className="nav-link">
                            Level 2.1
                          </a>
                        </li>

                        <li className="nav-item">
                          <a
                            href="#sidebarCrm"
                            className="nav-link"
                            data-bs-toggle="collapse"
                            role="button"
                            aria-expanded="false"
                          >
                            Level 2.2
                          </a>

                          <div
                            className="collapse menu-dropdown"
                            id="sidebarCrm"
                          >
                            <ul className="nav nav-sm flex-column">

                              <li className="nav-item">
                                <a href="#" className="nav-link">
                                  Level 3.1
                                </a>
                              </li>

                              <li className="nav-item">
                                <a href="#" className="nav-link">
                                  Level 3.2
                                </a>
                              </li>

                            </ul>
                          </div>
                        </li>

                      </ul>
                    </div>
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