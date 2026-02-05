import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Play, Triangle } from 'lucide-react';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full bg-white dark:bg-dark-card/90 backdrop-blur-md z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
                        <Triangle className="w-6 h-6 text-blue-600 fill-blue-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-dark-text">TubeFlow</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-dark-text transition-colors">
                            Recursos
                        </a>
                        <a href="#benefits" className="text-gray-600 hover:text-gray-900 dark:text-dark-text transition-colors">
                            Benefícios
                        </a>
                        <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-dark-text transition-colors">
                            Preços
                        </a>
                        <button className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors">
                            Começar Agora
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <motion.div
                className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                transition={{ duration: 0.2 }}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-dark-card shadow-lg">
                    <a
                        href="#features"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 dark:text-dark-text hover:bg-gray-50"
                    >
                        Recursos
                    </a>
                    <a
                        href="#benefits"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 dark:text-dark-text hover:bg-gray-50"
                    >
                        Benefícios
                    </a>
                    <a
                        href="#pricing"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 dark:text-dark-text hover:bg-gray-50"
                    >
                        Preços
                    </a>
                    <div className="px-3 py-2">
                        <button className="w-full bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors">
                            Começar Agora
                        </button>
                    </div>
                </div>
            </motion.div>
        </nav>
    );
};

export default Navigation;