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
import { Query } from "appwrite";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Lottie and animations
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";

const TestimonialsList = () => {
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);

  const limit = 100;

  useEffect(() => {
    const fetchTestimonials = async () => {
      if (!hasMore) return;

      try {
        setIsLoading(true);
        const queries = [Query.limit(limit)];
        if (cursor) {
          queries.push(Query.cursorAfter(cursor));
        }

        const response = await db.testimonials.list(queries);
        const testimonials = response.documents || [];

        if (testimonials.length < limit) {
          setHasMore(false);
        }

        if (testimonials.length > 0) {
          setCursor(testimonials[testimonials.length - 1].$id);
        }

        setTestimonialsList((prev) => [...prev, ...testimonials]);

      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        toast.error("Failed to fetch testimonials");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [cursor, hasMore]);

  const onClickDelete = (testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteModal(true);
  };

  const handleDeleteTestimonial = async () => {
    if (testimonialToDelete) {
      try {
        if (testimonialToDelete.profilePicId) {
          await storageServices.images.deleteFile(testimonialToDelete.profilePicId);
        }
        if (testimonialToDelete.imageId) {
          await storageServices.images.deleteFile(testimonialToDelete.imageId);
        }
        await db.testimonials.delete(testimonialToDelete.$id);
        setDeleteModal(false);
        setTestimonialsList(testimonialsList.filter((t) => t.$id !== testimonialToDelete.$id));
        toast.success("Testimonial deleted successfully");
      } catch (error) {
        console.error("Failed to delete testimonial:", error);
        toast.error("Failed to delete testimonial");
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
        header: "Profile Picture",
        accessorKey: "profilePicId",
        id: "profilePicture",
        cell: (info) => (
          <img
            src={getImageURL(info.row.original.profilePicId)}
            alt="Profile Pic"
            className="img-thumbnail"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        ),
      },
      {
        header: "Additional Image",
        accessorKey: "imageId",
        id: "image",
        cell: (info) => (
          <img
            src={getImageURL(info.row.original.imageId)}
            alt="Additional"
            className="img-thumbnail"
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        ),
      },
      { header: "Name", accessorKey: "name" },
      { header: "Position", accessorKey: "position" },
      { header: "Content", accessorKey: "content" },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => {
          const testimonialData = info.row.original;
          return (
            <UncontrolledDropdown>
              <DropdownToggle href="#" className="btn btn-soft-secondary btn-sm" tag="button">
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem tag={Link} to={`/edittestimonial/${testimonialData.$id}`}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
                </DropdownItem>
                <DropdownItem href="#" onClick={() => onClickDelete(testimonialData)}>
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
        <h5>No Testimonials Found.</h5>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal show={deleteModal} onDeleteClick={handleDeleteTestimonial} onCloseClick={() => setDeleteModal(false)} />
      <Container fluid>
        <BreadCrumb title="Testimonials" pageTitle="Testimonials" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center">
                <h4 className="card-title mb-0 flex-grow-1">Testimonials List</h4>
                <div className="flex-shrink-0">
                  <Link to="/addtestimonial" className="btn btn-primary">
                    Add Testimonial
                  </Link>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && testimonialsList.length === 0 ? (
                  // Loading Indicator
                  renderLoadingAnimation()
                ) : testimonialsList && testimonialsList.length > 0 ? (
                  <>
                    <TableContainer
                      columns={columns}
                      data={testimonialsList}
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

export default TestimonialsList;
