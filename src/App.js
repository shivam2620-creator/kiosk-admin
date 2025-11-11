import './App.css';
import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import Route from './Routes/Route';
import { setupAxiosAuth } from './Apis/axiosInstance';
import { useAuth } from './Utils/AuthContext';
import { fetchAllCalendar } from './Utils/fetchAllCalendar';
import { useDispatch } from 'react-redux';
import { getAllGhlUsersApi } from './Apis/CompanyAdminApis/CompanyApis';



function App() {
    const { getValidIdToken, handleLogout,user } = useAuth();
    const dispatch  = useDispatch();
    
 
  useEffect(() => {
    setupAxiosAuth({ getValidIdToken, handleLogout }); 
    fetchAllCalendar(user?.companyId, dispatch);


  }, [getValidIdToken, handleLogout]);
  return (
   
    <div className="App">
      <RouterProvider router={Route} />
    </div>

  );
}

export default App;
