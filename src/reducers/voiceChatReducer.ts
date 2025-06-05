import type { Message, ExtendedUserProfile, VoiceChatState, VoiceChatAction } from "@/types";

// === Estados iniciales ===
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
  isChatVisible: false,
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

// === Reducer ===
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
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        )
      };
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
      console.log('Toggle chat deshabilitado - modo solo voz activo');
      return state;
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