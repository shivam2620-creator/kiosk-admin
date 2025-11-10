import axiosInstance from "../axiosInstance";


const getAllCalenderApi = (companyId) => {
    return axiosInstance.get(`/company/calendars/${companyId}`);
}

const getAllAppointmentsApi = (companyId) => {
    return axiosInstance.get(`appointments/${companyId}`);
}


const getAllServiceCombination = () => {
    return axiosInstance.get("company/service-combinations");
}


const getAllGhlUsersApi = (companyId) => {
    return axiosInstance.get(`company/${companyId}/ghl-users`)
}

const mapGhlUserApi = (companyId,data) => {
      return axiosInstance.post(`company/${companyId}/map-users`,data)
}

const removeMappedUserApi = (companyId, data) => {
  return axiosInstance.delete(`/company/remove-mapped/${companyId}`, {
    data: data, 
  });
};

const getCompanyDetailApi = (companyId) => {
    return axiosInstance.get(`/company/${companyId}`)
}
export { getAllCalenderApi,getAllServiceCombination,getAllGhlUsersApi ,mapGhlUserApi,removeMappedUserApi,getCompanyDetailApi }