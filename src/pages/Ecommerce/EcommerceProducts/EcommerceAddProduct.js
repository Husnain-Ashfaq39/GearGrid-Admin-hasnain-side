// src/components/dashboard/EcommerceAddProduct.jsx

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Dropzone from "react-dropzone";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Input,
  Label,
  Form,
  FormFeedback,
  Button,
  CardHeader,
  Alert,
} from "reactstrap";
import Select from "react-select";
import db from "../../../appwrite/Services/dbServices";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Query } from "appwrite"; // Import Query for pagination
import { ToastContainer } from "react-toastify";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import axios from "axios";

const EcommerceAddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [imageError, setImageError] = useState(""); // New state for image errors
  const limit = 100; // Adjust the limit as needed

  // Function to fetch all categories with pagination
  const fetchAllCategories = async () => {
    let allCategories = [];
    let offset = 0;
    let fetchedCategories = [];

    try {
      
       // Fetch categories with pagination using Query.limit() and Query.offset()
       const response = await axios.get('http://localhost:5001/categories/all');
       console.log('categories '+JSON.stringify(response));
       allCategories=response;
    

      // Map categories to the format required by react-select
      const categoryOptions = allCategories.map((cat) => ({
        label: cat.name,
        value: cat._id,
      }));
      setCategories(categoryOptions);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setFetchError("Failed to fetch categories. Please try again later.");
      setCategories([]);
    }
  };

  // Fetch categories from Appwrite
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Handle file uploads (for preview, store the selected files in state)
  const handleAcceptedFiles = (files) => {
    if (!Array.isArray(files)) {
      console.error("Accepted files is not an array:", files);
      return;
    }

    const previewFiles = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setSelectedFiles((prevFiles) => [...prevFiles, ...previewFiles]);
    console.log("Selected Files after drop:", [...selectedFiles, ...previewFiles]);
  };

  // Remove a selected image
  const removeSelectedFile = (file) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    console.log("Selected Files after removal:", selectedFiles.filter((f) => f !== file));
  };

  // Cleanup image previews to avoid memory leaks
  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [selectedFiles]);

  // Formik validation schema
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryId: "",
      tags: "",
      isOnSale: false,
      discountPrice: "",
      barcode: "", // New field
      taxExclusivePrice: "", // New field
      tax: "0", // New field, default to 0%
      bannerLabel: "", // New field
      lowStockAlert: "", // Add this line
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please enter a product title"),
      description: Yup.string().required("Please enter a product description"), // Make description required
      price: Yup.number()
        .typeError("Price must be a number")
        .positive("Price must be a positive number")
        .required("Please enter a product price"),
      stockQuantity: Yup.number()
        .typeError("Stock Quantity must be a number")
        .integer("Stock Quantity must be an integer")
        .min(0, "Stock Quantity cannot be negative")
        .required("Please enter the product stock"),
      categoryId: Yup.string().required("Please select a product category"),
      isOnSale: Yup.boolean().notRequired(),
      discountPrice: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value
        )
        .nullable()
        .when("isOnSale", {
          is: true,
          then: () =>
            Yup.number()
              .typeError("Discount Price must be a number")
              .positive("Discount Price must be a positive number")
              .required("Please enter a discount price")
              .max(
                Yup.ref("price"),
                "Discount Price must be less than the original price"
              ),
          otherwise: () => Yup.number().notRequired(),
        }),
      tags: Yup.string(),
      barcode: Yup.string().required("Please enter a barcode"),
      taxExclusivePrice: Yup.number()
        .typeError("Tax Exclusive Price must be a number")
        .positive("Tax Exclusive Price must be a positive number")
        .required("Please enter the Tax Exclusive Price"),
      tax: Yup.number()
        .typeError("Tax must be a number")
        .min(0, "Tax cannot be negative")
        .max(100, "Tax cannot exceed 100%")
        .required("Please enter the tax percentage"),
      bannerLabel: Yup.string(),
      lowStockAlert: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value
        )
        .nullable()
        .min(1, "Low stock alert must be at least 1")
        .integer("Low stock alert must be an integer"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setSubmitError("");
      setImageError("");
    
      if (selectedFiles.length === 0) {
        setImageError("Please upload at least one product image.");
        return;
      }
    
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    
      try {
        const response = await axios.post("http://localhost:5001/api/products/add-product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Product successfully created:", response.data);
        resetForm();
        setSelectedFiles([]);
        navigate("/apps-ecommerce-products");
      } catch (error) {
        console.error("Failed to create product:", error);
        setSubmitError("Failed to create product. Please try again.");
      }
    },
  });

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Create Product" pageTitle="Ecommerce" />
        <Row>
          <Col lg={8}>
            <Form onSubmit={formik.handleSubmit}>
              {/* Display Submission Error */}
              {submitError && (
                <Alert color="danger" className="mb-3">
                  {submitError}
                </Alert>
              )}

              <Card>
                <CardBody>
                 
                  

                  {/* Product Title */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="product-title-input">
                      Product Title
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="product-title-input"
                      placeholder="Enter product title"
                      name="name"
                      value={formik.values.name}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      invalid={formik.errors.name && formik.touched.name}
                    />
                    {formik.errors.name && formik.touched.name && (
                      <FormFeedback type="invalid">{formik.errors.name}</FormFeedback>
                    )}
                  </div>

                  {/* Product Description */}
                  <div className="mb-3">
                    <Label>Product Description</Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formik.values.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        formik.setFieldValue("description", data);
                      }}
                      onBlur={() => formik.setFieldTouched("description", true)}
                    />
                    {formik.errors.description && formik.touched.description && (
                      <FormFeedback type="invalid" className="d-block">
                        {formik.errors.description}
                      </FormFeedback>
                    )}
                  </div>

                  {/* Barcode */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="product-barcode-input">
                      Barcode
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="product-barcode-input"
                      placeholder="Enter product barcode"
                      name="barcode"
                      value={formik.values.barcode}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      invalid={formik.errors.barcode && formik.touched.barcode}
                    />
                    {formik.errors.barcode && formik.touched.barcode && (
                      <FormFeedback type="invalid">{formik.errors.barcode}</FormFeedback>
                    )}
                  </div>

                  {/* Product Gallery */}
                  <Card>
                    <CardHeader>
                      <h5 className="card-title mb-0">Product Gallery</h5>
                    </CardHeader>
                    <CardBody>
                      <div className="mb-4">
                        <h5 className="fs-14 mb-1">Product Images</h5>
                        <Dropzone
                          onDrop={handleAcceptedFiles}
                          accept={{
                            "image/*": [".jpeg", ".png", ".gif", ".bmp", ".webp"],
                          }}
                          maxSize={5242880} // 5MB
                        >
                          {({
                            getRootProps,
                            getInputProps,
                            isDragActive,
                            isDragReject,
                            rejectedFiles,
                          }) => {
                            const safeRejectedFiles = Array.isArray(rejectedFiles)
                              ? rejectedFiles
                              : [];
                            const isFileTooLarge =
                              safeRejectedFiles.length > 0 &&
                              safeRejectedFiles[0].size > 5242880;

                            return (
                              <div className="dropzone dz-clickable" {...getRootProps()}>
                                {/* Render the input element */}
                                <input {...getInputProps()} />

                                <div className="dz-message needsclick">
                                  <div className="mb-3 mt-5">
                                    <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                                  </div>
                                  <h5>Drop files here or click to upload.</h5>
                                  {isDragActive && !isDragReject && (
                                    <p className="mt-2 text-primary">Drop the files here...</p>
                                  )}
                                  {isDragReject && (
                                    <p className="mt-2 text-danger">Unsupported file type.</p>
                                  )}
                                  {isFileTooLarge && (
                                    <p className="mt-2 text-danger">File is too large.</p>
                                  )}
                                </div>
                              </div>
                            );
                          }}
                        </Dropzone>

                        {/* Display Image Error */}
                        {imageError && (
                          <FormFeedback type="invalid" className="d-block">
                            {imageError}
                          </FormFeedback>
                        )}

                        {/* Image Preview */}
                        <div className="list-unstyled mb-0" id="file-previews">
                          {selectedFiles.map((f, i) => (
                            <Card
                              className="mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete"
                              key={i + "-file"}
                            >
                              <div className="p-2">
                                <Row className="align-items-center">
                                  <Col className="col-auto">
                                    <img
                                      data-dz-thumbnail=""
                                      height="80"
                                      className="avatar-sm rounded bg-light"
                                      alt={f.name}
                                      src={f.preview}
                                    />
                                  </Col>
                                  <Col>
                                    <p className="text-muted font-weight-bold mb-0">
                                      {f.name}
                                    </p>
                                  </Col>
                                  <Col className="col-auto">
                                    <Button
                                      color="danger"
                                      size="sm"
                                      onClick={() => removeSelectedFile(f)}
                                    >
                                      Remove
                                    </Button>
                                  </Col>
                                </Row>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>

              {/* General Info */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">General Info</h5>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <div className="mb-3">
                        <Label className="form-label">
                          {formik.values.productType === "wholesale"
                            ? "Wholesale Price"
                            : "Price"}
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          name="price"
                          placeholder={`Enter price`}
                          value={formik.values.price}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          invalid={formik.errors.price && formik.touched.price}
                        />
                        {formik.errors.price && formik.touched.price && (
                          <FormFeedback type="invalid">{formik.errors.price}</FormFeedback>
                        )}
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="mb-3">
                        <Label className="form-label">
                          {formik.values.productType === "wholesale"
                            ? "Wholesale Stock Quantity"
                            : "Stock Quantity"}
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          name="stockQuantity"
                          placeholder={`Enter ${
                            formik.values.productType === "wholesale"
                              ? "wholesale"
                              : "retail"
                          } stock quantity`}
                          value={formik.values.stockQuantity}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          invalid={formik.errors.stockQuantity && formik.touched.stockQuantity}
                        />
                        {formik.errors.stockQuantity && formik.touched.stockQuantity && (
                          <FormFeedback type="invalid">{formik.errors.stockQuantity}</FormFeedback>
                        )}
                      </div>
                    </Col>
                    {formik.values.productType === 'wholesale' && (
                      <Col lg={6}>
                        <div className="mb-3">
                          <Label className="form-label">Minimum Purchase Quantity</Label>
                          <Input
                            type="number"
                            className="form-control"
                            name="minimumPurchaseQuantity"
                            placeholder="Enter minimum purchase quantity"
                            value={formik.values.minimumPurchaseQuantity}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={formik.touched.minimumPurchaseQuantity && formik.errors.minimumPurchaseQuantity}
                          />
                          {formik.touched.minimumPurchaseQuantity && formik.errors.minimumPurchaseQuantity && (
                            <FormFeedback type="invalid">{formik.errors.minimumPurchaseQuantity}</FormFeedback>
                          )}
                        </div>
                      </Col>
                    )}
                    <Col lg={6}>
                      {/* Add this block after the stockQuantity input */}
                      <div className="mb-3">
                        <Label className="form-label">
                          Low Stock Alert Threshold (Optional)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          name="lowStockAlert"
                          placeholder="Enter low stock alert threshold"
                          value={formik.values.lowStockAlert}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          invalid={formik.errors.lowStockAlert && formik.touched.lowStockAlert}
                        />
                        {formik.errors.lowStockAlert && formik.touched.lowStockAlert && (
                          <FormFeedback type="invalid">{formik.errors.lowStockAlert}</FormFeedback>
                        )}
                        <small className="text-muted">
                          Leave empty to use default threshold (20 units)
                        </small>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6}>
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="product-tax-exclusive-price-input">
                          Tax Exclusive Price
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          id="product-tax-exclusive-price-input"
                          placeholder="Enter tax exclusive price"
                          name="taxExclusivePrice"
                          value={formik.values.taxExclusivePrice}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                            // Update the price field
                            const taxAmount = (parseFloat(e.target.value) * parseFloat(formik.values.tax)) / 100;
                            const finalPrice = parseFloat(e.target.value) + taxAmount;
                            formik.setFieldValue("price", finalPrice.toFixed(2));
                          }}
                          invalid={formik.errors.taxExclusivePrice && formik.touched.taxExclusivePrice}
                        />
                        {formik.errors.taxExclusivePrice && formik.touched.taxExclusivePrice && (
                          <FormFeedback type="invalid">{formik.errors.taxExclusivePrice}</FormFeedback>
                        )}
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div className="mb-3">
                        <Label className="form-label" htmlFor="product-tax-input">
                          Tax (%)
                        </Label>
                        <Input
                          type="number"
                          className="form-control"
                          id="product-tax-input"
                          placeholder="Enter tax percentage"
                          name="tax"
                          value={formik.values.tax}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            formik.handleChange(e);
                            // Update the price field
                            const taxAmount = (parseFloat(formik.values.taxExclusivePrice) * parseFloat(e.target.value)) / 100;
                            const finalPrice = parseFloat(formik.values.taxExclusivePrice) + taxAmount;
                            formik.setFieldValue("price", finalPrice.toFixed(2));
                          }}
                          invalid={formik.errors.tax && formik.touched.tax}
                        />
                        {formik.errors.tax && formik.touched.tax && (
                          <FormFeedback type="invalid">{formik.errors.tax}</FormFeedback>
                        )}
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <div className="text-end mb-3">
                <Button type="submit" color="success">
                  Create Product
                </Button>
              </div>
            </Form>
          </Col>

          <Col lg={4}>
            {/* Display Category Fetch Error */}
            {fetchError && (
              <Alert color="danger" className="mb-3">
                {fetchError}
              </Alert>
            )}

            {/* Product Categories Container */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Product Categories</h5>
              </CardHeader>
              <CardBody>
                <Select
                  value={categories.find(
                    (cat) => cat.value === formik.values.categoryId
                  )}
                  onChange={(option) =>
                    formik.setFieldValue("categoryId", option.value)
                  }
                  options={categories}
                  name="categoryId"
                  classNamePrefix="select2-selection form-select"
                  placeholder="Select a category"
                />
                {formik.errors.categoryId && formik.touched.categoryId && (
                  <FormFeedback type="invalid" className="d-block">
                    {formik.errors.categoryId}
                  </FormFeedback>
                )}
              </CardBody>
            </Card>

            {/* Banner Label */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Leave Label for product</h5>
              </CardHeader>
              <CardBody>
                <Input
                  type="text"
                  className="form-control"
                  id="product-banner-label-input"
                  placeholder="Enter Restricted  Banner Label (e.g., 18+)"
                  name="bannerLabel"
                  value={formik.values.bannerLabel}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  invalid={formik.errors.bannerLabel && formik.touched.bannerLabel}
                />
                {formik.errors.bannerLabel && formik.touched.bannerLabel && (
                  <FormFeedback type="invalid">{formik.errors.bannerLabel}</FormFeedback>
                )}
              </CardBody>
            </Card>

            {/* Product Tags Container */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Product Tags</h5>
              </CardHeader>
              <CardBody>
                <Input
                  className="form-control"
                  placeholder="Enter tags separated by commas"
                  type="text"
                  name="tags"
                  value={formik.values.tags}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  invalid={formik.errors.tags && formik.touched.tags}
                />
                {formik.errors.tags && formik.touched.tags && (
                  <FormFeedback type="invalid">{formik.errors.tags}</FormFeedback>
                )}
              </CardBody>
            </Card>

            {/* On Sale Toggle Switch */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">On Sale</h5>
              </CardHeader>
              <CardBody>
                <div className="form-check form-switch mb-3">
                  <Input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="isOnSale"
                    name="isOnSale"
                    checked={formik.values.isOnSale}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (!e.target.checked) {
                        formik.setFieldValue("discountPrice", "");
                      }
                    }}
                  />
                  <Label className="form-check-label" htmlFor="isOnSale">
                    Is On Sale
                  </Label>
                </div>

                {/* Discount Price Field */}
                {formik.values.isOnSale && (
                  <div className="mb-3">
                    <Label htmlFor="discountPrice">Discounted Price</Label>
                    <Input
                      type="number"
                      className="form-control"
                      id="discountPrice"
                      placeholder="Enter discount price"
                      name="discountPrice"
                      value={formik.values.discountPrice}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      invalid={formik.errors.discountPrice && formik.touched.discountPrice}
                    />
                    {formik.errors.discountPrice && formik.touched.discountPrice && (
                      <FormFeedback type="invalid">{formik.errors.discountPrice}</FormFeedback>
                    )}
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

export default EcommerceAddProduct;
