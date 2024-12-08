// src/routes/allRoutes.js

import React from "react";
import { Navigate } from "react-router-dom";

// Import pages
import DashboardEcommerce from "../pages/DashboardEcommerce";
import EcommerceProducts from "../pages/Ecommerce/EcommerceProducts/index";
import EcommerceAddProduct from "../pages/Ecommerce/EcommerceProducts/EcommerceAddProduct";
import EcommerceEditProduct from "../pages/Ecommerce/EcommerceProducts/EcommerceEditProduct";
import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProducts/EcommerceProductDetail";
import EcommerceCategories from "../pages/Ecommerce/EcommerceCategory/EcommerceCategories";
import EcommerceAddCategory from "../pages/Ecommerce/EcommerceCategory/EcommerceAddCategory";
import EcommerceEditCategory from "../pages/Ecommerce/EcommerceCategory/EcommerceEditCategory";
import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
import EcommerceOrderDetail from "../pages/Ecommerce/EcommerceOrders/EcommerceOrderDetail";
import WholesaleRequests from "../pages/Ecommerce/WholesaleRequests";
import ContactList from "../pages/Ecommerce/Contactlist";
import BlogsList from "../pages/Ecommerce/Blog/BlogsList";
import BlogAdd from "../pages/Ecommerce/Blog/BlogAdd";
import BlogEdit from "../pages/Ecommerce/Blog/BlogEdit";
import BannersList from "../pages/Ecommerce/Banner/BannersList";
import BannerAdd from "../pages/Ecommerce/Banner/BannerAdd";
import BannerEdit from "../pages/Ecommerce/Banner/BannerEdit";
import SubscribersList from "../pages/Ecommerce/Subscribers/SubscribersList";
import HeroSectionList from "../pages/Ecommerce/HeroSection/HeroSectionList";
import HeroSectionAdd from "../pages/Ecommerce/HeroSection/HeroSectionAdd";
import HeroSectionEdit from "../pages/Ecommerce/HeroSection/HeroSectionEdit";
import GeneralimagesList from "../pages/Ecommerce/GenralImages/GeneralimagesList";
import GeneralimagesEdit from "../pages/Ecommerce/GenralImages/GeneralimagesEdit";
import Alt404 from "../pages/AuthenticationInner/Errors/Alt404";
import Basic404 from "../pages/AuthenticationInner/Errors/Basic404";
import Cover404 from "../pages/AuthenticationInner/Errors/Cover404";
import Error500 from "../pages/AuthenticationInner/Errors/Error500";
import Maintenance from "../pages/Pages/Maintenance/Maintenance";
import Offlinepage from "../pages/AuthenticationInner/Errors/Offlinepage";
import UserManagement from "../pages/Ecommerce/UserManagement/UserManagement";
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import NotificationsPage from "../pages/Notifications";
import EcommerceVouchers from "../pages/Ecommerce/EcommerceVouchers";
import InvoiceDetails from "../pages/Invoices/InvoiceDetails";
import SetupMfa from "../pages/SetupMfa";
import ChangePassword from "../pages/Authentication/ChangePassword";
import NotAuthorized from "../pages/NotAuthorized"; // Ensure this component exists
import RoleBasedRedirect from "./RoleBasedRedirect"; // New component
import TestimonialsList from "../pages/Ecommerce/Testimonial/TestimonialList";
import TestimonialAdd from "../pages/Ecommerce/Testimonial/TestimonialAdd";
import TestimonialEdit from "../pages/Ecommerce/Testimonial/TestimonialEdit";

const roles = {
  ADMIN: "admin",
  MARKETING: "marketing",
  CUSTOMER_RELATIONS: "customer_relations",
  OPERATIONS_TEAM_1: "operations_team_1",
  OPERATIONS_TEAM_2: "operations_team_2",
};

