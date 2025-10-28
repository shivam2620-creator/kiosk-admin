import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RoleCheck from "./RoleCheck";
import AdminOptions from "../Component/AdminOptions/AdminOptions";
import CreateCompany from "../Pages/CreateCompany";



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
            }

        ]
    }
 
]);

export default Route;