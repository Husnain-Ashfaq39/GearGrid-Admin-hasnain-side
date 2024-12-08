// src/pages/HeroSection/HeroSectionList.js

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

const HeroSectionList = () => {
  const [heroSections, setHeroSections] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [heroToDelete, setHeroToDelete] = useState(null);
  const limit = 100;

  // Function to fetch hero sections
  const fetchHeroSections = async (initial = false) => {
    try {
      setIsLoading(true);
      const queries = [Query.limit(limit)];
      if (cursor && !initial) {
        queries.push(Query.cursorAfter(cursor));
      }

      const response = await db.HeroSection.list(queries);
      const heroes = response.documents || [];

      if (initial && heroes.length === 0) {
        // No hero sections exist, create a default one
        const defaultHero = {
          title: "Default Title",
          subtitle: "Default Subtitle",
          imageId: "", // You can set a default image ID if available
        };
        const createdHero = await db.HeroSection.create(defaultHero);
        heroes.push(createdHero);
        toast.info("No hero sections found. A default hero section has been created.");
      }

      setHeroSections((prev) => [...prev, ...heroes]);

      if (heroes.length < limit) {
        setHasMore(false);
      }

      if (heroes.length > 0) {
        setCursor(heroes[heroes.length - 1].$id);
      }
    } catch (error) {
      console.error("Failed to fetch hero sections:", error);
      toast.error("Failed to fetch hero sections");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize hero sections on mount
  useEffect(() => {
    fetchHeroSections(true);
  }, []);

  // Handle Delete
  const onClickDelete = (hero) => {
    setHeroToDelete(hero);
    setDeleteModal(true);
  };

  const handleDeleteHero = async () => {
    if (heroToDelete) {
      try {
        // Delete associated image if exists
        if (heroToDelete.imageId) {
          await storageServices.images.deleteFile(heroToDelete.imageId);
        }

        // Delete the hero document
        await db.HeroSection.delete(heroToDelete.$id);
        setDeleteModal(false);

        // Remove the deleted hero from the state
        setHeroSections(heroSections.filter((h) => h.$id !== heroToDelete.$id));

        toast.success("Hero section deleted successfully");
      } catch (error) {
        console.error("Failed to delete hero section:", error);
        toast.error("Failed to delete hero section");
      }
    }
  };

  // Get Image URL
  const getImageURL = (imageId) => {
    if (!imageId) return "/path/to/default/image.jpg"; // Return a default image path if no imageId
    const imageUrlResponse = storageServices.images.getFilePreview(imageId);
    return imageUrlResponse.href;
  };

  // Table Columns
  const columns = useMemo(
    () => [
      {
        header: "S/N",
        id: "serialNumber",
        cell: (info) => info.row.index + 1,
      },
      {
        header: "Image",
        accessorKey: "imageId",
        id: "image",
        cell: (info) => (
          <img
            src={getImageURL(info.row.original.imageId)}
            alt="Hero"
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
        header: "Subtitle",
        accessorKey: "subtitle",
      },
      {
        header: "Actions",
        id: "actions",
        cell: (info) => {
          const heroData = info.row.original;
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
                <DropdownItem tag={Link} to={`/edithero/${heroData.$id}`}>
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
                </DropdownItem>
                <DropdownItem href="#" onClick={() => onClickDelete(heroData)}>
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

  const renderLoadingAnimation = () => (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
      <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} loop={true} />
      <div className="mt-3">
        <h5>Loading data!</h5>
      </div>
    </div>
  );

  const renderNoResultsAnimation = () => (
    <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '300px' }}>
      <Lottie animationData={noDataAnimation} style={{ width: 150, height: 150 }} loop={true} />
      <div className="mt-3">
        <h5>No hero sections found.</h5>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteHero}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Container fluid>
        <BreadCrumb title="Hero Sections" pageTitle="Hero Sections" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex align-items-center">
                <h4 className="card-title mb-0 flex-grow-1">Hero Sections List</h4>
                <div className="flex-shrink-0">
                  <Link to="/addhero" className="btn btn-primary">
                    Add Hero Section
                  </Link>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && heroSections.length === 0 ? (
                  renderLoadingAnimation()
                ) : heroSections && heroSections.length > 0 ? (
                  <>
                    <TableContainer
                      columns={columns}
                      data={heroSections}
                      isGlobalFilter={true}
                      customPageSize={10}
                      divClass="table-responsive mb-1"
                      tableClass="mb-0 align-middle table-borderless"
                      theadClass="table-light text-muted"
                      SearchPlaceholder="Search Hero Sections..."
                      globalFilterFn="fuzzy"
                      filterFields={["title", "subtitle"]}
                    />
                    {hasMore && (
                      <div className="d-flex justify-content-center mt-3">
                        <Button
                          color="primary"
                          onClick={() => fetchHeroSections()}
                          disabled={isLoading}
                        >
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

export default HeroSectionList;
