import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Building2, Phone, Mail, Globe, FileText, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOrganizationStore } from '../../store/organizationStore';
import { OrganizationFormData } from '../../types';

const OrganizationSettings: React.FC = () => {
  const { organization, fetchOrganization, updateOrganization, uploadLogo } = useOrganizationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    address: '',
    phones: [''],
    emails: [''],
    website: '',
    taxId: '',
    registrationNumber: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        address: organization.address,
        phones: organization.phones.length > 0 ? organization.phones : [''],
        emails: organization.emails.length > 0 ? organization.emails : [''],
        website: organization.website || '',
        taxId: organization.taxId || '',
        registrationNumber: organization.registrationNumber || ''
      });
      setLogoPreview(organization.logo || '');
    }
  }, [organization]);

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'phones' | 'emails', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'phones' | 'emails') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'phones' | 'emails', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty values
      const cleanedData = {
        ...formData,
        phones: formData.phones.filter(phone => phone.trim() !== ''),
        emails: formData.emails.filter(email => email.trim() !== '')
      };

      // Validate required fields
      if (!cleanedData.name.trim()) {
        toast.error('Organization name is required');
        return;
      }

      if (cleanedData.emails.length === 0) {
        toast.error('At least one email is required');
        return;
      }

      if (cleanedData.phones.length === 0) {
        toast.error('At least one phone number is required');
        return;
      }

      // Upload logo if changed
      let logoUrl = organization.logo;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      // Update organization
      updateOrganization({
        ...cleanedData,
        logo: logoUrl
      });

      toast.success('Organization settings updated successfully');
    } catch (error) {
      toast.error('Failed to update organization settings');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="page-title">Organization Settings</h1>
            <p className="text-gray-600 mt-2">Manage your company information for estimates, bills, and receipts.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            <p className="text-gray-600 mt-1">Essential company details that appear on all documents.</p>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div>
                <label className="form-label">Website</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="url"
                    className="form-input pl-12"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.yourcompany.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your complete business address"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Tax ID / VAT Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-12"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    placeholder="TAX123456789"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Registration Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-12"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    placeholder="REG123456789"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <p className="text-gray-600 mt-1">Phone numbers and email addresses for customer communication.</p>
          </div>
          <div className="card-body space-y-6">
            {/* Phone Numbers */}
            <div>
              <label className="form-label">
                Phone Numbers <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {formData.phones.map((phone, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        className="form-input pl-12"
                        value={phone}
                        onChange={(e) => handleArrayChange('phones', index, e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {formData.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('phones', index)}
                        className="action-btn action-btn-danger"
                        title="Remove phone number"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('phones')}
                  className="btn btn-outline btn-sm"
                >
                  <Plus size={16} />
                  Add Phone Number
                </button>
              </div>
            </div>

            {/* Email Addresses */}
            <div>
              <label className="form-label">
                Email Addresses <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {formData.emails.map((email, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        className="form-input pl-12"
                        value={email}
                        onChange={(e) => handleArrayChange('emails', index, e.target.value)}
                        placeholder="info@yourcompany.com"
                      />
                    </div>
                    {formData.emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('emails', index)}
                        className="action-btn action-btn-danger"
                        title="Remove email address"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('emails')}
                  className="btn btn-outline btn-sm"
                >
                  <Plus size={16} />
                  Add Email Address
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Company Logo</h2>
            <p className="text-gray-600 mt-1">Upload your company logo to appear on estimates and receipts.</p>
          </div>
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <label className="form-label">Logo Image</label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file-input"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Recommended: PNG or JPG format, max 5MB. Optimal size: 300x100 pixels.
                  </p>
                </div>
              </div>
              
              {logoPreview && (
                <div className="lg:w-80">
                  <label className="form-label">Preview</label>
                  <div className="mt-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-24 max-w-full object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationSettings;