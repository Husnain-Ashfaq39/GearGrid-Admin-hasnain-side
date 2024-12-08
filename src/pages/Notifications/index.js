// src/pages/Notifications/NotificationsPage.js

import React from 'react';
import { Container, Row, Col, Card, CardBody, Button, Input, InputGroup } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { Search } from 'react-feather';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/animations/loading.json'; // Ensure the path is correct
import searchAnimation from '../../assets/animations/search.json';   // Optional: For no results found

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsSeen, 
    markAllAsSeen, 
    setSearchQuery, 
    isLoading, 
    isError, 
    error 
  } = useNotifications();

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark the notification as seen
    markAsSeen(notification.id);
    // Navigate to product details page
    navigate(`/apps-ecommerce-product-details/${notification.productId}`);
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="All Notifications" pageTitle="Notifications" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0">Stocks Notifications</h4>
                  <div className="d-flex gap-2 align-items-center">
                    <InputGroup style={{ width: '300px' }}>
                      <Input
                        type="text"
                        placeholder="Search Product Name..."
                        onChange={handleSearch}
                        className="form-control-sm border-end-0"
                      />
                      <Button color="light" className="border border-start-0">
                        <Search size={18} className="text-muted" />
                      </Button>
                    </InputGroup>
                    {notifications.length > 0 && (
                      <Button color="primary" size="sm" onClick={markAllAsSeen}>
                        Mark All as Read for Now
                      </Button>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                    <Lottie animationData={loadingAnimation} style={{ width: 100, height: 100 }} loop={true} />
                    <div className="mt-4">
                      <h5>Loading notifications...</h5>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {isError && (
                  <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                    <Lottie animationData={searchAnimation} style={{ width: 100, height: 100 }} loop={false} />
                    <div className="mt-4">
                      <h5>Failed to load notifications</h5>
                      <p className="text-muted">{error.message}</p>
                    </div>
                  </div>
                )}

                {/* Notifications List */}
                {!isLoading && !isError && (
                  <>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Card 
                          key={notification.id}
                          className={`border ${!notification.seen ? 'border-info' : ''} mb-3`}
                          onClick={() => handleNotificationClick(notification)}
                          style={{ cursor: 'pointer' }}
                        >
                          <CardBody>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1">
                                <h5 className="mb-1">{notification.title}</h5>
                                <p className="text-muted mb-2">{notification.message}</p>
                                <small className="text-muted">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </small>
                              </div>
                              {!notification.seen && (
                                <span className="badge bg-info">New</span>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <div className="py-4 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: "300px" }}>
                        <Lottie animationData={searchAnimation} style={{ width: 100, height: 100 }} loop={true} />
                        <div className="mt-4">
                          <h5>No notifications available</h5>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotificationsPage;
