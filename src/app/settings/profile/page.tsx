'use client';

import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, Clock, User, Mail, BadgeCheck, MessageSquareHeart } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import type { Profile, ChatSession } from '@prisma/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FeedbackPaymentModal } from '@/components/ui/FeedbackPaymentModal';
import { useSearchParams } from 'next/navigation';
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

// Registrar plugins de GSAP
gsap.registerPlugin(ScrollTrigger);

// Constantes
const API_PROFILE_URL = '/api/profile';
const API_HISTORY_URL = '/api/chat-sessions/history';
const ITEMS_PER_PAGE = 6;

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

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [usernameForm, setUsernameForm] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { data: profile, isLoading: isLoadingProfile, error: profileError, refetch: refetchProfile } = useQuery<Profile, Error>({
    queryKey: ['profile', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) throw new Error('Usuario no autenticado'); // Asegurar que la sesión exista
      const response = await fetch(API_PROFILE_URL);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al obtener el perfil.');
      }
      return response.json();
    },
    enabled: authStatus === 'authenticated',
  });

  // Detectar si viene del chat y mostrar modal de feedback
  useEffect(() => {
    const fromChat = searchParams?.get('fromChat');
    const showFeedback = searchParams?.get('showFeedback');
    
    if (fromChat === 'true' && showFeedback === 'true') {
      console.log('[ProfilePage] Detectado que viene del chat, mostrando modal de feedback');
      // Pequeño delay para que la página se cargue antes de mostrar el modal
      setTimeout(() => {
        setShowFeedbackModal(true);
      }, 1000);
    }
  }, [searchParams]);

  // Efecto para manejar el éxito o error de la carga del perfil
  useEffect(() => {
    if (profile) {
      setUsernameForm(profile.username || session?.user?.name || '');
    }
  }, [profile, session]);

  useEffect(() => {
    if (profileError) {
      toast.error(profileError.message || 'Error al cargar el perfil.');
    }
  }, [profileError]);

  const [history, setHistory] = useState<PaginatedHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyApiError, setHistoryApiError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const historyCardRef = useRef<HTMLDivElement>(null);
  const historyGridRef = useRef<HTMLDivElement>(null);
  const historyItemsRefs = useRef<Array<HTMLDivElement | null>>([]);
  const decorativeElementRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async (page: number) => {
    setIsLoadingHistory(true);
    setHistoryApiError(null);
    try {
      const response = await fetch(`${API_HISTORY_URL}?page=${page}&pageSize=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error('Error al obtener el historial.');
      }
      const data: PaginatedHistoryResponse = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistoryApiError(err instanceof Error ? err.message : 'Error desconocido al obtener el historial.');
      toast.error('Error al cargar el historial.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      // fetchProfile ya es manejado por useQuery
      fetchHistory(currentPage);
    } else if (authStatus === 'unauthenticated') {
      // setIsLoadingProfile ya es manejado por useQuery
      setIsLoadingHistory(false);
    }
  }, [authStatus, fetchHistory, currentPage]);

  // Preparar el array de refs cuando el historial cambia
  useEffect(() => {
    if (history?.data) {
      // Reiniciar el array de refs con la longitud adecuada
      historyItemsRefs.current = Array(history.data.length).fill(null);
    }
  }, [history]);

  // Efecto para animaciones con GSAP
  useEffect(() => {
    // Iniciar animaciones solo cuando el contenido está cargado
    if (!isLoadingProfile && !isLoadingHistory && profile) {
      const ctx = gsap.context(() => {
        // Animación para el contenedor principal con un efecto sutil
        if (containerRef.current) {
          gsap.fromTo(containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
          );
        }

        // Animación para la tarjeta de perfil
        if (profileCardRef.current) {
          gsap.fromTo(profileCardRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: 0.2 }
          );
        }

        // Animación para el avatar
        if (avatarRef.current) {
          gsap.fromTo(avatarRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)", delay: 0.5 } // Slightly more bounce
          );
        }

        // Animación para la tarjeta de historial con scroll trigger
        if (historyCardRef.current) {
          gsap.fromTo(historyCardRef.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              delay: 0.4,
              scrollTrigger: {
                trigger: historyCardRef.current,
                start: "top 90%", // Trigger slightly later
                toggleActions: "play none none none"
              }
            }
          );
        }

        // Animación para las tarjetas de historial individual
        const historyItems = historyItemsRefs.current.filter(item => item !== null);
        if (historyItems.length > 0) {
          gsap.fromTo(historyItems,
            { opacity: 0, y: 25, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.12, // Slightly increased stagger
              ease: "power2.out",
              delay: 0.6, // Adjusted delay to account for card animation
              scrollTrigger: {
                trigger: historyGridRef.current,
                start: "top 90%", // Match history card trigger
                toggleActions: "play none none none"
              }
            }
          );
        }

        // Animación para elemento decorativo
        if (decorativeElementRef.current) {
          gsap.to(decorativeElementRef.current, {
            backgroundPosition: "200% 0%", // Faster movement
            duration: 12, // Faster duration
            ease: "none",
            repeat: -1,
            yoyo: true
          });
        }
      });

      // Limpiar contexto al desmontar
      return () => ctx.revert();
    }
  }, [isLoadingProfile, isLoadingHistory, history, profile]);

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation<Profile, Error, { username: string }>({
    mutationFn: async (newProfileData) => {
      const response = await fetch(API_PROFILE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfileData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al actualizar el perfil.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', session?.user?.email] });
      toast.success('Perfil actualizado correctamente.');
      if (profileCardRef.current) {
        gsap.fromTo(profileCardRef.current,
          { scale: 1 },
          { scale: 1.01, duration: 0.15, ease: "power1.out", yoyo: true, repeat: 1 }
        );
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Error al actualizar el perfil.');
    },
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    updateProfile({ username: usernameForm });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      // Consider scroll to top of history section if needed
      // historyCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (history && currentPage < history.pagination.totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      // Consider scroll to top of history section if needed
      // historyCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Funciones de Renderizado --- 

  const renderSkeletonState = () => (
    <div className="container mx-auto p-4 md:p-8 space-y-10">
      <Skeleton className="h-10 w-1/3 mb-6 bg-muted/40" />
      <Skeleton className="h-[400px] w-full rounded-xl bg-muted/40" />
      <Skeleton className="h-6 w-1/4 mb-4 mt-10 bg-muted/40" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {[...Array(ITEMS_PER_PAGE)].map((_, i) =>
           <Skeleton key={i} className="h-52 w-full rounded-lg bg-muted/30" />
         )}
       </div>
    </div>
  );

  const renderUnauthenticatedState = () => (
     <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
          <Card className="w-full max-w-md shadow-xl border border-border/30 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                  <CardTitle className="text-xl text-primary font-semibold">Acceso Denegado</CardTitle>
                  <CardDescription className="text-muted-foreground">Por favor, inicia sesión para ver tu perfil.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={() => import('next-auth/react').then(mod => mod.signIn('google'))} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md">
                      Iniciar Sesión con Google
                  </Button>
              </CardContent>
          </Card>
      </div>
  );

  const renderProfileCardContent = () => (
    isLoadingProfile ? (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <Skeleton className="h-36 w-36 rounded-full bg-muted/50" />
          <div className="space-y-3 flex-grow">
            <Skeleton className="h-7 w-3/4 bg-muted/50" />
            <Skeleton className="h-5 w-full bg-muted/40" />
            <Skeleton className="h-4 w-2/3 bg-muted/40" />
          </div>
        </div>
        <Skeleton className="h-10 w-full bg-muted/40" />
        <Skeleton className="h-10 w-full bg-muted/40" />
        <Skeleton className="h-10 w-28 bg-muted/40" />
      </div>
    ) : profileError ? (
      <Alert variant="destructive" className="my-5 w-full">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error al Cargar Perfil</AlertTitle>
        <AlertDescription>
          {profileError.message || "No se pudo cargar la información del perfil."}
          <Button onClick={() => refetchProfile()} variant="outline" size="sm" className="ml-4">Reintentar</Button>
        </AlertDescription>
      </Alert>
    ) : profile ? (
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pb-8 border-b border-border/20">
          <div ref={avatarRef} className="relative group">
            <Avatar className="h-36 w-36 text-5xl flex-shrink-0 ring-4 ring-primary/30 dark:ring-primary/25 p-1.5 shadow-xl group-hover:ring-primary/50 transition-all duration-300">
              <AvatarImage
                 src={profile.avatarUrl || session?.user?.image || ''}
                 alt={profile.username || session?.user?.name || 'Usuario'}
                 className="object-cover rounded-full"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/90 to-secondary/70 text-primary-foreground">{profile.username ? profile.username.charAt(0).toUpperCase() : session?.user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {/* Potential Upload Button Overlay - Example */}
            {/* <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <Camera className="h-8 w-8 text-white" />
            </div> */}
          </div>

          <div className="flex-grow space-y-1.5 text-center sm:text-left">
             <h2 className="text-3xl font-bold tracking-tight">{profile.username || session?.user?.name || 'Usuario'}</h2>
             <p className="text-base text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
               <Mail className="h-4 w-4 text-primary/80"/> {session?.user?.email}
             </p>
             <p className="text-xs text-muted-foreground/80 pt-2 flex items-center justify-center sm:justify-start gap-1.5">
               <BadgeCheck className="h-3.5 w-3.5 text-green-500"/> Identidad verificada a través de Google.
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="cursor-not-allowed bg-muted/60 border-border/30 text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
              />
              <p className="text-xs text-muted-foreground/80">
                  Tu email está vinculado a tu cuenta de Google y no puede modificarse aquí.
              </p>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/90">Nombre de usuario</Label>
              <Input
                id="username"
                value={usernameForm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsernameForm(e.target.value)}
                placeholder="Elige un nombre visible"
                disabled={isUpdatingProfile}
                className="border-border/40 focus-visible:ring-primary/40 focus-visible:border-primary/60 transition-colors duration-200 placeholder:text-muted-foreground/70"
                aria-describedby="username-description"
              />
              <p id="username-description" className="text-xs text-muted-foreground/80">
                Este será tu nombre visible en la plataforma.
              </p>
            </div>
        </div>

       <div className="pt-5 flex flex-col items-start">
          <Button
            type="submit"
            disabled={isUpdatingProfile}
            className="transition-all duration-300 ease-in-out bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-primary/30 px-6 py-2.5 font-semibold text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
            aria-live="polite"
          >
            {isUpdatingProfile ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </div>

      </form>
    ) : (
       <p className="text-center text-muted-foreground py-10">No se pudo cargar la información del perfil. Intenta recargar la página.</p>
    )
  );

  const renderHistorySection = () => (
    <Card
      ref={historyCardRef}
      className="bg-gradient-to-br from-card via-card/95 to-primary/10 dark:from-card dark:via-card/95 dark:to-primary/20 backdrop-blur-md shadow-lg border border-border/30 rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl"
    >
      <CardHeader className="pb-5 border-b border-border/20 bg-gradient-to-r from-transparent to-secondary/5 dark:to-secondary/10 px-6 md:px-8">
        <CardTitle className="text-2xl font-bold text-secondary dark:text-secondary-foreground tracking-tight flex items-center gap-2.5">
           <MessageSquareHeart className="h-5 w-5 stroke-[2.5px]" /> Historial de Conversaciones
        </CardTitle>
        <CardDescription className="text-muted-foreground/90 mt-1">
          Explora tus sesiones anteriores y accede a sus resúmenes.
          {history?.pagination?.totalItems !== undefined && (
            <span className="block mt-1.5 text-xs font-medium text-muted-foreground">
              Total de sesiones: {history.pagination.totalItems}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-6 md:px-8 pb-8">
        {isLoadingHistory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) =>
              <Skeleton key={i} className="h-56 w-full rounded-xl bg-muted/40" />
            )}
          </div>
        ) : historyApiError ? (
          <Alert variant="destructive" className="my-5 w-full">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error al Cargar Historial</AlertTitle>
            <AlertDescription>
              {historyApiError}
              <Button onClick={() => fetchHistory(currentPage)} variant="outline" size="sm" className="ml-4">Reintentar</Button>
            </AlertDescription>
          </Alert>
        ) : history?.data && history.data.length > 0 ? (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <div
              ref={historyGridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {history.data.map((session: ChatSession, index: number) => {
                 const sessionNumber = history.pagination.totalItems - ((history.pagination.currentPage - 1) * ITEMS_PER_PAGE + index);

                 return (
                    <DialogTrigger asChild key={session.id} onClick={() => setSelectedSession(session)}>
                        <div
                            ref={(el) => { historyItemsRefs.current[index] = el; }}
                            className="bg-background/70 dark:bg-background/50 border border-border/40 shadow-md rounded-xl p-5 hover:shadow-xl hover:border-primary/70 dark:hover:border-primary/50 hover:scale-[1.03] transition-all duration-300 ease-in-out cursor-pointer flex flex-col h-full min-h-[220px] relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/10 dark:to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                          <CardTitle className="text-base font-semibold mb-3 text-foreground flex items-center gap-2 z-10">
                            <span className="h-7 w-7 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center text-xs font-bold text-primary dark:text-primary-foreground shrink-0">
                              {sessionNumber}
                            </span>
                            Sesión <span className="font-mono">#{sessionNumber}</span>
                          </CardTitle>

                          <div className="text-xs text-muted-foreground mb-4 flex items-center space-x-1.5 bg-muted/40 dark:bg-muted/30 py-1 px-2.5 rounded-md w-fit z-10">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(session.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>

                          <CardDescription className="text-sm text-muted-foreground flex-grow line-clamp-5 mb-4 leading-relaxed z-10">
                            {session.summary
                              ? (session.summary.startsWith('Resumen:') ? session.summary.substring(8).trim() : session.summary)
                              : <span className="italic text-muted-foreground/70">Resumen no disponible.</span>
                            }
                          </CardDescription>

                          <div className="pt-3 mt-auto border-t border-border/30 z-10">
                            <p className="text-xs text-primary dark:text-primary font-semibold flex items-center justify-end gap-1.5 group-hover:gap-2.5 transition-all duration-300">
                              Ver detalles
                              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 transform group-hover:translate-x-1" />
                            </p>
                          </div>
                        </div>
                    </DialogTrigger>
                 );
              })}
            </div>

            {selectedSession && (
              <DialogContent className="sm:max-w-[650px] bg-card border border-border/50 rounded-xl shadow-2xl z-[60] p-0">
                <DialogHeader className="p-6 pb-4 border-b border-border/20">
                  <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                      <MessageSquareHeart className="h-5 w-5 stroke-2"/>
                      Detalles de la Sesión <span className="font-mono">#{history?.pagination?.totalItems ? (history.pagination.totalItems - history.data.findIndex(s => s.id === selectedSession.id) - ((history.pagination.currentPage - 1) * ITEMS_PER_PAGE)) : ''}</span>
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground/90 pt-1">
                    Resumen completo y detalles de la conversación.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-muted/40 dark:bg-muted/30 p-4 rounded-lg border border-border/20">
                    <div className="flex items-center space-x-2.5 text-sm text-muted-foreground">
                       <Calendar className="h-4 w-4 text-primary/80" />
                       <span className="font-medium text-foreground/90">Inicio:</span>
                       <span>{new Date(selectedSession.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                     <div className="flex items-center space-x-2.5 text-sm text-muted-foreground">
                       <Clock className="h-4 w-4 text-primary/80" />
                       <span className="font-medium text-foreground/90">Fin:</span>
                       <span>{selectedSession.endedAt ? new Date(selectedSession.endedAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : <span className="italic">En curso</span>}</span>
                     </div>
                  </div>
                   <div className="mt-1 p-4 bg-background/50 dark:bg-background/30 rounded-lg max-h-[40vh] overflow-y-auto border border-border/30 shadow-inner">
                     <h4 className="font-semibold text-base mb-3 text-foreground/95 border-b border-border/20 pb-2">Resumen Completo:</h4>
                     <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {selectedSession.summary
                            ? (selectedSession.summary.startsWith('Resumen:') ? selectedSession.summary.substring(8).trim() : selectedSession.summary)
                            : <span className="italic text-muted-foreground/70">Resumen no disponible para esta sesión.</span>
                          }
                     </p>
                   </div>
                </div>
                <DialogFooter className="p-6 pt-4 border-t border-border/20 bg-muted/20 dark:bg-muted/10 rounded-b-xl">
                   <DialogClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="transition-all duration-200 hover:bg-muted/50 dark:hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      >
                        Cerrar
                      </Button>
                   </DialogClose>
                </DialogFooter>
              </DialogContent>
            )}

            {history.pagination && history.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-6 border-t border-border/20">
                <span className="text-sm text-muted-foreground mb-4 sm:mb-0">
                  Página <span className="font-semibold text-foreground">{history.pagination.currentPage}</span> de <span className="font-semibold text-foreground">{history.pagination.totalPages}</span> (Total: <span className="font-semibold text-foreground">{history.pagination.totalItems}</span> sesiones)
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1 || isLoadingHistory}
                    className="border-border/40 hover:bg-primary/5 hover:border-primary/40 transition-colors duration-200"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= history.pagination.totalPages || isLoadingHistory}
                    className="border-border/40 hover:bg-primary/5 hover:border-primary/40 transition-colors duration-200"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </Dialog>
        ) : (
          <p className="text-center text-muted-foreground py-12 italic">No se encontró historial de conversaciones.</p>
        )}
      </CardContent>
    </Card>
  );

  // --- Renderizado Principal ---

  // Handlers para el modal de feedback
  const handleCloseFeedbackModal = useCallback(() => {
    console.log('[ProfilePage] ❌ Modal de feedback cerrado sin completar');
    setShowFeedbackModal(false);
  }, []);

  const handleCompleteFeedbackModal = useCallback((phoneNumber?: string) => {
    console.log('[ProfilePage] ✅ Modal de feedback completado', phoneNumber ? 'con número' : 'sin número');
    setShowFeedbackModal(false);
    
    if (phoneNumber) {
      toast.success('¡Gracias! Tu número ha sido guardado.');
    }
  }, []);

  if (authStatus === 'loading') {
    return renderSkeletonState();
  }

  if (!session) {
    return renderUnauthenticatedState();
  }

  return (
    <div ref={containerRef} className="container mx-auto p-4 md:p-8 space-y-12">
        {/* Sección de Perfil */}
        <div>
           <Card
             ref={profileCardRef}
             className="bg-gradient-to-br from-card via-card/95 to-secondary/10 dark:from-card dark:via-card/95 dark:to-secondary/20 backdrop-blur-md shadow-lg border border-border/30 rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl"
           >
             <CardHeader className="pb-5 border-b border-border/20 bg-gradient-to-r from-transparent to-primary/5 dark:to-primary/10 px-6 md:px-8">
               <CardTitle className="text-2xl font-bold text-primary dark:text-primary-foreground tracking-tight flex items-center gap-2.5">
                  <User className="h-5 w-5 stroke-[2.5px]" /> Perfil de Usuario
               </CardTitle>
               <CardDescription className="text-muted-foreground/90 mt-1">Administra tu información personal y de cuenta.</CardDescription>
             </CardHeader>
             <CardContent className="pt-6 px-6 md:px-8">
                {renderProfileCardContent()} 
             </CardContent>
           </Card>
         </div>

        {/* Sección de Historial */}
        <div>
          {renderHistorySection()}
        </div>

        {/* Elemento decorativo con animación */}
        <div
          ref={decorativeElementRef}
          className="h-1.5 w-full bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 dark:from-primary/40 dark:via-secondary/40 dark:to-primary/40 rounded-full opacity-70"
          style={{ backgroundSize: "400% 100%" }}
        />

        {/* Modal de feedback y pago */}
        <FeedbackPaymentModal
          isOpen={showFeedbackModal}
          onClose={handleCloseFeedbackModal}
          onComplete={handleCompleteFeedbackModal}
          userName={session?.user?.name || profile?.username || undefined}
        />
    </div>
  );
} 