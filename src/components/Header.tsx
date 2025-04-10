'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from './ThemeProvider';
import { useSessionContext } from '@/contexts/SessionContext';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, login, logout } = useSessionContext();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Recursos', href: '/recursos' },
    { name: 'Consejos', href: '/consejos' },
    { name: 'Contacto', href: '/contacto' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    login();
    
    // Después de iniciar sesión, establecer cookie para el middleware
    document.cookie = "simulatedAuth=true; path=/; max-age=86400";
    
    // Redirigir a chat después de un breve retraso
    setTimeout(() => {
      router.push('/chat');
    }, 800);
  };

  const handleLogout = () => {
    logout();
    
    // Eliminar cookie
    document.cookie = "simulatedAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Cerrar menú de usuario
    setIsUserMenuOpen(false);
    
    // Redirigir a la página de inicio
    router.push('/');
  };

  const handleViewProfile = () => {
    alert(`
      Perfil de Usuario
      -----------------
      Nombre: ${user?.name}
      Email: ${user?.email}
      
      Esta es una vista temporal. En una implementación completa, 
      habría una página de perfil de usuario con más opciones.
    `);
    setIsUserMenuOpen(false);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-sm sticky top-0 z-10 transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <span className="text-blue-600 text-3xl font-bold mr-2">AI</span>
              <h1 className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} font-semibold text-xl transition-colors duration-300`}>
                Mental Health
              </h1>
            </motion.div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200 font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Botón Cuenta/Iniciar sesión */}
            <div className="relative" ref={userMenuRef}>
              {isLoading ? (
                <button
                  className={`flex items-center space-x-2 focus:outline-none ${
                    theme === 'dark' 
                      ? 'border border-gray-700 bg-gray-800 hover:bg-gray-700' 
                      : 'border border-gray-200 bg-gray-50 hover:bg-blue-50'
                  } py-2 px-4 rounded-lg transition-all duration-200`}
                  disabled
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 border-2 border-t-blue-600 ${theme === 'dark' ? 'border-gray-700' : 'border-blue-200'} rounded-full animate-spin mr-2`}></div>
                    <span className="text-sm font-medium">Cargando...</span>
                  </div>
                </button>
              ) : isAuthenticated && user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 focus:outline-none ${
                    theme === 'dark' 
                      ? 'border border-gray-700 bg-gray-800 hover:bg-gray-700' 
                      : 'border border-gray-200 bg-gray-50 hover:bg-blue-50'
                  } py-2 px-4 rounded-lg transition-all duration-200`}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user?.picture ? (
                      <Image
                        src={user.picture}
                        alt={user.name || 'Avatar de usuario'}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user?.given_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className={`hidden md:inline text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} text-left leading-tight transition-colors duration-200`}>
                    Cuenta
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Botón Iniciar Sesión clickeado');
                    handleLogin();
                  }}
                  className={`flex items-center space-x-2 focus:outline-none ${
                    theme === 'dark' 
                      ? 'border border-gray-700 bg-blue-600 hover:bg-blue-700' 
                      : 'border border-blue-200 bg-blue-600 hover:bg-blue-700'
                  } py-2 px-4 rounded-lg transition-all duration-200 text-white`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  <span className="text-sm font-medium">Iniciar sesión</span>
                </button>
              )}

              <AnimatePresence>
                {isAuthenticated && isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-72 ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-md shadow-lg py-1 z-20 border`}
                  >
                    <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-start">
                        <div className="mr-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            {user?.picture ? (
                              <Image
                                src={user.picture}
                                alt={user.name || 'Avatar de usuario'}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {user?.given_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.name}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate max-w-[15rem]`}>{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`py-1 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <button
                        onClick={handleViewProfile}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Ver mi perfil
                      </button>
                      <Link
                        href="/dashboard"
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Mi Dashboard
                      </Link>
                      <Link
                        href="/chat"
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Ir al chat
                      </Link>
                    </div>
                    
                    {/* Sección de preferencias */}
                    <div className={`py-1 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                        theme === 'dark' 
                          ? 'text-gray-200' 
                          : 'text-gray-700'
                      }`}>
                        <div className="flex items-center">
                          <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>Modo {theme === 'dark' ? 'oscuro' : 'claro'}</span>
                        </div>
                        <motion.button 
                          onClick={toggleTheme}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ease-in-out duration-200 focus:outline-none ${
                            theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span 
                            layout
                            transition={{ type: "spring", stiffness: 700, damping: 30 }}
                            className={`inline-block w-4 h-4 transform rounded-full bg-white shadow-md ${
                              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`} 
                          />
                        </motion.button>
                      </div>
                      
                      <div className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                        theme === 'dark' 
                          ? 'text-gray-200' 
                          : 'text-gray-700'
                      }`}>
                        <div className="flex items-center">
                          <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          <span>Idioma</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="mr-2 text-blue-500">ES</span>
                          <span className="opacity-50">/ EN</span>
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Próximamente</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sección de configuración */}
                    <div className={`py-1 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                      <button
                        onClick={toggleSettings}
                        className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Configuración</span>
                        </div>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transform transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`}
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                      
                      <AnimatePresence>
                        {isSettingsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} px-3 py-2 mx-2 rounded-md`}
                          >
                            <div className="space-y-2 text-xs">
                              <div className={`flex items-center justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span>Notificaciones</span>
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Próximamente</span>
                              </div>
                              <div className={`flex items-center justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span>Cambiar contraseña</span>
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Próximamente</span>
                              </div>
                              <div className={`flex items-center justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span>Preferencias de privacidad</span>
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">Próximamente</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-red-400 hover:bg-gray-700' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <svg className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
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

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden mt-4 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-md shadow-md p-4`} 
              id="mobile-menu"
            >
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-600 hover:text-blue-600'
                    } transition-colors duration-200 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header; 