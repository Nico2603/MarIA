import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extiende los tipos por defecto para añadir el 'id'

declare module "next-auth" {
  /**
   * El objeto Session devuelto por `useSession`, `getSession` y recibido 
   * como prop por el `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user?: {
      id: string;
    } & DefaultSession["user"]; // Mantiene name, email, image
  }

  /** El objeto User como se devuelve de un proveedor OAuth o credenciales */
  interface User extends DefaultUser {
    // Puedes añadir otras propiedades si las necesitas directamente del proveedor
    // o en el callback signIn
  }
}

// Si usaras estrategia JWT, también podrías extender JWT aquí:
// declare module "next-auth/jwt" {
//   /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
//   interface JWT extends DefaultJWT {
//     id?: string;
//   }
// } 