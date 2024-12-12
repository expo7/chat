import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useConversation } from "../../context/ConversationContext";
import Search from "./Search";
import "./style.scss";

const Sidebar = ({ conversations, setConversations }) => {
  const [userDetails, setUserDetails] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const { setActiveConversation } = useConversation();

  useEffect(() => {
    const fetchConversations = async () => {
      if (auth.currentUser) {
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const conversationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConversations(conversationsList);
      }
    };

    fetchConversations();
  }, [setConversations]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetailsMap = {};
      for (const conversation of conversations) {
        for (const participant of conversation.participants) {
          if (
            participant !== auth.currentUser.uid &&
            !userDetailsMap[participant]
          ) {
            const userDoc = await getDocs(
              query(collection(db, "users"), where("uid", "==", participant))
            );
            if (!userDoc.empty) {
              userDetailsMap[participant] = userDoc.docs[0].data();
            }
          }
        }
      }
      setUserDetails(userDetailsMap);
    };

    fetchUserDetails();
  }, [conversations]);

  useEffect(() => {
    const fetchLastMessages = async () => {
      const messagesMap = {};
      for (const conversation of conversations) {
        const messagesQuery = query(
          collection(db, `conversations/${conversation.id}/messages`),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const messageSnap = await getDocs(messagesQuery);
        if (!messageSnap.empty) {
          messagesMap[conversation.id] = messageSnap.docs[0].data();
        }
      }
      setLastMessages(messagesMap);
    };

    fetchLastMessages();
  }, [conversations]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "conversations"),
        where("participants", "array-contains", auth.currentUser.uid)
      ),
      (snapshot) => {
        const updatedConversations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConversations(updatedConversations);
      }
    );

    return () => unsubscribe();
  }, [setConversations]);

  const handleHideConversation = async (e, conversation) => {
    e.stopPropagation(); // Prevent conversation selection
    try {
      // Optimistically update UI
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversation.id
            ? { ...conv, hide: [...(conv.hide || []), auth.currentUser.uid] }
            : conv
        )
      );

      // Update in database
      const conversationRef = doc(db, "conversations", conversation.id);
      await updateDoc(conversationRef, {
        hide: [...(conversation.hide || []), auth.currentUser.uid],
      });
    } catch (error) {
      console.error("Error hiding conversation:", error);
      // Revert optimistic update on error
      const conversationsRef = collection(db, "conversations");
      const q = query(
        conversationsRef,
        where("participants", "array-contains", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const conversationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(conversationsList);
    }
  };

  const handleConversationClick = async (conversation) => {
    setActiveConversation(conversation);
    const conversationRef = doc(db, "conversations", conversation.id);
    await updateDoc(conversationRef, {
      [`lastSeen.${auth.currentUser.uid}`]: new Date(),
    });
  };

  return (
    <div className="sidebar">
      <div className="container">
        <Search setConversations={setConversations} />
        <ul>
          {conversations
            .filter(
              (conversation) =>
                !(conversation.hide || []).includes(auth.currentUser.uid)
            )
            .map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (participant) => participant !== auth.currentUser.uid
              );
              const otherUser = userDetails[otherParticipant] || {};
              const lastMessage = lastMessages[conversation.id] || {};

              return (
                <li
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="conversation">
                    {otherUser.photoURL && (
                      <img
                        src={otherUser.photoURL}
                        alt={otherUser.displayName}
                        className="avatar"
                      />
                    )}
                    <div className="conversation-info">
                      <strong className="name">
                        {otherUser.displayName || "Conversation"}
                      </strong>
                      <small className="preview">
                        {lastMessage.message || ""}
                      </small>
                    </div>
                    <button
                      className="hide-btn"
                      onClick={(e) => handleHideConversation(e, conversation)}
                    >
                      Hide
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
