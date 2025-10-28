import logo from './logo.svg';
import './App.css';
import Navbar from './Component/Navbar/Navbar';
import AdminOptions from './Component/AdminOptions/AdminOptions';
import { RouterProvider } from 'react-router-dom';
import Route from './Routes/Route';

function App() {
  return (
    <div className="App">
      <RouterProvider router={Route} />
    </div>
  );
}

export default App;
