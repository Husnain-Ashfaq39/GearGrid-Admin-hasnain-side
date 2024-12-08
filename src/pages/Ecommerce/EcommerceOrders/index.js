// src/components/EcommerceOrders.js

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Modal,
  ModalHeader,
  Form,
  ModalBody,
  Label,
  Input,
  FormFeedback,
  Button,
} from "reactstrap";
import moment from "moment";
import { Link } from "react-router-dom";
import classnames from "classnames";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { isEmpty } from "lodash";

// Import WidgetsOrders component
import WidgetsOrders from "./WidgetsOrders";

// Formik and Yup for form handling
import * as Yup from "yup";
import { useFormik } from "formik";

// Import dbServices
import db from "../../../appwrite/Services/dbServices";

// Import other components and libraries
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ExportCSVModal from "../../../Components/Common/ExportCSVModal";

import { Query } from "appwrite";
import Flatpickr from "react-flatpickr";

// Import Lottie and animations
import Lottie from "lottie-react";
import loadingAnimation from "../../../assets/animations/loading.json";
import noDataAnimation from "../../../assets/animations/search.json";
import axios from "axios";

const EcommerceOrders = () => {
  // State Management
  const [orders, setOrders] = useState([]); // Master data
  const [filteredOrders, setFilteredOrders] = useState([]); // Filtered data based on active filters
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const [selectedOrder, setSelectedOrder] = useState(null); // Currently selected order
  const [isEdit, setIsEdit] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const [isExportCSV, setIsExportCSV] = useState(false);

  // State for Date Range Filtering
  const [dateRange, setDateRange] = useState([
    moment().startOf("day").toDate(),
    moment().endOf("day").toDate(),
  ]); // Default to today's date

  // Pagination States
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // State for widget data
  const [widgetData, setWidgetData] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    totalCustomers: 0,
    myBalance: 0,
  });

  // Define options for order status and payment method
  const orderStatusOptions = [
    { label: "All", value: "All" },
    { label: "Pending", value: "Pending" },
    { label: "Processing", value: "Processing" },
    { label: "Dispatched", value: "Dispatched" },
    { label: "Delivered", value: "Delivered" },
    { label: "Returns", value: "Returns" },
  ];

  const paymentMethodOptions = [
    { label: "All", value: "All" },
    { label: "Mastercard", value: "Mastercard" },
    { label: "Paypal", value: "Paypal" },
    { label: "Visa", value: "Visa" },
    { label: "COD", value: "COD" },
    { label: "Direct Bank Transfer", value: "directBankTransfer" },
    { label: "Paid", value: "cardPayment" },
  ];

  // Add these new states after other state declarations
  const [shippingModal, setShippingModal] = useState(false);
  const [shippingRate, setShippingRate] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [loadingRate, setLoadingRate] = useState(false);

  // Add a new state to store the current shipping rate document ID
  const [shippingRateDocId, setShippingRateDocId] = useState(null);

  // Helper Function to Generate Order Number
  const getOrderNumber = (orderId) => {
    return `#${orderId.substring(0, 8).toUpperCase()}`;
  };

  // Toggle Modal
  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setSelectedOrder(null);
      setIsEdit(false);
      formik.resetForm();
    }
  };

  // Handle Edit Order Click
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsEdit(true);
    toggleModal();
  };

  // Handle Delete Order Click
  const handleDeleteOrderClick = (order) => {
    setSelectedOrder(order);
    setDeleteModal(true);
  };

  // Confirm Delete Order
  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const orderId = selectedOrder._id;
      await db.Orders.delete(orderId);
      // Remove the deleted order from master data
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
      toast.success("Order deleted successfully", { autoClose: 3000 });
    } catch (err) {
      console.error("Delete Order Error:", err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        "Failed to delete order.";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setLoading(false);
      setDeleteModal(false);
      setSelectedOrder(null);
    }
  };

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    if (!hasMore) return; // No more orders to fetch

    setLoading(true);
    setError(null);
    try {
     

      // Fetch Orders with Queries
      const fetchedOrders = await axios.get('http://localhost:5001/orders/all'); // Call custom API to get all orders using axios
      console.log("Fetched Orders "+JSON.stringify(fetchedOrders));
      

     

      // Add orderNumber to each order
      const ordersWithNumber = fetchedOrders.map((order) => ({
        ...order,
        orderNumber: getOrderNumber(order._id),
      }));

      // Deduplicate orders based on _id
      setOrders((prevOrders) => {
        const existingOrderIds = new Set(prevOrders.map((order) => order._id));
        const newUniqueOrders = ordersWithNumber.filter(
          (order) => !existingOrderIds.has(order._id)
        );
        return [...prevOrders, ...newUniqueOrders];
      });
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        "Failed to fetch orders.";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }, [dateRange, cursor, hasMore]);

  // Helper to map activeTab to filter criteria
  const activeTabToFilter = (tabId) => {
    switch (tabId) {
      case "2":
        return { type: "orderStatus", value: "Delivered" };
      case "3":
        return { type: "orderStatus", value: "Returns" };
      case "4":
        return { type: "paymentMethod", value: "directBankTransfer" };
      case "5":
        return { type: "paymentMethod", value: "cardPayment" };
      case "6":
        return { type: "orderStatus", value: "Pending" };
      case "7":
        return { type: "orderStatus", value: "Processing" };
      case "8":
        return { type: "orderStatus", value: "Dispatched" };
      default:
        return { type: "all", value: "All" };
    }
  };

  // Use useEffect to fetch Orders when component mounts or when dateRange/cursor changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Compute Widget Data whenever filteredOrders changes
  useEffect(() => {
    const computeWidgetData = () => {
      const totalEarnings = filteredOrders
        .filter((order) => order.orderStatus.toLowerCase() !== "returns")
        .reduce((acc, order) => acc + (parseFloat(order.totalPrice) || 0), 0);

      const totalOrders = filteredOrders.length;

      // Get unique customer names
      const customerNames = new Set(
        filteredOrders.map(
          (order) =>
            `${order.customerFirstName || ""} ${
              order.customerLastName || ""
            }`.trim()
        )
      );
      const totalCustomers = customerNames.size;

      const myBalance = filteredOrders
        .filter(
          (order) =>
            order.orderStatus.toLowerCase() !== "returns" &&
            order.paymentMethod &&
            order.paymentMethod.toLowerCase() === "directbanktransfer"
        )
        .reduce((acc, order) => acc + (parseFloat(order.totalPrice) || 0), 0);

      setWidgetData({
        totalEarnings,
        totalOrders,
        totalCustomers,
        myBalance,
      });
    };

    computeWidgetData();
  }, [filteredOrders]);

  // Memoized function to filter orders based on activeTab
  const applyTabFilter = useCallback(() => {
    const filterCriteria = activeTabToFilter(activeTab);

    if (filterCriteria.type === "all") {
      // All Orders
      setFilteredOrders(orders);
    } else if (filterCriteria.type === "orderStatus") {
      // Filter by Order Status (case-insensitive)
      const filtered = orders.filter(
        (order) =>
          order.orderStatus &&
          order.orderStatus.toLowerCase() === filterCriteria.value.toLowerCase()
      );
      setFilteredOrders(filtered);
    } else if (filterCriteria.type === "paymentMethod") {
      // Filter by Payment Method (case-insensitive)
      if (filterCriteria.value.toLowerCase() === "directbanktransfer") {
        const filtered = orders.filter(
          (order) =>
            order.paymentMethod &&
            order.paymentMethod.toLowerCase() === "directbanktransfer"
        );
        setFilteredOrders(filtered);
      } else if (filterCriteria.value.toLowerCase() === "cardpayment") {
        const filtered = orders.filter(
          (order) =>
            order.paymentMethod &&
            order.paymentMethod.toLowerCase() === "cardpayment"
        );
        setFilteredOrders(filtered);
      } else {
        setFilteredOrders(orders);
      }
    } else {
      setFilteredOrders(orders);
    }
  }, [activeTab, orders]);

  // Use useEffect to apply tab filter whenever activeTab or orders change
  useEffect(() => {
    applyTabFilter();
  }, [activeTab, orders, applyTabFilter]);

  // Handle Select All Checkbox
  const handleSelectAll = () => {
    const isChecked =
      selectedCheckBoxDelete.length === filteredOrders.length &&
      filteredOrders.length > 0;
    if (isChecked) {
      setSelectedCheckBoxDelete([]);
      setIsMultiDeleteButton(false);
    } else {
      const allOrderIds = filteredOrders.map((order) => order._id);
      setSelectedCheckBoxDelete(allOrderIds);
      setIsMultiDeleteButton(true);
    }
  };

  // Handle Individual Checkbox Change
  const handleCheckboxChange = (orderId) => {
    setSelectedCheckBoxDelete((prevSelected) => {
      if (prevSelected.includes(orderId)) {
        const updatedSelected = prevSelected.filter((id) => id !== orderId);
        setIsMultiDeleteButton(updatedSelected.length > 0);
        return updatedSelected;
      } else {
        const updatedSelected = [...prevSelected, orderId];
        setIsMultiDeleteButton(updatedSelected.length > 0);
        return updatedSelected;
      }
    });
  };

  // Confirm Delete Multiple Orders
  const confirmDeleteMultipleOrders = async () => {
    if (selectedCheckBoxDelete.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedCheckBoxDelete.map((orderId) => db.Orders.delete(orderId))
      );
      // Remove the deleted orders from master data
      setOrders((prevOrders) =>
        prevOrders.filter((order) => !selectedCheckBoxDelete.includes(order._id))
      );
      setSelectedCheckBoxDelete([]);
      setIsMultiDeleteButton(false);
      toast.success("Selected orders deleted successfully", { autoClose: 3000 });
    } catch (err) {
      console.error("Delete Multiple Orders Error:", err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        "Failed to delete some orders.";
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setLoading(false);
      setDeleteModalMulti(false);
    }
  };

  // Filter Orders Based on Tab Selection
  const handleTabClick = (tabId, statusType) => {
    setActiveTab(tabId);
    // 'applyTabFilter' will be called via useEffect due to dependency on 'activeTab' and 'orders'
  };

  // Formik for Edit Order Form
  const formik = useFormik({
    enableReinitialize: true,
    initialValues:
      isEdit && selectedOrder
        ? {
            status: selectedOrder.orderStatus,
          }
        : {},
    validationSchema: Yup.object({
      status: Yup.string().required("Please select Delivery Status"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (isEdit) {
        // Only update the delivery status
        if (!selectedOrder) {
          toast.error("No order selected for editing.", { autoClose: 3000 });
          setSubmitting(false);
          return;
        }

        const updatedOrder = {
          orderStatus: values.status,
          updatedAt: new Date().toISOString(),
        };

        setLoading(true);
        try {
          const orderId = selectedOrder._id;
          await axios.put(`http://localhost:5001/orders/${orderId}`, updatedOrder);
          // Update local state
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? { ...order, ...updatedOrder } : order
            )
          );
          toast.success("Order updated successfully", { autoClose: 3000 });
          toggleModal();
        } catch (err) {
          console.error("Update Order Error:", err);
          const errorMessage =
            (err.response && err.response.data && err.response.data.message) ||
            err.message ||
            "Failed to update order.";
          setError(errorMessage);
          toast.error(errorMessage, { autoClose: 5000 });
        } finally {
          setLoading(false);
          setSubmitting(false);
        }
      }
    },
  });

  // Define table columns based on Orders schema
  const columns = useMemo(
    () => [
      {
        header: (
          <input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            checked={
              selectedCheckBoxDelete.length === filteredOrders.length &&
              filteredOrders.length > 0
            }
            onChange={handleSelectAll}
            aria-label="Select All Orders"
          />
        ),
        cell: (cell) => (
          <input
            type="checkbox"
            className="orderCheckBox form-check-input"
            value={cell.row.original._id}
            checked={selectedCheckBoxDelete.includes(cell.row.original._id)}
            onChange={() => handleCheckboxChange(cell.row.original._id)}
            aria-label={`Select Order ${cell.row.original.orderNumber}`}
          />
        ),
        id: "#",
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "No.",
        cell: (cell) => cell.row.index + 1,
        id: "serial",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        header: "Order Number",
        accessorKey: "orderNumber",
        enableColumnFilter: false,
        cell: (cell) => {
          const orderNumber = cell.getValue();
          return orderNumber;
        },
      },
      {
        header: "Customer",
        accessorKey: "customerFirstName",
        enableColumnFilter: false,
        cell: (cell) => {
          const firstName = cell.row.original.customerFirstName || "";
          const lastName = cell.row.original.customerLastName || "";
          return `${firstName} ${lastName}`.trim() || "N/A";
        },
      },
      {
        header: "Order Date",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: (cell) =>
          moment(cell.getValue()).format("DD MMM YYYY, hh:mm A"),
      },
      {
        header: "Amount",
        accessorKey: "totalPrice",
        enableColumnFilter: false,
        cell: (cell) => `£${parseFloat(cell.getValue()).toFixed(2)}`,
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        enableColumnFilter: false,
      },
      {
        header: "Delivery Status",
        accessorKey: "orderStatus",
        enableColumnFilter: false,
        cell: (cell) => {
          let status = cell.getValue();
          if (typeof status === "string") {
            status = status.toLowerCase(); // Convert to lowercase for case-insensitive matching
          } else {
            status = "";
          }

          const statusClasses = {
            pending: "badge bg-warning text-dark",
            processing: "badge bg-info text-white",
            dispatched: "badge bg-primary text-white",
            delivered: "badge bg-success text-white",
            returns: "badge bg-danger text-white",
          };

          // Capitalize the first letter for display
          const displayStatus =
            status.charAt(0).toUpperCase() + status.slice(1);

          return (
            <span className={statusClasses[status] || "badge bg-light text-dark"}>
              {displayStatus || "N/A"}
            </span>
          );
        },
      },
      {
        header: "Action",
        cell: (cellProps) => {
          const orderData = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item">
                <Link
                  to={`/dashboard/orders/${orderData._id}`}
                  className="text-primary d-inline-block"
                  aria-label={`View Order ${orderData.orderNumber}`}
                >
                  <i className="ri-eye-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item edit">
                <Link
                  to="#"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => handleEditOrder(orderData)}
                  aria-label={`Edit Order ${orderData.orderNumber}`}
                >
                  <i className="ri-pencil-fill fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => handleDeleteOrderClick(orderData)}
                  aria-label={`Delete Order ${orderData.orderNumber}`}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li>
            </ul>
          );
        },
      },
    ],
    [selectedCheckBoxDelete, filteredOrders.length]
  );

  // Helper to render Loading Animation
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

  // Helper to render No Results Animation
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
        <h5>No orders found.</h5>
      </div>
    </div>
  );

  // Update the fetch function to store the document ID
  const fetchShippingRate = async () => {
    try {
      const response = await db.ShippingRates.list([
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]);
      if (response.documents.length > 0) {
        const latestRate = response.documents[0];
        setShippingRate(latestRate.shippingRate);
        setFreeDeliveryThreshold(latestRate.FreeDeliveryThreshold || 0);
        setShippingRateDocId(latestRate._id); // Store the document ID
      }
    } catch (error) {
      console.error("Error fetching shipping rate:", error);
      toast.error("Failed to fetch shipping rate");
    }
  };

  // Add useEffect to fetch shipping rate on component mount
  useEffect(() => {
    fetchShippingRate();
  }, []);

  // Update the handle update function to use update instead of create
  const handleUpdateShippingRate = async (e) => {
    e.preventDefault();
    setLoadingRate(true);
    try {
      const updatedData = {
        shippingRate: parseFloat(shippingRate),
        FreeDeliveryThreshold:
          freeDeliveryThreshold === ""
            ? 70
            : parseFloat(freeDeliveryThreshold), // Default to 70 if empty
        updatedAt: new Date().toISOString(),
      };

      if (shippingRateDocId) {
        // Update existing document
        await db.ShippingRates.update(shippingRateDocId, updatedData);
      } else {
        // Create new document if none exists
        const response = await db.ShippingRates.create(updatedData);
        setShippingRateDocId(response._id);
      }

      toast.success("Shipping settings updated successfully");
      setShippingModal(false);
    } catch (error) {
      console.error("Error updating shipping settings:", error);
      toast.error("Failed to update shipping settings");
    } finally {
      setLoadingRate(false);
    }
  };

  document.title = "Orders | CarBungalo";

  return (
    <div className="page-content">
      {/* Export CSV Modal */}
      <ExportCSVModal
        show={isExportCSV}
        onCloseClick={() => setIsExportCSV(false)}
        data={filteredOrders.map((order, index) => ({
          no: index + 1,
          orderNumber: order.orderNumber,
          customer: `${order.customerFirstName || ""} ${
            order.customerLastName || ""
          }`.trim() || "N/A",
          orderDate: moment(order.createdAt).format("DD MMM YYYY, hh:mm A"),
          amount: `£${parseFloat(order.totalPrice).toFixed(2)}`,
          paymentMethod: order.paymentMethod,
          deliveryStatus: order.orderStatus,
        }))}
        filename={`Orders_${moment().format("YYYYMMDD_HHmmss")}.csv`}
      />

      {/* Delete Single Order Modal */}
      <DeleteModal
        show={deleteModal}
        onDeleteClick={confirmDeleteOrder}
        onCloseClick={() => setDeleteModal(false)}
        title="Delete Order"
        message="Are you sure you want to delete this order?"
      />

      {/* Delete Multiple Orders Modal */}
      <DeleteModal
        show={deleteModalMulti}
        onDeleteClick={confirmDeleteMultipleOrders}
        onCloseClick={() => setDeleteModalMulti(false)}
        title="Delete Multiple Orders"
        message="Are you sure you want to delete the selected orders?"
      />

      <Container fluid>
        {/* Breadcrumb */}
        <BreadCrumb title="Orders" pageTitle="Ecommerce" />

        {/* Widgets */}
        <Row>
          <WidgetsOrders
            totalEarnings={widgetData.totalEarnings}
            totalOrders={widgetData.totalOrders}
            totalCustomers={widgetData.totalCustomers}
            myBalance={widgetData.myBalance}
          />
        </Row>

        <Row>
          <Col lg={12}>
            <Card id="orderList">
              <CardHeader className="border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">Order History</h5>
                  </div>
                  <div className="col-sm-auto">
                    <div className="d-flex gap-1 flex-wrap">
                      {/* Date Range Filter with Input Group */}
                      <div className="col-sm-auto">
                        <div className="input-group me-2">
                          <Flatpickr
                            id="dateRange"
                            className="form-control border-0 dash-filter-picker shadow"
                            options={{
                              mode: "range",
                              dateFormat: "d M, Y",
                            }}
                            value={dateRange}
                            onChange={(selectedDates) => {
                              setDateRange(selectedDates);
                              // Reset pagination and master data when date range changes
                              setOrders([]);
                              setFilteredOrders([]);
                              setCursor(null);
                              setHasMore(true);
                            }}
                            placeholder="Select Date Range"
                          />
                          <div className="input-group-text bg-primary border-primary text-white">
                            <i className="ri-calendar-2-line"></i>
                          </div>
                        </div>
                      </div>
                      {/* Reset Button */}
                      <Button
                        color="secondary"
                        onClick={() => {
                          setDateRange([
                            moment().startOf("day").toDate(),
                            moment().endOf("day").toDate(),
                          ]);
                          setOrders([]);
                          setFilteredOrders([]);
                          setCursor(null);
                          setHasMore(true);
                        }}
                        className="me-2"
                      >
                        <i className="ri-refresh-line align-bottom me-1"></i> Reset
                      </Button>
                      {/* Export CSV Button */}
                      <Button
                        color="info"
                        onClick={() => setIsExportCSV(true)}
                        className="me-2"
                      >
                        <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                        Export
                      </Button>
                      {isMultiDeleteButton && (
                        <Button
                          color="danger"
                          onClick={() => setDeleteModalMulti(true)}
                        >
                          <i className="ri-delete-bin-2-line"></i>
                        </Button>
                      )}
                      {/* Shipping Rate Button */}
                      <Button
                        color="primary"
                        onClick={() => setShippingModal(true)}
                        className="me-2"
                      >
                        <i className="ri-ship-line align-bottom me-1"></i> Shipping Rate
                      </Button>
                    </div>
                  </div>
                </Row>
              </CardHeader>

              <CardBody className="pt-0">
                <div>
                  {/* Tabs for Filtering Orders */}
                  <Nav
                    className="nav-tabs nav-tabs-custom nav-success"
                    role="tablist"
                  >
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "1" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("1", "All")}
                        href="#"
                      >
                        <i className="ri-store-2-fill me-1 align-bottom"></i> All
                        Orders
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "2" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("2", "Delivered")}
                        href="#"
                      >
                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                        Delivered
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "3" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("3", "Returns")}
                        href="#"
                      >
                        <i className="ri-arrow-left-right-fill me-1 align-bottom"></i>{" "}
                        Returns
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "6" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("6", "Pending")}
                        href="#"
                      >
                        <i className="ri-hourglass-line me-1 align-bottom"></i>{" "}
                        Pending
                      </NavLink>
                    </NavItem>
                    {/* New "Processing" Tab */}
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "7" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("7", "Processing")}
                        href="#"
                      >
                        <i className="ri-time-line me-1 align-bottom"></i>{" "}
                        Processing
                      </NavLink>
                    </NavItem>
                    {/* New "Dispatched" Tab */}
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "8" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("8", "Dispatched")}
                        href="#"
                      >
                        <i className="ri-truck-line me-1 align-bottom"></i>{" "}
                        Dispatched
                      </NavLink>
                    </NavItem>
                    {/* New Payment Method Tabs */}
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "4" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("4", "Direct Bank Transfer")}
                        href="#"
                      >
                        <i className="ri-bank-line me-1 align-bottom"></i> Direct Bank
                        Transfer
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames(
                          { active: activeTab === "5" },
                          "fw-semibold"
                        )}
                        onClick={() => handleTabClick("5", "Paid")}
                        href="#"
                      >
                        <i className="ri-bank-line me-1 align-bottom"></i> Paid
                      </NavLink>
                    </NavItem>
                  </Nav>

                  {/* Table or Loader or Error */}
                  {loading && orders.length === 0 ? (
                    renderLoadingAnimation()
                  ) : error ? (
                    <div className="alert alert-danger mt-3" role="alert">
                      {error}
                    </div>
                  ) : isEmpty(filteredOrders) ? (
                    renderNoResultsAnimation()
                  ) : (
                    <>
                      <TableContainer
                        columns={columns}
                        data={filteredOrders}
                        isGlobalFilter={true}
                        isAddUserList={false}
                        customPageSize={8}
                        divClass="table-responsive table-card mb-1"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light text-muted"
                        handleOrderClick={() => {}}
                        isOrderFilter={true}
                        SearchPlaceholder="Search for order number or customer..."
                        globalFilterFn="fuzzy"
                        filterFields={[
                          "orderNumber",
                          "customerFirstName",
                          "customerLastName",
                        ]}
                      />
                      {/* Load More Button for Pagination */}
                      {hasMore && (
                        <div className="d-flex justify-content-center mt-3">
                          <Button
                            color="primary"
                            onClick={fetchOrders}
                            disabled={loading}
                          >
                            {loading ? "Loading..." : "Load More"}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Edit Order Modal */}
                <Modal
                  id="showModal"
                  isOpen={modal}
                  toggle={toggleModal}
                  centered
                >
                  <ModalHeader className="bg-light p-3" toggle={toggleModal}>
                    {isEdit ? "Edit Delivery Status" : "Add Order"}
                  </ModalHeader>
                  <Form onSubmit={formik.handleSubmit}>
                    <ModalBody>
                      {isEdit ? (
                        // Edit Mode: Only show Delivery Status field
                        <div className="mb-3">
                          <Label htmlFor="status-field" className="form-label">
                            Delivery Status
                          </Label>
                          <Input
                            name="status"
                            id="status-field"
                            type="select"
                            className="form-select"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.status}
                            invalid={
                              formik.touched.status &&
                              Boolean(formik.errors.status)
                            }
                          >
                            <option value="">Select Delivery Status</option>
                            {orderStatusOptions
                              .filter((option) => option.value !== "All")
                              .map((option, idx) => (
                                <option value={option.value} key={idx}>
                                  {option.label}
                                </option>
                              ))}
                          </Input>
                          {formik.touched.status && formik.errors.status && (
                            <FormFeedback type="invalid">
                              {formik.errors.status}
                            </FormFeedback>
                          )}
                        </div>
                      ) : null}
                    </ModalBody>
                    <div className="modal-footer">
                      <div className="hstack gap-2 justify-content-end">
                        <Button color="light" onClick={toggleModal}>
                          Close
                        </Button>
                        <Button
                          type="submit"
                          color="success"
                          disabled={formik.isSubmitting || loading}
                        >
                          {isEdit ? "Update Status" : "Add Order"}
                        </Button>
                      </div>
                    </div>
                  </Form>
                </Modal>

                {/* Shipping Rate Modal */}
                <Modal
                  isOpen={shippingModal}
                  toggle={() => setShippingModal(!shippingModal)}
                  centered
                >
                  <ModalHeader toggle={() => setShippingModal(!shippingModal)}>
                    Update Shipping Settings
                  </ModalHeader>
                  <form onSubmit={handleUpdateShippingRate}>
                    <ModalBody>
                      <div className="mb-3">
                        <Label htmlFor="shippingRate" className="form-label">
                          Shipping Rate (£) *
                        </Label>
                        <Input
                          type="number"
                          id="shippingRate"
                          placeholder="Enter shipping rate"
                          value={shippingRate}
                          onChange={(e) => setShippingRate(e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <Label htmlFor="freeDeliveryThreshold" className="form-label">
                          Free Delivery Threshold (£)
                        </Label>
                        <Input
                          type="number"
                          id="freeDeliveryThreshold"
                          placeholder="Enter free delivery threshold (optional)"
                          value={freeDeliveryThreshold}
                          onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                        <small className="text-muted">
                          Orders above this amount will qualify for free delivery. If
                          left empty, default value of £70 will be used.
                        </small>
                      </div>
                    </ModalBody>
                    <div className="modal-footer">
                      <Button
                        type="button"
                        color="light"
                        onClick={() => setShippingModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" disabled={loadingRate}>
                        {loadingRate ? "Updating..." : "Update Settings"}
                      </Button>
                    </div>
                  </form>
                </Modal>

                {/* Toast Notifications */}
                <ToastContainer closeButton={false} limit={1} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EcommerceOrders;
