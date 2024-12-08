import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
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
import { Link } from "react-router-dom";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Lottie and animations
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/animations/loading.json";
import noDataAnimation from "../../assets/animations/search.json";

// Import Formik and Yup for form handling
import * as Yup from "yup";
import { useFormik } from "formik";

// Import dbServices
import db from "../../appwrite/Services/dbServices";
import axios from "axios";

const EcommerceVouchers = () => {
  // State Management
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  // Toggle Modal
  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setSelectedVoucher(null);
      setIsEdit(false);
      formik.resetForm();
    }
  };

  // Fetch Vouchers
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/vouchers');
      setVouchers(response);
    } catch (err) {
      console.error("Fetch Vouchers Error:", err);
      setError("Failed to fetch vouchers");
      toast.error("Failed to fetch vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Handle Edit Voucher
  const handleEditVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setIsEdit(true);
    setModal(true);
  };

  // Handle Delete Voucher
  const handleDeleteVoucher = (voucher) => {
    setSelectedVoucher(voucher);
    setDeleteModal(true);
  };

  // Confirm Delete Voucher
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/vouchers/${selectedVoucher._id}`);
      toast.success("Voucher deleted successfully");
      fetchVouchers();
      setDeleteModal(false);
    } catch (error) {
      console.error("Delete Voucher Error:", error);
      toast.error("Failed to delete voucher");
    }
  };

  // Formik validation schema with uniqueness check in onSubmit
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: selectedVoucher?.code || "",
      discount: selectedVoucher?.discount || "",
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .required("Voucher code is required")
        .min(3, "Voucher code must be at least 3 characters"),
      discount: Yup.number()
        .required("Discount value is required")
        .positive("Discount value must be positive")
        .max(100, "Discount value cannot exceed 100"),
    }),
    onSubmit: async (values, { setErrors }) => {
      // Normalize the code by trimming and converting to uppercase
      const normalizedCode = values.code.trim().toUpperCase();

      // Check for uniqueness
      const duplicate = vouchers.find(
        (v) =>
          v.code.toUpperCase() === normalizedCode &&
          (!isEdit || v._id !== selectedVoucher._id)
      );

      if (duplicate) {
        setErrors({ code: "Voucher code must be unique" });
        return;
      }

      try {
        if (isEdit) {
          await axios.put(`http://localhost:5001/vouchers/${selectedVoucher._id}`, {
            code: normalizedCode,
            discount: parseFloat(values.discount),
          });
          toast.success("Voucher updated successfully");
        } else {
          await axios.post('http://localhost:5001/vouchers', {
            code: normalizedCode,
            discount: parseFloat(values.discount),
          });
          toast.success("Voucher created successfully");
        }
        fetchVouchers();
        toggleModal();
      } catch (error) {
        console.error("Save Voucher Error:", error);
        toast.error(isEdit ? "Failed to update voucher" : "Failed to create voucher");
      }
    },
  });

  // Table Columns
  const columns = useMemo(
    () => [
      {
        header: "Voucher Code",
        accessorKey: "code",
        enableColumnFilter: false,
      },
      {
        header: "Discount Value (%)",
        accessorKey: "discount",
        enableColumnFilter: false,
        cell: (cell) => `${cell.getValue()}%`,
      },
      {
        header: "Action",
        cell: (cellProps) => {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit">
                <Button
                  color="success"
                  size="sm"
                  className="text-white edit-item-btn"
                  onClick={() => handleEditVoucher(cellProps.row.original)}
                >
                  Edit
                </Button>
              </li>
              <li className="list-inline-item">
                <Button
                  color="danger"
                  size="sm"
                  className="text-white remove-item-btn"
                  onClick={() => handleDeleteVoucher(cellProps.row.original)}
                >
                  Delete
                </Button>
              </li>
            </ul>
          );
        },
      },
    ],
    []
  );

  // Loading Animation
  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
            <Lottie animationData={loadingAnimation} style={{ width: 150, height: 150 }} />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Vouchers" pageTitle="Ecommerce" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Vouchers</h5>
                <Button
                  color="success"
                  onClick={() => {
                    setIsEdit(false);
                    toggleModal();
                  }}
                >
                  Add Voucher
                </Button>
              </CardHeader>
              <CardBody>
                {vouchers.length === 0 ? (
                  <div className="d-flex justify-content-center">
                    <Lottie animationData={noDataAnimation} style={{ width: 150, height: 150 }} />
                  </div>
                ) : (
                  <TableContainer
                    columns={columns}
                    data={vouchers}
                    isGlobalFilter={true} 
                    customPageSize={10}
                    divClass="table-responsive"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light"
                    SearchPlaceholder="Search for Voucher Code..."
                    globalFilterFn="fuzzy"
                    filterFields={["code"]}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Add/Edit Voucher Modal */}
        <Modal isOpen={modal} toggle={toggleModal} centered>
          <ModalHeader toggle={toggleModal}>
            {isEdit ? "Edit Voucher" : "Add Voucher"}
          </ModalHeader>
          <Form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <div className="mb-3">
                <Label htmlFor="code" className="form-label">
                  Voucher Code
                </Label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  placeholder="Enter voucher code"
                  value={formik.values.code}
                  onChange={(e) => {
                    // Optionally normalize input here
                    formik.handleChange(e);
                  }}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.code && formik.errors.code}
                />
                {formik.touched.code && formik.errors.code && (
                  <FormFeedback>{formik.errors.code}</FormFeedback>
                )}
              </div>
              <div className="mb-3">
                <Label htmlFor="discount" className="form-label">
                  Discount Value (%)
                </Label>
                <Input
                  type="number"
                  id="discount"
                  name="discount"
                  placeholder="Enter discount value"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  invalid={formik.touched.discount && formik.errors.discount}
                />
                {formik.touched.discount && formik.errors.discount && (
                  <FormFeedback>{formik.errors.discount}</FormFeedback>
                )}
              </div>
            </ModalBody>
            <div className="modal-footer">
              <Button type="button" color="light" onClick={toggleModal}>
                Close
              </Button>
              <Button type="submit" color="success">
                {isEdit ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <DeleteModal
          show={deleteModal}
          onDeleteClick={confirmDelete}
          onCloseClick={() => setDeleteModal(false)}
        />

        <ToastContainer closeButton={false} />
      </Container>
    </div>
  );
};

export default EcommerceVouchers;
