import axios from "axios";



const createStudioApi = async (companyId, studioData) => {
    return axios.post(`https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/studios/${companyId}`, studioData);
}