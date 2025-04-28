'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const navItems = [
    { name: 'Inicio', href: '/' },
    {
      name: 'Recursos Ansiedad',
      submenu: [
        { name: 'Centro de Recursos', href: '/recursos' },
        { name: 'Sobre la Ansiedad', href: '/recursos/ansiedad' },
        { name: 'Técnicas de Manejo', href: '/recursos/tecnicas' },
        { name: 'Ayuda Profesional', href: '/recursos/profesionales' },
        { name: 'Líneas de Crisis', href: '/recursos/crisis' },
      ],
    },
    {
      name: 'Legal',
      submenu: [
        { name: 'Aviso Legal', href: '/legal/aviso-legal' },
        { name: 'Privacidad', href: '/legal/privacidad' },
        { name: 'Cookies', href: '/legal/cookies' },
        { name: 'Términos', href: '/legal/terminos' },
        { name: 'Limitaciones', href: '/legal/limitaciones' },
      ],
    },
    { name: 'Contacto', href: '/contacto' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Construcción de clases dinámicas para el header
  const headerClasses = `
    sticky top-0 z-50 transition-all duration-300 ease-in-out 
    ${theme === 'dark' ? 'text-white' : 'text-gray-800'}
    ${hasScrolled
      ? (theme === 'dark' ? 'bg-gray-900/95 backdrop-blur-sm shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-md')
      : (theme === 'dark' ? 'bg-gray-900' : 'bg-white')
    }
  `;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} text-3xl font-semibold transition-colors duration-300`}>
                Mar
              </span>
              <span className="text-blue-600 text-3xl font-semibold">
                IA
              </span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 font-medium text-sm lg:text-base flex items-center`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 font-medium text-sm lg:text-base flex items-center group`}
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                {item.submenu && (
                  <div
                    className={`absolute left-0 mt-2 w-56 origin-top-left rounded-md shadow-lg 
                      ${theme === 'dark' ? 'bg-gray-800 ring-1 ring-black ring-opacity-5' : 'bg-white ring-1 ring-black ring-opacity-5'} 
                      focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out`
                    }
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby={`menu-button-${item.name}`}
                  >
                    <div className="py-1" role="none">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-4 py-2 text-sm 
                            ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                            transition-colors duration-150`}
                          role="menuitem"
                          tabIndex={-1}
                          id={`menu-item-${subItem.name}`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                ${theme === 'dark'
                  ? 'text-yellow-400 hover:bg-gray-700 focus-visible:ring-yellow-400 focus-visible:ring-offset-gray-900'
                  : 'text-gray-600 hover:bg-gray-200 focus-visible:ring-blue-500 focus-visible:ring-offset-white'}
              `}
              aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
               <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </motion.div>
              </AnimatePresence>
            </button>

            <button
              className={`md:hidden p-2 rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
              ${theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700 focus-visible:ring-gray-400 focus-visible:ring-offset-gray-900'
                : 'text-gray-700 hover:bg-gray-200 focus-visible:ring-blue-500 focus-visible:ring-offset-white'}`
              }
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isMenuOpen ? 'close' : 'open'}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
              id="mobile-menu"
            >
              <div className={`mt-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-md shadow-lg p-4`}>
                <nav className="flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <div key={item.name}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 
                            ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'}`
                          }
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <div className="text-base font-medium">
                          <span className={`block px-3 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-semibold`}>{item.name}</span>
                          <div className="pl-4 mt-1 space-y-1">
                            {item.submenu?.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 
                                  ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-blue-600'}`
                                }
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header; 