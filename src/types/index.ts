// === Tipos de Notificación ===
export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationMessage {
  message: string;
  type: NotificationType;
  duration: number;
}

// === Tipos de Respuestas Enriquecidas ===
export interface RichImage {
  title: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface RichLink {
  title: string;
  url: string;
  description?: string;
  type?: 'article' | 'resource' | 'external' | 'guide';
}

export interface RichButton {
  title: string;
  action: string;
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  icon?: string;
}

export interface RichCard {
  title: string;
  content: string;
  type?: 'tip' | 'technique' | 'exercise' | 'info' | 'warning';
  items?: string[];
}

export interface RichContent {
  images?: RichImage[];
  links?: RichLink[];
  buttons?: RichButton[];
  cards?: RichCard[];
  suggestedVideo?: { title: string; url: string }; // Mantener compatibilidad
}

// === Tipos de Mensaje ===
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestedVideo?: { title: string; url: string }; // Deprecated, usar richContent
  richContent?: RichContent;
}

// === Tipos de VoiceChat ===
// Perfil de usuario simplificado para el chat de voz
export interface ExtendedUserProfile {
  id?: string; // ID del usuario de la sesión
  username?: string | null;
  email?: string | null; // Email del usuario de la sesión
  initial_context?: string | null; // Se mantiene si initial_context sigue siendo parte del perfil de alguna manera
}

// Estado del VoiceChat
export interface VoiceChatState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentSpeakingId: string | null;
  textInput: string;
  messages: Message[];
  greetingMessageId: string | null;
  isReadyToStart: boolean;
  conversationActive: boolean;
  isPushToTalkActive: boolean;
  isChatVisible: boolean;
  sessionStartTime: number | null;
  isFirstInteraction: boolean;
  isSessionClosed: boolean;
  isThinking: boolean;
  activeSessionId: string | null;
  initialContext: string | null;
  userProfile: ExtendedUserProfile | null;
  isTimeRunningOutState: boolean;
  currentSessionTitle: string | null;
}

// Acciones del VoiceChat
export type VoiceChatAction =
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_CURRENT_SPEAKING_ID'; payload: string | null }
  | { type: 'SET_TEXT_INPUT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_GREETING_MESSAGE_ID'; payload: string | null }
  | { type: 'SET_READY_TO_START'; payload: boolean }
  | { type: 'SET_CONVERSATION_ACTIVE'; payload: boolean }
  | { type: 'SET_PUSH_TO_TALK_ACTIVE'; payload: boolean }
  | { type: 'TOGGLE_CHAT_VISIBILITY' }
  | { type: 'SET_SESSION_START_TIME'; payload: number | null }
  | { type: 'SET_FIRST_INTERACTION'; payload: boolean }
  | { type: 'SET_SESSION_CLOSED'; payload: boolean }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_ACTIVE_SESSION_ID'; payload: string | null }
  | { type: 'SET_INITIAL_CONTEXT'; payload: string | null }
  | { type: 'SET_USER_PROFILE'; payload: ExtendedUserProfile | null }
  | { type: 'SET_TIME_RUNNING_OUT'; payload: boolean }
  | { type: 'SET_CURRENT_SESSION_TITLE'; payload: string | null }
  | { type: 'RESET_CONVERSATION_STATE' }
  | { type: 'START_CONVERSATION_SUCCESS'; payload: { sessionId: string; startTime: number; initialMessages: Message[] } }
  | { type: 'END_SESSION_SUCCESS' };

// === Tipos de Error ===
export type AppErrorType = 'livekit' | 'openai' | 'stt' | 'tts' | 'agent' | 'profile' | 'permissions' | 'api' | null;

export interface AppError {
  type: AppErrorType;
  message: string | null;
} 