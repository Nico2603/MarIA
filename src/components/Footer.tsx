import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Definir listas de enlaces para facilitar la gestión
  const legalLinks = [
    { href: '/legal/aviso-legal', label: 'Aviso Legal' },
    { href: '/legal/privacidad', label: 'Privacidad' },
    { href: '/legal/cookies', label: 'Cookies' },
    { href: '/legal/terminos', label: 'Términos' },
    { href: '/legal/limitaciones', label: 'Limitaciones' },
  ];

  const resourceLinks = [
    { href: '/recursos', label: 'Recursos' },
    { href: '/recursos/ansiedad', label: 'Ansiedad' },
    { href: '/recursos/depresion', label: 'Depresión' },
    { href: '/recursos/tecnicas', label: 'Técnicas' },
    { href: '/recursos/profesionales', label: 'Profesionales' },
    { href: '/recursos/crisis', label: 'Crisis' },
    { href: '/contacto', label: 'Contacto' }, // Añadido enlace a Contacto
  ];

  return (
    <footer className="bg-neutral-800 text-white pt-8 pb-6"> {/* Aumentado padding superior */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6"> {/* Usar grid para organizar */}
          {/* Columna 1: Copyright */}
          <div className="text-sm text-neutral-400">
            &copy; {currentYear} AI Mental Health - Colombia
          </div>
          
          {/* Columna 2: Enlaces Legales */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase mb-3">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Enlaces de Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 uppercase mb-3">Recursos y Ayuda</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Disclaimer y Emergencias (sin cambios) */}
        <div className="mt-6 pt-6 border-t border-neutral-700 text-center text-xs text-neutral-500">
          <p>
            Importante: Este asistente es una herramienta de apoyo basada en IA y no sustituye el consejo, diagnóstico o tratamiento médico o psicológico profesional. 
            Consulta siempre a un profesional de la salud mental calificado para cualquier duda sobre tu bienestar emocional.
          </p>
          <p className="mt-1">
            En caso de emergencia, contacta inmediatamente con la línea de emergencia nacional 123 o la Línea de Salud Mental 106.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 