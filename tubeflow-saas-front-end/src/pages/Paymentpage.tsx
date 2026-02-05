import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, ArrowLeft, Check, Shield, Clock, AlertCircle, User, Mail, FileText, Copy, Smartphone, RefreshCw } from 'lucide-react';
import InputMask from 'react-input-mask';
import CreditCardComponent from '../components/CreditCard';
import { API_URL } from '../config';

interface PaymentPageProps {
  onBack: () => void;
}

interface LocationState {
  plan: {
    type: string;
    period: string;
    price: number;
    label: string;
    savings?: number; // Adicione se necessário
  };
}

interface FormData {
  name: string;
  email: string;
  cpf: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
}

interface PaymentResponse {
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
  expiration_date: string;
  error?: string;
  status?: string;
  ticket_url?: string;
  external_reference?: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<'credit' | 'pix'>('pix');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cpf: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });
  const [pixCode, setPixCode] = useState('');
  const [pixCodeBase64, setPixCodeBase64] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [focusedField, setFocusedField] = useState<'number' | 'name' | 'expiry' | 'cvc' | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [paymentId, setPaymentId] = useState<string>('');
  const { plan } = location.state as LocationState;

  useEffect(() => {
    let timer: number;
    if (pixCode && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pixCode, timeLeft]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/payments/${paymentId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Erro na verificação do status');

      const data = await response.json();

      if (data.status === 'approved') {
        navigate('/payment-success', {
          state: {
            paymentId: data.payment_id,
            amount: data.amount,
            plan: data.plan_type,
            userExists: data.user_exists
          }
        });
      }
      else if (['rejected', 'canceled', 'chargeback'].includes(data.status)) {
        navigate('/payment-error', {
          state: {
            status: data.status,
            paymentId: data.payment_id,
            amount: data.amount
          }
        });
      }

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      navigate('/payment-error', {
        state: {
          errorMessage: 'Falha ao verificar o status do pagamento'
        }
      });
    }
  };
  // Atualize o useEffect de verificação
  useEffect(() => {
    let timer: number;

    const startVerification = () => {
      if (pixCode && timeLeft > 0) {
        // Verificação imediata primeiro
        checkPaymentStatus();
        // Depois verifica a cada 30 segundos
        timer = window.setInterval(checkPaymentStatus, 30000);
      }
    };

    startVerification();
    return () => clearInterval(timer);
  }, [pixCode, timeLeft, paymentId, navigate]);

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Falha ao copiar código:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: Partial<FormData> = {};
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!emailRegex.test(formData.email)) errors.email = 'Email inválido';
    if (!cpfRegex.test(formData.cpf)) errors.cpf = 'CPF inválido (use o formato 000.000.000-00)';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const state = location.state as LocationState;

    if (!state?.plan || !state.plan.type || !state.plan.price || !state.plan.period) {
      navigate('/', { replace: true });
    }

    const validTypes = ['monthly', 'quarterly', 'annual'];
    if (!validTypes.includes(state.plan.type.toLowerCase())) {
      navigate('/', { replace: true });
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!plan?.type) {
      alert('Selecione um plano válido antes de continuar');
      return navigate('/');
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const paymentData = {
        paymentMethod: 'pix',
        plan: {
          type: plan.type
        },
        userData: {
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, '')
        }
      };

      const response = await fetch(`${API_URL}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData),
      });

      const data: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      setPaymentId(data.payment_id);
      setPixCode(data.qr_code);
      setPixCodeBase64(data.qr_code_base64);

      if (data.expiration_date) {
        const expires = new Date(data.expiration_date);
        setTimeLeft(Math.floor((expires.getTime() - Date.now()) / 1000));
      }

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-6 px-4 sm:py-12 sm:px-6 lg:px-8 dark:bg-dark-background dark:text-dark-text">
      <div className="max-w-4xl mx-auto">
        <motion.button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-dark-text mb-8 group"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Voltar
        </motion.button>

        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 py-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">Finalizar Compra</h1>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total a pagar</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {plan?.price.toFixed(2)}
                  <span className="text-sm text-gray-500 font-normal">/{plan?.period.toLowerCase()}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

              <motion.button
                onClick={() => setSelectedMethod('pix')}
                className={`p-4 rounded-xl border-2 transition-colors ${selectedMethod === 'pix'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 dark:border-dark-card hover:border-gray-300'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <QrCode className={selectedMethod === 'pix' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className={selectedMethod === 'pix' ? 'text-blue-600' : 'text-gray-600'}>
                    PIX
                  </span>
                </div>
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={selectedMethod}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline-block w-4 h-4 mr-2" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Seu nome completo"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline-block w-4 h-4 mr-2" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="seu@email.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>

                  <div className={selectedMethod === 'credit' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline-block w-4 h-4 mr-2" />
                      CPF
                    </label>
                    <InputMask
                      mask="999.999.999-99"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${formErrors.cpf ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="000.000.000-00"
                      name="cpf"
                    />
                    {formErrors.cpf && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.cpf}</p>
                    )}
                  </div>
                </div>

                {selectedMethod === 'credit' ? (
                  <div className="space-y-6">
                    <CreditCardComponent
                      number={formData.cardNumber || ''}
                      name={formData.name || ''}
                      expiry={formData.cardExpiry || ''}
                      cvc={formData.cardCVC || ''}
                      focused={focusedField}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="inline-block w-4 h-4 mr-2" />
                        Número do Cartão
                      </label>
                      <InputMask
                        mask="9999 9999 9999 9999"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('number')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3 rounded-lg border ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="0000 0000 0000 0000"
                        name="cardNumber"
                      />
                      {formErrors.cardNumber && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Validade
                        </label>
                        <InputMask
                          mask="99/99"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('expiry')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 rounded-lg border ${formErrors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                          placeholder="MM/AA"
                          name="cardExpiry"
                        />
                        {formErrors.cardExpiry && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <InputMask
                          mask="999"
                          value={formData.cardCVC}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('cvc')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 rounded-lg border ${formErrors.cardCVC ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                          placeholder="000"
                          name="cardCVC"
                        />
                        {formErrors.cardCVC && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.cardCVC}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!pixCode ? (
                      <div className="text-center py-8">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto"
                        >
                          <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
                            Pagamento Instantâneo via PIX
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Pague em segundos usando o app do seu banco. Basta preencher seus dados e escanear o QR Code.
                          </p>
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Aprovação Imediata</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>100% Seguro</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-lg"
                      >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="w-full md:w-1/2 flex flex-col items-center">
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, damping: 15 }}
                              className="relative"
                            >
                              <img
                                src={`data:image/png;base64,${pixCodeBase64}`}
                                alt="QR Code PIX"
                                className="w-48 h-48 rounded-xl shadow-lg"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 border-2 border-blue-400 rounded-xl"
                              />
                            </motion.div>
                            <div className="mt-4 text-center">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium">
                                <Clock className="h-4 w-4" />
                                <span>{formatTimeLeft(timeLeft)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-full md:w-1/2 space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
                                Código PIX Copiável
                              </h3>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={pixCode}
                                  readOnly
                                  className="w-full px-4 py-3 pr-12 rounded-lg bg-white dark:bg-dark-card border border-gray-300 font-mono text-sm text-gray-600 break-all"
                                  style={{ minHeight: '3rem' }}
                                />
                                <motion.button
                                  type="button"
                                  onClick={handleCopyCode}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {copiedCode ? (
                                    <Check className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Copy className="h-5 w-5" />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900 dark:text-dark-text">Como pagar:</h4>
                              <ol className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-medium">1</span>
                                  <span>Abra o app do seu banco</span>
                                </li>
                                <li className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-medium">2</span>
                                  <span>Escolha pagar via PIX com QR Code</span>
                                </li>
                                <li className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-medium">3</span>
                                  <span>Escaneie o código e confirme o pagamento</span>
                                </li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>{pixCode ? 'Atualizando...' : 'Gerando QR Code...'}</span>
                    </>
                  ) : pixCode ? (
                    <>
                      <span>Atualizar QR Code</span>
                      <RefreshCw className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <span>Gerar QR Code PIX</span>
                      <QrCode className="h-5 w-5" />
                    </>
                  )}
                </motion.button>

                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-600">
                    Após a confirmação do pagamento, você receberá um e-mail com as instruções de acesso à sua conta.
                  </p>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Pagamento 100% seguro processado por Mercado Pago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;