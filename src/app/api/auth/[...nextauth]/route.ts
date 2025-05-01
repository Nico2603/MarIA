import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  // Configura el adaptador de Prisma
  // @ts-ignore // Ignora temporalmente posible problema de tipos con Adapter, común en setup inicial
  adapter: PrismaAdapter(prisma),

  // Configura uno o más proveedores de autenticación
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...añade más proveedores aquí si los necesitas
  ],

  // Define la estrategia de sesión (database es común con adaptadores)
  session: {
    strategy: "database", // Puedes usar "jwt" si prefieres, pero "database" funciona bien con PrismaAdapter
  },

  // Secret para firmar JWTs o cookies de sesión (ya lo pusiste en .env)
  secret: process.env.NEXTAUTH_SECRET,

  // Callbacks para personalizar el comportamiento
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   // Aquí podrías crear el 'Profile' asociado al 'User' la primera vez que inicia sesión
    //   const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
    //   if (dbUser && !dbUser.profile) { // Comprueba si el usuario existe pero no tiene perfil
    //      await prisma.profile.create({ data: { userId: dbUser.id } });
    //   }
    //   return true; // Continúa el proceso de inicio de sesión
    // },
    async session({ session, user }) {
      // `user` aquí es el usuario de la base de datos (obtenido por el adaptador)
      if (session.user) {
        // Añade el ID del usuario de la BD a la sesión del cliente
        session.user.id = user.id; 
      }
      return session;
    },
    // async jwt({ token, user }) {
    //   // Si usas estrategia JWT, añade el ID aquí
    //   if (user) {
    //     token.id = user.id;
    //   }
    //   return token;
    // }
  },

  // Puedes añadir páginas personalizadas si quieres sobrescribir las de next-auth
  // pages: {
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error', // Error code passed in query string as ?error=
  //   verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
  //   newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  // }
};

// Exporta los handlers GET y POST
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 