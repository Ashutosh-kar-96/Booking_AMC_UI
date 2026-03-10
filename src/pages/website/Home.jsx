import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ServicesSection from "../../components/website/ServicesSection";

import { TESTIMONIAL_URL, BANNER_URL, CMS_URL, SETTINGS_URL } from "../../services/endpoints";

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [banners, setBanners] = useState([]);
  const [cms, setCms] = useState([]);
  const [settings, setSettings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTestimonialSet, setActiveTestimonialSet] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const testimonialIntervalRef = useRef(null);
  const testimonialContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testimonialRes, bannerRes, cmsRes, settingsRes] = await Promise.all([
          axios.get(TESTIMONIAL_URL),
          axios.get(BANNER_URL),
          axios.get(CMS_URL),
          axios.get(SETTINGS_URL)
        ]);

        const testimonialData =
          testimonialRes?.data?.data || testimonialRes?.data || [];

        const bannerData =
          bannerRes?.data?.data || bannerRes?.data || [];

        const cmsData =
          cmsRes?.data?.data || cmsRes?.data || [];

        const settingsData =
        settingsRes?.data?.data?.[0] || settingsRes?.data?.[0];

        setTestimonials(testimonialData);
        setBanners(bannerData);
        setCms(cmsData);
        setSettings(settingsData);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= AUTO-SLIDE FOR TESTIMONIALS =================
  useEffect(() => {
    if (testimonials.length > 3) {
      startTestimonialAutoSlide();
    }
    
    return () => {
      if (testimonialIntervalRef.current) {
        clearInterval(testimonialIntervalRef.current);
      }
    };
  }, [testimonials.length, activeTestimonialSet]);

  const startTestimonialAutoSlide = () => {
    if (testimonialIntervalRef.current) {
      clearInterval(testimonialIntervalRef.current);
    }
    
    testimonialIntervalRef.current = setInterval(() => {
      const totalSets = Math.ceil(testimonials.length / 3);
      if (totalSets > 1) {
        nextTestimonialSet();
      }
    }, 5000); // Change every 5 seconds
  };

  const resetTestimonialTimer = () => {
    if (testimonialIntervalRef.current) {
      clearInterval(testimonialIntervalRef.current);
      startTestimonialAutoSlide();
    }
  };

  // Testimonial navigation with smooth transition
  const nextTestimonialSet = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const totalSets = Math.ceil(testimonials.length / 3);
    
    // Add slide-out class
    if (testimonialContainerRef.current) {
      testimonialContainerRef.current.classList.add('slide-out');
    }
    
    setTimeout(() => {
      setActiveTestimonialSet((prev) => 
        prev === totalSets - 1 ? 0 : prev + 1
      );
      
      // Remove slide-out class and add slide-in
      if (testimonialContainerRef.current) {
        testimonialContainerRef.current.classList.remove('slide-out');
        testimonialContainerRef.current.classList.add('slide-in');
      }
      
      setTimeout(() => {
        if (testimonialContainerRef.current) {
          testimonialContainerRef.current.classList.remove('slide-in');
        }
        setIsTransitioning(false);
      }, 500);
    }, 300);
    
    resetTestimonialTimer();
  };

  const prevTestimonialSet = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const totalSets = Math.ceil(testimonials.length / 3);
    
    // Add slide-out class (reverse direction)
    if (testimonialContainerRef.current) {
      testimonialContainerRef.current.classList.add('slide-out-reverse');
    }
    
    setTimeout(() => {
      setActiveTestimonialSet((prev) => 
        prev === 0 ? totalSets - 1 : prev - 1
      );
      
      // Remove slide-out class and add slide-in
      if (testimonialContainerRef.current) {
        testimonialContainerRef.current.classList.remove('slide-out-reverse');
        testimonialContainerRef.current.classList.add('slide-in');
      }
      
      setTimeout(() => {
        if (testimonialContainerRef.current) {
          testimonialContainerRef.current.classList.remove('slide-in');
        }
        setIsTransitioning(false);
      }, 500);
    }, 300);
    
    resetTestimonialTimer();
  };

  // Banner slider navigation
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const homeCms = cms.find(item => item.id === 1);

  // Get current set of 3 testimonials
  const getCurrentTestimonials = () => {
    const startIndex = activeTestimonialSet * 3;
    return testimonials.slice(startIndex, startIndex + 3);
  };

  const totalTestimonialSets = Math.ceil(testimonials.length / 3);

  return (
    <div>
      {/* Hero Slider Section */}
      <section id="home" className="hero-slider">
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`slide ${
                activeSlide === index ? "active-slide" : ""
              }`}
              style={{
                backgroundImage: `
                  linear-gradient(135deg, rgba(30,58,138,0.8), rgba(15,23,42,0.4)),
                  url(https://api.bookamc.com/uploads/vendor/${banner.image})
                `,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="container slide-content">
                <span className="badge">
                  {banner.banner_subtitle || "Professional AMC Services"}
                </span>
                <h1>
                  {banner.banner_title || "Reliable Maintenance For Your Peace of Mind"}
                </h1>
                <p>
                  {banner.description || "We provide top-tier maintenance and installation services for residential and commercial properties."}
                </p>
                <div className="slide-actions">
                  <a href="#services" className="btn btn-primary btn-large">
                    Explore Services
                  </a>
                  <a href="#contact" className="btn btn-outline btn-large">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "100px", backgroundColor: "#1e3a8a", color: "#fff" }}>
            <h2>Loading banners...</h2>
          </div>
        )}

        {/* Banner Controls */}
        {banners.length > 1 && (
          <>
            <div className="slider-controls">
              <button className="prev-slide" onClick={prevSlide}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="next-slide" onClick={nextSlide}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="slider-dots">
              {banners.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${
                    activeSlide === index ? "active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                ></span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="welcome-section section-padding">
        <div className="container">
          <div className="welcome-grid">
            <div className="welcome-text">
              <h2 className="section-title">
                {homeCms?.page_title || "Welcome to BookAMC"}
              </h2>

              {homeCms?.details ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: homeCms.details
                  }}
                />
              ) : (
                <p>Loading content...</p>
              )}

              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-num">500+</span>
                  <span className="stat-label">Happy Clients</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">10+</span>
                  <span className="stat-label">Years Exp</span>
                </div>
              </div>
            </div>

            <div className="welcome-image">
              <div className="image-wrapper">
                {homeCms?.image ? (
                  <img
                    src={`https://api.bookamc.com/uploads/vendor/${homeCms.image}`}
                    alt={homeCms.page_title}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "400px",
                      backgroundColor: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      fontSize: "4rem"
                    }}
                  >
                    <i className="fas fa-building"></i>
                  </div>
                )}

                <div className="experience-badge">
                  <span className="years">10</span>
                  <span className="text">
                    Years of
                    <br />
                    Excellence
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Testimonials Section - 3 Column Grid with Smooth Auto-scroll and Arrows */}
      <section id="testimonials" className="testimonials-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <span className="subtitle">Testimonials</span>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-desc">
              Don't just take our word for it. Read what our satisfied clients
              have to say about our compliance-first services.
            </p>
          </div>

          {loading && <p className="text-center">Loading testimonials...</p>}
          {error && (
            <p className="text-center" style={{ color: "red" }}>
              {error}
            </p>
          )}

          {!loading && !error && testimonials.length === 0 && (
            <p className="text-center">No testimonials available</p>
          )}

          {!loading && testimonials.length > 0 && (
            <div className="testimonials-slider-container">
              {/* Testimonial Grid with Smooth Transition */}
              <div 
                className="testimonials-grid" 
                ref={testimonialContainerRef}
              >
                {getCurrentTestimonials().map((item, index) => (
                  <div className="testimonial-card" key={item.id || index}>
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>

                    <p className="testimonial-text">
                      "{item.message || item.content || item.testimonial || ''}"
                    </p>

                    <div className="client-info">
                      <div className="client-avatar">
                        <img
                          src={
                            item.image
                              ? `https://api.bookamc.com/uploads/vendor/${item.image}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  item.name || item.client_name || "User"
                                )}&background=1e3a8a&color=fff&size=60`
                          }
                          alt={item.name || item.client_name || "Client"}
                        />
                      </div>
                      <div>
                        <h4>{item.name || item.client_name || "Anonymous"}</h4>
                        <span>{item.designation || item.position || item.role || "Client"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Arrows for Testimonials (No Dots) */}
              {totalTestimonialSets > 1 && (
                <div className="testimonial-arrows">
                  <button 
                    className="prev-arrow" 
                    onClick={prevTestimonialSet}
                    disabled={isTransitioning}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button 
                    className="next-arrow" 
                    onClick={nextTestimonialSet}
                    disabled={isTransitioning}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Join Us Section */}
      <section id="join-us" className="join-section section-padding">
        <div className="container">
          <div className="join-grid">
            {/* Vendor */}
            <div className="join-card vendor-card">
              <div className="join-content">
                <h3>Join Us as Vendor</h3>
                <p>
                  Partner with BookAMC to supply quality materials and expand
                  your business reach. We collaborate with top-tier vendors to
                  deliver excellence.
                </p>
                <a href="/apply-vendor" className="btn btn-outline-light">
                  Apply as Vendor
                </a>
              </div>
            </div>
            {/* Technician */}
            <div className="join-card technician-card">
              <div className="join-content">
                <h3>Join Us as Technician</h3>
                <p>
                  Are you a skilled professional? Join our expert network, get
                  consistent jobs, and grow your career with the BookAMC
                  platform.
                </p>
                <a href="/apply-technician" className="btn btn-primary">
                  Apply as Technician
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Book Demo */}
      <section id="contact" className="contact-section section-padding bg-light">
        <div className="container">
          <div className="contact-container">
            <div className="contact-info">
              <h2 className="section-title">Get in Touch</h2>
              <p>
                Have questions or need a custom solution? Reach out to us, or
                book a demo directly.
              </p>

              <ul className="contact-details">
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{settings?.address || "123 Business Avenue, Tech Hub, NY 10001"}</span>
                </li>

                <li>
                  <i className="fas fa-phone-alt"></i>
                  <span>{settings?.contact_no || "+1 (800) 123-4567"}</span>
                </li>

                <li>
                  <i className="fas fa-envelope"></i>
                  <span>{settings?.email || "support@bookamc.com"}</span>
                </li>
              </ul>

              <div className="social-links">
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

            <div className="contact-form-wrapper" id="book-demo">
              <form
                className="contact-form"
                id="contactForm"
                onSubmit={(e) => e.preventDefault()}
              >
                <h3>Book a Demo / Contact Us</h3>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="service">Interested Service</label>
                  <select id="service" required defaultValue="">
                    <option value="" disabled>
                      Select a Service
                    </option>
                    <option value="fire">Fire Safety</option>
                    <option value="solar">Solar Systems</option>
                    <option value="water">Water Treatment</option>
                    <option value="cctv">CCTV & Security</option>
                    <option value="demo">General Demo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows="4"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;