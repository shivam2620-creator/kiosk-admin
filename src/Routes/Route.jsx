import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RoleCheck from "./RoleCheck";
import AdminOptions from "../Component/AdminOptions/AdminOptions";
import CreateCompany from "../Pages/CreateCompany/CreateCompany";
import UpdateBranding from "../Pages/UpdateBranding/UpdateBranding";



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
    }
 
]);

export default Route;