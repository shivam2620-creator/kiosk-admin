import axios from "axios";



const  DeleteCompanyApi = async (companyId) => {
  
    return axios.delete(`https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/${companyId}`);
}

export { DeleteCompanyApi }


