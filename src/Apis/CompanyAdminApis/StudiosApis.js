import axiosInstance from "../axiosInstance";



const createStudioApi =  (companyId, studioData) => {
    return axiosInstance.post(`studios/${companyId}`, studioData);
}

const getAllStudiosApi =  (companyId) => {
    return axiosInstance.get(`/studios?compoanyId=${companyId}`);
}


export { createStudioApi, getAllStudiosApi }