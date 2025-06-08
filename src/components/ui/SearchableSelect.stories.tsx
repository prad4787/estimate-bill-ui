import React, { useState } from 'react';
import SearchableSelect, { SelectOption } from './SearchableSelect';
import { Package, User, Building } from 'lucide-react';

// Mock data
const mockUsers: SelectOption[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin' },
];

const mockProducts: SelectOption[] = [
  { id: '1', name: 'Laptop Computer', category: 'Electronics', price: 999 },
  { id: '2', name: 'Office Chair', category: 'Furniture', price: 299 },
  { id: '3', name: 'Wireless Mouse', category: 'Electronics', price: 49 },
  { id: '4', name: 'Standing Desk', category: 'Furniture', price: 599 },
  { id: '5', name: 'Monitor 24"', category: 'Electronics', price: 199 },
];

// Example usage component
const SearchableSelectExample: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SelectOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
  
  const [users, setUsers] = useState(mockUsers);
  const [products, setProducts] = useState(mockProducts);
  const [categories] = useState<SelectOption[]>([
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Furniture' },
    { id: '3', name: 'Office Supplies' },
  ]);

  const handleCreateUser = async (name: string): Promise<SelectOption> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: SelectOption = {
      id: `user_${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      role: 'User'
    };
    
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const handleCreateProduct = async (name: string): Promise<SelectOption> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newProduct: SelectOption = {
      id: `product_${Date.now()}`,
      name,
      category: 'Uncategorized',
      price: 0
    };
    
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const renderUserOption = (option: SelectOption) => (
    <div className="flex items-center gap-3">
      <div className="p-1 bg-blue-100 rounded-lg">
        <User size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{option.name}</div>
        <div className="text-xs text-gray-500">{option.email} • {option.role}</div>
      </div>
    </div>
  );

  const renderProductOption = (option: SelectOption) => (
    <div className="flex items-center gap-3">
      <div className="p-1 bg-green-100 rounded-lg">
        <Package size={14} className="text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{option.name}</div>
        <div className="text-xs text-gray-500">
          {option.category} • ${option.price}
        </div>
      </div>
    </div>
  );

  const renderCategoryOption = (option: SelectOption) => (
    <div className="flex items-center gap-3">
      <div className="p-1 bg-purple-100 rounded-lg">
        <Building size={14} className="text-purple-600" />
      </div>
      <div className="font-medium text-gray-900">{option.name}</div>
    </div>
  );

  const renderSelectedUser = (option: SelectOption) => (
    <div className="flex items-center gap-2">
      <div className="p-1 bg-blue-100 rounded-lg">
        <User size={12} className="text-blue-600" />
      </div>
      <span>{option.name}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SearchableSelect Component</h1>
        <p className="text-gray-600">A versatile select component with search and create functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Example */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Select</h3>
            <p className="text-sm text-gray-600 mb-4">Simple category selection without create option</p>
          </div>
          
          <div>
            <label className="form-label">Category</label>
            <SearchableSelect
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Select a category..."
              searchPlaceholder="Search categories..."
              renderOption={renderCategoryOption}
            />
          </div>
          
          {selectedCategory && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                Selected: <strong>{selectedCategory.name}</strong>
              </p>
            </div>
          )}
        </div>

        {/* With Create Option */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">With Create Option</h3>
            <p className="text-sm text-gray-600 mb-4">User selection with ability to create new users</p>
          </div>
          
          <div>
            <label className="form-label">User</label>
            <SearchableSelect
              options={users}
              value={selectedUser}
              onChange={setSelectedUser}
              onCreateNew={handleCreateUser}
              placeholder="Select or create a user..."
              searchPlaceholder="Search users or type to create..."
              createLabel="Create user"
              renderOption={renderUserOption}
              renderSelected={renderSelectedUser}
            />
          </div>
          
          {selectedUser && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Selected: <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </p>
            </div>
          )}
        </div>

        {/* Advanced Example */}
        <div className="space-y-4 md:col-span-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Example</h3>
            <p className="text-sm text-gray-600 mb-4">Product selection with rich display and create functionality</p>
          </div>
          
          <div className="max-w-md">
            <label className="form-label">Product</label>
            <SearchableSelect
              options={products}
              value={selectedProduct}
              onChange={setSelectedProduct}
              onCreateNew={handleCreateProduct}
              placeholder="Select or create a product..."
              searchPlaceholder="Search products or type to create..."
              createLabel="Create product"
              renderOption={renderProductOption}
              maxHeight="300px"
            />
          </div>
          
          {selectedProduct && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg max-w-md">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package size={16} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">{selectedProduct.name}</h4>
                  <p className="text-sm text-green-700">
                    Category: {selectedProduct.category}
                  </p>
                  <p className="text-sm text-green-700">
                    Price: ${selectedProduct.price}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Instructions</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <p><strong>Search:</strong> Type to filter existing options</p>
          <p><strong>Create:</strong> Type a new name and press Enter or click the create option</p>
          <p><strong>Navigate:</strong> Use arrow keys to navigate, Enter to select, Escape to close</p>
          <p><strong>Clear:</strong> Click the × button to clear selection (if allowClear is enabled)</p>
        </div>
      </div>
    </div>
  );
};

export default SearchableSelectExample;