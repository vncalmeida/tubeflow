import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard as CardIcon } from 'lucide-react';

interface CreditCardProps {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused: 'number' | 'name' | 'expiry' | 'cvc' | null;
}

const getCardType = (number: string) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6/,
    elo: /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|636369)/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(number.replace(/\s/g, ''))) {
      return type;
    }
  }
  return 'default';
};

const CreditCard: React.FC<CreditCardProps> = ({ number, name, expiry, cvc, focused }) => {
  const cardType = getCardType(number);
  const isBackFacing = focused === 'cvc';

  return (
    <div className="w-full max-w-[400px] h-[220px] mx-auto mb-8 [perspective:1000px]">
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700"
        animate={{ rotateY: isBackFacing ? 180 : 0 }}
      >
        {/* Front of the card */}
        <div className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl p-6 
          bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl`}>
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12">
                {cardType === 'visa' && (
                  <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png" alt="Visa" className="w-full" />
                )}
                {cardType === 'mastercard' && (
                  <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png" alt="Mastercard" className="w-full" />
                )}
                {cardType === 'amex' && (
                  <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/amex.png" alt="American Express" className="w-full" />
                )}
                {cardType === 'default' && (
                  <CardIcon className="w-full h-full text-white" />
                )}
              </div>
              <div className="text-sm">
                {cardType.toUpperCase()}
              </div>
            </div>

            <motion.div 
              className="text-2xl tracking-wider"
              animate={{ scale: focused === 'number' ? 1.05 : 1 }}
            >
              {number || '•••• •••• •••• ••••'}
            </motion.div>

            <div className="flex justify-between items-end">
              <motion.div 
                className="flex-1"
                animate={{ scale: focused === 'name' ? 1.05 : 1 }}
              >
                <div className="text-xs opacity-75 mb-1">Nome no Cartão</div>
                <div className="font-medium truncate">
                  {name || 'NOME NO CARTÃO'}
                </div>
              </motion.div>

              <motion.div 
                className="ml-4"
                animate={{ scale: focused === 'expiry' ? 1.05 : 1 }}
              >
                <div className="text-xs opacity-75 mb-1">Validade</div>
                <div className="font-medium">
                  {expiry || 'MM/AA'}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Back of the card */}
        <div className={`absolute w-full h-full [backface-visibility:hidden] rounded-2xl 
          bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-2xl 
          [transform:rotateY(180deg)]`}>
          <div className="w-full h-12 bg-gray-800 mt-6" />
          <div className="px-6 mt-8">
            <div className="flex justify-end items-center bg-white dark:bg-dark-card h-10 rounded">
              <motion.div 
                className="text-gray-900 dark:text-dark-text font-mono mr-3"
                animate={{ scale: focused === 'cvc' ? 1.05 : 1 }}
              >
                {cvc || 'CVC'}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreditCard;