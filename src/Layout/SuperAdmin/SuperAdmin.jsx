import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../Component/Navbar/Navbar'

const SuperAdmin = () => {
  return (
    <div className="super-admin-cont">
      <header>
         <Navbar />
      </header>
      <main>
              <Outlet />
        
      </main>
    </div>
  )
}

export default SuperAdmin
