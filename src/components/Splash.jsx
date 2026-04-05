import React from 'react';

const Splash = () => {
  return (
    <div className="splash-screen">
      <div className="splash-logo">L</div>
      <div className="text-center">
        <h1 className="splash-title">Local Deals Hub</h1>
        <p className="splash-sub">Best Deals Near You</p>
      </div>
      <div className="splash-loader"></div>
    </div>
  );
};

export default Splash;
