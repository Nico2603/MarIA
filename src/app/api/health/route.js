export async function GET() {
  try {
    // Verificar que las variables de entorno críticas estén presentes
    const criticalEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
    const missingVars = criticalEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: `Missing environment variables: ${missingVars.join(', ')}`,
          timestamp: new Date().toISOString()
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 