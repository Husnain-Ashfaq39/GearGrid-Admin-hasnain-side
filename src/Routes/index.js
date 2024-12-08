// src/routes/Index.js

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth services
import { authProtectedRoutes, publicRoutes } from "./allRoutes";

// Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import VerticalLayout from "../Layouts/index";
import "lord-icon-element";

// AuthProtected
import AuthProtected from "./AuthProtected";

// Pages
import NotAuthorized from "../pages/NotAuthorized"; // Ensure this component exists
import RoleBasedRedirect from "./RoleBasedRedirect"; // New component

const Index = () => {
  return (
    <React.Fragment>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <NonAuthLayout>{route.component}</NonAuthLayout>
            }
          />
        ))}

        {/* Protected Routes */}
        {authProtectedRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={
              <AuthProtected roles={route.roles}>
                <VerticalLayout>{route.component}</VerticalLayout>
              </AuthProtected>
            }
          />
        ))}

        {/* Role-Based Redirect for "/" and "*" */}
        <Route
          path="/"
          element={
            <AuthProtected>
              <RoleBasedRedirect />
            </AuthProtected>
          }
        />
        <Route
          path="*"
          element={
            <AuthProtected>
              <RoleBasedRedirect />
            </AuthProtected>
          }
        />

        {/* Not Authorized Route */}
        <Route
          path="/not-authorized"
          element={
            <NonAuthLayout>
              <NotAuthorized />
            </NonAuthLayout>
          }
        />
      </Routes>
    </React.Fragment>
  );
};

export default Index;
