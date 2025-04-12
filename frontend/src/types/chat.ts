export interface Chat {
  _id: string;
  userDetails: { 
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageTime: string; 
  createdAt?: string;      
}