const authProtectedRoutes = [
  // Dashboard
  {
    path: "/dashboard",
    component: <DashboardEcommerce />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.CUSTOMER_RELATIONS],
  },
  {
    path: "/index",
    component: <DashboardEcommerce />,
    roles: [
      roles.ADMIN,
      roles.OPERATIONS_TEAM_1,
      roles.CUSTOMER_RELATIONS,
    ],
  },
  {
    path: "/notifications",
    component: <NotificationsPage />,
    roles: [
      roles.ADMIN,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
      roles.MARKETING,
      roles.CUSTOMER_RELATIONS,
    ],
  },

  // Products
  {
    path: "/apps-ecommerce-products",
    component: <EcommerceProducts />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    path: "/apps-ecommerce-add-product",
    component: <EcommerceAddProduct />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    path: "/apps-ecommerce-edit-product/:productId",
    component: <EcommerceEditProduct />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    path: "/apps-ecommerce-product-details/:id",
    component: <EcommerceProductDetail />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },

  // Categories
  {
    path: "/apps-ecommerce-categories",
    component: <EcommerceCategories />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    path: "/apps-ecommerce-add-category",
    component: <EcommerceAddCategory />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    path: "/apps-ecommerce-edit-category/:categoryId",
    component: <EcommerceEditCategory />,
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },

  // Orders
  {
    path: "/apps-ecommerce-orders",
    component: <EcommerceOrders />,
    roles: [
      roles.ADMIN,
      roles.CUSTOMER_RELATIONS,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
    ],
  },
  {
    path: "/dashboard/orders/:orderId",
    component: <EcommerceOrderDetail />,
    roles: [
      roles.ADMIN,
      roles.CUSTOMER_RELATIONS,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
    ],
  },

  // Invoice Details
  {
    path: "/invoice-details/:orderId",
    component: <InvoiceDetails />,
    roles: [
      roles.ADMIN,
      roles.CUSTOMER_RELATIONS,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
    ],
  },

  // Wholesale Requests
  {
    path: "/wholesale-requests",
    component: <WholesaleRequests />,
    roles: [
      roles.ADMIN,
      roles.CUSTOMER_RELATIONS,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
    ],
  },

  // Contact List
  {
    path: "/contactlist",
    component: <ContactList />,
    roles: [
      roles.ADMIN,
      roles.CUSTOMER_RELATIONS,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
    ],
  },

  // Blogs
  {
    path: "/bloglist",
    component: <BlogsList />,
    roles: [roles.ADMIN, roles.MARKETING],
  },
  {
    path: "/addblog",
    component: <BlogAdd />,
    roles: [roles.ADMIN, roles.MARKETING],
  },
  {
    path: "/editblog/:id",
    component: <BlogEdit />,
    roles: [roles.ADMIN, roles.MARKETING],
  },

  // Banners
{
  path: "/bannerlist",
  component: <BannersList />,
  roles: [roles.ADMIN, roles.MARKETING],
},
{
  path: "/addbanner",
  component: <BannerAdd />,
  roles: [roles.ADMIN, roles.MARKETING],
},
{
  path: "/editbanner/:id",
  component: <BannerEdit />,
  roles: [roles.ADMIN, roles.MARKETING],
},

// Testimonials
{
  path: "/testimoniallist",
  component: <TestimonialsList />,
  roles: [roles.ADMIN, roles.MARKETING],
},
{
  path: "/addtestimonial",
  component: <TestimonialAdd />,
  roles: [roles.ADMIN, roles.MARKETING],
},
{
  path: "/edittestimonial/:id",
  component: <TestimonialEdit />,
  roles: [roles.ADMIN, roles.MARKETING],
},


  // Subscribers List
  {
    path: "/subscribers",
    component: <SubscribersList />,
    roles: [roles.ADMIN, roles.MARKETING],
  },

  // Vouchers
  {
    path: "/vouchers",
    component: <EcommerceVouchers />,
    roles: [roles.ADMIN],
  },

  // Hero Section
  {
    path: "/herosectionlist",
    component: <HeroSectionList />,
    roles: [roles.ADMIN, roles.MARKETING],
  },
  {
    path: "/addhero",
    component: <HeroSectionAdd />,
    roles: [roles.ADMIN, roles.MARKETING],
  },
  {
    path: "/edithero/:id",
    component: <HeroSectionEdit />,
    roles: [roles.ADMIN, roles.MARKETING],
  },

  // General Images
  {
    path: "/generalimageslist",
    component: <GeneralimagesList />,
    roles: [roles.ADMIN],
  },
  {
    path: "/editgeneralimages/:id",
    component: <GeneralimagesEdit />,
    roles: [roles.ADMIN],
  },

  // Admin User Management
  {
    path: "/admin/users",
    component: <UserManagement />,
    roles: [roles.ADMIN],
  },

  // Change Password
  {
    path: "/change-password",
    component: <ChangePassword />,
    roles: [
      roles.ADMIN,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
      roles.MARKETING,
      roles.CUSTOMER_RELATIONS,
    ],
  },

  // Redirects handled by RoleBasedRedirect
  // These will be defined in Index.js
];

const publicRoutes = [
  // Authentication Pages
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/setup-mfa", component: <SetupMfa /> },

  // Error Pages
  { path: "/auth-404-basic", component: <Basic404 /> },
  { path: "/auth-404-cover", component: <Cover404 /> },
  { path: "/auth-404-alt", component: <Alt404 /> },
  { path: "/auth-500", component: <Error500 /> },
  { path: "/pages-maintenance", component: <Maintenance /> },
  { path: "/auth-offline", component: <Offlinepage /> },
];

export { authProtectedRoutes, publicRoutes, roles };
