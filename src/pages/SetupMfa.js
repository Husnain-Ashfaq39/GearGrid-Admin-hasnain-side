// src/pages/SetupMfa.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enableMfa, generateRecoveryCodes, updateUserPreferences } from '../appwrite/Services/authServices';
import { Alert, Button } from 'reactstrap';

const SetupMfa = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const navigate = useNavigate();

  const handleEnableMfa = async () => {
    try {
      await enableMfa();
      const codes = await generateRecoveryCodes();
      setRecoveryCodes(codes);
      // Update user preferences to indicate MFA is enabled
      await updateUserPreferences({ mfaEnabled: true });
    } catch (error) {
      console.error('Error enabling MFA:', error);
      setErrorMessage('Failed to enable MFA. Please try again.');
    }
  };

  const handleContinue = () => {
    // Redirect to dashboard after MFA setup
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <h2>Set Up Multi-Factor Authentication (MFA)</h2>
      {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
      {!recoveryCodes.length ? (
        <div>
          <p>To enhance your account security, please enable MFA.</p>
          <Button color="primary" onClick={handleEnableMfa}>
            Enable MFA
          </Button>
        </div>
      ) : (
        <div>
          <h4>Recovery Codes</h4>
          <p>Please save these recovery codes in a secure place:</p>
          <pre>{recoveryCodes.join('\n')}</pre>
          <Button color="success" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default SetupMfa;
