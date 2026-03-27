import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  console.log("Token:", token); // DEBUG

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}