import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
// import Search from "./Search";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useConversation } from "../../context/ConversationContext";
import "./style.scss";

/**
 * Home component - Main chat application interface
 * Displays user info, conversations list, and chat window
 * @component
 */
const Home = () => {
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [conversations, setConversations] = useState([]);
  const { activeConversation } = useConversation();
  const [activeUserDetails, setActiveUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    } else {
      setDisplayName(auth.currentUser.displayName || "");
      setPhotoURL(auth.currentUser.photoURL || "");
    }
  }, [navigate]);

  // Fetch active conversation user details
  useEffect(() => {
    const fetchActiveUserDetails = async () => {
      if (activeConversation) {
        const otherUserId = activeConversation.participants.find(
          (id) => id !== auth.currentUser.uid
        );
        const userDoc = await getDocs(
          query(collection(db, "users"), where("uid", "==", otherUserId))
        );
        if (!userDoc.empty) {
          setActiveUserDetails(userDoc.docs[0].data());
        }
      }
    };
    fetchActiveUserDetails();
  }, [activeConversation]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleUpdateProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="home">
      <div className="user-info">
        <div className="current-user">
          <img
            src={photoURL || "/path/to/default/image.jpg"}
            alt="Profile Avatar"
            className="avatar"
          />
          <strong className="userName">{displayName}</strong>
          <button onClick={handleUpdateProfile}>Update Profile</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
        {activeConversation && activeUserDetails && (
          <div className="active-chat">
            <img
              src={activeUserDetails.photoURL || ".img/av2.jpg"}
              alt="Active User Avatar"
              className="avatar"
            />
            <strong className="userName">
              {activeUserDetails.displayName}
            </strong>
          </div>
        )}
      </div>
      <div className="main-content">
        <div className="sideChat">
          <Sidebar
            conversations={conversations}
            setConversations={setConversations}
          />
          <div className="chat-section">
            {activeConversation ? (
              <ChatWindow activeConversation={activeConversation} />
            ) : (
              <div className="empty-chat">
                <p>
                  Select a conversation or search for a user to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
