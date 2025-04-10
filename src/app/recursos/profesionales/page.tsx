'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

// Datos ficticios de profesionales para el directorio
const profesionales = [
  {
    id: 1,
    nombre: "Dra. Ana Martínez",
    especialidad: "Psiquiatría",
    enfoque: ["Trastornos de ansiedad", "Depresión", "Trastorno bipolar"],
    ubicacion: "Madrid",
    contacto: "contacto@anamartinez.es",
    telefono: "+34 912 345 678",
    modalidad: ["Presencial", "Telepsiquiatría"],
    idiomas: ["Español", "Inglés"],
  },
  {
    id: 2,
    nombre: "Dr. Carlos Rodríguez",
    especialidad: "Psicología Clínica",
    enfoque: ["Terapia Cognitivo-Conductual", "Trauma", "TEPT"],
    ubicacion: "Barcelona",
    contacto: "c.rodriguez@psicologia.es",
    telefono: "+34 933 456 789",
    modalidad: ["Presencial"],
    idiomas: ["Español", "Catalán", "Francés"],
  },
  {
    id: 3,
    nombre: "Lucía Fernández",
    especialidad: "Psicoterapia",
    enfoque: ["Terapia familiar", "Relaciones de pareja", "Mindfulness"],
    ubicacion: "Valencia",
    contacto: "lucia@terapiafamiliar.es",
    telefono: "+34 963 567 890",
    modalidad: ["Presencial", "Online"],
    idiomas: ["Español"],
  },
  {
    id: 4,
    nombre: "Dr. Javier López",
    especialidad: "Neuropsicología",
    enfoque: ["Evaluación cognitiva", "Rehabilitación neuropsicológica", "TDAH"],
    ubicacion: "Sevilla",
    contacto: "javier.lopez@neuropsico.es",
    telefono: "+34 954 678 901",
    modalidad: ["Presencial", "Online"],
    idiomas: ["Español", "Inglés"],
  },
  {
    id: 5,
    nombre: "María González",
    especialidad: "Psicología Infantil y Adolescente",
    enfoque: ["Ansiedad infantil", "Problemas de conducta", "Desarrollo"],
    ubicacion: "Bilbao",
    contacto: "mgonzalez@psicologia.es",
    telefono: "+34 944 789 012",
    modalidad: ["Presencial", "Online"],
    idiomas: ["Español", "Euskera"],
  },
  {
    id: 6,
    nombre: "Dr. Alejandro Ramírez",
    especialidad: "Psiquiatría",
    enfoque: ["Adicciones", "Depresión resistente", "Trastornos del sueño"],
    ubicacion: "Málaga",
    contacto: "dr.ramirez@psiquiatria.es",
    telefono: "+34 952 890 123",
    modalidad: ["Presencial", "Telepsiquiatría"],
    idiomas: ["Español", "Inglés", "Alemán"],
  },
];

// Categorías para filtrar profesionales
const categorias = {
  especialidades: ["Psiquiatría", "Psicología Clínica", "Psicoterapia", "Neuropsicología", "Psicología Infantil y Adolescente"],
  ubicaciones: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga"],
  modalidades: ["Presencial", "Online", "Telepsiquiatría"],
};

