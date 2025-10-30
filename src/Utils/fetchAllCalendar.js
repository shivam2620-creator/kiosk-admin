import { getAllCalenderApi } from "../Apis/CompanyAdminApis/CompanyApis";
import { setLoading,setCalendarData } from "../Redux/CaledarSlice";
import toast from "react-hot-toast";

export const fetchAllCalendar = async (companyId,dispatch) => {
    try{
         const response = await getAllCalenderApi(companyId);
         console.log(companyId);
         console.log(response);
         if(response?.data?.success){
              dispatch(setCalendarData(response?.data?.calendars))
              toast.success(response?.data?.messages);
         }

    }catch(err){
        console.log(err);
    }finally{
        dispatch(setLoading(false));
    }
}