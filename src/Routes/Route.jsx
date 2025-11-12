import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RoleCheck from "./RoleCheck";
import AdminOptions from "../Component/AdminOptions/AdminOptions";
import CreateCompany from "../Pages/CreateCompany/CreateCompany";
import UpdateBranding from "../Pages/UpdateBranding/UpdateBranding";
import AuthLayout from "../Layout/AuthLayout/AuthLayout";
import AllCompanyList from "../Pages/AllCompanyLlist/AllCompanyList";
import CreateStudio from "../Pages/CreateStudio/CreateStudio";
import LoginPage from "../Pages/Login/Login";
import CreateUser from "../Pages/CreateUser/CreateUser";
import AllStudios from "../Pages/AllStudios/AllStudios";
import ForgotPassword from "../Pages/ForgotPassword/ForgotPassword";
import MapServiceAndCombo from "../Pages/MapService&Combo/MapService&Combo";
import GhlUsersList from "../Pages/GhlUsersList/GhlUsersList";
import UpdateCalendar from "../Pages/UpdateCalendar/UpdateCalendar";
import AllCalendar from "../Pages/AllCalendars/AllCalendar";
import AllAppointmentList from "../Pages/AllAppointment/AllAppointmentList";
import RegisterGhlUser from "../Pages/RegisterGhlUser/RegisterGhlUser";
import RequireRole from "./RequireRole";
import MainLayout from "../Layout/Dashboard/MainLayout";

const Route = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <AdminOptions /> },

      // Shared (superAdmin + companyAdmin)
      { path: "/all-appointment", element: <AllAppointmentList /> },
      { path: "/all-studios", element: <AllStudios /> },
      { path: "/all-calendars-list", element: <AllCalendar /> },
      { path: "/settings/create-studio", element: <CreateStudio /> },
      { path: "/settings/map-service-and-combo", element: <MapServiceAndCombo /> },
      { path: "/settings/update-calendar", element: <UpdateCalendar /> },
      { path: "/ghl-user-list", element:  <GhlUsersList />},

      // SuperAdmin only (guarded)
      {
        path: "/update-branding",
        element: (
          <RequireRole role="superAdmin">
            <UpdateBranding />
          </RequireRole>
        ),
      },
      {
        path: "/companies-list",
        element: (
          <RequireRole role="superAdmin">
            <AllCompanyList />
          </RequireRole>
        ),
      },
      {
        path: "/settings/create-company",
        element: (
          <RequireRole role="superAdmin">
            <CreateCompany />
          </RequireRole>
        ),
      },
      {
        path: "/settings/create-user",
        element: (
          <RequireRole role="superAdmin">
            <CreateUser />
          </RequireRole>
        ),
      },
      {
        path: "/settings/register-ghl-user",
        element: (
          <RequireRole role="superAdmin">
            <RegisterGhlUser />
          </RequireRole>
        ),
      },
    ],
  },

  // Auth routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
]);

export default Route;


