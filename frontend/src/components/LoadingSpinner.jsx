import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner">
      <Loader2 className="animate-spin" size={40} />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
