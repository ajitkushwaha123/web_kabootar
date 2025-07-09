import React from "react";

const layout = ({ children }) => {
  return (
    <div className="w-[100%] bg-gray-100 p-4">
      {children}
    </div>
  );
};

export default layout;
