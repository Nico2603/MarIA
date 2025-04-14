// Script de análisis - cargado de forma diferida
// Este archivo simula la carga de un script de analytics que no es crítico para el renderizado inicial

(function() {
  console.log('Analytics cargado después de la interacción del usuario');
  
  // Función para registrar eventos
  window.trackEvent = function(category, action, label) {
    console.log('Evento registrado:', category, action, label);
    // Aquí iría la lógica real de analytics
  };
  
  // Registrar tiempo en página
  let startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    let timeOnPage = (Date.now() - startTime) / 1000;
    console.log('Tiempo en página:', timeOnPage.toFixed(2) + 's');
  });
})(); 