import React from 'react';
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isNotificationDropdown, setIsNotificationDropdown] = React.useState(false);
  const toggleNotificationDropdown = () => setIsNotificationDropdown(!isNotificationDropdown);
  
  const { notifications, unseenCount, markAsSeen, markAllAsSeen } = useNotifications();

  const handleNotificationClick = (notification) => {
    markAsSeen(notification.id);
    // Updated navigation path
    navigate(`/apps-ecommerce-product-details/${notification.productId}`);
    setIsNotificationDropdown(false);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setIsNotificationDropdown(false);
  };

  return (
    <React.Fragment>
      <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown ms-1 header-item">
        <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
          <i className='bx bx-bell fs-22'></i>
          {unseenCount > 0 && <span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">{unseenCount}</span>}
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
          <div className="dropdown-head bg-primary bg-pattern rounded-top">
            <div className="p-3">
              <Row className="align-items-center">
                <Col>
                  <h6 className="m-0 fs-16 fw-semibold text-white">Stock Notifications</h6>
                </Col>
                <div className="col-auto dropdown-tabs">
                  <span className="badge badge-soft-light fs-13">{unseenCount} New</span>
                </div>
              </Row>
            </div>
          </div>

          <div className="py-2 ps-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`text-reset notification-item d-block ${!notification.seen ? 'bg-soft-info' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex p-2">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{notification.title}</h6>
                      <div className="fs-13 text-muted">
                        <p className="mb-1">{notification.message}</p>
                        <p className="mb-0 text-muted">
                          <small>{new Date(notification.timestamp).toLocaleString()}</small>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <h6>No notifications</h6>
              </div>
            )}
          </div>

          <div className="p-2 border-top">
            <div className="d-grid gap-2">
              <button className="btn btn-sm btn-light" onClick={markAllAsSeen}>
                Mark All as Read for Now
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleViewAll}>
                View All Notifications
              </button>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default NotificationDropdown;
