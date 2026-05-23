import React from "react";
import PackageList from "../../components/superadmin/PackageList";
import { C } from "../../components/constants/data";

const Packages = () => {
  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.black }}
    >
      <PackageList />
    </div>
  );
};

export default Packages;
