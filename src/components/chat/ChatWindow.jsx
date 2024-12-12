import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./style.scss";

const ChatWindow = ({ activeConversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDoc = await getDocs(
        query(
          collection(db, "users"),
          where("uid", "==", activeConversation.uid)
        )
      );
      setUserDetails(userDoc.docs[0].data());
    };

    if (activeConversation) {
      fetchUserDetails();
    }
  }, [activeConversation]);

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(
        collection(db, "messages"),
        where("conversationId", "==", activeConversation.id),
        orderBy("timestamp")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
        setLoading(false);
      });

      return () => unsubscribe();
    };

    if (activeConversation) {
      fetchMessages();
    }
  }, [activeConversation]);

  return (
    <div className="chat-window">
      {/* Render chat messages and other UI elements */}
    </div>
  );
};

export default ChatWindow;
