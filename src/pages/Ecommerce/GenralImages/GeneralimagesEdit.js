// src/pages/HeroSection/HeroSectionEdit.js

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Form,
  Button,
  CardHeader,
  Label,
  FormFeedback,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import axios from "axios";

const GeneralDataEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedLoginFile, setSelectedLoginFile] = useState(null);
  const [existingLoginImageUrl, setExistingLoginImageUrl] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false); // State to handle errors or no data

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const data = await axios.get(`http://localhost:5001/GeneralData/all`);
        console.log(data);
        
        if (!data) {
          setHasError(true);
          toast.error("No data found for the provided ID.");
          return;
        }
        setHeroData(data);
  
        // If there is an existing logo, set it
        if (data.logo) {
          setExistingLoginImageUrl(data.logo || ''); // The logo URL from Cloudinary
        }
      } catch (error) {
        console.error("Failed to fetch Images:", error);
        toast.error("Failed to fetch Images data.");
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroSection();
  }, [id]);
  

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      logo: heroData?.logo || "",
      facebook: heroData?.facebook || "",
      twitter: heroData?.twitter || "",
      instagram: heroData?.instagram || "",
      linkedin: heroData?.linkedin || "",
      terms: heroData?.terms || "", // New field for Terms and Conditions
    },
    validationSchema: Yup.object({
      facebook: Yup.string().url("Invalid Facebook URL"),
      twitter: Yup.string().url("Invalid Twitter URL"),
      instagram: Yup.string().url("Invalid Instagram URL"),
      linkedin: Yup.string().url("Invalid LinkedIn URL"),
      terms: Yup.string().required("Please enter the Terms and Conditions"),
    }),
  
    onSubmit: async (values) => {
      try {
        let logo = heroData.logo;
  
        if (selectedLoginFile) {
          // Upload image to Cloudinary
          const formData = new FormData();
          formData.append("image", selectedLoginFile);
          const uploadResponse = await axios.post("http://localhost:5001/cloudinary/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log('new upload logo '+JSON.stringify(uploadResponse.data[0]));
          
  
          // Set the new logo URL from Cloudinary response
          logo = uploadResponse.data[0]; // Cloudinary response URL
  
          // If there was an existing logo, delete it from Cloudinary
          if (heroData.logo) {
            await axios.delete(`http://localhost:5001/cloudinary/delete/${heroData.logo}`);
          }
        }
  
        const updatedHeroData = {
          logo,
          facebook: values.facebook,
          twitter: values.twitter,
          instagram: values.instagram,
          linkedin: values.linkedin,
          terms: values.terms, // Include Terms in the update
        };
  
        await axios.put(`http://localhost:5001/GeneralData`, updatedHeroData);
        toast.success("Images updated successfully");
        navigate("/generalimageslist");
      } catch (error) {
        console.error("Error updating Images:", error);
        toast.error("Failed to update Images. Please try again.");
      }
    },
  });
  

  const { getRootProps: getLoginRootProps, getInputProps: getLoginInputProps } =
    useDropzone({
      accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
      maxSize: 5242880,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          setSelectedLoginFile(acceptedFiles[0]);
          setExistingLoginImageUrl(URL.createObjectURL(acceptedFiles[0]));
        }
      },
    });

  // Helper function to render loading animation
  const renderLoadingAnimation = () => (
    <div
      className="d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "300px" }}
    >
      <Lottie
        animationData={loadingAnimation}
        style={{ width: 150, height: 150 }}
        loop={true}
      />
      <div className="mt-3">
        <h5>Loading data!</h5>
      </div>
    </div>
  );

  // Helper function to render no data or error animation
  const renderNoDataAnimation = () => (
    <div
      className="d-flex justify-content-center align-items-center flex-column"
      style={{ minHeight: "300px" }}
    >
      <Lottie
        animationData={noDataAnimation}
        style={{ width: 150, height: 150 }}
        loop={true}
      />
      <div className="mt-3">
        <h5>No Images Found.</h5>
      </div>
    </div>
  );

  // Function to get image URL
  const getImageURL = (imageId) => {
    if (!imageId) return null;
    const imageUrlResponse = storageServices.images.getFileDownload(imageId);
    return imageUrlResponse;
  };

  // Memoize the form to prevent unnecessary re-renders
  const renderForm = useMemo(() => {
    return (
      <Form onSubmit={validation.handleSubmit}>
        <Row>
          <Col lg={8}>
            {/* Login Image Upload */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Login Image</h5>
              </CardHeader>
              <CardBody>
                <div
                  {...getLoginRootProps()}
                  className="dropzone dz-clickable"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <input {...getLoginInputProps()} />
                  <div className="dz-message needsclick">
                    <div className="mb-3 mt-5">
                      <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                    </div>
                    <h5>Drop files here or click to upload.</h5>
                  </div>
                </div>
                {existingLoginImageUrl && (
                  <div className="mt-3">
                    <img
                      src={existingLoginImageUrl}
                      alt="Selected"
                      className="img-thumbnail"
                      width="200"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Terms and Conditions</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <Label className="form-label">Terms and Conditions <span className="text-danger">*</span></Label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={validation.values.terms || ""}
                    onChange={(event, editor) => {
                      validation.setFieldValue("terms", editor.getData());
                    }}
                  />
                  {validation.errors.terms && validation.touched.terms ? (
                    <FormFeedback type="invalid" className="d-block">
                      {validation.errors.terms}
                    </FormFeedback>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            {/* Submit Button */}
            <div className="text-end mb-3">
              <Button type="submit" color="success">
                Update Images
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <Label htmlFor="facebook" className="form-label">Facebook URL</Label>
              <input
                type="text"
                className={`form-control ${
                  validation.touched.facebook && validation.errors.facebook
                    ? "is-invalid"
                    : ""
                }`}
                id="facebook"
                value={validation.values.facebook}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter Facebook URL"
              />
              {validation.touched.facebook && validation.errors.facebook ? (
                <div className="invalid-feedback">{validation.errors.facebook}</div>
              ) : null}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Label htmlFor="twitter" className="form-label">Twitter URL</Label>
              <input
                type="text"
                className={`form-control ${
                  validation.touched.twitter && validation.errors.twitter
                    ? "is-invalid"
                    : ""
                }`}
                id="twitter"
                value={validation.values.twitter}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter Twitter URL"
              />
              {validation.touched.twitter && validation.errors.twitter ? (
                <div className="invalid-feedback">{validation.errors.twitter}</div>
              ) : null}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Label htmlFor="instagram" className="form-label">Instagram URL</Label>
              <input
                type="text"
                className={`form-control ${
                  validation.touched.instagram && validation.errors.instagram
                    ? "is-invalid"
                    : ""
                }`}
                id="instagram"
                value={validation.values.instagram}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter Instagram URL"
              />
              {validation.touched.instagram && validation.errors.instagram ? (
                <div className="invalid-feedback">{validation.errors.instagram}</div>
              ) : null}
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <Label htmlFor="linkedin" className="form-label">LinkedIn URL</Label>
              <input
                type="text"
                className={`form-control ${
                  validation.touched.linkedin && validation.errors.linkedin
                    ? "is-invalid"
                    : ""
                }`}
                id="linkedin"
                value={validation.values.linkedin}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                placeholder="Enter LinkedIn URL"
              />
              {validation.touched.linkedin && validation.errors.linkedin ? (
                <div className="invalid-feedback">{validation.errors.linkedin}</div>
              ) : null}
            </div>
          </Col>
        </Row>
      </Form>
    );
  }, [
    validation.handleSubmit,
    getLoginRootProps,
    getLoginInputProps,
    existingLoginImageUrl,
    validation.values.terms,
    validation.errors.terms,
    validation.touched.terms,
    validation.handleChange,
    validation.handleBlur,
    validation.values.facebook,
    validation.errors.facebook,
    validation.touched.facebook,
    validation.values.twitter,
    validation.errors.twitter,
    validation.touched.twitter,
    validation.values.instagram,
    validation.errors.instagram,
    validation.touched.instagram,
    validation.values.linkedin,
    validation.errors.linkedin,
    validation.touched.linkedin,
  ]);

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit Images" pageTitle="Images" />
        {isLoading ? (
          // Loading Indicator
          renderLoadingAnimation()
        ) : hasError ? (
          // No Data or Error Indicator
          renderNoDataAnimation()
        ) : (
          renderForm
        )}
      </Container>
    </div>
  );
};

export default GeneralDataEdit;
