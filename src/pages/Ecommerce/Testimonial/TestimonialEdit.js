// src/pages/Testimonials/TestimonialEdit.js

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

const TestimonialEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);
  const [existingProfilePicUrl, setExistingProfilePicUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [testimonialData, setTestimonialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        setIsLoading(true);
        const testimonial = await db.testimonials.get(id);
        setTestimonialData(testimonial);

        if (testimonial.profilePicId) {
          const profilePicUrlResponse = storageServices.images.getFilePreview(testimonial.profilePicId);
          setExistingProfilePicUrl(profilePicUrlResponse.href);
        }

        if (testimonial.imageId) {
          const imageUrlResponse = storageServices.images.getFilePreview(testimonial.imageId);
          setExistingImageUrl(imageUrlResponse.href);
        }
      } catch (error) {
        console.error("Failed to fetch testimonial:", error);
        toast.error("Failed to fetch testimonial data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonial();
  }, [id]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: testimonialData?.name || "",
      position: testimonialData?.position || "",
      content: testimonialData?.content || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please enter a name"),
      position: Yup.string().required("Please enter a position"),
      content: Yup.string().required("Please enter content"),
    }),
    onSubmit: async (values) => {
      try {
        let profilePicId = testimonialData.profilePicId;
        let additionalImageId = testimonialData.imageId;

        // Handle Profile Picture Update
        if (profilePicFile) {
          const uploadedProfilePic = await storageServices.images.createFile(profilePicFile);
          profilePicId = uploadedProfilePic.$id;
          if (testimonialData.profilePicId) {
            await storageServices.images.deleteFile(testimonialData.profilePicId);
          }
        }

        // Handle Additional Image Update
        if (imageFile) {
          const uploadedImage = await storageServices.images.createFile(imageFile);
          additionalImageId = uploadedImage.$id;
          if (testimonialData.imageId) {
            await storageServices.images.deleteFile(testimonialData.imageId);
          }
        }

        const updatedTestimonialData = {
          name: values.name,
          position: values.position,
          content: values.content,
          profilePicId,
          imageId: additionalImageId,
        };

        await db.testimonials.update(id, updatedTestimonialData);

        toast.success("Testimonial updated successfully");
        navigate("/testimoniallist");
      } catch (error) {
        console.error("Error updating testimonial:", error);
        toast.error("Failed to update testimonial. Please try again.");
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
        setExistingProfilePicUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setProfilePicFile(null);
      setFileRejectionErrors(
        fileRejections.map((file) =>
          file.errors.map((err) => err.message).join(", ")
        )
      );
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
        setExistingImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setImageFile(null);
      setFileRejectionErrors(
        fileRejections.map((file) =>
          file.errors.map((err) => err.message).join(", ")
        )
      );
    },
  });

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="py-4 text-center">
            <lord-icon
              src="https://cdn.lordicon.com/msoeawqm.json"
              trigger="loop"
              colors="primary:#405189,secondary:#0ab39c"
              style={{ width: "72px", height: "72px" }}
            ></lord-icon>
            <div className="mt-4">
              <h5>Loading data!</h5>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit Testimonial" pageTitle="Testimonials" />
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
                      invalid={
                        validation.errors.name && validation.touched.name
                      }
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
                      invalid={
                        validation.errors.position && validation.touched.position
                      }
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
                      type="textarea"
                      id="content-input"
                      placeholder="Enter content"
                      name="content"
                      value={validation.values.content}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={
                        validation.errors.content && validation.touched.content
                      }
                      rows={5}
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
                  <div
                    {...profilePicDropzone.getRootProps()}
                    className="dropzone dz-clickable"
                  >
                    <input {...profilePicDropzone.getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>
                        Drop files here or click to upload profile picture.
                      </h5>
                      {profilePicDropzone.isDragActive && (
                        <p className="mt-2 text-primary">
                          Drop the files here...
                        </p>
                      )}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">
                          {fileRejectionErrors.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {existingProfilePicUrl && (
                    <div className="mt-3">
                      <img
                        src={existingProfilePicUrl}
                        alt="Profile Pic"
                        className="img-thumbnail"
                        width="200"
                      />
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
                  <div
                    {...imageDropzone.getRootProps()}
                    className="dropzone dz-clickable"
                  >
                    <input {...imageDropzone.getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>
                        Drop files here or click to upload additional image.
                      </h5>
                      {imageDropzone.isDragActive && (
                        <p className="mt-2 text-primary">
                          Drop the files here...
                        </p>
                      )}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">
                          {fileRejectionErrors.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {existingImageUrl && (
                    <div className="mt-3">
                      <img
                        src={existingImageUrl}
                        alt="Additional"
                        className="img-thumbnail"
                        width="200"
                      />
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="text-end mb-3">
                <Button type="submit" color="success">
                  Update Testimonial
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default TestimonialEdit;
