import React from "react";

const inner = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">

          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                
                <h4 className="mb-sm-0">admin Inner page</h4>

                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <span>inner</span>
                    </li>
                    <li className="breadcrumb-item active">
                     admin Inner page
                    </li>
                  </ol>
                </div>

              </div>
            </div>
          </div>

          {/* inner Content */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5>Welcome to CRM inner 🚀</h5>
                  <p>This is your inner content area.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default inner;