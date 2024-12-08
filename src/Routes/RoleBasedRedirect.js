// src/routes/RoleBasedRedirect.js

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const userRoles = JSON.parse(localStorage.getItem("userRoles")) || [];

  useEffect(() => {
    if (userRoles.includes("admin") || userRoles.includes("operations_team_1")) {
      navigate("/dashboard", { replace: true });
    } else if (userRoles.includes("operations_team_2")) {
      // Redirect to a default page for Operations Team 2
      // Example: Orders page
      navigate("/apps-ecommerce-orders", { replace: true });
    } else if (userRoles.includes("marketing")) {
      // Redirect to Blogs List for Marketing
      navigate("/bloglist", { replace: true });
    } else if (userRoles.includes("customer_relations")) {
      // Redirect to Contact List for Customer Relations
      navigate("/contactlist", { replace: true });
    } else {
      // If no matching role, redirect to Not Authorized
      navigate("/not-authorized", { replace: true });
    }
  }, [navigate, userRoles]);

  return null;
};

export default RoleBasedRedirect;
