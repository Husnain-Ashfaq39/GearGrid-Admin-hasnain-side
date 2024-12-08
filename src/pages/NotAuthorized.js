import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';



const NotAuthorized = () => {
document.title ="501 Error | Iwalewah";
    return (
        <React.Fragment>
            
            
            <div className="auth-page-wrapper py-5 d-flex justify-content-center align-items-center min-vh-100">
                <div className="auth-page-content overflow-hidden p-0">
                    <Container fluid={true}>
                        <Row className="justify-content-center">
                            <Col xl={4} className="text-center">
                                <div className="error-500 position-relative">
                                    <img src="../../../assets/images/error500.png" alt="" className="img-fluid error-500-img error-img" />
                                    <h1 className="title text-muted">501</h1>
                                </div>
                                <div>
                                    <h4>Unauthorized Access!</h4>
                                    <p className="text-muted w-75 mx-auto">Server Error 501.You are not Authorized to access this page</p>
                                    <Link to="/" className="btn btn-success"><i className="mdi mdi-home me-1"></i>Back to home</Link>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </React.Fragment>
    );
};

export default NotAuthorized;
