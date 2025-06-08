
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import ClientModal from './ClientModal';
import { Client } from '../../types';
interface ClientSelectProps {
    clients: any[];
    selectedClient: any;
    setSelectedClient: React.Dispatch<React.SetStateAction<any>>;
    onClientCreated: (client: any) => void;
}

export default function ClientSelect({
    clients,
    selectedClient,
    setSelectedClient,
    onClientCreated,
}: ClientSelectProps ) {

    const [searchTerm, setSearchTerm] = useState('');
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClientCreated = (newClient: Client) => {
        setSelectedClient(newClient);
        setShowClientModal(false);
        onClientCreated(newClient); // Refresh the clients list
      };
    



    

    return <>
        <div className="relative">
            <label className="form-label">Client</label>
            {selectedClient ? (
                <div className="flex justify-between items-center p-4 border border-gray-300 border-solid rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                    <div>
                        <div className="font-semibold text-gray-900">{selectedClient.name}</div>
                        {selectedClient.address && (
                            <div className="text-sm text-gray-600">{selectedClient.address}</div>
                        )}
                        {selectedClient.panVat && (
                            <div className="text-sm text-gray-500">PAN/VAT: {selectedClient.panVat}</div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedClient(null)}
                        className="btn btn-outline btn-sm"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search existing clients..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowClientSearch(true);
                            }}
                            onFocus={() => {
                                setShowClientSearch(true);
                            }}
                            onBlur={() => {
                                // Delay hiding to allow clicking on dropdown items
                                setTimeout(() => setShowClientSearch(false), 200);
                            }}
                        />
                        {showClientSearch && (
                            <div className="fixed  z-[9999] w-auto mt-1 bg-white border border-gray-300 border-solid rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {searchTerm.length === 0 ? (
                                    // Show all clients when no search term
                                    clients.length > 0 ? (
                                        <>
                                            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100 border-solid">
                                                All Clients ({clients.length})
                                            </div>
                                            {clients.slice(0, 10).map(client => (
                                                <div
                                                    key={client.id}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 border-solid last:border-b-0"
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setShowClientSearch(false);
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    <div className="font-medium text-gray-900">{client.name}</div>
                                                    {client.address && (
                                                        <div className="text-sm text-gray-500">{client.address}</div>
                                                    )}
                                                </div>
                                            ))}
                                            {clients.length > 10 && (
                                                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 text-center">
                                                    Type to search through all {clients.length} clients
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-4 text-gray-500 text-center">
                                            No clients found. Create your first client below.
                                        </div>
                                    )
                                ) : filteredClients.length > 0 ? (
                                    // Show filtered results when searching
                                    <>
                                        <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100 border-solid">
                                            Search Results ({filteredClients.length})
                                        </div>
                                        {filteredClients.map(client => (
                                            <div
                                                key={client.id}
                                                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 border-solid last:border-b-0"
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setShowClientSearch(false);
                                                    setSearchTerm('');
                                                }}
                                            >
                                                <div className="font-medium text-gray-900">{client.name}</div>
                                                {client.address && (
                                                    <div className="text-sm text-gray-500">{client.address}</div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    // No search results
                                    <div className="p-4 text-gray-500 text-center">
                                        No clients match "{searchTerm}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 border-solid" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">Don't see your client?</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowClientModal(true)}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                            >
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                                    <UserPlus size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Create New Client</div>
                                    <div className="text-sm text-blue-500">Add a new client to your database</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </>
}