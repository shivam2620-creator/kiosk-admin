import React from 'react'
import SuperAdmin from '../Layout/SuperAdmin/SuperAdmin';

const RoleCheck = () => {

  const role = "superadmin";

  if(role === "superadmin"){
    return <SuperAdmin />
  }
  return (
    <div>
          Normal Admin
    </div>
  )
}

export default RoleCheck
