import React from 'react';

const ParticlesAuth = ({ children }) => {
  return (
    <div className="auth-page-wrapper pt-5">
      <div className="auth-one-bg-position auth-one-bg" id="auth-particles">
        <div className="bg-overlay"></div>
      </div>
      {children}
    </div>
  );
};

export default ParticlesAuth;

