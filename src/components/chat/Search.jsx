import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import "./style.scss";

const Search = ({ setConversations }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filtered = users.filter(
        (user) =>
          user.displayName &&
          user.displayName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm) {
      setDropdownVisible(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setDropdownVisible(false);
    }, 200); // Delay to allow click event on dropdown items
  };

  const handleUserSelect = async (selectedUser) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const participants = [currentUser.uid, selectedUser.uid].sort();
    const q = query(
      collection(db, "conversations"),
      where("participants", "==", participants)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // Create new conversation with empty hide array
      const newConversation = await addDoc(collection(db, "conversations"), {
        participants,
        createdAt: serverTimestamp(),
        lastMessage: "",
        hide: [],
      });
      setConversations((prev) => [
        ...prev,
        {
          id: newConversation.id,
          participants,
          createdAt: new Date(),
          lastMessage: "",
          hide: [],
        },
      ]);
    } else {
      // Clear hide array of existing conversation
      const conversation = querySnapshot.docs[0];
      await updateDoc(doc(db, "conversations", conversation.id), {
        hide: [],
      });

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, hide: [] } : conv
        )
      );
    }

    setDropdownVisible(false);
    setSearchTerm("");
  };

  return (
    <div className="search">
      <input
        className="search-input"
        type="text"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {dropdownVisible && (
        <div className="dropdown">
          {filteredUsers.map((user, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => handleUserSelect(user)}
            >
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="avatar"
                />
              )}
              <span>{user.displayName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
