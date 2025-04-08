import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Header = () => {
  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Recursos', href: '/recursos' },
    { name: 'Consejos', href: '/consejos' },
    { name: 'Contacto', href: '/contacto' },
  ];

  return (
    <header className="navbar sticky top-0 z-10">
      <div className="container-app">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <span className="text-primary-600 text-3xl font-bold mr-2">AI</span>
              <h1 className="text-neutral-800 font-display font-semibold text-xl">
                Mental Health
              </h1>
            </motion.div>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <div className="bg-green-100 px-2 py-1 rounded-full flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-green-800 font-medium">En línea</span>
            </div>
            <button className="md:hidden ml-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-6 h-6 text-neutral-700"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 