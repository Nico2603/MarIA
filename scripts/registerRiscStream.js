import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// --- Configuración ---
// Asegúrate de que esta ruta sea correcta y el archivo exista.
// Idealmente, la ruta al archivo de claves se pasaría como un argumento de línea de comandos
// o se leería de una variable de entorno para mayor seguridad.
const KEY_FILE_NAME = 'gen-lang-client-0670046560-c3396247785f.json'; // ACTUALIZADO
const KEY_FILE_PATH = path.resolve(process.cwd(), KEY_FILE_NAME); // Asume que está en la raíz del proyecto

const YOUR_RECEIVER_ENDPOINT_URL = 'https://mentalia.digital/api/risc/webhook';

const RISC_API_SCOPE = 'https://www.googleapis.com/auth/risc.configuration';
const RISC_STREAM_BASE_URL = 'https://risc.googleapis.com/v1beta/stream'; // Corregido: stream en singular

const EVENTS_REQUESTED = [
  "https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked",
  "https://schemas.openid.net/secevent/risc/event-type/account-disabled",
  "https://schemas.openid.net/secevent/risc/event-type/sessions-revoked",
  "https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required",
  // Considera si necesitas más eventos como:
  // "https://schemas.openid.net/secevent/risc/event-type/account-purged",
  // "https://schemas.openid.net/secevent/risc/event-type/account-enabled"
];
// --- Fin Configuración ---

async function registerAndEnableRiscStream() {
  console.log(`Intentando registrar el stream de RISC para el endpoint: ${YOUR_RECEIVER_ENDPOINT_URL}`);
  console.log(`Usando archivo de claves: ${KEY_FILE_PATH}`);

  if (!fs.existsSync(KEY_FILE_PATH)) {
    console.error(`Error: El archivo de claves de la cuenta de servicio NO SE ENCUENTRA en ${KEY_FILE_PATH}`);
    console.error('Por favor, descarga el archivo JSON de la clave de tu cuenta de servicio desde Google Cloud Console,',
                  'colócalo en la raíz de tu proyecto y actualiza la variable KEY_FILE_NAME en este script.');
    process.exit(1);
  }

  try {
    console.log('Autenticando cuenta de servicio...');
    const auth = new GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: [RISC_API_SCOPE],
    });

    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken())?.token;

    if (!accessToken) {
        throw new Error('No se pudo obtener el token de acceso de la cuenta de servicio.');
    }
    console.log('Token de acceso obtenido.');

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    console.log('Configurando (PUT) el stream de RISC...');
    const streamConfigPayload = {
      delivery: {
        delivery_method: 'https://schemas.openid.net/secevent/risc/delivery-method/http-post',
        url: YOUR_RECEIVER_ENDPOINT_URL,
      },
      events_requested: EVENTS_REQUESTED,
      // status: "enabled", // También se puede poner aquí, pero la documentación sugiere un POST separado para habilitar/deshabilitar
    };

    // Usamos PUT para crear o reemplazar la configuración del stream
    // La URL para PUT/GET/DELETE de la configuración del stream es la URL base del stream.
    const configResponse = await axios.put(RISC_STREAM_BASE_URL, streamConfigPayload, { headers });
    console.log('Respuesta de configuración del stream (PUT):', configResponse.data);

    console.log('Habilitando (POST) el stream de RISC...');
    const enableStreamPayload = {
      status: 'enabled',
      // No necesitas el delivery ni events_requested aquí, solo el status.
    };

    // Para actualizar el estado (habilitar/deshabilitar), se usa POST a /stream:update
    const RISC_STREAM_UPDATE_STATUS_URL = `${RISC_STREAM_BASE_URL}:update`;
    const enableResponse = await axios.post(RISC_STREAM_UPDATE_STATUS_URL, enableStreamPayload, { headers });
    console.log('Respuesta de habilitación del stream (POST):', enableResponse.data);

    console.log('\n¡Configuración y habilitación del stream de RISC completadas exitosamente!');
    console.log(`Google ahora debería enviar eventos a: ${YOUR_RECEIVER_ENDPOINT_URL}`);
    console.log('Puedes verificar el estado del stream usando GET en', RISC_STREAM_BASE_URL, '(requiere autenticación)');

  } catch (error) {
    console.error('\nError durante el registro o habilitación del stream de RISC:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request (no se recibió respuesta):', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

registerAndEnableRiscStream(); 