import { useNavigate } from "react-router-dom";
import "./style.css"

import { IoIosCreate } from "react-icons/io";


const options = [
      {
        icon : <IoIosCreate size={22}/>,
        title : "Create Compoany",
        path: "/create-company"
      },
      {
        icon : <IoIosCreate size={22}/>,
        title : "Create Compoany"
      },
      {
        icon : <IoIosCreate size={22}/>,
        title : "Create Compoany"
      }
]

const AdminOptions = () => {
    const navigate = useNavigate();

    
  return (
    <div className="admin-options-cont">

        {
            options.map((option,indx) => {
                return (
                    <button key={indx} className="admin-option-card" onClick={() => navigate(option.path || "#")}>
                        <div className="admin-option-icon">
                            {option.icon}
                        </div>
                        <div className="admin-option-title">
                            <p>{option.title}</p>
                        </div>
                    </button>
                )
            })
        }
      
    </div>
  )
}

export default AdminOptions
