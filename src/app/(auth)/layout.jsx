import React from "react";

const layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-[35%] flex items-center justify-center px-6 py-12 bg-white">
        <div className="max-w-md w-full">{children}</div>
      </div>

      <div className="hidden md:block md:w-[65%] relative overflow-hidden">
        <video
          className="w-full h-full object-cover absolute inset-0"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/dashboard-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default layout;
