'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Menu, X, ChevronDown, LogIn, LogOut, User, Settings, Loader2 } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Componente para el Dropdown del usuario
const UserDropdown = ({ theme }: { theme: string }) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!session || !session.user) return null;

  const { user } = session;

  const dropdownClasses = `absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none transition-all duration-150 ease-in-out ${theme === 'dark' ? 'bg-gray-800 ring-black' : 'bg-white ring-black'} ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`;
  const itemClasses = `flex items-center w-full px-4 py-2 text-sm transition-colors duration-150 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`;

  const handleProfileClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsOpen(false);
    router.push('/settings/profile');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'dark' ? 'focus:ring-offset-gray-900 focus:ring-white' : 'focus:ring-offset-white focus:ring-blue-500'}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Image
          src={user.image ?? '/default-avatar.png'}
          alt={user.name ?? 'Avatar del usuario'}
          width={32}
          height={32}
          className="rounded-full"
        />
      </button>

      <div ref={dropdownRef} className={dropdownClasses} role="menu" aria-orientation="vertical">
        <div className="py-1" role="none">
          <div className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Logueado como
            <span className={`block font-medium truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{user.name ?? user.email}</span>
          </div>
          <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} my-1`}></div>
          <a 
            href="/settings/profile" 
            className={itemClasses} 
            role="menuitem" 
            onClick={handleProfileClick}
          >
            <Settings className="w-4 h-4 mr-2" />
            Perfil
          </a>
          <button
            onClick={(e) => { 
              signOut(); 
              setIsOpen(false); 
            }}
            className={`${itemClasses} w-full text-left`}
            role="menuitem"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const router = useRouter();

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
        { name: 'Política de Privacidad', href: '/legal' },
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

          <div className="flex items-center space-x-3 sm:space-x-4">
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

            <div className="flex items-center">
              {status === 'loading' && (
                <Loader2 className={`animate-spin w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              )}

              {status === 'unauthenticated' && (
                <button
                  onClick={() => signIn('google')}
                  className={`hidden sm:flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                    ${theme === 'dark'
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 focus-visible:ring-offset-gray-900'
                      : 'bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500 focus-visible:ring-offset-white'}
                  `}
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Iniciar Sesión
                </button>
              )}

              {status === 'authenticated' && session?.user && (
                 <UserDropdown theme={theme} />
              )}
            </div>

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

                  <div className="pt-2 mt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
                    {status === 'loading' && (
                      <div className="flex justify-center py-2">
                         <Loader2 className={`animate-spin w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                    )}
                    {status === 'unauthenticated' && (
                      <button
                        onClick={() => { signIn('google'); setIsMenuOpen(false); }}
                        className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 
                          ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                        `}
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Iniciar Sesión
                      </button>
                    )}
                    {status === 'authenticated' && session?.user && (
                      <>
                         <a
                          href="/settings/profile"
                          className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 
                            ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                          `}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                            router.push('/settings/profile');
                          }}
                        >
                           <Settings className="w-5 h-5 mr-2" />
                           Perfil
                         </a>
                         <button
                          onClick={() => { signOut(); setIsMenuOpen(false); }}
                           className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 
                            ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                          `}
                        >
                           <LogOut className="w-5 h-5 mr-2" />
                           Cerrar Sesión
                         </button>
                       </>
                    )}
                  </div>
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