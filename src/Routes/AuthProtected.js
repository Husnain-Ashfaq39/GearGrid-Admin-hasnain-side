// src/routes/AuthProtected.js

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Lottie from "lottie-react";
import { checkAuth } from "../appwrite/Services/authServices";
import authentication from "../assets/animations/authentication.json";

const AuthProtected = ({ children, roles: requiredRoles }) => {
  const [userRoles, setUserRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setLoading(true);
        const isAuth = await checkAuth();
        if (isAuth) {
          setIsAuthenticated(true);
          const roles = JSON.parse(localStorage.getItem("userRoles")) || [];
          setUserRoles(roles);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center flex-column"
        style={{ height: "100vh" }}
      >
        <div>
          <Lottie
            animationData={authentication}
            style={{ width: 72, height: 72 }}
            loop={true}
          />
        </div>
        <div className="mt-4">
          <h5>Authenticating...</h5>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    // Normalize roles to lowercase for comparison
    const userRolesLower = userRoles.map((role) => role.toLowerCase());
    const requiredRolesLower = requiredRoles.map((role) => role.toLowerCase());

    const hasRole = userRolesLower.some((role) =>
      requiredRolesLower.includes(role)
    );
    if (!hasRole) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return children;
};

export default AuthProtected;
