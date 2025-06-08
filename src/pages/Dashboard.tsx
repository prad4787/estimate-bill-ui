import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Plus, DollarSign, TrendingUp, Calendar } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/clients/add" className="btn btn-outline">
            <Plus size={18} />
            Add Client
          </Link>
          <Link to="/estimates/add" className="btn btn-primary">
            <FileText size={18} />
            New Estimate
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Clients</p>
              <h3 className="text-3xl font-bold text-gray-900">{totalClients}</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Users size={24} />
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Opening Balance</p>
              <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(totalOpeningBalance)}</h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-green-500 to-green-600 text-white">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <h3 className="text-3xl font-bold text-gray-900">$0</h3>
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <Calendar size={14} className="mr-1" />
                No estimates yet
              </p>
            </div>
            <div className="stats-icon bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <FileText size={24} />
            </div>
          </div>
        </div>
        
        <div className="stats-card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
          <div className="text-center">
            <div className="stats-icon bg-white bg-opacity-20 text-white mx-auto mb-4">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <p className="text-blue-100 text-sm mb-4">
              Create estimates and manage clients
            </p>
            <Link to="/estimates/add" className="btn bg-white text-blue-600 hover:bg-gray-100 w-full">
              New Estimate
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Clients</h2>
              <Link to="/clients" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body p-0">
            {clients.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <Users size={48} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-500 mb-6">Add your first client to get started with estimates and billing.</p>
                <Link to="/clients/add" className="btn btn-primary">
                  <Plus size={16} />
                  Add Client
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {clients.slice(0, 5).map((client, index) => (
                  <div key={client.id} className="p-6 animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        {client.address && (
                          <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                        )}
                        <div className="flex items-center mt-2">
                          <span className="badge badge-primary">
                            {new Date(client.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-gray-900">{formatCurrency(client.openingBalance)}</div>
                        <div className="text-xs text-gray-500">Opening Balance</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Active Clients</p>
                    <p className="text-sm text-gray-600">Total registered clients</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{totalClients}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 text-white rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Estimates</p>
                    <p className="text-sm text-gray-600">Total estimates created</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">0</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 text-white rounded-lg">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Revenue</p>
                    <p className="text-sm text-gray-600">Total revenue this month</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">$0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;