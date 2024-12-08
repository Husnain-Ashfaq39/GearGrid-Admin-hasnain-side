// src/pages/Ecommerce/ProductDetail/EcommerceProductDetail.jsx

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Tooltip,
  Nav,
  NavItem,
  NavLink,
  Row,
  Badge,
  TabContent,
  TabPane,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Swiper, SwiperSlide } from "swiper/react";
import classnames from "classnames";
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json"; // Adjust the path as needed

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for API requests
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Query } from "appwrite"; // Import Query for pagination

// Pricing Widget Component (Displays Price, Stock, etc.)
const PricingWidgetList = ({ pricingDetails }) => {
  return (
    <Col lg={3} sm={6}>
      <div className="p-2 border border-dashed rounded">
        <div className="d-flex align-items-center">
          <div className="avatar-sm me-2">
            <div
              className={`avatar-title rounded bg-transparent text-${pricingDetails.color} fs-24`}
            >
              <i className={pricingDetails.icon}></i>
            </div>
          </div>
          <div className="flex-grow-1">
            <p className="text-muted mb-1">{pricingDetails.label} :</p>
            <h5 className="mb-0">{pricingDetails.labelDetail}</h5>
          </div>
        </div>
      </div>
    </Col>
  );
};

const EcommerceProductDetail = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  // State variables
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [customActiveTab, setCustomActiveTab] = useState("1");
  const [tooltips, setTooltips] = useState({
    edit: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Added isLoading state
  const [fetchError, setFetchError] = useState(""); // Added fetchError state

  // Function to fetch all categories with pagination
  const fetchAllCategories = async () => {
    let allCategories = [];
    let offset = 0;
    let fetchedCategories = [];
    const limit = 100; // Adjust the limit as needed

    try {
     
        // Fetch categories with pagination using Query.limit() and Query.offset()
        const response = await axios.get('http://localhost:5001/categories/all');
        console.log('categories '+JSON.stringify(response));

     

      setCategories(response);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setFetchError("Failed to fetch categories. Please try again later.");
      toast.error("Failed to fetch categories.");
      setCategories([]);
    }
  };

  // Fetch product details and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Start loading

        // Fetch all categories with pagination
        await fetchAllCategories();

        // Fetch product data using custom API
        const productResponse = await axios.get(`http://localhost:5001/api/products/${id}`);
        console.log('product '+JSON.stringify(productResponse));
        
        const productData = {
          ...productResponse,
          price: parseFloat(productResponse.price),
          discountPrice: productResponse.discountPrice
            ? parseFloat(productResponse.discountPrice)
            : null,
          stockQuantity: parseInt(productResponse.stockQuantity, 10),
          isOnSale: Boolean(productResponse.isOnSale),
          // Remove wholesalePrice as it's deprecated
          tags: productResponse.tags || [],
          images: productResponse.images || [],
          taxExclusivePrice: parseFloat(productResponse.taxExclusivePrice) || null,
          tax: parseFloat(productResponse.tax) || 0,
          minimumPurchaseQuantity: parseInt(productResponse.minimumPurchaseQuantity, 10) || null,
          lowStockAlert: parseInt(productResponse.lowStockAlert, 10) || null,
        };
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchData();
  }, [id]);

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.$id === categoryId);
    return category ? category.name : "Unknown";
  };

 

  // Toggle active tab
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setCustomActiveTab(tab);
    }
  };

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/apps-ecommerce-edit-product/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Product Details" pageTitle="Ecommerce" />
          <div className="py-5 text-center">
            <Lottie
              animationData={loadingAnimation}
              style={{ width: 200, height: 200, margin: "0 auto" }}
            />
            <div className="mt-4">
              <h5>Loading Product Details...</h5>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // If product data is not available after loading
  if (!product) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Product Details" pageTitle="Ecommerce" />
          <div className="py-5 text-center">
            <h5 className="text-danger">Product not found.</h5>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Product Details" pageTitle="Ecommerce" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row className="gx-lg-5">
                  {/* Product Image Slider */}
                  <Col xl={4} md={8} className="mx-auto">
                    <div className="product-img-slider sticky-side-div">
                      <Swiper
                        navigation={true}
                        thumbs={{ swiper: thumbsSwiper }}
                        modules={[FreeMode, Navigation, Thumbs]}
                        className="swiper product-thumbnail-slider p-2 rounded bg-light"
                      >
                        {product.images && product.images.length > 0 ? (
                          product.images.map((imageurl, key) => (
                            <SwiperSlide key={key}>
                              <img
                                src={imageurl}
                                alt={product.name}
                                className="img-fluid d-block"
                              />
                            </SwiperSlide>
                          ))
                        ) : (
                          <SwiperSlide>
                            <img
                              src="/path/to/default-image.jpg" // Replace with your default image path
                              alt="Default Product"
                              className="img-fluid d-block"
                            />
                          </SwiperSlide>
                        )}
                      </Swiper>

                      {/* Thumbnail Slider */}
                      <div className="product-nav-slider mt-2">
                        <Swiper
                          onSwiper={setThumbsSwiper}
                          slidesPerView={4}
                          freeMode={true}
                          watchSlidesProgress={true}
                          spaceBetween={10}
                          modules={[FreeMode, Navigation, Thumbs]}
                          className="swiper product-nav-slider mt-2 overflow-hidden"
                        >
                          {product.images && product.images.length > 0 ? (
                            product.images.map((imageurl, key) => (
                              <SwiperSlide key={key} className="rounded">
                                <div className="nav-slide-item">
                                  <img
                                    src={imageurl}
                                    alt={`${product.name} Thumbnail ${key + 1}`}
                                    className="img-fluid d-block rounded"
                                  />
                                </div>
                              </SwiperSlide>
                            ))
                          ) : (
                            <SwiperSlide className="rounded">
                              <div className="nav-slide-item">
                                <img
                                  src="/path/to/default-image.jpg" // Replace with your default image path
                                  alt="Default Thumbnail"
                                  className="img-fluid d-block rounded"
                                />
                              </div>
                            </SwiperSlide>
                          )}
                        </Swiper>
                      </div>
                    </div>
                  </Col>

                  {/* Product Details */}
                  <Col xl={8}>
                    <div className="mt-xl-0 mt-5">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h4>{product.name}</h4>
                        </div>
                        <div className="flex-shrink-0">
                          <Tooltip
                            placement="top"
                            isOpen={tooltips.edit}
                            target="TooltipEdit"
                            toggle={() =>
                              setTooltips((prev) => ({
                                ...prev,
                                edit: !prev.edit,
                              }))
                            }
                          >
                            Edit
                          </Tooltip>
                          <button
                            id="TooltipEdit"
                            className="btn btn-light"
                            onClick={handleEdit}
                          >
                            <i className="ri-pencil-fill align-bottom"></i>
                          </button>
                        </div>
                      </div>

                      {/* Pricing and Stock Info */}
                      <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                        <div className="text-muted fs-16">
                          {/* Display stars based on averageRating */}
                          {product.averageRating && (
                            <>
                              {Array.from({ length: 5 }, (_, index) => (
                                <i
                                  key={index}
                                  className={
                                    index < Math.floor(product.averageRating)
                                      ? "mdi mdi-star text-warning"
                                      : index < product.averageRating
                                      ? "mdi mdi-star-half text-warning"
                                      : "mdi mdi-star-outline text-warning"
                                  }
                                ></i>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pricing Widgets */}
                      <Row className="mt-4">
                        {/* Price */}
                        <PricingWidgetList
                          pricingDetails={{
                            icon: "ri-price-tag-line",
                            label: "Price",
                            labelDetail: product.price != null ? `£${product.price.toFixed(2)}` : "N/A",
                            color: "success",
                          }}
                        />
                        {/* Discount Price */}
                        {product.discountPrice && (
                          <PricingWidgetList
                            pricingDetails={{
                              icon: "ri-price-tag-3-line",
                              label: "Discount",
                              labelDetail: `£${product.discountPrice.toFixed(2)}`,
                              color: "danger",
                            }}
                          />
                        )}
                        {/* Stock Quantity */}
                        <PricingWidgetList
                          pricingDetails={{
                            icon: "ri-archive-line",
                            label: "Stock",
                            labelDetail: product.stockQuantity != null ? product.stockQuantity : "N/A",
                            color: "info",
                          }}
                        />
                        {/* On Sale Status */}
                        <PricingWidgetList
                          pricingDetails={{
                            icon: "ri-percent-line",
                            label: "On Sale",
                            labelDetail: product.isOnSale != null ? (product.isOnSale ? "Yes" : "No") : "N/A",
                            color: product.isOnSale ? "warning" : "secondary",
                          }}
                        />
                      
                      </Row>

                      {/* Tags */}
                      <div className="mt-4">
                        <h5 className="fs-14">Tags:</h5>
                        <div className="d-flex flex-wrap gap-2">
                          {product.tags && product.tags.length > 0 ? (
                            product.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                color="secondary"
                                className="fs-12"
                              >
                                {tag.trim()}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted">
                              No tags available.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-4 text-muted">
                        <h5 className="fs-14">Description:</h5>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        ></p>
                      </div>

                      {/* Detailed Description Tabs */}
                      <div className="product-content mt-5">
                        <h5 className="fs-14 mb-3">Product Details:</h5>
                        <Nav tabs className="nav-tabs-custom nav-success">
                          <NavItem>
                            <NavLink
                              style={{ cursor: "pointer" }}
                              className={classnames({
                                active: customActiveTab === "1",
                              })}
                              onClick={() => {
                                toggleCustom("1");
                              }}
                            >
                              Specification
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              style={{ cursor: "pointer" }}
                              className={classnames({
                                active: customActiveTab === "2",
                              })}
                              onClick={() => {
                                toggleCustom("2");
                              }}
                            >
                              Additional Details
                            </NavLink>
                          </NavItem>
                        </Nav>

                        <TabContent
                          activeTab={customActiveTab}
                          className="border border-top-0 p-4"
                          id="nav-tabContent"
                        >
                          <TabPane id="nav-speci" tabId="1">
                            <div className="table-responsive">
                              <table className="table mb-0">
                                <tbody>
                                  <tr>
                                    <th scope="row" style={{ width: "200px" }}>
                                      Category
                                    </th>
                                    <td>{getCategoryName(product.categoryId)}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Price (Inc. Tax)</th>
                                    <td>{product.price != null ? `£${product.price.toFixed(2)}` : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Tax Exclusive Price</th>
                                    <td>{product.taxExclusivePrice != null ? `£${product.taxExclusivePrice.toFixed(2)}` : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Tax (%)</th>
                                    <td>{product.tax != null ? `${product.tax}%` : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Barcode</th>
                                    <td>{product.barcode || 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Discounted Price</th>
                                    <td>{product.discountPrice != null ? `£${product.discountPrice.toFixed(2)}` : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">Stock Quantity</th>
                                    <td>{product.stockQuantity != null ? product.stockQuantity : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <th scope="row">On Sale</th>
                                    <td>{product.isOnSale != null ? (product.isOnSale ? "Yes" : "No") : 'N/A'}</td>
                                  </tr>
                                 
                                  {product.isWholesaleProduct && (
                                    <tr>
                                      <th scope="row">Minimum Purchase Quantity</th>
                                      <td>{product.minimumPurchaseQuantity || 'N/A'}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <th scope="row">Low Stock Alert Threshold</th>
                                    <td>
                                      {product.lowStockAlert 
                                        ? `${product.lowStockAlert} units`
                                        : "Default (20 units)"}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </TabPane>
                          <TabPane id="nav-detail" tabId="2">
                            <div>
                              <h5 className="font-size-16 mb-3">{product.name}</h5>
                              <p
                                dangerouslySetInnerHTML={{
                                  __html: product.description,
                                }}
                              ></p>
                              {/* Additional Details can be added here if available */}
                            </div>
                          </TabPane>
                        </TabContent>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EcommerceProductDetail;
