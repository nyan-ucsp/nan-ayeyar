import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';

const DebugAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('DebugAuthPage mounted');
    
    const token = Cookies.get('token');
    addLog(`Token exists: ${!!token}`);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;
        addLog(`Token expired: ${isExpired}`);
        addLog(`Token expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
        addLog(`Current time: ${new Date().toLocaleString()}`);
      } catch (error) {
        addLog(`Token decode error: ${error}`);
      }
    }

    setDebugInfo({
      user,
      isAuthenticated,
      isLoading,
      token: !!token,
      timestamp: new Date().toISOString()
    });
  }, [user, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="bg-gray-100 p-4 rounded text-sm max-h-96 overflow-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono text-xs">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => {
                addLog('Manual refresh triggered');
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                addLog('Clearing logs');
                setLogs([]);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuthPage;
