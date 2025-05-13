'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider'; // Asumiendo que tienes ThemeProvider
import Link from 'next/link';

export default function ContactoPage() {
  const { theme } = useTheme();
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    // Validación básica
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setError('Por favor completa todos los campos requeridos.');
      setEnviando(false);
      return;
    }

    // Simulación de envío (en una app real, aquí iría la lógica de envío al backend)
    console.log("Datos del formulario (simulación):", formData);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      // Limpiar formulario tras envío exitoso (opcional)
      // setFormData({
      //   nombre: '',
      //   email: '',
      //   asunto: '',
      //   mensaje: '',
      // });
    }, 1500);
  };

  return (
    <div className={`min-h-screen py-12 px-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Información de contacto */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'} p-8 rounded-xl`}>
              <h1 className="text-3xl font-bold mb-4 text-blue-600">Contacto</h1>
              <p className={`mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>
                Estamos aquí para escucharte. Puedes contactarnos utilizando el formulario o a través de los siguientes medios.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded-full mr-4 shadow-sm`}>
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-neutral-800'}`}>Email</h3>
                    <a href="mailto:talent@teilur.com" className="text-blue-500 hover:underline">
                      talent@teilur.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded-full mr-4 shadow-sm`}>
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-neutral-800'}`}>Teléfono</h3>
                    <a href="tel:+13476544961" className="text-blue-500 hover:underline">
                      +1 (347) 654 4961
                    </a>
                  </div>
                </div>
                
                 <div className="flex items-start">
                  <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-3 rounded-full mr-4 shadow-sm`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  </div>
                  <div>
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-neutral-800'}`}>Dirección</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>2093 Philadelphia Pike #9001</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>Claymont, DE, 19703</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>United States</p>
                  </div>
                </div>
                
              </div>

              <div className={`mt-12 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
                <h3 className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'} mb-3`}>Asistencia en crisis</h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}`}>
                  Si estás experimentando una emergencia de salud mental, por favor contacta a los servicios de emergencia inmediatamente.
                </p>
                <div className="space-y-2">
                  <a 
                    href="tel:123" 
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors w-full justify-center md:w-auto"
                  >
                    Línea de Emergencia Nacional: 123
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                   <a 
                    href="tel:106" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full justify-center md:w-auto ml-0 md:ml-2 mt-2 md:mt-0"
                  >
                    Línea de Salud Mental: 106
                     <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                     </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div>
              {enviado ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${theme === 'dark' ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200'} border rounded-xl p-8 text-center h-full flex flex-col justify-center`}
                >
                  <div className={`${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'} w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center`}>
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'} mb-2`}>¡Mensaje enviado!</h2>
                  <p className={`${theme === 'dark' ? 'text-green-400' : 'text-green-700'} mb-6`}>
                    Gracias por contactarnos. Responderemos a tu mensaje lo antes posible.
                  </p>
                  <button
                    onClick={() => setEnviado(false)} // Permite enviar otro mensaje
                    className={`mx-auto px-5 py-2 ${theme === 'dark' ? 'bg-gray-700 text-green-300 border-gray-600 hover:bg-gray-600' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'} border rounded-lg transition-colors font-medium`}
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-neutral-100'} shadow-sm rounded-xl p-8 border`}>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-neutral-800'} mb-6`}>Envíanos un mensaje</h2>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="nombre" className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-700'} font-medium mb-1`}>
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'border-neutral-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none transition-all`}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-700'} font-medium mb-1`}>
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'border-neutral-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none transition-all`}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="asunto" className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-700'} font-medium mb-1`}>
                        Asunto
                      </label>
                      <select
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'border-neutral-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none transition-all`}
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="consulta">Consulta general</option>
                        <option value="tecnico">Soporte técnico</option>
                        <option value="sugerencia">Sugerencia</option>
                        <option value="colaboracion">Oportunidad de colaboración</option>
                        <option value="privacidad">Consulta de privacidad</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="mensaje" className={`block ${theme === 'dark' ? 'text-gray-300' : 'text-neutral-700'} font-medium mb-1`}>
                        Mensaje <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        rows={6}
                        className={`w-full px-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'border-neutral-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none transition-all`}
                        placeholder="¿En qué podemos ayudarte?"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={enviando}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white 
                          ${enviando 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'} 
                          transition-colors flex items-center justify-center`}
                      >
                        {enviando ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando...
                          </>
                        ) : 'Enviar mensaje'}
                      </button>
                    </div>
                  </form>
                  
                  <p className={`mt-6 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-neutral-500'} text-center`}>
                    Al enviar este formulario, aceptas nuestra <Link href="/legal" className="underline hover:text-blue-500">política de privacidad</Link>.
                    Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos:
                    Por email: <a href="mailto:talent@teilur.com" className="underline hover:text-blue-500">talent@teilur.com</a> | 
                    Visitando: <a href="https://www.teilur.com/contact" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">www.teilur.com/contact</a> | 
                    Teléfono: <a href="tel:+13476544961" className="underline hover:text-blue-500">+1 (347) 654 4961</a> | 
                    Correo: 2093 Philadelphia Pike #9001 Claymont, DE, 19703, United States
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 