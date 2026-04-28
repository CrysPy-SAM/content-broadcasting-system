import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0F1419',
              color: '#F5F1E8',
              border: '1px solid #2A3038',
              borderRadius: '0',
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#C2410C', secondary: '#F5F1E8' } },
            error: { iconTheme: { primary: '#C2410C', secondary: '#F5F1E8' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
