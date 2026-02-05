import React, { useEffect, useRef, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import IMask from 'imask';
import Select, { MultiValue, StylesConfig, ThemeConfig } from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../config';

interface FreelancerData {
  id: string;
  name: string;
  email: string;
  roles: string[];
  phone: string;
}

interface ModalFreelancerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
  freelancer?: FreelancerData;
}

interface FreelancerFormData {
  name: string;
  email: string;
  roles: string[];
  phone: string;
}

interface FreelancerFormErrors {
  name?: string;
  email?: string;
  roles?: string;
  phone?: string;
  general?: string;
}

const roleOptions = [
  { value: 'roteirista', label: 'Roteirista' },
  { value: 'editor', label: 'Editor' },
  { value: 'narrador', label: 'Narrador' },
  { value: 'thumb_maker', label: 'Thumb Maker' }
];

const ModalFreelancer: React.FC<ModalFreelancerProps> = ({
  isOpen,
  onClose,
  companyId,
  onSuccess,
  freelancer
}) => {
  const [formData, setFormData] = useState<FreelancerFormData>({
    name: '',
    email: '',
    roles: [],
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<FreelancerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  // acompanha o modo da página (classe `dark` no <html>)
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (phoneRef.current) {
      const mask = IMask(phoneRef.current, { 
        mask: '(00) 00000-0000',
        lazy: false
      });
      
      // Atualizar o estado do React quando o IMask aceitar um valor
      mask.on('accept', () => {
        setFormData(prev => ({ ...prev, phone: mask.unmaskedValue }));
      });
      
      return () => mask.destroy();
    }
  }, [isOpen]);

  useEffect(() => {
    if (freelancer && isOpen) {
      setFormData({
        name: freelancer.name,
        email: freelancer.email,
        roles: freelancer.roles || [],
        phone: freelancer.phone || ''
      });
    } else if (!freelancer && isOpen) {
      setFormData({ name: '', email: '', roles: [], phone: '' });
    }
  }, [freelancer, isOpen]);

  if (!isOpen) return null;

  const handleRolesChange = (selected: MultiValue<{ value: string; label: string }>) => {
    setFormData({ ...formData, roles: selected.map(o => o.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: FreelancerFormErrors = {};
    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) errors.email = 'E-mail é obrigatório';
    if (!formData.roles.length) errors.roles = 'Selecione ao menos uma função';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      setFormErrors(prev => ({ ...prev, general: 'Token não encontrado — faça login novamente.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const url = freelancer ? `${API_URL}/api/freelancers/${freelancer.id}` : `${API_URL}/api/register-freelancer`;
      const method = freelancer ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Company-Id': companyId,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || (freelancer ? 'Freelancer atualizado!' : 'Freelancer cadastrado!'));
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Erro ao salvar.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Falha de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // >>> Estilo do react-select – preto puro no dark, igual aos inputs do modal
  const selectStyles: StylesConfig<any, true> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#000000' : '#ffffff',
      borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#d1d5db',
      boxShadow: state.isFocused
        ? `0 0 0 2px ${isDark ? 'rgba(239,68,68,.45)' : 'rgba(239,68,68,.25)'}`
        : 'none',
      ':hover': { borderColor: isDark ? 'rgba(255,255,255,0.18)' : '#9ca3af' },
      minHeight: 42
    }),
    valueContainer: (b) => ({ ...b, padding: '2px 8px' }),
    placeholder: (b) => ({ ...b, color: isDark ? 'rgba(255,255,255,0.55)' : '#6b7280' }),
    input: (b) => ({ ...b, color: isDark ? '#ffffff' : '#111827' }),
    singleValue: (b) => ({ ...b, color: isDark ? '#ffffff' : '#111827' }),
    multiValue: (b) => ({
      ...b,
      backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#f3f4f6'
    }),
    multiValueLabel: (b) => ({ ...b, color: isDark ? '#ffffff' : '#111827' }),
    multiValueRemove: (b) => ({
      ...b,
      color: isDark ? '#ffffff' : '#6b7280',
      ':hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
        color: isDark ? '#ffffff' : '#111827'
      }
    }),
    menuPortal: (b) => ({ ...b, zIndex: 999999 }),
    menu: (b) => ({
      ...b,
      backgroundColor: isDark ? '#000000' : '#ffffff',
      color: isDark ? '#ffffff' : '#111827',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}`,
      boxShadow: isDark ? '0 12px 28px rgba(0,0,0,.6)' : undefined
    }),
    menuList: (b) => ({ ...b, padding: 4 }),
    option: (b, state) => ({
      ...b,
      backgroundColor: state.isFocused
        ? (isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6')
        : 'transparent',
      color: isDark ? '#e5e7eb' : '#111827',
      ':active': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'
      }
    }),
    indicatorSeparator: (b) => ({ ...b, backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#d1d5db' }),
    dropdownIndicator: (b) => ({ ...b, color: isDark ? 'rgba(255,255,255,0.60)' : '#6b7280' }),
    clearIndicator: (b) => ({ ...b, color: isDark ? 'rgba(255,255,255,0.60)' : '#6b7280' })
  };

  const selectTheme: ThemeConfig = (theme) => ({
    ...theme,
    borderRadius: 8,
    spacing: { ...theme.spacing, baseUnit: 4, controlHeight: 42, menuGutter: 6 },
    colors: {
      ...theme.colors,
      primary: '#ef4444',           // foco/vermelho igual aos inputs
      primary25: isDark ? 'rgba(255,255,255,0.08)' : '#fee2e2',
      neutral0: isDark ? '#000000' : '#ffffff',
      neutral80: isDark ? '#ffffff' : '#111827'
    }
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {freelancer ? 'Editar Freelancer' : 'Cadastrar Novo Freelancer'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-white/70">
                {freelancer ? 'Atualize os dados do profissional' : 'Informe os dados do profissional'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-white/70" />
          </button>
        </div>

        <ToastContainer position="top-right" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formErrors.general && <p className="text-red-600 dark:text-red-400">{formErrors.general}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 ring-1 focus:ring-2 outline-none ${
                formErrors.name ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-200 dark:ring-white/10 focus:ring-red-500'
              }`}
              placeholder="Digite o nome completo"
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 ring-1 focus:ring-2 outline-none ${
                formErrors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-200 dark:ring-white/10 focus:ring-red-500'
              }`}
              placeholder="Digite o e-mail"
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Funções</label>
            <Select
              isMulti
              options={roleOptions}
              value={roleOptions.filter(o => formData.roles.includes(o.value))}
              onChange={handleRolesChange}
              styles={selectStyles}
              theme={selectTheme}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              menuPlacement="auto"
              closeMenuOnSelect={false}
              classNamePrefix="freelancer-select"
              noOptionsMessage={() => 'Sem opções'}
            />
            {formErrors.roles && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.roles}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-1">Telefone</label>
            <input
              ref={phoneRef}
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 ring-1 ring-gray-200 dark:ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-white/80 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/15 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalFreelancer;
