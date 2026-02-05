import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  XCircle,
  ArrowLeft,
  RefreshCcw,
  AlertTriangle,
  ShieldX,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const PaymentErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const errorFeatures = [
    {
      icon: AlertTriangle,
      title: 'Problema no Pagamento',
      description: 'Não foi possível processar seu pagamento no momento',
      color: 'bg-red-500'
    },
    {
      icon: ShieldX,
      title: 'Transação Segura',
      description: 'Nenhum valor foi cobrado do seu cartão',
      color: 'bg-red-600'
    },
    {
      icon: HelpCircle,
      title: 'Precisa de Ajuda?',
      description: 'Nossa equipe está disponível 24/7',
      color: 'bg-red-700'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center dark:bg-dark-background dark:text-dark-text">
      <motion.div
        className="max-w-xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <XCircle className="w-20 h-20 text-red-500" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-red-400" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-bold text-red-600 mt-6 mb-3">
            Ops! Algo deu errado
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Não foi possível processar seu pagamento
          </p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-red-100 mb-8"
          variants={itemVariants}
        >
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Identificamos um problema durante o processamento do seu pagamento. 
                Não se preocupe, nenhum valor foi cobrado.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all transform hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voltar e tentar novamente
                </motion.button>
                
                <motion.button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all transform hover:scale-105"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCcw className="mr-2 h-5 w-5" />
                  Recarregar página
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={itemVariants}
        >
          {errorFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-dark-card shadow-md hover:shadow-lg transition-all border border-red-100"
              whileHover={{ scale: 1.05 }}
              variants={itemVariants}
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
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato com nosso{' '}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentErrorPage;