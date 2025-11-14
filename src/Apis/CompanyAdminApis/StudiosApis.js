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

const addCalendarApi = (studioId,data) => {
    return axiosInstance.patch(`studios/${studioId}/add-calendar`,data)
}

const getStudioAyIdApi = (studioId,companyId) => {
    return axiosInstance.get(`studios/${studioId}?companyId=${companyId}`)
}

const removeMappedCalendarApi = (studioId,calendarId) => {
    return axiosInstance.delete(`studios/${studioId}/calendar/${calendarId}`)
}
const updateDefaultCalendarApi = (studioId,data) => {
    return axiosInstance.patch(`studios/${studioId}/default-calendar`,data)
}

const updateStudioFormApi = (studioId,data) => {
    return axiosInstance.put(`/studios/${studioId}`,data)
}

const deleteMappingApi = (studioId,data) => {
    return axiosInstance.delete(`studios/service-mapping/${studioId}`,{data : data})
}
export { deleteMappingApi, updateStudioFormApi,updateDefaultCalendarApi,removeMappedCalendarApi,getStudioAyIdApi,addCalendarApi, removeServiceMappingApi,createStudioApi, getAllStudiosApi,deleteStudioApi,mapServiceAndComboApi,updateCalendarApi, checkServiceAndMappingApi }