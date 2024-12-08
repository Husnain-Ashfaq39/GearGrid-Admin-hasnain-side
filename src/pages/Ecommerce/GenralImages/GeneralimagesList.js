import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";
import axios from "axios";

const GeneralimagesList = () => {
  const [heroSection, setHeroSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const heroData = await axios.get("http://localhost:5001/GeneralData/all");
        console.log('Fetching'+heroData);
       

        if (!heroData) {
          // Handle the case when no general data exists
          const dummyData = {
            logo: "",
            facebook: "https://www.facebook.com",
            twitter: "https://www.twitter.com",
            instagram: "https://www.instagram.com",
            linkedin: "https://www.linkedin.com",
            terms: "<p>Default Terms and Conditions.</p>",
          };

          // If no data, create it using the API
          await axios.post("http://localhost:5001/GeneralData", dummyData);
          heroData = dummyData;
          toast.success("Dummy General Data created.");
        }

        setHeroSection(heroData);
      } catch (error) {
        console.error("Failed to fetch General Data:", error);
        toast.error("Failed to fetch General Data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroSection();
  }, []);

  

  



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

  const renderNoResultsAnimation = () => (
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

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <BreadCrumb title="Images" pageTitle="Images" />
        {isLoading ? (
          renderLoadingAnimation()
        ) : heroSection ? (
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader className="d-flex align-items-center">
                  <h4 className="card-title mb-0 flex-grow-1">Images</h4>
                  <div className="flex-shrink-0">
                    <Link
                      to={`/editgeneralimages/${heroSection._id}`}
                      className="btn btn-primary"
                    >
                      Edit Images
                    </Link>
                  </div>
                </CardHeader>
                <CardBody>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Logo Image</th>
                        <td>
                          {heroSection.logo ? (
                            <img
                              src={heroSection.logo}
                              alt="Logo"
                              className="img-thumbnail"
                              style={{
                                maxHeight: "400px",
                                maxWidth: "700px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "No logo image uploaded."
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Facebook</th>
                        <td>
                          <a href={heroSection.facebook} target="_blank" rel="noopener noreferrer">
                            {heroSection.facebook}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th>Twitter</th>
                        <td>
                          <a href={heroSection.twitter} target="_blank" rel="noopener noreferrer">
                            {heroSection.twitter}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th>Instagram</th>
                        <td>
                          <a href={heroSection.instagram} target="_blank" rel="noopener noreferrer">
                            {heroSection.instagram}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th>LinkedIn</th>
                        <td>
                          <a href={heroSection.linkedin} target="_blank" rel="noopener noreferrer">
                            {heroSection.linkedin}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th>Terms and Conditions</th>
                        <td>
                          <div dangerouslySetInnerHTML={{ __html: heroSection.terms }} />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  
                </CardBody>
              </Card>
            </Col>
          </Row>
        ) : (
          renderNoResultsAnimation()
        )}
      </Container>
    </div>
  );
};

export default GeneralimagesList;
