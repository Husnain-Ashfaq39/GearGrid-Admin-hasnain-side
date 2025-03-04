// src/pages/Ecommerce/EcommerceProducts.js

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
  Col,
  Label,
  Input,
  Button, // Import Button from reactstrap
} from "reactstrap";
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import DeleteModal from "../../../Components/Common/DeleteModal";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import { Link } from "react-router-dom";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loading from "../../../assets/animations/loading.json";
import search from "../../../assets/animations/search.json";
import Lottie from "lottie-react";
import axios from "axios";

const EcommerceProducts = () => {
  // State variables
  const [productList, setProductList] = useState([]);
  const [filteredProductList, setFilteredProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [priceSliderRange, setPriceSliderRange] = useState({
    min: 0,
    max: 1000,
  });
  const [isOnSaleFilter, setIsOnSaleFilter] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [dele, setDele] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch all products with pagination
  const fetchAllProducts = async () => {
    try {
      let response = await axios.get('http://localhost:5001/api/products/all');
      response=response.products;
      
      const products = response.map((product) => ({
        ...product,
        price: parseFloat(product.price),
        isOnSale: Boolean(product.isOnSale),
      }));
      setProductList(products);
      return products;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all categories with pagination
  const fetchAllCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5001/categories/all');
      setCategories(response);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (productList.length > 0) {
      // Compute min and max prices
      const prices = productList.map((product) => product.price);
      let minPrice = Math.min(...prices);
      let maxPrice = Math.max(...prices);

      // Handle cases when min and max prices are equal or invalid
      if (!isFinite(minPrice) || !isFinite(maxPrice)) {
        minPrice = 0;
        maxPrice = 1000;
      } else if (minPrice === maxPrice) {
        // Adjust maxPrice to be greater than minPrice
        maxPrice = minPrice + 100;
      }

      setPriceRange({ min: minPrice, max: maxPrice });
      setPriceSliderRange({ min: minPrice, max: maxPrice });

      // Initialize minCost and maxCost inputs
      const minCostInput = document.getElementById("minCost");
      const maxCostInput = document.getElementById("maxCost");
      if (minCostInput && maxCostInput) {
        minCostInput.value = minPrice;
        maxCostInput.value = maxPrice;
      }
    }
  }, [productList]);

  // Filter products whenever filters change
  useEffect(() => {
    filterProducts();
  }, [productList, categoryFilter, priceRange, isOnSaleFilter]);

  // Function to get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Function to filter products based on active filters
  const filterProducts = () => {
    let filtered = productList;

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.categoryId === categoryFilter);
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

    // On Sale filter
    if (isOnSaleFilter) {
      filtered = filtered.filter((product) => product.isOnSale === true);
    }

    setFilteredProductList(filtered);
  };

  // Function to handle category filter change
  const categoriesFilter = (categoryId) => {
    setCategoryFilter(categoryId);
  };

  // Function to handle price range slider update
  const onUpdate = (values) => {
    const minCost = parseFloat(values[0]);
    const maxCost = parseFloat(values[1]);

    const minCostInput = document.getElementById("minCost");
    const maxCostInput = document.getElementById("maxCost");
    if (minCostInput && maxCostInput) {
      minCostInput.value = minCost;
      maxCostInput.value = maxCost;
    }

    setPriceRange({ min: minCost, max: maxCost });
  };

  // Function to handle deletion of a single product
  const onClickDelete = (product) => {
    setProductToDelete(product);
    setDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
      

        // Delete the product document
        await axios.delete(`http://localhost:5001/api/products/delete/${productToDelete._id}`);
        setDeleteModal(false);

        // Remove the deleted product from the state
        setProductList(productList.filter((p) => p.$id !== productToDelete.$id));

        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  // Function to handle display of the bulk delete option
  const displayDelete = () => {
    const ele = document.querySelectorAll(".productCheckBox:checked");
    const del = document.getElementById("selection-element");
    setDele(ele.length);
    if (ele.length === 0) {
      del.style.display = "none";
    } else {
      del.style.display = "block";
    }
  };

  // Function to handle deletion of multiple products
  const deleteMultiple = async () => {
    const ele = document.querySelectorAll(".productCheckBox:checked");
    const del = document.getElementById("selection-element");
    try {
      await Promise.all(
        Array.from(ele).map(async (element) => {
          const productId = element.value;
          const product = productList.find((p) => p.$id === productId);

          // Delete associated images
          if (product && product.images && product.images.length > 0) {
            await Promise.all(
              product.images.map(async (imageId) => {
                await storageServices.images.deleteFile(imageId);
              })
            );
          }

          // Delete the product
          await db.Products.delete(productId);
        })
      );
      // Remove the deleted products from the state
      const deletedIds = Array.from(ele).map((element) => element.value);
      setProductList(productList.filter((p) => !deletedIds.includes(p.$id)));
      del.style.display = "none";
      setDele(0);
      setDeleteModalMulti(false);

      toast.success("Selected products deleted successfully");
    } catch (error) {
      console.error("Failed to delete products:", error);
      toast.error("Failed to delete selected products");
    }
  };

  // Function to convert JSON to CSV
  const convertToCSV = (data) => {
    // Define the headers you want in the CSV
    const headers = [
      "$id",
      "name",
      "barcode",
      "category",
      "price",
      "isOnSale",
      "stockQuantity",
      "images",
      "tags",
      "description",
      "discountPrice",
      "taxExclusivePrice",
      "tax",
      "bannerLabel",
      // Add any other fields you need
    ];

    // Map the data to include necessary transformations
    const rows = data.map((product) => ({
      "$id": product._id,
      "name": product.name,
      "barcode": product.barcode,
      "category": product.categoryId,
      "price": product.price,
      "isOnSale": product.isOnSale ? "Yes" : "No",
     
      "stockQuantity": product.stockQuantity,
      "images": product.images? product.images[0]
        : "No Images",
      "tags": product.tags && product.tags.length > 0
        ? product.tags.join("; ")
        : "No Tags",
      "description": product.description || "No Description",
      "discountPrice": product.discountPrice ? `£${product.discountPrice}` : "No Discount",
      "taxExclusivePrice": product.taxExclusivePrice ? `£${product.taxExclusivePrice}` : "N/A",
      "tax": product.tax ? `${product.tax}%` : "N/A",
      "bannerLabel": product.bannerLabel || "N/A",
      // Add other fields as needed
    }));

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...rows.map((row) =>
        headers
          .map((fieldName) => {
            let field = row[fieldName];
            if (typeof field === "string") {
              // Escape double quotes by replacing " with ""
              field = field.replace(/"/g, '""');
              // If field contains comma, newline, or double quotes, wrap it in double quotes
              if (field.search(/("|,|\n)/g) >= 0) {
                field = `"${field}"`;
              }
            }
            return field;
          })
          .join(",")
      ),
    ].join("\r\n");

    return csvContent;
  };

  // Function to trigger CSV download
  const exportToCSV = () => {
    if (filteredProductList.length === 0) {
      toast.warn("No products to export");
      return;
    }

    const csv = convertToCSV(filteredProductList);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Create a link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "$id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (cell) => {
          return (
            <input
              type="checkbox"
              className="productCheckBox form-check-input"
              value={cell.getValue()}
              onClick={() => displayDelete()}
            />
          );
        },
      },
      {
        header: "Product",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cell) => (
          <>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm bg-light rounded p-1">
                  {cell.row.original.images && cell.row.original.images.length > 0 ? (
                    <img
                      src={cell.row.original.images[0]}
                      alt=""
                      className="img-fluid d-block"
                    />
                  ) : (
                    <img
                      src="/path/to/default-image.jpg" // Provide a default image path
                      alt="Default"
                      className="img-fluid d-block"
                    />
                  )}
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="fs-14 mb-1">
                  <Link
                    to={`/apps-ecommerce-product-details/${cell.row.original._id}`}
                    className="text-body"
                  >
                    {cell.getValue()}
                  </Link>
                </h5>
                <p className="text-muted mb-0">
                  Category:{" "}
                  <span className="fw-medium">
                    {getCategoryName(cell.row.original.categoryId)}
                  </span>
                </p>
                <p className="text-muted mb-0">
                  Barcode:{" "}
                  <span className="fw-medium">
                    {cell.row.original.barcode || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </>
        ),
      },
      {
        header: "Barcode",
        accessorKey: "barcode",
        enableColumnFilter: false,
        cell: (cell) => <>{cell.getValue() || "N/A"}</>,
      },
      
      {
        header: "Stock",
        accessorKey: "stockQuantity",
        enableColumnFilter: false,
        cell: (cell) => <>{cell.getValue()}</>,
      },
      {
        header: "Price",
        accessorKey: "price",
        enableColumnFilter: false,
        cell: (cell) => {
          return <>£{cell.getValue()}</>;
        },
      },
      {
        header: "Action",
        cell: (cell) => {
          return (
            <UncontrolledDropdown>
              <DropdownToggle
                href="#"
                className="btn btn-soft-secondary btn-sm"
                tag="button"
              >
                <i className="ri-more-fill" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end" >
              <DropdownItem
                  href={`/apps-ecommerce-edit-product/${cell.row.original._id}`}
                >
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
                </DropdownItem>

                <DropdownItem
                  href={`/apps-ecommerce-product-details/${cell.row.original._id}`}
                >
                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i> View
                </DropdownItem>

                <DropdownItem divider />
                <DropdownItem
                  href="#"
                  onClick={() => {
                    const productData = cell.row.original;
                    onClickDelete(productData);
                  }}
                >
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          );
        },
      },
    ],
    [categories]
  );

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteProduct}
        onCloseClick={() => setDeleteModal(false)}
      />
      <DeleteModal
        show={deleteModalMulti}
        onDeleteClick={deleteMultiple}
        onCloseClick={() => setDeleteModalMulti(false)}
      />
      <Container fluid>
        <BreadCrumb title="Products" pageTitle="Ecommerce" />

        <Row>
          <Col xl={3} lg={4}>
            <Card>
              <CardHeader>
                <div className="d-flex mb-3">
                  <div className="flex-grow-1">
                    <h5 className="fs-16">Filters</h5>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      to="#"
                      className="text-decoration-underline"
                      onClick={() => {
                        setCategoryFilter("all");
                        setPriceRange({
                          min: priceSliderRange.min,
                          max: priceSliderRange.max,
                        });
                        setIsOnSaleFilter(false);
                        const minCostInput = document.getElementById("minCost");
                        const maxCostInput = document.getElementById("maxCost");
                        if (minCostInput && maxCostInput) {
                          minCostInput.value = priceSliderRange.min;
                          maxCostInput.value = priceSliderRange.max;
                        }
                      }}
                    >
                      Clear All
                    </Link>
                  </div>
                </div>
              </CardHeader>

              {/* Categories Filter */}
              <div className="card-body border-bottom">
                <p className="text-muted text-uppercase fs-12 fw-medium mb-2">
                  Categories
                </p>
                <ul className="list-unstyled mb-0 filter-list">
                  <li>
                    <Link
                      to="#"
                      className={
                        categoryFilter === "all"
                          ? "active d-flex py-1 align-items-center"
                          : "d-flex py-1 align-items-center"
                      }
                      onClick={() => categoriesFilter("all")}
                    >
                      <div className="flex-grow-1">
                        <h5 className="fs-13 mb-0 listname">All</h5>
                      </div>
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.$id}>
                      <Link
                        to="#"
                        className={
                          categoryFilter === category.$id
                            ? "active d-flex py-1 align-items-center"
                            : "d-flex py-1 align-items-center"
                        }
                        onClick={() => categoriesFilter(category.$id)}
                      >
                        <div className="flex-grow-1">
                          <h5 className="fs-13 mb-0 listname">{category.name}</h5>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Filter */}
              <div className="card-body border-bottom">
                <p className="text-muted text-uppercase fs-12 fw-medium mb-4">
                  Price
                </p>

                {isFinite(priceSliderRange.min) && isFinite(priceSliderRange.max) && (
                  <>
                    <Nouislider
                      key={priceSliderRange.min + "-" + priceSliderRange.max}
                      range={{
                        min: priceSliderRange.min,
                        max: priceSliderRange.max,
                      }}
                      start={[priceRange.min, priceRange.max]}
                      connect
                      onSlide={onUpdate}
                      data-slider-color="primary"
                      id="product-price-range"
                    />
                    <div className="formCost d-flex gap-2 align-items-center mt-3">
                      <Input
                        className="form-control form-control-sm"
                        type="text"
                        id="minCost"
                        placeholder="Min"
                        readOnly
                      />
                      <span className="fw-semibold text-muted">to</span>
                      <Input
                        className="form-control form-control-sm"
                        type="text"
                        id="maxCost"
                        placeholder="Max"
                        readOnly
                      />
                    </div>
                  </>
                )}
              </div>

              {/* On Sale Filter with Toggle Switch */}
              <div className="card-body border-bottom">
                <p className="text-muted text-uppercase fs-12 fw-medium mb-2">
                  On Sale
                </p>
                <div className="form-check form-switch mb-3">
                  <Input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="onSaleSwitch"
                    checked={isOnSaleFilter}
                    onChange={(e) => {
                      setIsOnSaleFilter(e.target.checked);
                    }}
                  />
                  <Label className="form-check-label" htmlFor="onSaleSwitch">
                    Show only products on sale
                  </Label>
                </div>
              </div>

            </Card>
          </Col>

          <Col xl={9} lg={8}>
            <div>
              <Card>
                <div className="card-header border-0">
                  <Row className="align-items-center">
                    <Col>
                      <h5 className="card-title mb-0">Products</h5>
                    </Col>
                    <div className="col-auto d-flex align-items-center">
                      <Button
                        color="primary"
                        className="me-2"
                        onClick={exportToCSV}
                      >
                        Export CSV
                      </Button>
                      <div id="selection-element" style={{ display: "none" }}>
                        <div className="my-n1 d-flex align-items-center text-muted">
                          Selected{" "}
                          <div
                            id="select-content"
                            className="text-body fw-semibold px-1"
                          >
                            {dele}
                          </div>{" "}
                          Result(s){" "}
                          <button
                            type="button"
                            className="btn btn-link link-danger p-0 ms-3"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </Row>
                </div>
                <div className="card-body pt-0">
                  {isLoading ? (
                    <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                      <Lottie animationData={loading} style={{ width: 100, height: 100 }} loop={true} />
                      <div className="mt-4">
                        <h5>Loading data!</h5>
                      </div>
                    </div>
                  ) : filteredProductList && filteredProductList.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={filteredProductList}
                      isGlobalFilter={true}
                      isAddUserList={false}
                      customPageSize={10}
                      divClass="table-responsive mb-1"
                      tableClass="mb-0 align-middle table-borderless"
                      theadClass="table-light text-muted"
                      isFilter={false}
                      SearchPlaceholder="Search by product name or barcode..."
                      globalFilterFn="fuzzy"
                      filterFields={["name", "barcode"]}
                    />
                  ) : (
                    <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                      <Lottie animationData={search} style={{ width: 100, height: 100 }} loop={true} />
                      <div className="mt-4">
                        <h5>Sorry! No Result Found</h5>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  const statusColors = {
    Pending: "warning",
    Inprogress: "secondary",
    Pickups: "info",
    Returns: "primary",
    Delivered: "success",
  };
  return statusColors[status] || "light";
};

export default EcommerceProducts;
