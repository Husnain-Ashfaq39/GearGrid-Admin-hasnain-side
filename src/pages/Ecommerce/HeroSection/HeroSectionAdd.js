// src/pages/HeroSection/HeroSectionAdd.js

import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HeroSectionAdd = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);

  // Formik validation schema
  const validation = useFormik({
    initialValues: {
      title: "",
      subtitle: "",
    },
    validationSchema: Yup.object({
      title: Yup.string(),
      subtitle: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        let imageId = "";

        if (selectedFile) {
          // Upload image to storage
          const uploadedImage = await storageServices.images.createFile(selectedFile);
          imageId = uploadedImage.$id;
        }

        // Prepare hero section data
        const heroData = {
          title: values.title,
          subtitle: values.subtitle,
          imageId: imageId,
        };

        // Save hero section to database
        await db.HeroSection.create(heroData);

        toast.success("Hero section has been added successfully");
        navigate("/herosectionlist");
      } catch (error) {
        console.error("Error adding hero section:", error);
        toast.error("Failed to add hero section. Please try again.");
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

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Add Hero Section" pageTitle="Hero Sections" />
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
                  {selectedFile && (
                    <div className="mt-3">
                      <img
                        src={URL.createObjectURL(selectedFile)}
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
                  Add Hero Section
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default HeroSectionAdd;
