import time
import logging

class MessageThrottler:
    """Clase para reducir el spam de logs de eventos repetitivos."""
    def __init__(self):
        self.last_log_times = {}
        self.event_configs = {
            # Configuraciones específicas para diferentes tipos de eventos
            'system.replica_present': {'throttle_seconds': 30, 'log_every_n': 20},  # Log cada 30s o cada 20 intentos
            'system.heartbeat': {'throttle_seconds': 60, 'log_every_n': 100},  # Log cada 60s o cada 100 heartbeats
            'datachannel_success': {'throttle_seconds': 10, 'log_every_n': 50},  # Menos logs de éxito de DataChannel
            'tts_events': {'throttle_seconds': 2, 'log_every_n': 1},  # TTS events normales
            'conversation_events': {'throttle_seconds': 0, 'log_every_n': 1},  # Eventos importantes siempre
            'default': {'throttle_seconds': 5, 'log_every_n': 10}  # Default para otros eventos
        }
        self.event_counters = {}
    
    def should_log(self, event_key, event_type='default', attempt_number=None):
        """
        Determina si un evento debe loguearse basado en tiempo y frecuencia.
        
        Args:
            event_key: Clave única del evento
            event_type: Tipo de evento para configuración específica
            attempt_number: Número de intento para eventos numerados
        """
        now = time.time()
        config = self.event_configs.get(event_type, self.event_configs['default'])
        
        # Inicializar counters si no existen
        if event_key not in self.event_counters:
            self.event_counters[event_key] = 0
        
        # Incrementar contador
        self.event_counters[event_key] += 1
        
        # Verificar si ha pasado suficiente tiempo
        last_time = self.last_log_times.get(event_key, 0)
        time_passed = now - last_time >= config['throttle_seconds']
        
        # Verificar si es cada N intentos
        count_reached = self.event_counters[event_key] % config['log_every_n'] == 0
        
        # Para eventos numerados, siempre loguear el primer intento
        if attempt_number == 1:
            should_log = True
        else:
            should_log = time_passed or count_reached
        
        if should_log:
            self.last_log_times[event_key] = now
            return True
        return False

    def get_stats(self, event_key):
        """Obtiene estadísticas de un evento específico."""
        return {
            'total_events': self.event_counters.get(event_key, 0),
            'last_log_time': self.last_log_times.get(event_key, 0)
        }

# Instancia global del throttler
message_throttler = MessageThrottler()

# Cargar variables de entorno (si .env file es usado por AppSettings, esto podría ser redundante o necesitar ajuste)
# load_dotenv() # AppSettings ya carga desde .env

# Configuración de Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s') 