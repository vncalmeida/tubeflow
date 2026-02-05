// Admin.tsx
import React, { useEffect, useState } from 'react';
import { X, Edit2, Trash2, Plus, AlertTriangle, Mail, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../config';

type Administrator = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AdministratorFormData = {
  name: string;
  email: string;
};

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [formData, setFormData] = useState<AdministratorFormData>({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState<Partial<AdministratorFormData>>({});
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  const fetchAdministrators = async () => {
    if (!companyId) return;
    try {
      const response = await fetch(`${API_URL}/api/administrators`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Company-Id': companyId
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAdministrators(data.data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao buscar administradores.', { position: 'top-right' });
      }
    } catch {
      toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, [companyId]);

  const validateForm = () => {
    const errors: Partial<AdministratorFormData> = {};
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'E-mail inválido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && selectedAdmin && companyId) {
      try {
        const response = await fetch(`${API_URL}/api/administrators/${selectedAdmin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Company-Id': companyId
          },
          body: JSON.stringify({ name: formData.name, email: formData.email })
        });
        if (response.ok) {
          toast.success('Administrador atualizado com sucesso!', { position: 'top-right' });
          fetchAdministrators();
          setIsEditModalOpen(false);
          setFormData({ name: '', email: '' });
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Erro ao atualizar administrador.', { position: 'top-right' });
        }
      } catch {
        toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
      }
    }
  };

  const handleDelete = async () => {
    if (selectedAdmin && companyId) {
      try {
        const response = await fetch(`${API_URL}/api/administrators/${selectedAdmin.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Company-Id': companyId
          }
        });
        if (response.ok) {
          toast.success('Administrador excluído com sucesso!', { position: 'top-right' });
          fetchAdministrators();
          setIsDeleteModalOpen(false);
          setSelectedAdmin(null);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Erro ao excluir administrador.', { position: 'top-right' });
        }
      } catch {
        toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
      }
    }
  };

  const openEditModal = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setFormData({ name: admin.name, email: admin.email });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyId) return;
    if (!validateForm()) return;
    try {
      const response = await fetch(`${API_URL}/api/register-administrator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Company-Id': companyId
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message, { position: 'top-right' });
        setIsCreateModalOpen(false);
        setFormData({ name: '', email: '' });
        fetchAdministrators();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao cadastrar administrador.', { position: 'top-right' });
      }
    } catch {
      toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <PageHeader title="Administradores" description="Gerencie os administradores da empresa" />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">Lista de Administradores</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Cadastrar Administrador</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
        <div className="hidden md:block bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 dark:bg-black dark:border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">E-mail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">Data de Cadastro</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {administrators.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white">{admin.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/70">{admin.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/70">{formatDate(admin.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:textWhite/80 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-white/5 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {administrators.map((admin) => (
            <div key={admin.id} className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{admin.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(admin)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-gray-100 dark:text-white/80 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(admin)}
                    className="p-2 rounded-lg text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg:white/5 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-white/70">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Cadastrado em {formatDate(admin.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Cadastrar Novo Administrador</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-white/70">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-white/10'}`}
                    placeholder="Digite o nome completo"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-white/10'}`}
                    placeholder="Digite o e-mail"
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Editar Administrador</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-white/70">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Nome</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-white/10'}`}
                    placeholder="Digite o nome completo"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">E-mail</label>
                  <input
                    type="email"
                    id="edit-email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-white/10'}`}
                    placeholder="Digite o e-mail"
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Excluir Administrador</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-white/70">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-gray-600 dark:text-white/80">
                  Tem certeza de que deseja excluir o administrador <span className="font-semibold">{selectedAdmin.name}</span>? Essa ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
