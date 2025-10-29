import axios from "axios";



const updateBrandingApi = (companyId,data) => {
    return axios.patch(`https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/branding/${companyId}`,data);

}


export default updateBrandingApi;
