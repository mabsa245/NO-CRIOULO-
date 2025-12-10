import React from 'react';
import LoginPage from './LoginPage';

// Since we are using Google Auth, Signup is essentially the same flow
const SignupPage: React.FC = () => {
  return <LoginPage />;
};

export default SignupPage;