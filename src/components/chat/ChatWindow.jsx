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
    if (activeConversation) {
      setLoading(true);
      const q = query(
        collection(db, "conversations", activeConversation.id, "messages"),
        orderBy("createdAt")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesList);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [activeConversation]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetailsMap = { ...userDetails };
      for (const message of messages) {
        if (!userDetailsMap[message.uid]) {
          const userDoc = await getDocs(
            query(collection(db, "users"), where("uid", "==", message.uid))
          );
          if (!userDoc.empty) {
            userDetailsMap[message.uid] = userDoc.docs[0].data();
          }
        }
      }
      setUserDetails(userDetailsMap);
    };

    if (messages.length > 0) fetchUserDetails();
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      // Clear hide array
      await updateDoc(doc(db, "conversations", activeConversation.id), {
        hide: [],
      });

      // Add new message
      await addDoc(
        collection(db, "conversations", activeConversation.id, "messages"),
        {
          message: newMessage,
          uid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        }
      );

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((message) => {
          const isOwnMessage = message.uid === auth.currentUser.uid;
          const user = userDetails[message.uid] || {};

          return (
            <div
              key={message.id}
              className={`message ${isOwnMessage ? "own" : ""}`}
            >
              <div className="message-content">
                <div className="message-info">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="avatar"
                    />
                  )}
                  <strong className="sender-name">{user.displayName} </strong>
                  <span className="timestamp">
                    {message.createdAt
                      ? message.createdAt.toDate().toLocaleTimeString()
                      : "Sending..."}
                  </span>
                </div>
                <div className="message-text-container">
                  <p className="message-text">{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div class="sendiv">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            className="message-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" class="send">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
