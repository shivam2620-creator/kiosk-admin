import axios from "axios";



const ConnectToGhlApi = async() => {
    return axios.get("https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/connect");
}

const getCompoanyDetails = async() => {
    return axios.get("https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/2lZEGuc5LBSO3HcgiMTp")
}

export { ConnectToGhlApi, getCompoanyDetails }