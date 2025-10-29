import React, { useState } from 'react';
import "./style.css"
import ThemeForm from '../../Component/ThemeForm/ThemeForm';
import CompanySelector from '../../Component/CompanySelector/CompanySelector';

const UpdateBranding = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  return (
    <div className='update-branding-cont'>
        <div style={{maxWidth: "700px", width: "100%", margin: "0px auto"}}>
      <CompanySelector
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
      />
        </div>
      {selectedCompanyId && (
        <div >
          <ThemeForm companyId={selectedCompanyId} />
        </div>
      )}
    </div>
  );
};

export default UpdateBranding;
