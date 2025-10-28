import "./style.css"

import { getCompoanyDetails , ConnectToGhlApi} from "../../Apis/SuperAdminApis/ConnectToGhlApi"
import { useEffect } from "react"
const ConnectToGhl = () => {

    const handleConnect = async() => {
        try {
            const response = await ConnectToGhlApi();
            console.log("Connected to GHL:", response.data);
        } catch (error) {
            console.error("Error connecting to GHL:", error);
        }
    }

    useEffect(() => {
        const fetchCompanyDetails = async() => {
            try {
                const response = await getCompoanyDetails();
                console.log("Company Details:", response.data);
            }           catch (error) { 
                console.error("Error fetching company details:", error);
            }
        }

        fetchCompanyDetails();
    }, [])
  return (
    <button className="connect-to-ghl-btn" onClick={handleConnect}>
        Connect to GHL
    </button>
  )
}

export default ConnectToGhl
