import { getAllStudiosApi } from "../Apis/CompanyAdminApis/StudiosApis"
import { setStudioData,setLoading } from "../Redux/StudioSlice";

export const fetchAllStudios = async (companyId,dispatch) => {
    try {
            dispatch(setLoading(true));
        const response =  await getAllStudiosApi(companyId);
        if(response.data.success)  dispatch(setStudioData(response.data.studios));
    } catch (error) {
        console.error("Error fetching studios:", error);
    } finally {
        dispatch(setLoading(false));
    }
}

