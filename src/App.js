import './App.css';
import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import Route from './Routes/Route';
import { setupAxiosAuth } from './Apis/axiosInstance';
import { useAuth } from './Utils/AuthContext';



function App() {
    const { getValidIdToken, handleLogout,user } = useAuth();

 
  useEffect(() => {
    setupAxiosAuth({ getValidIdToken, handleLogout });
  }, [getValidIdToken, handleLogout]);
  return (
   
    <div className="App">
      <RouterProvider router={Route} />
    </div>

  );
}

export default App;
