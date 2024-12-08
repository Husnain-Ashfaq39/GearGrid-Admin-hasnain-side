// src/components/Navdata.js

import React from "react";

const Navdata = () => {
    // Define Menu Items
    const menuItems = [
        {
            label: "Menu",
            isHeader: true,
        },
        // Dashboard Menu Item
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "ri-dashboard-line", // Choose an appropriate icon
            link: "/dashboard",
        },
        // E-commerce Menu Items
        {
            id: "products",
            label: "Products",
            icon: "ri-product-hunt-line", // Choose an appropriate icon
            link: "/apps-ecommerce-products",
        },
        {
            id: "create-product",
            label: "Create Product",
            icon: "ri-add-circle-line",
            link: "/apps-ecommerce-add-product",
        },
        {
            id: "categories",
            label: "Categories",
            icon: "ri-stack-line",
            link: "/apps-ecommerce-categories",
        },
        {
            id: "create-category",
            label: "Create Categories",
            icon: "ri-add-circle-line",
            link: "/apps-ecommerce-add-category",
        },
        {
            id: "wholesale-requests",
            label: "Wholesale Requests",
            icon: "ri-file-list-line",
            link: "/wholesale-requests",
        },
        {
            id: "contact-list",
            label: "Contact List",
            icon: "ri-phone-line",
            link: "/contactlist",
        },
        {
            id: "subscribers-list",
            label: "Subscribers List",
            icon: "ri-user-follow-line", // Updated icon
            link: "/subscribers",
        },
        {
            id: "orders",
            label: "Orders",
            icon: "ri-file-list-line",
            link: "/apps-ecommerce-orders",
        },
        {
            id: "vouchers",
            label: "Vouchers",
            icon: "ri-coupon-line",
            link: "/vouchers",
        },
        {
            id: "hero-section",
            label: "Hero Section",
            icon: "ri-star-line",
            link: "/herosectionlist",
        },
        {
            id: "blog-list",
            label: "Blog List",
            icon: "ri-pencil-line",
            link: "/bloglist",
        },
        {
            id: "add-blog",
            label: "Add Blog",
            icon: "ri-add-circle-line",
            link: "/addblog",
        },
        {
            id: "general-images",
            label: "General Images",
            icon: "ri-star-line",
            link: "/generalimageslist",
        },
        {
            id: "banner-list",
            label: "Banner List",
            icon: "ri-pencil-line",
            link: "/bannerlist",
        },
        {
            id: "add-banner", // Changed from "add-blog" to "add-banner"
            label: "Add Banner",
            icon: "ri-add-circle-line",
            link: "/addbanner",
        },
        // Add more e-commerce related items here if needed
    ];

    return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;
