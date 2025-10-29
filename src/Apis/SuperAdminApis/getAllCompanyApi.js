
import axiosInstance from "../axiosInstance";

const getAllCompanyApi = () => {
    return axiosInstance.get("/company");
}


export default getAllCompanyApi;