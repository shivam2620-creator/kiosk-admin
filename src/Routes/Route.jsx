import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RequireRole from "./RequireRole";
import ProtectedRoute from "./ProtectedRoute"; // ✅ Protect private routes
import MainLayout from "../Layout/Dashboard/MainLayout";
import AuthLayout from "../Layout/AuthLayout/AuthLayout";
import MediumSpinner from "../Utils/MediumSpinner/MediumSpinner";

// ===== Lazy-loaded pages =====
const CreateCompany = lazy(() => import("../Pages/CreateCompany/CreateCompany"));
const UpdateBranding = lazy(() => import("../Pages/UpdateBranding/UpdateBranding"));
const AllCompanyList = lazy(() => import("../Pages/AllCompanyLlist/AllCompanyList"));
const CreateStudio = lazy(() => import("../Pages/CreateStudio/CreateStudio"));
const LoginPage = lazy(() => import("../Pages/Login/Login"));
const CreateUser = lazy(() => import("../Pages/CreateUser/CreateUser"));
const AllStudios = lazy(() => import("../Pages/AllStudios/AllStudios"));
const ForgotPassword = lazy(() => import("../Pages/ForgotPassword/ForgotPassword"));
const MapServiceAndCombo = lazy(() => import("../Pages/MapService&Combo/MapService&Combo"));
const GhlUsersList = lazy(() => import("../Pages/GhlUsersList/GhlUsersList"));
const UpdateCalendar = lazy(() => import("../Pages/UpdateCalendar/UpdateCalendar"));
const AllCalendar = lazy(() => import("../Pages/AllCalendars/AllCalendar"));
const AllAppointmentList = lazy(() => import("../Pages/AllAppointment/AllAppointmentList"));
const RegisterGhlUser = lazy(() => import("../Pages/RegisterGhlUser/RegisterGhlUser"));

const Loading = (
  <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <MediumSpinner />
  </div>
);

// ===== Router Configuration =====
const Route = createBrowserRouter([
  // 🔒 Protected dashboard routes
  {
    path: "/",
    element: (
      <Suspense fallback={Loading}>
        <ProtectedRoute /> {/* ✅ Wraps all private routes */}
      </Suspense>
    ),
    children: [
      {
        element: (
          <Suspense fallback={Loading}>
            <MainLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={Loading}>
                <AllAppointmentList />
              </Suspense>
            ),
          },

          // ===== Shared (superAdmin + companyAdmin) =====
          {
            path: "/all-appointment",
            element: (
              <Suspense fallback={Loading}>
                <AllAppointmentList />
              </Suspense>
            ),
          },
          {
            path: "/all-studios",
            element: (
              <Suspense fallback={Loading}>
                <AllStudios />
              </Suspense>
            ),
          },
          {
            path: "/all-calendars-list",
            element: (
              <Suspense fallback={Loading}>
                <AllCalendar />
              </Suspense>
            ),
          },
          {
            path: "/settings/create-studio",
            element: (
              <Suspense fallback={Loading}>
                <CreateStudio />
              </Suspense>
            ),
          },
          {
            path: "/settings/map-service-and-combo",
            element: (
              <Suspense fallback={Loading}>
                <MapServiceAndCombo />
              </Suspense>
            ),
          },
          {
            path: "/settings/update-calendar",
            element: (
              <Suspense fallback={Loading}>
                <UpdateCalendar />
              </Suspense>
            ),
          },
          {
            path: "/ghl-user-list",
            element: (
              <Suspense fallback={Loading}>
                <GhlUsersList />
              </Suspense>
            ),
          },

          // ===== SuperAdmin Only =====
          {
            path: "/update-branding",
            element: (
              <RequireRole role="superAdmin">
                <Suspense fallback={Loading}>
                  <UpdateBranding />
                </Suspense>
              </RequireRole>
            ),
          },
          {
            path: "/companies-list",
            element: (
              <RequireRole role="superAdmin">
                <Suspense fallback={Loading}>
                  <AllCompanyList />
                </Suspense>
              </RequireRole>
            ),
          },
          {
            path: "/settings/create-company",
            element: (
              <RequireRole role="superAdmin">
                <Suspense fallback={Loading}>
                  <CreateCompany />
                </Suspense>
              </RequireRole>
            ),
          },
          {
            path: "/settings/create-user",
            element: (
              <RequireRole role="superAdmin">
                <Suspense fallback={Loading}>
                  <CreateUser />
                </Suspense>
              </RequireRole>
            ),
          },
          {
            path: "/settings/register-ghl-user",
            element: (
              <RequireRole role="superAdmin">
                <Suspense fallback={Loading}>
                  <RegisterGhlUser />
                </Suspense>
              </RequireRole>
            ),
          },
        ],
      },
    ],
  },

  // 🔓 Public auth routes
  {
    path: "/auth",
    element: (
      <Suspense fallback={Loading}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={Loading}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={Loading}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={Loading}>
            <ForgotPassword />
          </Suspense>
        ),
      },
    ],
  },
]);

export default Route;
