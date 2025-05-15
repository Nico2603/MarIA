export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestedVideo?: { title: string; url: string };
} 