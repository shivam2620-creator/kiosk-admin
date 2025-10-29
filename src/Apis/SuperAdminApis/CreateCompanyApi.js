import axios from "axios";
import axiosInstance from "../axiosInstance";


const createCompanyApi = async (companyData) => {
    return axiosInstance.post("/company", companyData);
}

export { createCompanyApi }