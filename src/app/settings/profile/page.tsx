'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UserProfile } from '@/types/profile'; // Assuming types/profile.ts exists
import type { ChatSession } from '@prisma/client'; // Import ChatSession type

// Define the structure for the paginated history response
interface PaginatedHistoryResponse {
  sessions: ChatSession[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const ITEMS_PER_PAGE = 5;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [history, setHistory] = useState<PaginatedHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    setError(null);
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Error al obtener el perfil.');
      }
      const data: UserProfile = await response.json();
      setProfile(data);
      setUsername(data.username || session?.user?.name || '');
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido al obtener el perfil.');
      toast.error('Error al cargar el perfil.');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [session]);

  const fetchHistory = useCallback(async (page: number) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const response = await fetch(`/api/chat-sessions/history?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error('Error al obtener el historial.');
      }
      const data: PaginatedHistoryResponse = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido al obtener el historial.');
      toast.error('Error al cargar el historial.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
      fetchHistory(currentPage);
    } else if (status === 'unauthenticated') {
      setIsLoadingProfile(false);
      setIsLoadingHistory(false);
      // Optionally redirect or show login prompt
    }
  }, [status, fetchProfile, fetchHistory, currentPage]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar el perfil.');
      }

      const updatedProfile: UserProfile = await response.json();
      setProfile(updatedProfile);
      setUsername(updatedProfile.username || updatedProfile.user?.name || '');
      toast.success('Perfil actualizado correctamente.');

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : 'Error desconocido al actualizar.');
      toast.error('Error al actualizar el perfil.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (history && currentPage < history.metadata.totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
        <div className="container mx-auto p-4 flex justify-center items-center h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Acceso Denegado</CardTitle>
                    <CardDescription>Por favor, inicia sesión para ver tu perfil.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => import('next-auth/react').then(mod => mod.signIn('google'))} className="w-full">
                        Iniciar Sesión con Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-primary dark:text-primary-foreground">Configuración del Perfil</CardTitle>
            <CardDescription>Actualiza tu información personal.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProfile ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
              </div>
            ) : profile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-border">
                   <Avatar className="h-32 w-32 text-4xl flex-shrink-0">
                     <AvatarImage 
                        src={profile.avatarUrl || session?.user?.image || ''}
                        alt={username || session?.user?.name || 'Usuario'} 
                     />
                     <AvatarFallback>{username ? username.charAt(0).toUpperCase() : session?.user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                   </Avatar>
                   
                   <div className="flex-grow space-y-1 text-center sm:text-left">
                      <h2 className="text-2xl font-semibold">{username || session?.user?.name || 'Usuario'}</h2>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      <p className="text-xs text-muted-foreground pt-2">
                        Tu email e imagen provienen de Google.
                      </p>
                   </div>
                 </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={session?.user?.email || ''} 
                        disabled 
                        className="cursor-not-allowed bg-muted/50 text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <p className="text-sm text-muted-foreground">
                          Tu email está vinculado a tu cuenta de Google y no se puede cambiar aquí.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        placeholder="Tu nombre de usuario visible"
                        disabled={isUpdating}
                      />
                      <p className="text-sm text-muted-foreground">
                        Este nombre se mostrará públicamente.
                      </p>
                    </div>
                </div>

               <div className="pt-4">
                  {error && (
                      <Alert variant="destructive" className="mb-4">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                  </Button>
                </div>

              </form>
            ) : (
               <p>No se pudo cargar el perfil.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="bg-card/80 dark:bg-card/50 backdrop-blur-sm">
            <CardHeader>
               <CardTitle className="text-xl text-primary dark:text-primary-foreground">Historial de Conversaciones</CardTitle>
              <CardDescription>
                Revisa tus sesiones anteriores y sus resúmenes.
                {history?.metadata?.totalItems !== undefined && (
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Total de sesiones completadas: {history.metadata.totalItems}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                  <div className="space-y-2">
                    {[...Array(ITEMS_PER_PAGE)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
              ) : history && history.sessions && history.sessions.length > 0 ? (
                <>
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Inicio</TableHead>
                         <TableHead>Fin</TableHead>
                         <TableHead className="w-[40%]">Resumen</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {history.sessions.map((session: ChatSession) => (
                         <TableRow key={session.id}>
                           <TableCell className="font-mono text-xs">{session.id.substring(0, 8)}...</TableCell>
                           <TableCell>{new Date(session.createdAt).toLocaleString()}</TableCell>
                           <TableCell>{session.endedAt ? new Date(session.endedAt).toLocaleString() : 'En curso'}</TableCell>
                           <TableCell className="text-xs text-muted-foreground">
                             {session.summary 
                               ? session.summary.length > 150 
                                 ? `${session.summary.substring(0, 150)}...` 
                                 : session.summary
                               : <span className="italic">No disponible</span>
                             }
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                    <div className="flex items-center justify-between mt-4">
                       <span className="text-sm text-muted-foreground">
                         Página {history.metadata.currentPage} de {history.metadata.totalPages} (Total: {history.metadata.totalItems} sesiones)
                       </span>
                       <div className="space-x-2">
                        <Button
                           variant="outline"
                           size="sm"
                           onClick={handlePreviousPage}
                           disabled={currentPage <= 1 || isLoadingHistory}
                         >
                           Anterior
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={handleNextPage}
                           disabled={currentPage >= history.metadata.totalPages || isLoadingHistory}
                         >
                           Siguiente
                         </Button>
                       </div>
                     </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No hay historial de conversaciones disponible.</p>
              )}
               {error && !isLoadingHistory && (
                    <Alert variant="destructive" className="mt-4">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Error al cargar historial</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
          </Card>
       </motion.div>
    </div>
  );
} 