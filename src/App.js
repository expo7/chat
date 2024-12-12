import React from "react";
import { useRoutes } from "react-router-dom";
import Home from "./components/chat/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/auth/Profile";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { ConversationProvider } from "./context/ConversationContext";

const App = () => {
  const routes = useRoutes([
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
      path: "/",
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      ),
    },
  ]);

  return routes;
};

const AppWrapper = () => (
  <AuthProvider>
    <ConversationProvider>
      <App />
    </ConversationProvider>
  </AuthProvider>
);

export default AppWrapper;
