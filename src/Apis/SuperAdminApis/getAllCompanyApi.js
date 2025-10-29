import axios from "axios";


const getAllCompanyApi = () => {
    return axios.get("https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company");
}


export default getAllCompanyApi;