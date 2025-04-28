import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Listas de enlaces actualizadas y enfocadas en Ansiedad
  const legalLinks = [
    { href: '/legal/aviso-legal', label: 'Aviso Legal' },
    { href: '/legal/privacidad', label: 'Privacidad' },
    { href: '/legal/cookies', label: 'Cookies' },
    { href: '/legal/terminos', label: 'Términos' },
    { href: '/legal/limitaciones', label: 'Limitaciones' },
  ];

  // Enlaces de la aplicación (combinados y reestructurados)
  const appLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/chat', label: 'Hablar con María' },
    { href: '/consejos', label: 'Consejos para Ansiedad' },
    { href: '/contacto', label: 'Contacto' },
    // { href: '/dashboard', label: 'Dashboard' }, // Descomentar si se usa dashboard
  ];

  // Enlaces específicos de recursos sobre ansiedad
  const resourceLinks = [
    { href: '/recursos', label: 'Centro de Recursos' },
    { href: '/recursos/ansiedad', label: 'Sobre la Ansiedad' },
    { href: '/recursos/tecnicas', label: 'Técnicas de Manejo' },
    { href: '/recursos/profesionales', label: 'Ayuda Profesional' },
    { href: '/recursos/crisis', label: 'Líneas de Crisis' },
  ];

  return (
    <footer className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 pt-12 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Grid ajustado a 4 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Logo y Copyright */}
          <div className="lg:col-span-1 pr-4">
            {/* Logo */}
            <div className="mb-4">
              <Link href="/" className="inline-flex items-center">
                  {/* Ajustar color del logo según el tema */}
                  <span className="text-neutral-900 dark:text-white text-2xl font-semibold transition-colors duration-300">Mar</span>
                  <span className="text-blue-600 dark:text-blue-500 text-2xl font-semibold transition-colors duration-300">IA</span>
              </Link>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              &copy; {currentYear} AI Mental Health Colombia.
              <br/>Todos los derechos reservados.
            </p>
          </div>

          {/* Columna 2: Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Recursos Ansiedad</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto (Nueva) */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li>Calle Falsa 123, Bogotá</li>
              <li>Ciudad, País</li>
              <li><a href="tel:+5712345678" className="hover:text-neutral-900 dark:hover:text-white transition-colors">+57 123 456 78</a></li>
              <li><a href="mailto:info@maria-ai.com" className="hover:text-neutral-900 dark:hover:text-white transition-colors">info@maria-ai.com</a></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer y Emergencias */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700 text-center text-xs text-neutral-600 dark:text-neutral-500 transition-colors duration-300">
          <p className="mb-2">
            <strong>Importante:</strong> María es una IA de apoyo y no reemplaza la consulta profesional. Su objetivo es ofrecer información y técnicas generales para el manejo de la <strong>ansiedad</strong>.
          </p>
          <p className="mb-2">
            No utilices este servicio para diagnóstico médico o psicológico. Consulta siempre a un profesional de la salud mental calificado.
          </p>
          <p>
            <strong>En caso de emergencia:</strong> Contacta a la línea nacional 123 o la Línea de Salud Mental 106.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 