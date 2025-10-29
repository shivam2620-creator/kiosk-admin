import logo from './logo.svg';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './Utils/AuthContext';
import Route from './Routes/Route';
import { setupAxiosAuth } from './Apis/axiosInstance';


function App() {
    const { getValidIdToken, handleLogout } = useAuth();

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
