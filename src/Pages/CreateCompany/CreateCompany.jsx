import React from "react";
import { useSearchParams } from "react-router-dom";
import ConnectToGhl from "../../Component/ConnectToGhl/ConnectToGhl";
import CreateCompanyForm from "../../Component/CreateCompanyForm/CreateCompanyForm";

const CreateCompany = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  console.log("code", code);

  return (
    <div>
      {code ?  <CreateCompanyForm code={code} /> : <ConnectToGhl />}
    </div>
  );
};

export default CreateCompany;
