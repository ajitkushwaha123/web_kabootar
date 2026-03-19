import React from "react";

const layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        {children}
    </div>
  );
};

export default layout;
