import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, LayoutGrid, List } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1>Clients</h1>
        <Link to="/clients/add" className="btn btn-primary inline-flex items-center">
          <Plus size={16} className="mr-1" />
          Add Client
        </Link>
      </div>
      
      {clients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients by name, address, or PAN/VAT..."
              className="form-input pl-10 border-gray-300 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={toggleView}
            className="btn btn-outline inline-flex items-center gap-2"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? (
              <>
                <List size={16} />
                <span className="hidden sm:inline">List View</span>
              </>
            ) : (
              <>
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Grid View</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Add your first client to get started with estimating and billing."
          icon={<Users size={48} />}
          action={
            <Link to="/clients/add\" className="btn btn-primary">
              Add Client
            </Link>
          }
        />
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No clients match your search. Try a different search term.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
          {filteredClients.map((client) => (
            <ClientListItem
              key={client.id}
              client={client}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientList;