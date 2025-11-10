import axiosInstance from "../axiosInstance";



const createStudioApi =  (companyId, studioData) => {
    return axiosInstance.post(`studios/${companyId}`, studioData);
}

const getAllStudiosApi =  (companyId) => {
    return axiosInstance.get(`/studios/all/${companyId}`);
}

const deleteStudioApi = (companyId,studioId) => {
      return axiosInstance.delete(`studios/${companyId}/${studioId}`)
}

const mapServiceAndComboApi = (companyId,studioId,data) => {
     return axiosInstance.post(`/studios/${companyId}/map-service/${studioId}`,data)
}

const updateCalendarApi = (companyId,data) => {
    return axiosInstance.post(`studios/${companyId}/calendar`,data)
}



export { createStudioApi, getAllStudiosApi,deleteStudioApi,mapServiceAndComboApi,updateCalendarApi }