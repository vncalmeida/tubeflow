import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Calendar, 
  CreditCard, 
  Shield, 
  Download,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Gift,
  Loader2
} from 'lucide-react';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

interface PaymentSuccessState {
  paymentId: string;
  amount: number;
  plan: string;
  userExists: boolean;
}

interface RegistrationData {
  email: string;
  companyName: string;
  password: string;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<RegistrationData>>({});
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    companyName: '',
    password: ''
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const safeParseAmount = (value: unknown): number => {
    try {
      if (typeof value === 'string') {
        const cleanedValue = value
          .replace(/[^0-9.,]/g, '')
          .replace(',', '.');
        return parseFloat(cleanedValue);
      }
      if (typeof value === 'number') {
        return value;
      }
      return 0;
    } catch (error) {
      console.error('[PaymentSuccessPage] Erro na conversão do valor:', error);
      return 0;
    }
  };

  const state = location.state as PaymentSuccessState | null;
  
  const paymentData: PaymentSuccessState = {
    paymentId: state?.paymentId || '',
    amount: safeParseAmount(state?.amount),
    plan: state?.plan || '',
    userExists: state?.userExists || false
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(confettiTimer);
    };
  }, []);

  useEffect(() => {
    if (!paymentData.paymentId) {
      navigate('/', { replace: true });
    }
  }, [paymentData.paymentId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: Partial<RegistrationData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!registrationData.email.match(emailRegex)) {
      errors.email = 'Email inválido';
    }
    if (registrationData.companyName.length < 3) {
      errors.companyName = 'Nome da empresa deve ter pelo menos 3 caracteres';
    }
    if (registrationData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...registrationData,
          paymentId: paymentData.paymentId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('company', JSON.stringify(data.company));
      
      navigate('/dashboard', {
        state: {
          newAccount: true,
          company: data.company
        }
      });

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPlanType = (type: string) => {
    const planNames: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };
    return planNames[type.toLowerCase()] || type;
  };

  if (!paymentData.paymentId || isNaN(paymentData.amount) || paymentData.amount <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 dark:bg-dark-background dark:text-dark-text">
        <div className="text-center max-w-2xl bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-blue-100">
          <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Ops! Algo deu errado
          </h1>
          <p className="text-gray-600 mb-6">
            Não foi possível processar as informações do pagamento
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  if (paymentData.userExists) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4 dark:bg-dark-background dark:text-dark-text">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 text-center border border-blue-100"
        >
          <div className="relative mb-6">
            <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-0 right-1/2 translate-x-12 -translate-y-2"
            >
              <Sparkles className="w-6 h-6 text-blue-400" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Pagamento Confirmado!
          </h2>
          <p className="text-gray-600 mb-2">
            Sua conta já está ativa! Use suas credenciais para fazer login.
          </p>
          <p className="text-gray-600 mb-8">
            Aproveite todos os recursos da plataforma.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            Acessar minha conta
          </button>
        </motion.div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(paymentData.amount);

  const features = [
    {
      icon: Calendar,
      title: 'Acesso Imediato',
      description: 'Comece a usar agora mesmo todos os recursos premium',
      color: 'bg-blue-500'
    },
    {
      icon: Shield,
      title: 'Garantia de 7 dias',
      description: 'Não ficou satisfeito? Devolvemos seu dinheiro',
      color: 'bg-blue-600'
    },
    {
      icon: Download,
      title: 'Suporte Premium',
      description: 'Atendimento prioritário 24/7 para você',
      color: 'bg-blue-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 dark:bg-dark-background dark:text-dark-text">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          colors={['#2563EB', '#60A5FA', '#93C5FD', '#FFFFFF']}
        />
      )}
      
      <motion.div
        className="max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="relative inline-block"
          >
            <CheckCircle className="w-20 h-20 text-blue-500" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-blue-400" />
            </motion.div>
          </motion.div>
          <h1 className="text-4xl font-bold text-blue-600 mt-6 mb-3">
            Sucesso! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Plano {formatPlanType(paymentData.plan)}
          </p>
          <p className="text-3xl font-bold text-blue-600 mb-8">
            {formattedAmount}
          </p>
          <p className="text-gray-600">
            Vamos configurar sua conta para começar
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={registrationData.email}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                    formErrors.email ? 'border-red-500' : 'border-blue-200'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                  placeholder="seu@email.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="companyName"
                  required
                  value={registrationData.companyName}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 rounded-xl border ${
                    formErrors.companyName ? 'border-red-500' : 'border-blue-200'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                  placeholder="Nome da sua empresa"
                />
                {formErrors.companyName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.companyName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={registrationData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-12 w-full px-4 py-3 rounded-xl border ${
                    formErrors.password ? 'border-red-500' : 'border-blue-200'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
                  placeholder="Escolha uma senha segura"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            className="mt-8 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Criar minha conta
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </motion.button>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-dark-card shadow-md hover:shadow-lg transition-all border border-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`p-2 rounded-full ${feature.color} mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.form>

        <motion.div
          className="mt-8 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>
            Ao criar sua conta, você concorda com nossos{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 hover:underline">
              Política de Privacidade
            </a>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
            <CreditCard className="h-4 w-4" />
            <span>Pagamento processado com segurança</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;