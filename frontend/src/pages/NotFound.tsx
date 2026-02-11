import React from 'react';
import Layout from '../components/Layout';

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-64">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400">Page not found</p>
      </div>
    </Layout>
  );
};

export default NotFound;