const ProfesionalesPage = () => {
  const { theme } = useTheme();
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroUbicacion, setFiltroUbicacion] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  
  // Filtrar profesionales según los criterios seleccionados
  const profesionalesFiltrados = profesionales.filter(profesional => {
    // Filtros de dropdown
    const especialidadMatch = filtroEspecialidad ? profesional.especialidad === filtroEspecialidad : true;
    const ubicacionMatch = filtroUbicacion ? profesional.ubicacion === filtroUbicacion : true;
    const modalidadMatch = filtroModalidad ? profesional.modalidad.includes(filtroModalidad) : true;
    
    // Búsqueda de texto
    const busquedaLower = busqueda.toLowerCase();
    const busquedaMatch = busqueda === "" ? true : (
      profesional.nombre.toLowerCase().includes(busquedaLower) ||
      profesional.especialidad.toLowerCase().includes(busquedaLower) ||
      profesional.enfoque.some(e => e.toLowerCase().includes(busquedaLower)) ||
      profesional.ubicacion.toLowerCase().includes(busquedaLower)
    );
    
    return especialidadMatch && ubicacionMatch && modalidadMatch && busquedaMatch;
  });
  
  const resetFiltros = () => {
    setFiltroEspecialidad("");
    setFiltroUbicacion("");
    setFiltroModalidad("");
    setBusqueda("");
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-blue-600">Directorio de Profesionales</h1>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Encuentra un profesional de salud mental</h2>
            <p className="mb-6">
              Este directorio te ofrece información sobre profesionales de salud mental disponibles. Puedes filtrar por especialidad, ubicación y modalidad de consulta para encontrar el apoyo que necesitas.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600">
              <p className="font-bold">Nota importante</p>
              <p>Esta es una lista representativa con fines demostrativos. En un entorno real, es recomendable verificar las credenciales, disponibilidad y especialización del profesional antes de concertar una cita.</p>
            </div>
            
            {/* Filtros de búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label htmlFor="busqueda" className="block text-sm font-medium mb-1">Búsqueda</label>
                <input
                  type="text"
                  id="busqueda"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, especialidad..."
                  className={`w-full px-3 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label htmlFor="especialidad" className="block text-sm font-medium mb-1">Especialidad</label>
                <select
                  id="especialidad"
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Todas las especialidades</option>
                  {categorias.especialidades.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ubicacion" className="block text-sm font-medium mb-1">Ubicación</label>
                <select
                  id="ubicacion"
                  value={filtroUbicacion}
                  onChange={(e) => setFiltroUbicacion(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Todas las ubicaciones</option>
                  {categorias.ubicaciones.map((ubi) => (
                    <option key={ubi} value={ubi}>{ubi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="modalidad" className="block text-sm font-medium mb-1">Modalidad</label>
                <select
                  id="modalidad"
                  value={filtroModalidad}
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Todas las modalidades</option>
                  {categorias.modalidades.map((mod) => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mb-6">
              <button 
                onClick={resetFiltros}
                className={`px-4 py-2 rounded-md ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } transition-colors duration-200`}
              >
                Limpiar filtros
              </button>
            </div>
            
            {/* Resultados */}
            <div className="space-y-6">
              {profesionalesFiltrados.length > 0 ? (
                profesionalesFiltrados.map((profesional) => (
                  <div 
                    key={profesional.id} 
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-200'
                    } shadow-sm`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-blue-500">{profesional.nombre}</h3>
                        <p className="text-sm font-semibold opacity-80 mb-2">{profesional.especialidad}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>{profesional.ubicacion}</span>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{profesional.contacto}</span>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{profesional.telefono}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Áreas de enfoque</h4>
                          <div className="flex flex-wrap gap-2">
                            {profesional.enfoque.map((area, index) => (
                              <span 
                                key={index} 
                                className={`text-xs px-2 py-1 rounded-full ${
                                  theme === 'dark' 
                                    ? 'bg-blue-900 text-blue-200' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Modalidad de consulta</h4>
                          <div className="flex flex-wrap gap-2">
                            {profesional.modalidad.map((mod, index) => (
                              <span 
                                key={index} 
                                className={`text-xs px-2 py-1 rounded-full ${
                                  theme === 'dark' 
                                    ? 'bg-green-900 text-green-200' 
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Idiomas</h4>
                          <div className="flex flex-wrap gap-2">
                            {profesional.idiomas.map((idioma, index) => (
                              <span 
                                key={index} 
                                className={`text-xs px-2 py-1 rounded-full ${
                                  theme === 'dark' 
                                    ? 'bg-gray-700 text-gray-300' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {idioma}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
                  <p className="text-sm opacity-75 mb-4">Prueba a cambiar los filtros de búsqueda.</p>
                  <button 
                    onClick={resetFiltros}
                    className={`px-4 py-2 rounded-md ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors duration-200`}
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Cómo elegir un profesional adecuado</h2>
            <p className="mb-4">
              Seleccionar el profesional de salud mental adecuado es una decisión importante. Aquí hay algunos factores a considerar:
            </p>
            <ul className="space-y-2 list-disc pl-5 mb-6">
              <li><strong>Especialización:</strong> Busca un profesional con experiencia en tu área específica de preocupación.</li>
              <li><strong>Enfoque terapéutico:</strong> Diferentes terapeutas utilizan distintos métodos. Investiga qué enfoque podría funcionar mejor para ti.</li>
              <li><strong>Compatibilidad personal:</strong> La relación terapeuta-paciente es fundamental. Es importante que te sientas cómodo/a con la persona.</li>
              <li><strong>Costo y cobertura:</strong> Verifica si el profesional acepta tu seguro médico o si ofrece tarifas escalonadas.</li>
              <li><strong>Accesibilidad:</strong> Considera la ubicación, horarios y si ofrece consultas online.</li>
            </ul>
            <p className="italic text-sm mb-4">
              Recuerda que es normal cambiar de profesional si sientes que no es el adecuado para ti. Lo más importante es que recibas la ayuda que necesitas.
            </p>
          </div>
          
          <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <h2 className="text-2xl font-semibold mb-4">Diferencias entre profesionales de salud mental</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Psiquiatras</h3>
                <p className="mb-2">
                  Médicos especializados en salud mental que pueden diagnosticar condiciones psiquiátricas y recetar medicamentos.
                </p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Titulación: Licenciatura en Medicina + especialización en Psiquiatría</li>
                  <li>Pueden prescribir medicación</li>
                  <li>Tratan trastornos mentales desde una perspectiva médica</li>
                  <li>Pueden ofrecer o no psicoterapia (dependiendo de su formación)</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Psicólogos Clínicos</h3>
                <p className="mb-2">
                  Profesionales especializados en evaluación psicológica y psicoterapia para diversos trastornos.
                </p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Titulación: Licenciatura/Grado en Psicología + especialización clínica</li>
                  <li>No pueden prescribir medicación (excepto en algunos países/estados)</li>
                  <li>Realizan evaluaciones psicológicas y diagnósticos</li>
                  <li>Ofrecen diferentes tipos de psicoterapia</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Psicoterapeutas</h3>
                <p className="mb-2">
                  Profesionales formados específicamente en técnicas de psicoterapia con diferentes enfoques.
                </p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Pueden tener diversa formación de base (psicología, medicina, trabajo social)</li>
                  <li>Especializados en diferentes modalidades terapéuticas</li>
                  <li>Trabajan con problemas psicológicos, emocionales o relacionales</li>
                  <li>No pueden prescribir medicación (salvo que sean también psiquiatras)</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-medium mb-3 text-blue-500">Otros profesionales</h3>
                <p className="mb-2">
                  Existen otros profesionales que pueden ofrecer apoyo en salud mental:
                </p>
                <ul className="space-y-1 list-disc pl-5">
                  <li><strong>Trabajadores sociales clínicos:</strong> Ayudan a conectar con recursos comunitarios</li>
                  <li><strong>Consejeros:</strong> Ofrecen orientación para desafíos específicos</li>
                  <li><strong>Neuropsicólogos:</strong> Especializados en la relación cerebro-comportamiento</li>
                  <li><strong>Terapeutas ocupacionales:</strong> Ayudan a desarrollar habilidades para la vida diaria</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Link 
              href="/recursos/crisis" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Manejo de Crisis
            </Link>
            
            <Link 
              href="/recursos" 
              className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-200`}
            >
              Volver a Recursos
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfesionalesPage; 