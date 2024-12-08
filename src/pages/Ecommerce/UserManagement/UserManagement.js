// src/pages/UserManagement.js

import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Container,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  InputGroup,
  InputGroupText,
  Row,
  Col,
} from 'reactstrap';
import { Eye, EyeOff } from 'react-feather'; // Import icons
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classnames from 'classnames';
import { Client, Query, Functions, Account, Teams } from 'appwrite';
import { client as appwriteClient } from '../../../appwrite/config'; // Adjust the import path as necessary

const accountClient = new Account(appwriteClient);
const teamsClient = new Teams(appwriteClient);

const UserManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [activeTab, setActiveTab] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '', // Added confirmPassword field
    phone: '', // Added phone field
    roles: [],
  });

  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // State for confirm password visibility

  const DASHBOARD_TEAM_ID = '671ca690003781eae833'; // Replace with your actual Dashboard team ID

  const rolesList = [
    { label: 'Admin', value: 'admin', icon: 'ri-admin-line' },
    { label: 'Marketing', value: 'marketing', icon: 'ri-advertisement-line' },
    { label: 'Customer Relations', value: 'customer_relations', icon: 'ri-customer-service-2-line' },
    { label: 'Operations Team 1', value: 'operations_team_1', icon: 'ri-team-line' },
    { label: 'Operations Team 2', value: 'operations_team_2', icon: 'ri-team-line' },
  ];

  /**
   * Fetch memberships from the Dashboard team.
   */
  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const limit = 25;
      let offset = 0;
      let membershipsBatch = [];
      let totalMemberships = [];

      do {
        const response = await teamsClient.listMemberships(DASHBOARD_TEAM_ID, [
          Query.limit(limit),
          Query.offset(offset),
        ]);
        membershipsBatch = response.memberships;
        totalMemberships = totalMemberships.concat(membershipsBatch);
        offset += limit;
      } while (membershipsBatch.length === limit);

      setMemberships(totalMemberships);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast.error('Failed to fetch memberships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  /**
   * Group users by their roles for display.
   */
  useEffect(() => {
    const groupUsersByRole = () => {
      const groupedUsers = {};
      rolesList.forEach((role) => {
        groupedUsers[role.value] = [];
      });

      memberships.forEach((membership) => {
        const userId = membership.userId;
        const userEmail = membership.userEmail;
        const roles = membership.roles;
        roles.forEach((role) => {
          if (groupedUsers[role]) {
            groupedUsers[role].push({
              membershipId: membership.$id,
              userId,
              userEmail,
              roles: membership.roles,
            });
          }
        });
      });

      setUsersByRole(groupedUsers);
    };

    groupUsersByRole();
  }, [memberships]);

  /**
   * Handle the deletion of a user.
   * @param {Object} user - The user to delete.
   */
  const handleDeleteUser = (user) => {
    setSelectedMembership(user);
    setDeleteModal(true);
  };

  /**
   * Confirm and execute the deletion of a user.
   */
  const confirmDeleteUser = async () => {
    if (!selectedMembership) return;
    setLoading(true);
    try {
      const jwtResponse = await accountClient.createJWT();
      const jwtToken = jwtResponse.jwt;

      const functionClient = new Client();
      functionClient
        .setEndpoint(appwriteClient.config.endpoint)
        .setProject(appwriteClient.config.project)
        .setJWT(jwtToken);

      const functionsWithJwt = new Functions(functionClient);
      const functionId = '672c75a30002c0e7e6d3'; // Replace with your actual function ID

      const execution = await functionsWithJwt.createExecution(
        functionId,
        JSON.stringify({
          userId: selectedMembership.userId,
        })
      );

      const result = await pollExecution(functionsWithJwt, functionId, execution.$id);
      console.log('Function result:', result);

      if (result.status === 'completed') {
        toast.success('User deleted successfully.');

        // Refresh the memberships list
        await fetchMemberships();
      } else {
        throw new Error('Function execution failed.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.');
    } finally {
      setLoading(false);
      setDeleteModal(false);
      setSelectedMembership(null);
    }
  };

  /**
   * Toggle the visibility of the Create User modal.
   */
  const toggleCreateModal = () => {
    setCreateModal(!createModal);
    setNewUserData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      roles: [],
    });
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);
  };

  /**
   * Poll the function execution until it's completed.
   * @param {Functions} functionsClient - The Functions client instance.
   * @param {string} functionId - The ID of the function.
   * @param {string} executionId - The ID of the function execution.
   * @param {number} interval - Polling interval in milliseconds.
   * @param {number} timeout - Maximum time to wait in milliseconds.
   * @returns {Promise<Object>} - The execution object.
   */
  const pollExecution = async (functionsClient, functionId, executionId, interval = 1000, timeout = 30000) => {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const execution = await functionsClient.getExecution(functionId, executionId);
          console.log('Execution response:', execution);

          if (execution.status === 'completed') {
            resolve(execution);
          } else if (execution.status === 'failed') {
            reject(new Error(execution.stderr || 'Function execution failed.'));
          } else {
            if (Date.now() - startTime > timeout) {
              reject(new Error('Function execution timed out.'));
            } else {
              setTimeout(checkStatus, interval);
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      checkStatus();
    });
  };

  /**
   * Handle the creation of a new user.
   * @param {Event} e - The form submission event.
   */
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, phone, roles } = newUserData;

    // Validate password and confirm password
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+\d{1,15}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Phone number must start with a "+" and contain up to fifteen digits.');
      return;
    }

    if (!username || !email || !password || !phone || roles.length === 0) {
      toast.error('Please fill in all fields and select at least one role.');
      return;
    }

    setCreating(true);
    try {
      const jwtResponse = await accountClient.createJWT();
      const jwtToken = jwtResponse.jwt;

      const functionClient = new Client();
      functionClient
        .setEndpoint(appwriteClient.config.endpoint)
        .setProject(appwriteClient.config.project)
        .setJWT(jwtToken);

      const functionsWithJwt = new Functions(functionClient);
      const functionId = '6721d69200185a8d7db6'; // Replace with your actual function ID

      const execution = await functionsWithJwt.createExecution(
        functionId,
        JSON.stringify({
          username,
          email,
          password,
          phone,
          roles,
        })
      );

      const result = await pollExecution(functionsWithJwt, functionId, execution.$id);
      console.log('Function result:', result);

      if (result.status === 'completed') {
        toast.success('User created successfully.');

        // Refresh the memberships list
        await fetchMemberships();

        toggleCreateModal();
      } else {
        throw new Error('Function execution failed.');
      }

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`An error occurred while creating the user: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Retrieve current user roles from localStorage
  const currentUserRoles = JSON.parse(localStorage.getItem('userRoles')) || [];

  // Authorization check: Only admins can access this page
  if (!currentUserRoles.includes('admin')) {
    return (
      <div className="text-center mt-5">
        <h3>You are not authorized to access this page.</h3>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        {/* Update Page Title */}
        <div className="page-title-box">
          <Row className="align-items-center">
            <Col md={8}>
              <h4 className="page-title mb-0">User Management</h4>
              <ol className="breadcrumb m-0 mt-2">
                <li className="breadcrumb-item"><a href="#">Dashboard</a></li>
                <li className="breadcrumb-item active">User Management</li>
              </ol>
            </Col>
            <Col md={4}>
              <div className="float-end d-none d-md-block">
                <Button color="primary" className="btn-rounded" onClick={toggleCreateModal}>
                  <i className="ri-user-add-line align-middle me-2"></i>
                  Create User
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Update Card UI */}
        <Card>
          <CardHeader className="bg-soft-light">
            <Nav pills className="nav-tabs-custom nav-justified">
              {rolesList.map((role) => (
                <NavItem key={role.value}>
                  <NavLink
                    className={classnames(
                      'transition-all duration-300 ease-in-out cursor-pointer',
                      {
                        'bg-primary text-white hover:text-white focus:text-white': activeTab === role.value,
                        'text-gray-700 hover:text-primary focus:text-primary': activeTab !== role.value
                      }
                    )}
                    onClick={() => setActiveTab(role.value)}
                    href="#"
                  >
                    <i className={`${role.icon} text-2xl block mb-1 transition-colors duration-300 ${
                      activeTab === role.value ? 'text-white' : 'group-hover:text-primary'
                    }`}></i>
                    <span className={`hidden sm:block transition-colors duration-300 ${
                      activeTab === role.value ? 'text-white' : 'group-hover:text-primary'
                    }`}>
                      {role.label}
                    </span>
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="text-center my-5">
                <Spinner color="primary" />
              </div>
            ) : (
              <div className="tab-content">
                {rolesList.map((role) => (
                  <div
                    className={classnames('tab-pane', { active: activeTab === role.value })}
                    key={role.value}
                  >
                    <Table hover responsive className="table-centered table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Email</th>
                          <th>Roles</th>
                          <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(usersByRole[role.value] || []).map((user) => (
                          <tr key={user.membershipId}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-xs me-2 bg-soft-primary">
                                  <span className="avatar-title rounded-circle text-white bg-primary">
                                    {user.userEmail.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-gray-700">
                                  {user.userEmail}
                                </span>
                              </div>
                            </td>
                            <td>
                              {user.roles.map((role, idx) => (
                                <span key={idx} className="badge bg-soft-primary text-primary me-1">
                                  {role}
                                </span>
                              ))}
                            </td>
                            <td>
                              <Button
                                color="danger"
                                size="sm"
                                className="btn-soft-danger"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <i className="ri-delete-bin-2-line align-middle"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {usersByRole[role.value]?.length === 0 && (
                          <tr>
                            <td colSpan="3" className="text-center py-4 text-muted">
                              <i className="ri-user-unfollow-line display-4 d-block mb-2"></i>
                              No users found for this role
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Update Create User Modal */}
        <Modal isOpen={createModal} toggle={toggleCreateModal} centered size="lg">
          <Form onSubmit={handleCreateUser}>
            <ModalHeader toggle={toggleCreateModal} className="bg-light">
              <span className="fw-semibold">Create New User</span>
            </ModalHeader>
            <ModalBody className="p-4">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="username" className="form-label">Username</Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter username"
                      value={newUserData.username}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, username: e.target.value })
                      }
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email" className="form-label">Email</Label>
                    <Input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter email"
                      value={newUserData.email}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, email: e.target.value })
                      }
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="password" className="form-label">Password</Label>
                    <InputGroup>
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        className="form-control"
                        id="password"
                        placeholder="Enter password"
                        value={newUserData.password}
                        onChange={(e) =>
                          setNewUserData({ ...newUserData, password: e.target.value })
                        }
                        required
                      />
                      <InputGroupText
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        style={{ cursor: 'pointer' }}
                      >
                        {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </InputGroupText>
                    </InputGroup>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="confirmPassword" className="form-label">Confirm Password</Label>
                    <InputGroup>
                      <Input
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm password"
                        value={newUserData.confirmPassword}
                        onChange={(e) =>
                          setNewUserData({ ...newUserData, confirmPassword: e.target.value })
                        }
                        required
                      />
                      <InputGroupText
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        style={{ cursor: 'pointer' }}
                      >
                        {confirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </InputGroupText>
                    </InputGroup>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="phone" className="form-label">Phone</Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="phone"
                      placeholder="+923451470397"
                      value={newUserData.phone}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, phone: e.target.value })
                      }
                      required
                    />
                    <small className="text-muted">
                      Must start with "+" followed by country code and number
                    </small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="roles" className="form-label">Role</Label>
                    <Input
                      type="select"
                      className="form-select"
                      id="roles"
                      value={newUserData.roles[0] || ''} // Only use first role
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          roles: [e.target.value], // Store as single-item array
                        })
                      }
                      required
                    >
                      <option value="">Select Role</option>
                      {rolesList.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={toggleCreateModal}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={creating}>
                {creating ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Delete User Modal */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} centered>
          <ModalHeader toggle={() => setDeleteModal(false)}>
            Delete User
          </ModalHeader>
          <ModalBody>
            Are you sure you want to delete user{' '}
            <strong>{selectedMembership?.userEmail}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>

        {/* Toast Notifications */}
        <ToastContainer closeButton={false} limit={1} />
      </Container>
    </div>
  );
};

export default UserManagement;
