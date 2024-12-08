// src/pages/Login.js

import React, { useEffect, useState } from "react";
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
  Spinner,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  signIn,
  createMfaChallenge,
  completeMfaChallenge,
  getCurrentUser,
} from "../../appwrite/Services/authServices";
import logo from "../../assets/images/logo.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [passwordShow, setPasswordShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [challengeId, setChallengeId] = useState(null);
  const [requiresMfaSetup, setRequiresMfaSetup] = useState(false);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      mfaCode: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Please Enter Your Email"),
      password: Yup.string().required("Please Enter Your Password"),
      mfaCode: Yup.string().when("requiresMFA", {
        is: true,
        then: Yup.string().required("Please Enter the MFA Code"),
      }),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!requiresMFA) {
          const result = await signIn(values.email, values.password);

          if (result.requiresMFA) {
            // Create MFA challenge
            const challenge = await createMfaChallenge("email"); // Use 'email' for email-based MFA
            setChallengeId(challenge.$id);
            setRequiresMFA(true);
          } else if (result.requiresMfaSetup) {
            // Redirect to MFA setup page
            setRequiresMfaSetup(true);
          } else {
            // Successful login without MFA
            navigate("/");
          }
        } else {
          // Complete MFA challenge
          await completeMfaChallenge(challengeId, values.mfaCode);
          navigate("/");
        }
      } catch (error) {
        setErrorMessage(error.message || "Login failed. Please try again.");
        console.error("Login failed:", error);
        setSubmitting(false);
      }
    },
  });

  // Redirect to MFA setup page if required
  useEffect(() => {
    if (requiresMfaSetup) {
      navigate("/setup-mfa");
    }
  }, [requiresMfaSetup, navigate]);

  // Handle error messages
  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  }, [errorMessage]);

  document.title = "Admin Dashboard Sign In";

  return (
    <React.Fragment>
      <ParticlesAuth>
        <div className="auth-page-content mt-lg-5">
          <Container>
            <Row>
              <Col lg={12}>
                <div className="text-center mt-sm-5 mb-4 text-white-50">
                  <div>
                    <Link to="/" className="d-inline-block auth-logo">
                      <img src={logo} alt="" width="70" />
                    </Link>
                  </div>
                  <p className="mt-3 fs-15 fw-medium">Admin Dashboard</p>
                </div>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="mt-4">
                  <CardBody className="p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Welcome Back!</h5>
                      <p className="text-muted">
                        Sign in to continue to your dashboard.
                      </p>
                    </div>
                    {errorMessage && (
                      <Alert color="danger"> {errorMessage} </Alert>
                    )}
                    <div className="p-2 mt-4">
                      <Form onSubmit={formik.handleSubmit}>
                        {!requiresMFA && (
                          <>
                            <div className="mb-3">
                              <Label htmlFor="email" className="form-label">
                                Email
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                invalid={
                                  formik.touched.email && formik.errors.email
                                    ? true
                                    : false
                                }
                              />
                              {formik.touched.email && formik.errors.email ? (
                                <FormFeedback>
                                  {formik.errors.email}
                                </FormFeedback>
                              ) : null}
                            </div>

                            <div className="mb-3">
                              <div className="float-end">
                                <Link
                                  to="/forgot-password"
                                  className="text-muted"
                                >
                                  Forgot password?
                                </Link>
                              </div>
                              <Label className="form-label" htmlFor="password">
                                Password
                              </Label>
                              <div className="position-relative auth-pass-inputgroup mb-3">
                                <Input
                                  id="password"
                                  name="password"
                                  type={passwordShow ? "text" : "password"}
                                  placeholder="Enter Password"
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  value={formik.values.password}
                                  invalid={
                                    formik.touched.password &&
                                    formik.errors.password
                                      ? true
                                      : false
                                  }
                                />
                                {formik.touched.password &&
                                formik.errors.password ? (
                                  <FormFeedback>
                                    {formik.errors.password}
                                  </FormFeedback>
                                ) : null}
                                <button
                                  className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                                  type="button"
                                  onClick={() => setPasswordShow(!passwordShow)}
                                >
                                  <i
                                    className={`ri-eye-${
                                      passwordShow ? "close-fill" : "fill"
                                    } align-middle`}
                                  ></i>
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {requiresMFA && (
                          <div className="mb-3">
                            <Label htmlFor="mfaCode" className="form-label">
                              Enter the code sent to your email
                            </Label>
                            <Input
                              id="mfaCode"
                              name="mfaCode"
                              type="text"
                              placeholder="MFA Code"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.mfaCode}
                              invalid={
                                formik.touched.mfaCode &&
                                formik.errors.mfaCode
                                  ? true
                                  : false
                              }
                            />
                            {formik.touched.mfaCode &&
                            formik.errors.mfaCode ? (
                              <FormFeedback>
                                {formik.errors.mfaCode}
                              </FormFeedback>
                            ) : null}
                          </div>
                        )}

                        <div className="mt-4">
                          <Button
                            color="success"
                            type="submit"
                            className="w-100"
                            disabled={formik.isSubmitting}
                          >
                            {formik.isSubmitting ? (
                              <Spinner size="sm" className="me-2" />
                            ) : null}
                            {requiresMFA ? "Verify Code" : "Sign In"}
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </ParticlesAuth>
    </React.Fragment>
  );
};

export default Login;
