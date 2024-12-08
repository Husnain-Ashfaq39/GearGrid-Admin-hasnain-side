import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
  Button,
} from "reactstrap";
import DeleteModal from "../../../Components/Common/DeleteModal";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import { Link } from "react-router-dom";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { Query } from "appwrite"; // Import the Query from Appwrite
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Lottie and animations
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";

const AboutUsList = () => {
  const [AboutUsList, setAboutUsList] = useState([]);
  const [cursor, setCursor] = useState(null); // State for pagination cursor
  const [hasMore, setHasMore] = useState(true); // State to track if more AboutUs are available
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [aboutusToDelete, setaboutusToDelete] = useState(null);

  const limit = 100; // Set limit to a larger value to fetch more AboutUs

  useEffect(() => {
    const fetchAboutUs = async () => {
      if (!hasMore) return; // If no more AboutUs are available, stop fetching

      try {
        setIsLoading(true);

        const queries = [Query.limit(limit)];
        if (cursor) {
          queries.push(Query.cursorAfter(cursor)); // Pagination handling
        }

        const response = await db.AboutUs.list(queries);
        const AboutUs = response.documents || [];

        if (AboutUs.length < limit) {
          setHasMore(false); // If fetched data is less than limit, we have reached the end
        }

        if (AboutUs.length > 0) {
          setCursor(AboutUs[AboutUs.length - 1].$id); // Set the cursor for the next batch
        }

        setAboutUsList((prev) => [...prev, ...AboutUs]); // Append new AboutUs to the list
      } catch (error) {
        console.error("Failed to fetch AboutUs:", error);
        toast.error("Failed to fetch AboutUs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAboutUs();
  }, [cursor, hasMore]);

  const onClickDelete = (aboutus) => {
    setaboutusToDelete(aboutus);
    setDeleteModal(true);
  };

  const handleDeleteaboutus = async () => {
    if (aboutusToDelete) {
      try {
        if (aboutusToDelete.imageId) {
          await storageServices.images.deleteFile(aboutusToDelete.imageId);
        }
        await db.AboutUs.delete(aboutusToDelete.$id);
        setDeleteModal(false);
        setAboutUsList(AboutUsList.filter((b) => b.$id !== aboutusToDelete.$id));
        toast.success("About Us deleted successfully");
      } catch (error) {
        console.error("Failed to delete About Us:", error);
        toast.error("Failed to delete About Us");
      }
    }
  };

  const getImageURL = (imageId) => {
    if (!imageId) return null;
    const imageUrlResponse = storageServices.images.getFilePreview(imageId);
    return imageUrlResponse.href;
  };

  const columns = useMemo(
    () => [
      { header: "S/N", id: "serialNumber", cell: (info) => info.row.index + 1 },
      {
        header: "Image",
        accessorKey: "imageId",
        id: "image",
        cell: (info) => (
          <img
            src={getImageURL(info.row.original.imageId)}
            alt="About Us"
            className="img-thumbnail"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        ),
      },
      { header: "Title", accessorKey: "title" },
      { header: "Content", accessorKey: "content" },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => {
          const aboutusData = info.row.original;
          return (
            <UncontrolledDropdown>
              <DropdownToggle href="#" className="btn btn-soft-secondary btn-sm" tag="button">
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem tag={Link} to={`/editbanner/${aboutusData.$id}`}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
                </DropdownItem>
                <DropdownItem href="#" onClick={() => onClickDelete(aboutusData)}>
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );

  // Helper function to render loading animation
  const renderLoadingAnimation = () => (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
      <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} loop={true} />
      <div className="mt-3">
        <h5>Loading data!</h5>
      </div>
    </div>
  );

  // Helper function to render no data animation
  const renderNoResultsAnimation = () => (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
      <Lottie animationData={noDataAnimation} style={{ width: 150, height: 150 }} loop={true} />
      <div className="mt-3">
        <h5>No About Us Found.</h5>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteaboutus} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="About Us" pageTitle="About Us" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center">
                <h4 className="card-title mb-0 flex-grow-1">About Us List</h4>
                <div className="flex-shrink-0">
                  {/* Conditionally disable the Add About Us button based on AboutUsList length */}
                  {AboutUsList.length === 0 ? (
                    <Link to="/addbanner" className="btn btn-primary">
                      Add Data
                    </Link>
                  ) : (
                    <Button color="primary" disabled>
                      Add Data
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && AboutUsList.length === 0 ? (
                  // Loading Indicator
                  renderLoadingAnimation()
                ) : AboutUsList && AboutUsList.length > 0 ? (
                  <>
                    <TableContainer
                      columns={columns}
                      data={AboutUsList}
                      // Removed search-related props
                      isGlobalFilter={false}
                      customPageSize={10}
                      divClass="table-responsive mb-1"
                      tableClass="mb-0 align-middle table-borderless"
                      theadClass="table-light text-muted"
                    />
                    {hasMore && (
                      <div className="d-flex justify-content-center mt-3">
                        <Button color="primary" onClick={() => setCursor(cursor)} disabled={isLoading}>
                          {isLoading ? "Loading..." : "Load More"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  // No Data Indicator
                  renderNoResultsAnimation()
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUsList;
