# Configuración SaaS Multi-Usuario para MarIA

Este documento describe las mejoras implementadas para hacer MarIA completamente compatible con un modelo SaaS multi-usuario.

## ✅ **Características SaaS Implementadas**

### 1. **Separación completa de datos por usuario**
- ✅ Base de datos con aislamiento por `userId`
- ✅ Sesiones de chat aisladas por usuario
- ✅ Mensajes vinculados a sesiones específicas
- ✅ Perfiles individuales por usuario

### 2. **Rate Limiting inteligente**
- ✅ Límites por usuario (no globales)
- ✅ Rate limiting en APIs web
- ✅ Rate limiting en agente LiveKit
- ✅ Diferentes límites por tipo de operación

### 3. **Gestión de recursos por usuario**
- ✅ Control de sesiones concurrentes por usuario
- ✅ Límites de mensajes diarios
- ✅ Limpieza automática de sesiones inactivas
- ✅ Bloqueo/desbloqueo de usuarios

### 4. **Monitoreo y métricas**
- ✅ Estadísticas por usuario
- ✅ Métricas del sistema
- ✅ API de administración
- ✅ Logging detallado por usuario

## 🔧 **Configuración necesaria**

### Variables de entorno para SaaS
Agregar al archivo `.env` tanto del proyecto MarIA como LiveKit_Agent_MarIA:

```env
# --- Configuración SaaS Multi-Usuario ---

# Rate limiting por usuario
MAX_CONCURRENT_SESSIONS_PER_USER=5
MAX_DAILY_MESSAGES_PER_USER=1000

# Configuración de recursos
MAX_SESSION_DURATION_MINUTES=60
CLEANUP_INACTIVE_SESSIONS_MINUTES=30

# Métricas y monitoreo
ENABLE_USER_METRICS=true
USER_ACTIVITY_LOG_LEVEL=INFO
```

### Límites de Rate Limiting por API

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/messages` | 100 requests | 1 minuto |
| `/api/sessions` | 10 requests | 1 minuto |
| `/api/livekit-token` | 20 requests | 1 minuto |
| `/api/profile` | 30 requests | 1 minuto |
| `/api/admin` | 50 requests | 1 minuto |
| `/api/summarize` | 20 requests | 1 minuto |

## 📊 **APIs de Administración**

### Obtener estadísticas del sistema
```bash
GET /api/admin/user-stats
Authorization: Bearer <token>
```

### Obtener estadísticas de usuario específico
```bash
GET /api/admin/user-stats?userId=<user_id>
Authorization: Bearer <token>
```

## 🏗️ **Arquitectura SaaS**

### Componentes principales:

1. **UserSessionManager** (`LiveKit_Agent_MarIA/user_session_manager.py`)
   - Gestiona sesiones de usuario
   - Controla cuotas y límites
   - Limpieza automática

2. **Middleware de Rate Limiting** (`src/middleware.ts`)
   - Rate limiting por usuario en APIs
   - Headers informativos
   - Manejo de errores 429

3. **APIs de Administración** (`src/app/api/admin/`)
   - Estadísticas y métricas
   - Gestión de usuarios
   - Monitoreo del sistema

4. **Configuración Extendida** (`LiveKit_Agent_MarIA/config.py`)
   - Variables específicas para SaaS
   - Límites configurables
   - Configuración por entorno

## 🚀 **Funcionalidades por Usuario**

### Límites por usuario:
- **Sesiones concurrentes**: 5 por defecto
- **Mensajes diarios**: 1,000 por defecto
- **Duración máxima de sesión**: 60 minutos
- **Limpieza de sesiones inactivas**: 30 minutos

### Métricas disponibles:
- Número de sesiones activas
- Mensajes enviados hoy
- Tiempo total de uso
- Estado de bloqueo/desbloqueo

## 🔒 **Seguridad y Aislamiento**

### Características de seguridad:
1. **Autenticación obligatoria**: Todas las APIs requieren token JWT
2. **Verificación de ownership**: Los usuarios solo pueden acceder a sus datos
3. **Rate limiting per-user**: Evita abuso individual
4. **Bloqueo automático**: Usuarios que excedan límites pueden ser bloqueados
5. **Logs auditables**: Todas las acciones quedan registradas

### Aislamiento de datos:
- ✅ Base de datos: Separación por `userId`
- ✅ LiveKit: Tokens con metadata de usuario
- ✅ Sesiones: Completamente aisladas
- ✅ Rate limiting: Por usuario, no global

## 📈 **Escalabilidad**

### Para mayor escala, considerar:

1. **Redis para rate limiting**
   ```typescript
   // Reemplazar Map en-memoria con Redis
   const redis = new Redis(process.env.REDIS_URL);
   ```

2. **Base de datos distribuida**
   - Sharding por userId
   - Read replicas para consultas

3. **Queue system para mensajes**
   - Bull/Bee Queue para procesar mensajes
   - Separación de workers por carga

4. **Monitoring avanzado**
   - Grafana + Prometheus
   - Alertas por límites excedidos

## 🧪 **Testing SaaS**

### Tests recomendados:

1. **Rate Limiting**
   ```bash
   # Test rate limiting por usuario
   for i in {1..101}; do curl -H "Authorization: Bearer $TOKEN" /api/messages; done
   ```

2. **Aislamiento de datos**
   ```bash
   # Verificar que usuario A no puede acceder a datos de usuario B
   curl -H "Authorization: Bearer $TOKEN_USER_A" /api/sessions?userId=USER_B
   ```

3. **Límites de sesiones concurrentes**
   ```bash
   # Abrir múltiples conexiones LiveKit con el mismo usuario
   ```

## 📋 **Checklist de Despliegue SaaS**

- [ ] Variables de entorno configuradas
- [ ] Base de datos con índices apropiados
- [ ] Rate limiting habilitado
- [ ] Monitoring configurado
- [ ] Logs centralizados
- [ ] Backup de base de datos programado
- [ ] Alertas de límites configuradas
- [ ] Tests de carga realizados
- [ ] Documentación actualizada
- [ ] Términos de servicio actualizados

## ⚠️ **Consideraciones Adicionales**

### Para producción:
1. **Compliance**: GDPR, CCPA si aplica
2. **Backup y Recovery**: Estrategia de backup automático
3. **Monitoring**: Alertas proactivas
4. **Scaling**: Auto-scaling basado en métricas
5. **Support**: Sistema de tickets para usuarios

### Límites recomendados por tier:
| Tier | Sesiones Concurrentes | Mensajes/Día | Duración/Sesión |
|------|----------------------|--------------|-----------------|
| Free | 2 | 100 | 15 min |
| Basic | 5 | 1,000 | 60 min |
| Pro | 10 | 5,000 | 120 min |
| Enterprise | 50 | 50,000 | Sin límite |

---

**✅ Con estas mejoras, MarIA está completamente configurada para operar como un SaaS multi-usuario robusto y escalable.** 