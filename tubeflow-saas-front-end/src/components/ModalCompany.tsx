import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

interface ModalCompanyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface CompanyFormData {
    name: string;
    expiration: string;
}

const ModalCompany: React.FC<ModalCompanyProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<CompanyFormData>({
        name: '',
        expiration: ''
    });
    const [formErrors, setFormErrors] = useState<Partial<CompanyFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Partial<CompanyFormData> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        }
        if (!formData.expiration) {
            errors.expiration = 'Data de expiração é obrigatória';
        }

        setFormErrors(errors);
        if (Object.keys(errors).length) return;

        const token = localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Token não encontrado. Faça login novamente.', { position: 'top-right' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/api/admin/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    expiration: formData.expiration
                })
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setFormData({ name: '', expiration: '' });
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Erro ao cadastrar empresa.', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Erro na solicitação de cadastro:', error);
            toast.error('Erro na conexão com o servidor.', { position: 'top-right' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Cadastrar Nova Empresa</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Digite o nome da empresa"
                        />
                        {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                            Data de Expiração
                        </label>
                        <input
                            type="date"
                            id="expiration"
                            value={formData.expiration}
                            onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.expiration ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.expiration && <p className="mt-1 text-sm text-red-500">{formErrors.expiration}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCompany;

