// src/Navdata.js

const roles = {
  ADMIN: 'admin',
  MARKETING: 'marketing',
  CUSTOMER_RELATIONS: 'customer_relations',
  OPERATIONS_TEAM_1: 'operations_team_1',
  OPERATIONS_TEAM_2: 'operations_team_2',
};

const menuItems = [
  {
    label: "Menu",
    isHeader: true,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "ri-dashboard-line",
    link: "/dashboard",
    roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1],
  },
  // {
  //   id: "products",
  //   label: "Products",
  //   icon: "ri-product-hunt-line",
  //   link: "/apps-ecommerce-products",
  //   roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  // },
  // {
  //   id: "create-product",
  //   label: "Create Product",
  //   icon: "ri-add-circle-line",
  //   link: "/apps-ecommerce-add-product",
  //   roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  // },
  // {
  //   id: "categories",
  //   label: "Categories",
  //   icon: "ri-stack-line",
  //   link: "/apps-ecommerce-categories",
  //   roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  // },
  // {
  //   id: "create-category",
  //   label: "Create Categories",
  //   icon: "ri-add-circle-line",
  //   link: "/apps-ecommerce-add-category",
  //   roles: [roles.ADMIN, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  // },
  // {
  //   id: "wholesale-requests",
  //   label: "Wholesale Requests",
  //   icon: "ri-file-list-line",
  //   link: "/wholesale-requests",
  //   roles: [roles.ADMIN, roles.CUSTOMER_RELATIONS, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  // },
  {
    id: "contact-list",
    label: "Contact List",
    icon: "ri-phone-line",
    link: "/contactlist",
    roles: [roles.ADMIN, roles.CUSTOMER_RELATIONS, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    id: "subscribers-list",
    label: "Subscribers List",
    icon: "ri-user-follow-line",
    link: "/subscribers",
    roles: [roles.ADMIN, roles.MARKETING],
  },
  {
    id: "orders",
    label: "Orders",
    icon: "ri-file-list-line",
    link: "/apps-ecommerce-orders",
    roles: [roles.ADMIN, roles.CUSTOMER_RELATIONS, roles.OPERATIONS_TEAM_1, roles.OPERATIONS_TEAM_2],
  },
  {
    id: "vouchers",
    label: "Vouchers",
    icon: "ri-coupon-line",
    link: "/vouchers",
    roles: [roles.ADMIN],
  },
  // {
  //   id: "hero-section",
  //   label: "Hero Section",
  //   icon: "ri-star-line",
  //   link: "/herosectionlist",
  //   roles: [roles.ADMIN, roles.MARKETING],
  // },
  // {
  //   id: "blog-list",
  //   label: "Blog List",
  //   icon: "ri-pencil-line",
  //   link: "/bloglist",
  //   roles: [roles.ADMIN, roles.MARKETING],
  // },
  // {
  //   id: "add-blog",
  //   label: "Add Blog",
  //   icon: "ri-add-circle-line",
  //   link: "/addblog",
  //   roles: [roles.ADMIN, roles.MARKETING],
  // },
  // {
  //   id: "general-images",
  //   label: "General Images",
  //   icon: "ri-star-line",
  //   link: "/generalimageslist",
  //   roles: [roles.ADMIN],
  // },
  // {
  //   id: "user-management",
  //   label: "User Management",
  //   icon: "ri-user-settings-line",
  //   link: "/admin/users",
  //   roles: [roles.ADMIN],
  // },
  // {
  //   id: "banner-list",
  //   label: "About Us",
  //   icon: "ri-pencil-line",
  //   link: "/bannerlist",
  //   roles: [roles.ADMIN, roles.MARKETING],
  // },
  // {
  //   id: "testimonial-list",
  //   label: "Testimonial List",
  //   icon: "ri-user-settings-line",
  //   link: "/testimoniallist",
  //   roles: [roles.ADMIN, roles.MARKETING],
  // },
  {
    id: "change-password",
    label: "Change Password",
    icon: "ri-lock-password-line",
    link: "/change-password",
    roles: [
      roles.ADMIN,
      roles.OPERATIONS_TEAM_1,
      roles.OPERATIONS_TEAM_2,
      roles.MARKETING,
      roles.CUSTOMER_RELATIONS,
    ],
  },
];

export default menuItems;
