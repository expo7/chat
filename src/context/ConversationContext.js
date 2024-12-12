// src/context/ConversationContext.js
import React, { createContext, useContext, useState } from "react";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [activeConversation, setActiveConversation] = useState(null);

  return (
    <ConversationContext.Provider
      value={{ activeConversation, setActiveConversation }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  return useContext(ConversationContext);
};
