// src/pages/HeroSection/HeroSectionEdit.js

import React, { useState, useEffect } from "react";
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
// Import Lottie and animations
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";

const HeroSectionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero section data
  useEffect(() => {
    const fetchHero = async () => {
      try {
        setIsLoading(true);
        const hero = await db.HeroSection.get(id);
        setHeroData(hero);

        // Fetch existing image URL
        if (hero.imageId) {
          const imageUrlResponse = storageServices.images.getFilePreview(hero.imageId);
          setExistingImageUrl(imageUrlResponse.href);
        }
      } catch (error) {
        console.error("Failed to fetch hero section:", error);
        toast.error("Failed to fetch hero section data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHero();
  }, [id]);

  // Formik validation schema
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: heroData?.title || "",
      subtitle: heroData?.subtitle || "",
    },
    validationSchema: Yup.object({
      title: Yup.string(),
      subtitle: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        let imageId = heroData.imageId;

        // If a new image is selected
        if (selectedFile) {
          // Upload new image
          const uploadedImage = await storageServices.images.createFile(selectedFile);
          imageId = uploadedImage.$id;

          // Delete old image
          if (heroData.imageId) {
            await storageServices.images.deleteFile(heroData.imageId);
          }
        }

        // Prepare updated hero section data
        const updatedHeroData = {
          title: values.title,
          subtitle: values.subtitle,
          imageId: imageId,
        };

        // Update hero section in database
        await db.HeroSection.update(id, updatedHeroData);

        toast.success("Hero section updated successfully");
        navigate("/herosectionlist");
      } catch (error) {
        console.error("Error updating hero section:", error);
        toast.error("Failed to update hero section. Please try again.");
      }
    },
  });

  // Handle file upload using useDropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
        setExistingImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setSelectedFile(null);
      const errors = fileRejections.map((fileRejection) => {
        return fileRejection.errors.map((error) => error.message).join(", ");
      });
      setFileRejectionErrors(errors);
    },
  });

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
        <h5>No hero section found.</h5>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return renderLoadingAnimation();
  }

  // If heroData is not found after loading
  if (!heroData) {
    return renderNoResultsAnimation();
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit Hero Section" pageTitle="Hero Sections" />
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  {/* Title */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="title-input">
                      Title
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="title-input"
                      placeholder="Enter title"
                      name="title"
                      value={validation.values.title}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.title && validation.touched.title
                          ? true
                          : false
                      }
                    />
                    {validation.errors.title && validation.touched.title ? (
                      <FormFeedback type="invalid">
                        {validation.errors.title}
                      </FormFeedback>
                    ) : null}
                  </div>

                  {/* Subtitle */}
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="subtitle-input">
                      Subtitle
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="subtitle-input"
                      placeholder="Enter subtitle"
                      name="subtitle"
                      value={validation.values.subtitle}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.subtitle && validation.touched.subtitle
                          ? true
                          : false
                      }
                    />
                    {validation.errors.subtitle && validation.touched.subtitle ? (
                      <FormFeedback type="invalid">
                        {validation.errors.subtitle}
                      </FormFeedback>
                    ) : null}
                  </div>
                </CardBody>
              </Card>

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Featured Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getRootProps()} className="dropzone dz-clickable">
                    <input {...getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                      {isDragActive && (
                        <p className="mt-2 text-primary">Drop the files here...</p>
                      )}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">
                          {fileRejectionErrors.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {existingImageUrl && (
                    <div className="mt-3">
                      <img
                        src={existingImageUrl}
                        alt="Selected"
                        className="img-thumbnail"
                        width="200"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Submit Button */}
              <div className="text-end mb-3">
                <Button type="submit" color="success">
                  Update Hero Section
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default HeroSectionEdit;
