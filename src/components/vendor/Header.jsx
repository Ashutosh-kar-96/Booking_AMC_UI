import React, { useEffect, useState } from "react";

const Header = () => {

  const html = document.documentElement;

  const [theme, setTheme] = useState("light");
  const [sidebar, setSidebar] = useState("lg");
  const [isFull, setIsFull] = useState(false);

  /* -------------------------
     Load Saved Settings
  --------------------------*/
  useEffect(() => {
    const savedTheme = sessionStorage.getItem("data-bs-theme");
    const savedSidebar = sessionStorage.getItem("data-sidebar-size");

    if (savedTheme) setTheme(savedTheme);
    if (savedSidebar) setSidebar(savedSidebar);
  }, []);

  /* -------------------------
     Apply Theme
  --------------------------*/
  useEffect(() => {
    html.setAttribute("data-bs-theme", theme);
    sessionStorage.setItem("data-bs-theme", theme);
  }, [theme]);

  /* -------------------------
     Apply Sidebar Size
  --------------------------*/
  useEffect(() => {
    html.setAttribute("data-sidebar-size", sidebar);
    sessionStorage.setItem("data-sidebar-size", sidebar);
  }, [sidebar]);

  /* -------------------------
     Fullscreen Toggle
  --------------------------*/
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFull(true);
    } else {
      document.exitFullscreen();
      setIsFull(false);
    }
  };

  /* -------------------------
     Sidebar Toggle
  --------------------------*/
  const toggleSidebar = () => {
    setSidebar(prev => (prev === "lg" ? "sm" : "lg"));
  };

  /* -------------------------
     Dark Mode Toggle
  --------------------------*/
  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">

          {/* LEFT SIDE */}
          <div className="d-flex">

            {/* LOGO */}
            <div className="navbar-brand-box horizontal-logo">
              <a href="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src="/assets/images/logo-sm.png" alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src="/assets/images/logo-dark.png" alt="" height="17" />
                </span>
              </a>

              <a href="/" className="logo logo-light">
                <span className="logo-sm">
                  <img src="/assets/images/logo-sm.png" alt="" height="22" />
                </span>
                <span className="logo-lg">
                  <img src="/assets/images/logo-light.png" alt="" height="17" />
                </span>
              </a>
            </div>

            {/* SIDEBAR TOGGLE */}
            <button
              type="button"
              className="btn btn-sm px-3 fs-16 header-item"
              onClick={toggleSidebar}
            >
              <span className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div className="d-flex align-items-center">

            {/* FULLSCREEN */}
            <div className="ms-1 header-item d-none d-sm-flex">
              <button
                type="button"
                className="btn btn-icon btn-topbar rounded-circle"
                onClick={toggleFullscreen}
              >
                <i
                  className={`bx ${
                    isFull ? "bx-exit-fullscreen" : "bx-fullscreen"
                  } fs-22`}
                ></i>
              </button>
            </div>

            {/* DARK MODE */}
            <div className="ms-1 header-item d-none d-sm-flex">
              <button
                type="button"
                className="btn btn-icon btn-topbar rounded-circle"
                onClick={toggleTheme}
              >
                <i
                  className={`bx ${
                    theme === "dark" ? "bx-sun" : "bx-moon"
                  } fs-22`}
                ></i>
              </button>
            </div>

            {/* USER DROPDOWN */}
            <div className="dropdown ms-sm-3 header-item topbar-user">
              <button
                type="button"
                className="btn"
                data-bs-toggle="dropdown"
              >
                <span className="d-flex align-items-center">
                  <img
                    className="rounded-circle header-profile-user"
                    src="/assets/images/users/avatar-1.jpg"
                    alt=""
                  />
                  <span className="text-start ms-xl-2">
                    <span className="d-none d-xl-inline-block fw-medium">
                      Anna Adame
                    </span>
                  </span>
                </span>
              </button>

              <div className="dropdown-menu dropdown-menu-end">
                <h6 className="dropdown-header">Welcome Anna!</h6>
                <a className="dropdown-item" href="/profile">Profile</a>
                <a className="dropdown-item" href="/logout">Logout</a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;