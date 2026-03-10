import DataTable from "react-data-table-component";
import useExcelDownload from "../../hooks/useExcelDownload"; // Import Excel download hook
import useSearch from "../../hooks/useSearch"; // Import search hook
import useToast from "../../hooks/useToast";
import useCrud from "../../hooks/useCrud";

import { CATEGORY_URL } from "../../services/endpoints"; // CHANGED: LOCATION_URL to CATEGORY_URL
import { useEffect, useState } from "react";

const Inner = () => {
 // Local state for form inputs (since we're not using useForm hook yet)
 const { toastRef, showToast } = useToast();
  const { get, post, put, delete: del, loading, error } = useCrud(CATEGORY_URL); // CHANGED: LOCATION_URL to CATEGORY_URL
  const [data, setData] = useState([]);
  
  const [formData, setFormData] = useState({
  name: '',
  parent: ''
});



// 🔥 Convert flat list to tree
const buildTree = (items, parentId = null, level = 0) => {
  return items
    .filter(item => item.parent_id === parentId)
    .flatMap(item => [
      { ...item, level },
      ...buildTree(items, item.id, level + 1)
    ]);
};

  const nestedCategories = buildTree(data);


const [editId, setEditId] = useState(null);

const parentOptions = [
  ...new Map(
    data
      .filter(item => item.parent_id !== null)
      .map(item => [
        item.parent_id,
        { id: item.parent_id, name: item.parent_name }
      ])
  ).values()
];


  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await get(""); // ✅ correct
        setData(response.data); // adjust if needed
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    fetchLocations();
  }, [get]);


  // ========== CUSTOM HOOKS INITIALIZATION ==========
  const downloadExcel = useExcelDownload(); // Initialize Excel download hook
  const { searchTerm, setSearchTerm, filteredData } = useSearch(data, ['name', 'parent_name']);

  // ========== TABLE COLUMNS DEFINITION ==========
  
  const columns = [
    {
      name: "ID", // Column header
      selector: (row) => row.id, // Which data to show
      sortable: true, // Enable sorting
      width: "80px", // Column width
    },
    {
      name: "Category Name", // CHANGED: "Location Name" to "Category Name"
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Parent Category", // CHANGED: "Parent Location" to "Parent Category"
      selector: (row) => row.parent_name,
      sortable: true,
    },
    {
      name: "Action", // Action buttons column
      cell: (row) => (
        <div className="d-flex gap-2">
          {/* Edit button - passes current row data */}
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          {/* Delete button - passes row id */}
          <button 
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // ========== EVENT HANDLERS ==========
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission (Add new category)
    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        if (editId) {
          // UPDATE
          await put(`/${editId}`, {
            name: formData.name,
            parent_id: formData.parent || null
          });

          showToast("Category updated successfully!", "success"); // CHANGED: Location to Category
        } else {
          // ADD
          await post("", {
            name: formData.name,
            parent_id: formData.parent || null
          });

         showToast("Category added successfully!", "success"); // CHANGED: Location to Category
        }

        // Refetch fresh list
        const response = await get("");
        setData(response.data);

        // Reset form
        setFormData({ name: "", parent: "" });
        setEditId(null);

      } catch (err) {
        console.error("Save failed:", err);
      }
    };

  // Handle edit button click
const handleEdit = (row) => {
  setFormData({
    name: row.name,
    parent: row.parent_id || ""
  });

  setEditId(row.id);
};

  // Handle delete button click
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this category?")) { // CHANGED: location to category
    return;
  }

  try {
    await del(`/${id}`);

    showToast("Category deleted successfully!", "danger"); // CHANGED: Location to Category

    // Refetch updated list
    const response = await get("");
    setData(response.data);

  } catch (err) {
    console.error("Delete failed:", err);
  }
};




  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          
          {/* ========== PAGE HEADER SECTION ========== */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
                <h4 className="mb-sm-0">Category Master</h4> {/* CHANGED: Location Master to Category Master */}
                <div className="page-title-right">
                  <ol className="breadcrumb m-0">
                    <li className="breadcrumb-item">
                      <span>Home</span>
                    </li>
                    <li className="breadcrumb-item active">Category Management</li> {/* CHANGED: Location to Category */}
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            
            {/* ========== LEFT SIDE - FORM SECTION ========== */}
            <div className="col-lg-3">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0">{editId ? "Update Category" : "Save Category"}</h5> {/* CHANGED: Location to Category */}
                </div>
                <div className="card-body">
                  {/* Form with submit handler */}
                  <form onSubmit={handleSubmit}>
                    {/* Category Name Input */}
                    <div className="mb-3">
                      <label className="form-label">Category Name</label> {/* CHANGED: Location to Category */}
                      <input
                        type="text"
                        name="name" // Matches state key
                        className="form-control"
                        placeholder="Enter category name" // CHANGED: location to category
                        value={formData.name}
                        onChange={handleInputChange}
                        required // Makes field mandatory
                      />
                    </div>
                    
                    {/* Parent Category Dropdown */}
                    <div className="mb-3">
                      <label className="form-label">Parent Category</label> {/* CHANGED: Location to Category */}
                      <select
                          name="parent"
                          className="form-control"
                          value={formData.parent}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Parent</option>

                          {nestedCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {"— ".repeat(cat.level) + cat.name}
                            </option>
                          ))}
                        </select>
                    </div>
                    
                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100">
                       {editId ? "Update Category" : "Save Category"} {/* CHANGED: Location to Category */}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* ========== RIGHT SIDE - TABLE SECTION ========== */}
            <div className="col-lg-9">
              <div className="card shadow-sm">
                
                {/* Table Header with Search and Download */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Category List ({filteredData.length} items)</h5> {/* CHANGED: Location to Category */}
                  <div className="d-flex gap-2">
                    
                    {/* EXCEL DOWNLOAD BUTTON */}
                    {/* Uses the custom hook - downloads only filtered data */}
                    <button
                      className="btn btn-success"
                      onClick={() => downloadExcel(filteredData, 'categories')} // CHANGED: locations to categories
                    >
                      <i className="ri-download-2-line me-1"></i>
                      Download Excel
                    </button>

                    {/* SEARCH INPUT */}
                    {/* Uses search hook - updates searchTerm and filters data automatically */}
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: "250px" }}
                      placeholder="Search by name or parent..."
                      value={searchTerm} // From search hook
                      onChange={(e) => setSearchTerm(e.target.value)} // From search hook
                    />
                  </div>
                </div>

                {/* TABLE BODY */}
                <div className="card-body">
                  {loading && <p>Loading...</p>}
                  {error && <p className="text-danger">{error}</p>}
                  <DataTable
                    columns={columns} // Column definitions
                    data={filteredData} // Filtered data from search hook
                    pagination // Enable pagination
                    highlightOnHover // Highlight row on hover
                    striped // Alternate row colors
                    responsive // Make responsive
                    persistTableHead // Keep header visible
                    noDataComponent="No categories found" // CHANGED: locations to categories
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
  <div
    ref={toastRef}
    className="toast align-items-center text-bg-success border-0"
    role="alert"
  >
    <div className="d-flex">
      <div className="toast-body">
        Message
      </div>
      <button
        type="button"
        className="btn-close btn-close-white me-2 m-auto"
        data-bs-dismiss="toast"
      ></button>
    </div>
  </div>
</div>

    </div>

  );
};

export default Inner;