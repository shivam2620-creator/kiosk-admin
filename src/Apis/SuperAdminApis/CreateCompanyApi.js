import axios from "axios";


const createCompanyApi = async (companyData) => {
    return axios.post("https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company", companyData);
}

export { createCompanyApi }