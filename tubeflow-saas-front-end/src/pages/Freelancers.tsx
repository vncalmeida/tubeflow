// Freelancers.tsx
import React, { useEffect, useState } from 'react';
import { X, Edit2, Trash2, Plus, AlertTriangle, Phone, Mail, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalFreelancer from '../components/ModalFreelancer';
import { API_URL } from '../config';

type Freelancer = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
  createdAt: string;
  phone: string;
};

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [companyId, setCompanyId] = useState(localStorage.getItem('companyId') || '');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  const fetchFreelancers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/freelancers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Company-Id': companyId
        }
      });
      if (response.ok) {
        const data = await response.json();
        const normalized = data.data.map((f: any) => ({
          ...f,
          roles: Array.isArray(f.roles) ? f.roles : f.roles ? [f.roles] : f.role ? [f.role] : []
        }));
        setFreelancers(normalized);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao buscar freelancers.', { position: 'top-right' });
      }
    } catch {
      toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const handleDelete = async () => {
    if (selectedFreelancer) {
      try {
        const response = await fetch(`${API_URL}/api/freelancers/${selectedFreelancer.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Company-Id': companyId
          }
        });
        if (response.ok) {
          toast.success('Freelancer excluído com sucesso!', { position: 'top-right' });
          fetchFreelancers();
          setIsDeleteModalOpen(false);
          setSelectedFreelancer(null);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Erro ao excluir freelancer.', { position: 'top-right' });
        }
      } catch {
        toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
      }
    }
  };

  const openEditModal = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <PageHeader title="Freelancers" description="Gerencie os freelancers do sistema" />
      <ToastContainer />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">Lista de Freelancers</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Cadastrar Freelancer</span>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">Função</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">Data de Cadastro</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-white/70">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {freelancers.map((freelancer) => (
                  <tr key={freelancer.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-white">{freelancer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/70">{freelancer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/70">
                      {Array.isArray(freelancer.roles) ? freelancer.roles.join(', ') : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-white/70">{formatDate(freelancer.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(freelancer)}
                          className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(freelancer)}
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
          {freelancers.map((freelancer) => (
            <div key={freelancer.id} className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{freelancer.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-white/10 dark:text-white rounded-full mt-1">
                    {Array.isArray(freelancer.roles) ? freelancer.roles.join(', ') : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(freelancer)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-gray-100 dark:text-white/80 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(freelancer)}
                    className="p-2 rounded-lg text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-white/70">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{freelancer.email}</span>
                </div>
                {freelancer.phone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-white/70">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{freelancer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 dark:text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Cadastrado em {formatDate(freelancer.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isCreateModalOpen && (
        <ModalFreelancer
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          companyId={companyId}
          onSuccess={fetchFreelancers}
        />
      )}
      {isEditModalOpen && selectedFreelancer && (
        <ModalFreelancer
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFreelancer(null);
          }}
          companyId={companyId}
          freelancer={selectedFreelancer}
          onSuccess={() => {
            fetchFreelancers();
            setSelectedFreelancer(null);
          }}
        />
      )}
      {isDeleteModalOpen && selectedFreelancer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Excluir Freelancer</h2>
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
                  Tem certeza de que deseja excluir o freelancer <span className="font-semibold">{selectedFreelancer.name}</span>? Essa ação não poderá ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
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
