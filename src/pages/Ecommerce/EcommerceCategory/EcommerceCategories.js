import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
} from "reactstrap";
import { Link } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Query } from "appwrite";
import Lottie from "lottie-react"; // Import Lottie component
import loadingAnimation from "../../../assets/animations/loading.json"; // Import loading animation JSON
import searchAnimation from "../../../assets/animations/search.json"; // Import search animation JSON
import axios from "axios";

const EcommerceCategories = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [filteredCategoryList, setFilteredCategoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const limit = 25; // Set the limit for pagination

  // Helper function to safely delete a file with enhanced error handling
  const safeDeleteFile = async (imageId) => {
    try {
      await storageServices.images.deleteFile(imageId);
    } catch (error) {
      if (error.code === "storage_file_not_found") {
        console.warn(`Image with ID ${imageId} not found. Skipping deletion.`);
      } else {
        console.error(`Error deleting image ${imageId}:`, error);
        throw error; // Re-throw other unexpected errors
      }
    }
  };

  // Fetch all categories with pagination
  const fetchAllCategories = async () => {
    

    try {
      setIsLoading(true);
     
      const response = await axios.get('http://localhost:5001/categories/all');
      console.log('categories '+JSON.stringify(response));

      setCategoryList(response);
      setFilteredCategoryList(response);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Function to filter categories based on search input
  const handleSearch = (searchTerm) => {
    const filtered = categoryList.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCategoryList(filtered);
  };

  // Function to get image URL
  const getImageURL = (imageId) => storageServices.images.getFilePreview(imageId);

  // Function to delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      toast.error("No category selected for deletion.");
      return;
    }

    try {
      setIsLoading(true);
      // Delete associated images
      if (categoryToDelete.image && categoryToDelete.image.length > 0) {
        const deleteImagesPromises = categoryToDelete.image.map((imageId) =>
          safeDeleteFile(imageId)
        );
        await Promise.all(deleteImagesPromises);
      }
      // Delete the category
      await db.Categories.delete(categoryToDelete.$id);
      setCategoryList(categoryList.filter((c) => c.$id !== categoryToDelete.$id));
      setFilteredCategoryList(filteredCategoryList.filter((c) => c.$id !== categoryToDelete.$id));
      setDeleteModal(false);
      setCategoryToDelete(null);
      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        header: "Image",
        accessorKey: "image",
        enableColumnFilter: false,
        cell: (cell) => {
          const imageArray = cell.getValue();
          
          return imageArray ? (
            <img
              src={imageArray[0]}
              alt={cell.row.original.name}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          ) : (
            <img
              src="/path/to/default-category-image.jpg" // Replace with your default image path
              alt="Default"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          );
        },
      },
      {
        header: "Category Name",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cell) => (
          <Link
            to={`/apps-ecommerce-edit-category/${cell.row.original.$id}`}
            className="text-body"
          >
            {cell.getValue()}
          </Link>
        ),
      },
      {
        header: "Parent Category",
        accessorKey: "parentCategoryId",
        enableColumnFilter: false,
        cell: (cell) => {
          const parentCategoryId = cell.getValue();
          const parentCategory = categoryList.find((c) => c.$id === parentCategoryId);
          return parentCategory ? parentCategory.name : "Main";
        },
      },
      {
        header: "Description",
        accessorKey: "description",
        enableColumnFilter: false,
        cell: (cell) => <span>{cell.getValue() || "No description."}</span>,
      },
      {
        header: "Action",
        cell: (cell) => (
          <UncontrolledDropdown>
            <DropdownToggle
              href="#"
              className="btn btn-soft-secondary btn-sm"
              tag="button"
            >
              <i className="ri-more-fill" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem
                tag={Link}
                to={`/apps-ecommerce-edit-category/${cell.row.original.$id}`}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCategoryToDelete(cell.row.original);
                  setDeleteModal(true);
                }}
              >
                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        ),
      },
    ],
    [categoryList]
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteCategory}
        onCloseClick={() => {
          setDeleteModal(false);
          setCategoryToDelete(null);
        }}
        requireConfirmation={true}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${
          categoryToDelete?.name
        }" and all its associated subcategories and products?`}
      />

      <Container fluid>
        <BreadCrumb title="Categories" pageTitle="Ecommerce" />
        <Row className="mb-3">
          <Col>
            <Button color="success" tag={Link} to="/apps-ecommerce-add-category">
              <i className="ri-add-line align-bottom me-1"></i> Add Category
            </Button>
          </Col>
          
        </Row>

        <Row>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Categories</h5>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                    <Lottie animationData={loadingAnimation} style={{ width: 100, height: 100 }} loop={true} />
                    <div className="mt-4">
                      <h5>Loading data!</h5>
                    </div>
                  </div>
                ) : filteredCategoryList.length > 0 ? (
                  <TableContainer
                    columns={columns}
                    data={filteredCategoryList}
                    isGlobalFilter={true}
                    customPageSize={10}
                    divClass="table-responsive mb-1"
                    tableClass="mb-0 align-middle table-borderless"
                    theadClass="table-light text-muted"
                    SearchPlaceholder="Search Categories..."
                    globalFilterFn="fuzzy"
                    filterFields={["name", "description"]}
                  />
                ) : (
                  <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                    <Lottie animationData={searchAnimation} style={{ width: 100, height: 100 }} loop={true} />
                    <div className="mt-4">
                      <h5>No categories found</h5>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EcommerceCategories;
