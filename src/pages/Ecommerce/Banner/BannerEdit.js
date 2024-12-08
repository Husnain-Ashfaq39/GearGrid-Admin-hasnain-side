// src/pages/AboutUs/BannerEdit.js

import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Input, Label, Form, FormFeedback, Button, CardHeader } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import db from "../../../appwrite/Services/dbServices";
import storageServices from "../../../appwrite/Services/storageServices";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileRejectionErrors, setFileRejectionErrors] = useState([]);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [aboutusData, setaboutusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchaboutus = async () => {
      try {
        setIsLoading(true);
        const aboutus = await db.AboutUs.get(id);
        setaboutusData(aboutus);
        const imageUrlResponse = storageServices.images.getFilePreview(aboutus.imageId);
        setExistingImageUrl(imageUrlResponse.href);
      } catch (error) {
        console.error("Failed to fetch aboutus:", error);
        toast.error("Failed to fetch aboutus data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchaboutus();
  }, [id]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: { title: aboutusData?.title || "", content: aboutusData?.content || "" },
    validationSchema: Yup.object({
      title: Yup.string().required("Please enter a title"),
      content: Yup.string().required("Please enter a content"),
    }),
    onSubmit: async (values) => {
      try {
        let imageId = aboutusData.imageId;
        if (selectedFile) {
          const uploadedImage = await storageServices.images.createFile(selectedFile);
          imageId = uploadedImage.$id;
          if (aboutusData.imageId) await storageServices.images.deleteFile(aboutusData.imageId);
        }

        const updatedaboutusData = { title: values.title, content: values.content, imageId };
        await db.AboutUs.update(id, updatedaboutusData);

        toast.success("aboutus updated successfully");
        navigate("/bannerlist");
      } catch (error) {
        console.error("Error updating aboutus:", error);
        toast.error("Failed to update aboutus. Please try again.");
      }
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setFileRejectionErrors([]);
        setExistingImageUrl(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    onDropRejected: (fileRejections) => {
      setSelectedFile(null);
      setFileRejectionErrors(fileRejections.map((file) => file.errors.map((err) => err.message).join(", ")));
    },
  });

  if (isLoading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="py-4 text-center">
            <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#405189,secondary:#0ab39c" style={{ width: "72px", height: "72px" }}></lord-icon>
            <div className="mt-4"><h5>Loading data!</h5></div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Edit aboutus" pageTitle="AboutUs" />
        <Form onSubmit={validation.handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card>
                <CardBody>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="title-input">
                      Title <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="title-input"
                      placeholder="Enter title"
                      name="title"
                      value={validation.values.title}
                      onBlur={validation.handleBlur}
                      onChange={validation.handleChange}
                      invalid={validation.errors.title && validation.touched.title}
                    />
                    {validation.errors.title && validation.touched.title && (
                      <FormFeedback>{validation.errors.title}</FormFeedback>
                    )}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="content-input">
                      content <span className="text-danger">*</span>
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

              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">aboutus Image</h5>
                </CardHeader>
                <CardBody>
                  <div {...getRootProps()} className="dropzone dz-clickable">
                    <input {...getInputProps()} />
                    <div className="dz-message needsclick">
                      <div className="mb-3 mt-5">
                        <i className="display-4 text-muted ri-upload-cloud-2-fill" />
                      </div>
                      <h5>Drop files here or click to upload.</h5>
                      {isDragActive && <p className="mt-2 text-primary">Drop the files here...</p>}
                      {fileRejectionErrors.length > 0 && (
                        <div className="text-danger mt-2">{fileRejectionErrors.join(", ")}</div>
                      )}
                    </div>
                  </div>
                  {existingImageUrl && (
                    <div className="mt-3">
                      <img src={existingImageUrl} alt="Selected" className="img-thumbnail" width="200" />
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="text-end mb-3">
                <Button type="submit" color="success">Update aboutus</Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default BannerEdit;
