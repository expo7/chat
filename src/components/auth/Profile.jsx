import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../firebase";
import { updateProfile, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import "./style.scss";

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    } else {
      setDisplayName(auth.currentUser.displayName || "");
      setEmail(auth.currentUser.email || "");
      setPhotoURL(auth.currentUser.photoURL || "");
    }
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (profileImage) {
        const storageRef = ref(
          storage,
          `profileImages/${auth.currentUser.uid}`
        );
        const uploadTask = uploadBytesResumable(storageRef, profileImage);

        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            setError(error.message);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(auth.currentUser, {
              displayName,
              photoURL: downloadURL,
            });
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              displayName,
              photoURL: downloadURL,
            });
            setPhotoURL(downloadURL); // Update the photoURL state
            setSuccess("Profile updated successfully!");
          }
        );
      } else {
        await updateProfile(auth.currentUser, { displayName });
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          displayName,
        });
        setSuccess("Profile updated successfully!");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="profile">
      <nav className="navbar">
        <button onClick={handleNavigateHome} className="home-button">
          Home
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      <h1>Update Profile</h1>
      {auth.currentUser ? (
        <div className="current-user">
          <p>Current User:</p>
          {photoURL && (
            <img src={photoURL} alt="Profile Avatar" className="avatar" />
          )}
          <p>Name: {displayName}</p>
          <p>Email: {email}</p>
        </div>
      ) : (
        <p>No user is logged in</p>
      )}
      <form onSubmit={handleProfileUpdate}>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input type="email" placeholder="Email" value={email} readOnly />
        <input
          type="file"
          onChange={(e) => setProfileImage(e.target.files[0])}
        />
        <button type="submit">Update Profile</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </div>
  );
};

export default Profile;
