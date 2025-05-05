'use client';

import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
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
import { Terminal, Calendar, Clock } from 'lucide-react';
import type { UserProfile } from '@/types/profile';
import type { ChatSession } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

// Define the structure for the paginated history response matching the API
interface PaginatedHistoryResponse {
  data: ChatSession[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const ITEMS_PER_PAGE = 6;

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
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const historyGridRef = useRef<HTMLDivElement>(null);

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
      const response = await fetch(`/api/chat-sessions/history?page=${page}&pageSize=${ITEMS_PER_PAGE}`);
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
    if (history && currentPage < history.pagination.totalPages) {
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
    <div ref={containerRef} className="container mx-auto p-4 md:p-8 space-y-8">
        <div>
           <Card className="bg-gradient-to-br from-card/70 via-card/80 to-card/70 dark:from-card/40 dark:via-card/50 dark:to-card/40 backdrop-blur-lg shadow-sm border border-border/50 rounded-xl overflow-hidden">
             <CardHeader>
               <CardTitle className="text-2xl font-semibold text-primary dark:text-primary-foreground tracking-tight">Configuración del Perfil</CardTitle>
               <CardDescription className="text-muted-foreground/90">Actualiza tu información personal y visualiza tus datos.</CardDescription>
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
                   <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 pb-6 border-b border-border/50">
                     <Avatar className="h-32 w-32 text-4xl flex-shrink-0 ring-2 ring-primary/30 dark:ring-primary/20 p-1">
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
                         <p className="text-sm text-muted-foreground/90">
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
                         <p className="text-sm text-muted-foreground/90">
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
                     <Button type="submit" disabled={isUpdating} className="transition-colors duration-200 ease-in-out">
                       {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                     </Button>
                   </div>

                 </form>
               ) : (
                  <p>No se pudo cargar el perfil.</p>
               )}
             </CardContent>
           </Card>
         </div>

        <div>
          <Card className="bg-gradient-to-br from-card/70 via-card/80 to-card/70 dark:from-card/40 dark:via-card/50 dark:to-card/40 backdrop-blur-lg shadow-sm border border-border/50 rounded-xl overflow-hidden">
             <CardHeader>
               <CardTitle className="text-xl font-semibold text-primary dark:text-primary-foreground tracking-tight">Historial de Conversaciones</CardTitle>
               <CardDescription className="text-muted-foreground/90">
                 Revisa tus sesiones anteriores y sus resúmenes.
                 {history?.pagination?.totalItems !== undefined && (
                   <span className="block mt-1 text-xs text-muted-foreground">
                     Total de sesiones completadas: {history.pagination.totalItems}
                   </span>
                 )}
               </CardDescription>
             </CardHeader>
             <CardContent>
               {isLoadingHistory ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[...Array(ITEMS_PER_PAGE)].map((_, i) =>
                     <Skeleton key={i} className="h-40 w-full rounded-lg bg-muted/50" />
                   )}
                 </div>
               ) : history?.data && history.data.length > 0 ? (
                 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                   <div
                     ref={historyGridRef}
                     className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                   >
                     {history.data.map((session: ChatSession, index: number) => {
                        const sessionNumber = history.pagination.totalItems - ((history.pagination.currentPage - 1) * ITEMS_PER_PAGE + index);
                        return (
                           <DialogTrigger asChild key={session.id} onClick={() => setSelectedSession(session)}>
                               <div
                                   className="bg-background/70 dark:bg-background/50 border border-border/60 rounded-lg p-4 hover:shadow-lg hover:border-primary/70 dark:hover:border-primary/50 transition-all duration-200 ease-in-out cursor-pointer flex flex-col h-full min-h-[160px]"
                               >
                                 <CardTitle className="text-base font-medium mb-2 text-foreground/90">Sesión #{sessionNumber}</CardTitle>
                                 <div className="text-xs text-muted-foreground mb-3 flex items-center space-x-1.5">
                                   <Calendar className="h-3.5 w-3.5" />
                                   <span>{new Date(session.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                 </div>
                                 <CardDescription className="text-sm text-muted-foreground/80 flex-grow line-clamp-3 mb-3">
                                   {session.summary
                                     ? (session.summary.startsWith('Resumen:') ? session.summary.substring(8).trim() : session.summary)
                                     : <span className="italic">Resumen no disponible.</span>
                                   }
                                 </CardDescription>
                                 <p className="text-xs text-primary dark:text-primary/80 mt-3 self-end">Ver detalles</p>
                               </div>
                           </DialogTrigger>
                        );
                     })}
                   </div>

                   {selectedSession && (
                     <DialogContent className="sm:max-w-[600px] bg-card/90 backdrop-blur-sm border border-border/70 rounded-lg">
                       <DialogHeader>
                         <DialogTitle className="text-lg font-semibold">Detalles de la Sesión #{history?.pagination?.totalItems ? (history.pagination.totalItems - history.data.findIndex(s => s.id === selectedSession.id) - ((history.pagination.currentPage - 1) * ITEMS_PER_PAGE)) : ''}</DialogTitle>
                         <DialogDescription className="text-muted-foreground/90">
                           Resumen completo de la conversación.
                         </DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                         <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" /> 
                            <span>Inicio: {new Date(selectedSession.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                         </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Fin: {selectedSession.endedAt ? new Date(selectedSession.endedAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</span>
                          </div>
                          <div className="mt-2 p-3 bg-muted/50 dark:bg-muted/20 rounded-md max-h-[40vh] overflow-y-auto">
                            <h4 className="font-semibold mb-2 text-foreground/95">Resumen Completo:</h4>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                 {selectedSession.summary
                                   ? (selectedSession.summary.startsWith('Resumen:') ? selectedSession.summary.substring(8).trim() : selectedSession.summary)
                                   : <span className="italic">No disponible</span>
                                 }
                            </p>
                          </div>
                       </div>
                       <DialogFooter>
                          <DialogClose asChild>
                             <Button type="button" variant="secondary">
                               Cerrar
                             </Button>
                          </DialogClose>
                       </DialogFooter>
                     </DialogContent>
                   )}
                   
                   {history.pagination && history.pagination.totalPages > 1 && (
                     <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                       <span className="text-sm text-muted-foreground">
                         Página {history.pagination.currentPage} de {history.pagination.totalPages} (Total: {history.pagination.totalItems} sesiones)
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
                           disabled={currentPage >= history.pagination.totalPages || isLoadingHistory}
                         >
                           Siguiente
                         </Button>
                       </div>
                     </div>
                   )}
                 </Dialog>
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
        </div>

        {/* Decorative Element */}
                <div className="h-2 w-full bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 dark:from-primary/20 dark:via-secondary/20 dark:to-primary/20 rounded" style={{ backgroundSize: "200% 100%" }}/>
    </div>
  );
} 