import axios from "axios";
import axiosInstance from "../axiosInstance";



const updateBrandingApi = (companyId,data) => {
    return axiosInstance.patch(`https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/branding/${companyId}`,data);

}


export default updateBrandingApi;
