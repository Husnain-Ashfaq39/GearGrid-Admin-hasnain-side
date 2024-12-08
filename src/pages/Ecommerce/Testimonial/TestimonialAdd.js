import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row, Input, Label, Form, FormFeedback, Button, CardHeader } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestimonialAdd = () => {
  const navigate = useNavigate();
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);

  const validation = useFormik({
    initialValues: {
      name: "",
      position: "",
      content: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please enter a name"),
      position: Yup.string().required("Please enter a position"),
      content: Yup.string().required("Please enter content"),
    }),
    onSubmit: async (values) => {
      try {
        if (!profilePicFile || !imageFile) {
          toast.error("Please select both images");
          return;
        }
        console.log("step 1");
        

        // Upload profile picture
        const uploadedProfilePic = await storageServices.images.createFile(profilePicFile);
        const profilePicId = uploadedProfilePic.$id;
        console.log("step 2");
        // Upload additional image
        const uploadedImage = await storageServices.images.createFile(imageFile);
        const imageId = uploadedImage.$id;
        console.log("step 3");
        const testimonialData = {
          name: values.name,
          position: values.position,
          content: values.content,
          profilePicId,
          imageId,
        };

        await db.testimonials.create(testimonialData);
        console.log("step 4");
        toast.success("Testimonial has been added successfully");
        navigate("/testimoniallist");
        console.log("step 5");
      } catch (error) {
        console.error("Error adding Data:", error);
        toast.error("Failed to add testimonial. Please try again.");
      }
    },
  });

  // Dropzone for Profile Picture
  const profilePicDropzone = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setProfilePicFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
      }
    },
    onDropRejected: (fileRejections) => {
      setProfilePicFile(null);
      setFileRejectionErrors(fileRejections.map((file) => file.errors.map((err) => err.message).join(", ")));
    },
  });

  // Dropzone for Additional Image
  const imageDropzone = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setImageFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
      }
    },
    onDropRejected: (fileRejections) => {
      setImageFile(null);
      setFileRejectionErrors(fileRejections.map((file) => file.errors.map((err) => err.message).join(", ")));
    },
  });

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Add Testimonial" pageTitle="Testimonials" />
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="name-input">
                      Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name-input"
                      placeholder="Enter name"
                      name="name"
                      value={validation.values.name}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={validation.errors.name && validation.touched.name}
                    />
                    {validation.errors.name && validation.touched.name && (
                      <FormFeedback>{validation.errors.name}</FormFeedback>
                    )}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="position-input">
                      Position <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="position-input"
                      placeholder="Enter position"
                      name="position"
                      value={validation.values.position}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={validation.errors.position && validation.touched.position}
                    />
                    {validation.errors.position && validation.touched.position && (
                      <FormFeedback>{validation.errors.position}</FormFeedback>
                    )}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="content-input">
                      Content <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="content-input"
                      placeholder="Enter content"
                      name="content"
                      value={validation.values.content}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={validation.errors.content && validation.touched.content}
                    />
                    {validation.errors.content && validation.touched.content && (
                      <FormFeedback>{validation.errors.content}</FormFeedback>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Profile Picture Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Profile Picture</h5>
                </CardHeader>
                <CardBody>
                  <div {...profilePicDropzone.getRootProps()} className="dropzone dz-clickable">
                    <input {...profilePicDropzone.getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload profile picture.</h5>
                      {profilePicDropzone.isDragActive && <p className="mt-2 text-primary">Drop the files here...</p>}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">{fileRejectionErrors.join(", ")}</div>
                      )}
                    </div>
                  </div>
                  {profilePicFile && (
                    <div className="mt-3">
                      <img src={URL.createObjectURL(profilePicFile)} alt="Profile Pic" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Additional Image Upload */}
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Additional Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...imageDropzone.getRootProps()} className="dropzone dz-clickable">
                    <input {...imageDropzone.getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload additional image.</h5>
                      {imageDropzone.isDragActive && <p className="mt-2 text-primary">Drop the files here...</p>}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">{fileRejectionErrors.join(", ")}</div>
                      )}
                    </div>
                  </div>
                  {imageFile && (
                    <div className="mt-3">
                      <img src={URL.createObjectURL(imageFile)} alt="Additional" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="text-end mb-3">
                <Button type="submit" color="success">Add Testimonial</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default TestimonialAdd;
