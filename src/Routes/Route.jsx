import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RoleCheck from "./RoleCheck";
import AdminOptions from "../Component/AdminOptions/AdminOptions";
import CreateCompany from "../Pages/CreateCompany/CreateCompany";
import UpdateBranding from "../Pages/UpdateBranding/UpdateBranding";
import AuthLayout from "../Layout/AuthLayout/AuthLayout";
import LoginPage from "../Pages/Login/Login";



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
                path: "/create-company",
                element: <CreateCompany />
            },
            {
                path: "/update-branding",
                element: <UpdateBranding />
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
            }
        ]
    }
 
]);

export default Route;