import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Alert,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { account } from "../../appwrite/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BreadCrumb from "../../Components/Common/BreadCrumb";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Formik validation schema
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current password is required"),
      newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
        ),
      confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("newPassword")], "Passwords must match"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setError(null);

      try {
        // Update password using Appwrite account API
        await account.updatePassword(values.newPassword, values.currentPassword);
        
        toast.success("Password changed successfully!");
        resetForm();
      } catch (err) {
        console.error("Change Password Error:", err);
        setError(
          err.message || "Failed to change password. Please check your current password."
        );
        toast.error(
          err.message || "Failed to change password. Please check your current password."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  document.title = "Change Password | Dashboard";

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Change Password" pageTitle="Authentication" />
        <Row className="justify-content-center">
          <Col lg={6}>
            <Card>
              <CardBody className="p-4">
                <div className="text-center mt-2">
                  <h5 className="text-primary">Change Password</h5>
                  <p className="text-muted">Update your password for enhanced security</p>
                </div>

                {error && (
                  <Alert color="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <div className="p-2 mt-4">
                  <Form
                    onSubmit={formik.handleSubmit}
                    className="needs-validation"
                    action="#"
                  >
                    <div className="mb-3">
                      <Label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          type={showPassword.current ? "text" : "password"}
                          className="form-control pe-5"
                          placeholder="Enter current password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formik.values.currentPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={
                            formik.touched.currentPassword &&
                            formik.errors.currentPassword
                          }
                        />
                        <button
                          className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                        >
                          <i
                            className={`ri-eye${
                              showPassword.current ? "" : "-off"
                            }-line align-middle`}
                          ></i>
                        </button>
                        {formik.touched.currentPassword &&
                          formik.errors.currentPassword && (
                            <FormFeedback type="invalid">
                              {formik.errors.currentPassword}
                            </FormFeedback>
                          )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="newPassword" className="form-label">
                        New Password
                      </Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          type={showPassword.new ? "text" : "password"}
                          className="form-control pe-5"
                          placeholder="Enter new password"
                          id="newPassword"
                          name="newPassword"
                          value={formik.values.newPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={
                            formik.touched.newPassword && formik.errors.newPassword
                          }
                        />
                        <button
                          className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          <i
                            className={`ri-eye${
                              showPassword.new ? "" : "-off"
                            }-line align-middle`}
                          ></i>
                        </button>
                        {formik.touched.newPassword &&
                          formik.errors.newPassword && (
                            <FormFeedback type="invalid">
                              {formik.errors.newPassword}
                            </FormFeedback>
                          )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="confirmPassword" className="form-label">
                        Confirm Password
                      </Label>
                      <div className="position-relative auth-pass-inputgroup mb-3">
                        <Input
                          type={showPassword.confirm ? "text" : "password"}
                          className="form-control pe-5"
                          placeholder="Confirm new password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={
                            formik.touched.confirmPassword &&
                            formik.errors.confirmPassword
                          }
                        />
                        <button
                          className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          <i
                            className={`ri-eye${
                              showPassword.confirm ? "" : "-off"
                            }-line align-middle`}
                          ></i>
                        </button>
                        {formik.touched.confirmPassword &&
                          formik.errors.confirmPassword && (
                            <FormFeedback type="invalid">
                              {formik.errors.confirmPassword}
                            </FormFeedback>
                          )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        color="success"
                        className="w-100"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="d-flex align-items-center">
                            <span className="spinner-border flex-shrink-0 me-2"></span>
                            <span className="flex-grow-1">Loading...</span>
                          </span>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <ToastContainer closeButton={false} limit={1} />
    </div>
  );
};

export default ChangePassword; 