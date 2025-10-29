import React from 'react'
import MainLayout from '../Layout/Dashboard/MainLayout';


const RoleCheck = () => {

  const role = "superadmin";

  if(role === "superadmin"){
    return <MainLayout/>
  }
  return (
    <div>
          Normal Admin
    </div>
  )
}

export default RoleCheck
