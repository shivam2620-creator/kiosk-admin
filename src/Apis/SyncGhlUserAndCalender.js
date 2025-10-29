import axios from "axios";



const SyncGhlUserAndCalender = (companyId) => {
    return axios.get(`https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/${companyId}/sync-ghl`)
}


export default SyncGhlUserAndCalender;