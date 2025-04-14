// Archivo JavaScript principal
// Este archivo contiene funcionalidades no críticas que se cargan de forma diferida

// Funciones para mejorar la experiencia de usuario después de la carga inicial
document.addEventListener('DOMContentLoaded', function() {
  console.log('main.js cargado correctamente');
  
  // Establecer bandera para que el monitor de optimización pueda detectarlo
  window._mainJsLoaded = true;
}); 