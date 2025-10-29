import React, { useState } from 'react';
import "./style.css"
import ThemeForm from '../../Component/ThemeForm/ThemeForm';
import CompanySelector from '../../Component/CompanySelector/CompanySelector';

const UpdateBranding = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  return (
    <div className='update-branding-cont'>
      <CompanySelector
        selectedCompanyId={selectedCompanyId}
        setSelectedCompanyId={setSelectedCompanyId}
      />
      {selectedCompanyId && (
        <div >
          <ThemeForm companyId={selectedCompanyId} />
        </div>
      )}
    </div>
  );
};

export default UpdateBranding;
