import React from 'react';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen py-16 flex items-center">
      <div className="container mx-auto px-4">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;