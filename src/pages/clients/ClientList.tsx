import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, LayoutGrid, List, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClientStore } from '../../store/clientStore';
import ClientCard from '../../components/clients/ClientCard';
import ClientListItem from '../../components/clients/ClientListItem';
import EmptyState from '../../components/ui/EmptyState';

const ClientList: React.FC = () => {
  const { clients, fetchClients, deleteClient, viewMode, setViewMode } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  const handleDelete = (id: string) => {
    deleteClient(id);
    toast.success('Client deleted successfully');
  };
  
  // Filter clients based on search term
  const filteredClients = clients.filter((client) => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.panVat && client.panVat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleView = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships and contact information.</p>
        </div>
        <Link to="/clients/add" className="btn btn-primary">
          <Plus size={18} />
          Add Client
        </Link>
      </div>
      
      {clients.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients by name, address, or PAN/VAT..."
                  className="form-input pl-12 border-gray-300 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-outline">
                  <Filter size={18} />
                  Filter
                </button>
                <button
                  onClick={toggleView}
                  className="btn btn-outline"
                  title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <List size={18} />
                      <span className="hidden sm:inline">List</span>
                    </>
                  ) : (
                    <>
                      <LayoutGrid size={18} />
                      <span className="hidden sm:inline">Grid</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Add your first client to get started with estimating and billing."
          icon={<Users size={64} />}
          action={
            <Link to="/clients/add\" className=\"btn btn-primary">
              <Plus size={18} />
              Add Client
            </Link>
          }
        />
      ) : filteredClients.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="empty-state-icon mx-auto mb-4">
              <Search size={48} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">No clients match your search criteria. Try adjusting your search terms.</p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <div key={client.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <ClientCard
                client={client}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <div className="divide-y divide-gray-200">
            {filteredClients.map((client, index) => (
              <div key={client.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                <ClientListItem
                  client={client}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;