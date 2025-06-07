import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Plus } from 'lucide-react';
import { useClientStore } from '../store/clientStore';

const Dashboard: React.FC = () => {
  const { clients, fetchClients } = useClientStore();
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  const totalClients = clients.length;
  const totalOpeningBalance = clients.reduce((sum, client) => sum + client.openingBalance, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1>Dashboard</h1>
        <div className="flex flex-wrap gap-3">
          <Link to="/clients/add" className="btn btn-primary inline-flex items-center">
            <Plus size={16} className="mr-1" />
            Add Client
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <h3 className="text-3xl font-semibold mt-1">{totalClients}</h3>
            </div>
            <div className="p-3 bg-primary-100 text-primary-700 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/clients" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all clients
            </Link>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Opening Balance</p>
              <h3 className="text-3xl font-semibold mt-1">{formatCurrency(totalOpeningBalance)}</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-700 rounded-lg">
              <FileText size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/clients" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Manage clients
            </Link>
          </div>
        </div>
        
        <div className="card p-5 flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-secondary-100 text-secondary-700 rounded-full mb-3">
            <Plus size={24} />
          </div>
          <h3 className="text-lg font-medium mb-1">Create New Estimate</h3>
          <p className="text-sm text-gray-500 mb-3">
            Create estimates for your clients
          </p>
          <Link to="/estimates/add" className="btn btn-secondary">
            New Estimate
          </Link>
        </div>
      </div>
      
      <div className="card">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-medium">Recent Clients</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {clients.length === 0 ? (
            <div className="p-5 text-center text-gray-500">
              No clients found. Add your first client to get started.
            </div>
          ) : (
            clients.slice(0, 5).map((client) => (
              <div key={client.id} className="p-5 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <h3 className="font-medium">{client.name}</h3>
                  {client.address && (
                    <p className="text-sm text-gray-500">{client.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(client.openingBalance)}</div>
                  <div className="text-xs text-gray-500">Opening Balance</div>
                </div>
              </div>
            ))
          )}
        </div>
        {clients.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <Link to="/clients" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all clients
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;