import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importar desde la nueva ubicación

// Ya no se define authOptions aquí

// Exporta los handlers GET y POST
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 