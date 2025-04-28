import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./services/supabase";

// Import the Transactions page
import Transactions from "./pages/Transactions";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };

    fetchSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && !session) {
    return <Navigate to="/login" />;
  }

  return children;
};

const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/appointments",
    element: (
      <ProtectedRoute>
        <Appointments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/billing",
    element: (
      <ProtectedRoute>
        <Billing />
      </ProtectedRoute>
    ),
  },
  {
    path: "/customers",
    element: (
      <ProtectedRoute>
        <Customers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute>
        <Inventory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/services",
    element: (
      <ProtectedRoute>
        <Services />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute>
        <Staff />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transactions",
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

function App() {
  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
