// // ChatProvider.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// type ChatProviderProps = {
//   children: React.ReactNode;
// };

// type User = {
//   id: number;
//   name: string;
//   token: string;
//   // Ajoutez d'autres champs nécessaires pour l'utilisateur
// };

// type Notification = {
//   id: number;
//   message: string;
//   // Ajoutez d'autres champs nécessaires pour la notification
// };

// type ChatContextType = {
//   selectedChat: any; // Définissez le type approprié ici
//   setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
//   user: User | null;
//   setUser: React.Dispatch<React.SetStateAction<User | null>>;
//   notification: Notification[];
//   setNotification: React.Dispatch<React.SetStateAction<Notification[]>>;
//   chats: any; // Définissez le type approprié ici
//   setChats: React.Dispatch<React.SetStateAction<any>>;
// };

// const ChatContext = createContext<ChatContextType | undefined>(undefined);

// export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
//   const [selectedChat, setSelectedChat] = useState<any>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [notification, setNotification] = useState<Notification[]>([]);
//   const [chats, setChats] = useState<any>(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const userInfoString = localStorage.getItem("userInfo");
//     if (userInfoString) {
//       const userInfo: User = JSON.parse(userInfoString);
//       setUser(userInfo);
//     } else {
//       navigate("/");
//     }
//   }, [navigate]);

//   const contextValue: ChatContextType = {
//     selectedChat,
//     setSelectedChat,
//     user,
//     setUser,
//     notification,
//     setNotification,
//     chats,
//     setChats,
//   };

//   return (
//     <ChatContext.Provider value={contextValue}>
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => {
//   const context = useContext(ChatContext);
//   if (!context) {
//     throw new Error("useChat must be used within a ChatProvider");
//   }
//   return context;
// };
