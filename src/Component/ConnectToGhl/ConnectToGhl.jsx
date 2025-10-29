import "./style.css"
import { useNavigate } from "react-router-dom"
const ConnectToGhl = () => {
    const navigate = useNavigate();

    const handleConnect = async() => {
         window.location.href = "https://us-central1-tattoo-shop-printing-dev.cloudfunctions.net/company/connect"
    }


  return (
    <div className="connect-to-ghl-cont">

   
    <button className="connect-to-ghl-btn" onClick={handleConnect}>
        Connect to GHL
    </button>
     </div>
  )
}

export default ConnectToGhl
