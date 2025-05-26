import type { Message } from "@/types/message";

// Perfil de usuario simplificado para el chat de voz
export interface ExtendedUserProfile {
  id?: string; // ID del usuario de la sesión
  username?: string | null;
  email?: string | null; // Email del usuario de la sesión
  initial_context?: string | null; // Se mantiene si initial_context sigue siendo parte del perfil de alguna manera
}

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

export const initialState: VoiceChatState = {
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  currentSpeakingId: null,
  textInput: '',
  messages: [],
  greetingMessageId: null,
  isReadyToStart: false,
  conversationActive: false,
  isPushToTalkActive: false,
  isChatVisible: true,
  sessionStartTime: null,
  isFirstInteraction: true,
  isSessionClosed: false,
  isThinking: false,
  activeSessionId: null,
  initialContext: null,
  userProfile: null,
  isTimeRunningOutState: false,
  currentSessionTitle: null,
};

export type VoiceChatAction =
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_CURRENT_SPEAKING_ID'; payload: string | null }
  | { type: 'SET_TEXT_INPUT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
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

export function voiceChatReducer(state: VoiceChatState, action: VoiceChatAction): VoiceChatState {
  switch (action.type) {
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    case 'SET_CURRENT_SPEAKING_ID':
      return { ...state, currentSpeakingId: action.payload };
    case 'SET_TEXT_INPUT':
      return { ...state, textInput: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_GREETING_MESSAGE_ID':
      return { ...state, greetingMessageId: action.payload };
    case 'SET_READY_TO_START':
      return { ...state, isReadyToStart: action.payload };
    case 'SET_CONVERSATION_ACTIVE':
      return { ...state, conversationActive: action.payload };
    case 'SET_PUSH_TO_TALK_ACTIVE':
      return { ...state, isPushToTalkActive: action.payload };
    case 'TOGGLE_CHAT_VISIBILITY':
      return { ...state, isChatVisible: !state.isChatVisible };
    case 'SET_SESSION_START_TIME':
      return { ...state, sessionStartTime: action.payload };
    case 'SET_FIRST_INTERACTION':
      return { ...state, isFirstInteraction: action.payload };
    case 'SET_SESSION_CLOSED':
      return { ...state, isSessionClosed: action.payload };
    case 'SET_THINKING':
      return { ...state, isThinking: action.payload };
    case 'SET_ACTIVE_SESSION_ID':
      return { ...state, activeSessionId: action.payload };
    case 'SET_INITIAL_CONTEXT':
      return { ...state, initialContext: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_TIME_RUNNING_OUT':
      return { ...state, isTimeRunningOutState: action.payload };
    case 'SET_CURRENT_SESSION_TITLE':
      return { ...state, currentSessionTitle: action.payload };
    case 'RESET_CONVERSATION_STATE':
      return {
        ...state,
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        currentSpeakingId: null,
        greetingMessageId: null,
        conversationActive: false,
        isPushToTalkActive: false,
        sessionStartTime: null,
        isFirstInteraction: true,
        isThinking: false,
        activeSessionId: null,
        isTimeRunningOutState: false,
        currentSessionTitle: null,
      };
    case 'START_CONVERSATION_SUCCESS':
      return {
        ...state,
        conversationActive: true,
        isSessionClosed: false,
        activeSessionId: action.payload.sessionId,
        sessionStartTime: action.payload.startTime,
        messages: action.payload.initialMessages,
        isFirstInteraction: false,
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        isThinking: false,
      };
    case 'END_SESSION_SUCCESS':
      return {
        ...state,
        isSessionClosed: true,
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        isPushToTalkActive: false,
        conversationActive: false,
        isTimeRunningOutState: false,
        currentSpeakingId: null,
        greetingMessageId: null,
        isReadyToStart: false,
        activeSessionId: null,
        sessionStartTime: null,
        currentSessionTitle: null,
      };
    default:
      return state;
  }
} 