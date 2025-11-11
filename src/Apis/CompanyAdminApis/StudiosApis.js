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
     return axiosInstance.post(`/studios/service-mapping/${studioId}`,data)
}

const updateCalendarApi = (companyId,data) => {
    return axiosInstance.post(`studios/${companyId}/calendar`,data)
}

const checkServiceAndMappingApi = (studioId) =>{
    return axiosInstance.get(`studios/service-mapping/${studioId}`)
}


const removeServiceMappingApi = (studioId, data) => {
  return axiosInstance.delete(`/studios/service-mapping/${studioId}`, {
    data: data,
  });
};


export { removeServiceMappingApi,createStudioApi, getAllStudiosApi,deleteStudioApi,mapServiceAndComboApi,updateCalendarApi, checkServiceAndMappingApi }