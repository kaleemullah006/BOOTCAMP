import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/adminAuth";

export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}