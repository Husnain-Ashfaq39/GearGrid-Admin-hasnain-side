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

const BlogsList = () => {
  const [blogsList, setBlogsList] = useState([]);
  const [cursor, setCursor] = useState(null); // State for pagination cursor
  const [hasMore, setHasMore] = useState(true); // State to track if more blogs are available
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const limit = 100; // Set limit to a larger value to fetch more blogs

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!hasMore) return; // If no more blogs are available, stop fetching

      try {
        setIsLoading(true);

        const queries = [Query.limit(limit)];
        if (cursor) {
          queries.push(Query.cursorAfter(cursor)); // Pagination handling
        }

        const response = await db.blogs.list(queries);
        const blogs = response.documents || [];

        if (blogs.length < limit) {
          setHasMore(false); // If fetched data is less than limit, we have reached the end
        }

        if (blogs.length > 0) {
          setCursor(blogs[blogs.length - 1].$id); // Set the cursor for the next batch
        }

        setBlogsList((prev) => [...prev, ...blogs]); // Append new blogs to the list

      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        toast.error("Failed to fetch blogs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [cursor, hasMore]);

  // Function to handle delete
  const onClickDelete = (blog) => {
    setBlogToDelete(blog);
    setDeleteModal(true);
  };

  const handleDeleteBlog = async () => {
    if (blogToDelete) {
      try {
        // Delete associated image
        if (blogToDelete.imageUrl) {
          await storageServices.images.deleteFile(blogToDelete.imageUrl);
        }

        // Delete the blog document
        await db.blogs.delete(blogToDelete.$id);
        setDeleteModal(false);

        // Remove the deleted blog from the state
        setBlogsList(blogsList.filter((b) => b.$id !== blogToDelete.$id));

        toast.success("Blog deleted successfully");
      } catch (error) {
        console.error("Failed to delete blog:", error);
        toast.error("Failed to delete blog");
      }
    }
  };

  // Function to get image URL
  const getImageURL = (imageId) => {
    if (!imageId) return null;
    const imageUrlResponse = storageServices.images.getFilePreview(imageId);
    return imageUrlResponse.href;
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "S/N",
        id: "serialNumber",
        cell: (info) => info.row.index + 1,
      },
      {
        header: "Image",
        accessorKey: "imageUrl",
        id: "image",
        cell: (info) => (
          <img
            src={getImageURL(info.row.original.imageUrl)}
            alt="Image"
            className="img-thumbnail"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
        ),
      },
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Author",
        accessorKey: "author",
      },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => {
          const blogData = info.row.original;
          return (
            <UncontrolledDropdown>
              <DropdownToggle
                href="#"
                className="btn btn-soft-secondary btn-sm"
                tag="button"
              >
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem tag={Link} to={`/editblog/${blogData.$id}`}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                  Edit
                </DropdownItem>
                <DropdownItem href="#" onClick={() => onClickDelete(blogData)}>
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    []
  );

  const renderLoadingAnimation = () => (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
      <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} loop={true} />
      <div className="mt-3">
        <h5>Loading data!</h5>
      </div>
    </div>
  );

  // Helper to render No Results Animation
  const renderNoResultsAnimation = () => (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
      <Lottie animationData={noDataAnimation} style={{ width: 150, height: 150 }} loop={true} />
      <div className="mt-3">
        <h5>No blogs found.</h5>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteBlog}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Container fluid>
        <BreadCrumb title="News" pageTitle="News" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center">
                <h4 className="card-title mb-0 flex-grow-1">News List</h4>
                <div className="flex-shrink-0">
                  <Link to="/addblog" className="btn btn-primary">
                    Add News
                  </Link>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && blogsList.length === 0 ? (
                  // Loading Indicator
                  renderLoadingAnimation()
                ) : blogsList && blogsList.length > 0 ? (
                  <>
                    <TableContainer
                      columns={columns}
                      data={blogsList}
                      isGlobalFilter={true}
                      customPageSize={10}
                      divClass="table-responsive mb-1"
                      tableClass="mb-0 align-middle table-borderless"
                      theadClass="table-light text-muted"
                      SearchPlaceholder="Search News..."
                      globalFilterFn="fuzzy"
                      filterFields={["title", "author"]}
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

export default BlogsList;
