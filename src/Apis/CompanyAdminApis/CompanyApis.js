import axiosInstance from "../axiosInstance";


const getAllCalenderApi = (companyId) => {
    return axiosInstance.get(`/company/calendars/${companyId}`);
}

const getAllAppointmentsApi = (companyId) => {
    return axiosInstance.get(`appointments/${companyId}`);
}




export { getAllCalenderApi }