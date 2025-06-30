import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen py-16 flex items-center">
      <div className="container mx-auto px-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;