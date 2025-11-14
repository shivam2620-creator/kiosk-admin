import axiosInstance from "../axiosInstance";
import axios from "axios";



const loginApi = (data) => {
    return axios.post(`https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/auth/login`,data);
}

const createUserApi = (data,companyId) => {
    return axiosInstance.post(`/auth/sign-up${companyId ? `?companyId=${companyId}` : ""}`,data);
}

const sendOtpApi = (data) => {
    return axios.post("https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/auth/send-otp",data);
}


const resetPasswordUsingOtpApi = (data) => {
    return axios.post("https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/auth/reset-password-otp",data);
}

const resetPasswordApi = (data) => {
    return axiosInstance.post("/auth/reset-password",data);
}

const getUserDetailsById = (userId) => {
    return axiosInstance.get(`/profile/${userId}`);

}



export { loginApi, createUserApi, sendOtpApi, resetPasswordUsingOtpApi, resetPasswordApi,getUserDetailsById }