import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Plus, Edit, Trash2, RefreshCw, Banknote } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { adminApiClient } from '@/lib/api';
import { BankAccount, BankAccountFormData, PaymentMethodType } from '@/types';

const CompanyAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<BankAccountFormData>({
    type: 'AYA_BANK' as PaymentMethodType,
    accountName: '',
    accountNumber: '',
    isActive: true,
  });

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApiClient.getBankAccounts();
      setAccounts(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load company payment accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormData({
      type: 'AYA_BANK' as PaymentMethodType,
      accountName: '',
      accountNumber: '',
      isActive: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditing(account);
    setFormData({
      type: account.type,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      isActive: account.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (editing) {
        const updated = await adminApiClient.updateBankAccount(editing.id, formData);
        setAccounts(accounts.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await adminApiClient.createBankAccount(formData);
        setAccounts([created, ...accounts]);
      }
      setShowModal(false);
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Failed to save company payment account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company payment account?')) return;
    try {
      await adminApiClient.deleteBankAccount(id);
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  };

  return (
    <>
      <Head>
        <title>Company Payment Accounts - {process.env.NEXT_PUBLIC_ADMIN_APP_NAME || 'Nan Ayeyar Admin'}</title>
      </Head>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Payment Accounts</h1>
              <p className="text-gray-600">Manage bank and wallet accounts used for online transfers</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={loadAccounts} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>

          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Banknote className="h-5 w-5 mr-2" />
                Accounts
              </h3>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
              )}
              {isLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : accounts.length === 0 ? (
                <div className="text-gray-500">No accounts yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accounts.map(acc => (
                        <tr key={acc.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{acc.type.replace('_', ' ')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{acc.accountName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{acc.accountNumber || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${acc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {acc.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => openEdit(acc)} className="text-green-600 hover:text-green-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(acc.id)} className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Create/Edit Modal */}
          {showModal && (
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'Edit Account' : 'Add Account'}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PaymentMethodType })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="AYA_BANK">AYA Bank</option>
                    <option value="KBZ_BANK">KBZ Bank</option>
                    <option value="AYA_PAY">AYA Pay</option>
                    <option value="KBZ_PAY">KBZ Pay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber || ''}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={!!formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {editing ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default CompanyAccountsPage;


