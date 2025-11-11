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



const Route = createBrowserRouter([
    {
        path : "/",
        element : <RoleCheck />,
        children : [

            {
                index : true,
                element : <AdminOptions />
            },
            {
                path : "/ghl-user-list",
                element : <GhlUsersList />
            },
            {
                path: "/settings/create-company",
                element: <CreateCompany />
            },
            {
                path : "/settings/create-studio",
                element : <CreateStudio />
            },

            {
                path: "/update-branding",
                element: <UpdateBranding />
            },
            {
                path: "/all-studios",
                element: <AllStudios />

            },
            {
                path: "/companies-list",
                element: <AllCompanyList />
            },
            {
                path: "/settings/create-user",
                element: <CreateUser />
            },
            {
                path: "/settings/map-service-and-combo",
                element: <MapServiceAndCombo />

            },
            {
                path: "/settings/update-calendar",
                element: <UpdateCalendar />
            },
            {
               path: "/all-calendars-list",
               element : <AllCalendar />
            },{
                path: "/all-appointment",
                element: <AllAppointmentList />
            }
            


        ]
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element:  <LoginPage />
            },
            {
                path: "login",
                element: <LoginPage />
            },{
                path: "forgot-password",
                element: <ForgotPassword />
                 
            }
        ]
    }
 
]);

export default Route;