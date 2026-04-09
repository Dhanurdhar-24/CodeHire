import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import InterviewerSignupPage from "./pages/InterviewerSignupPage";
import { setAuthTokenGetter } from "./lib/axios";

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());

    return () => setAuthTokenGetter(null);
  }, [getToken]);

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />

        <Route path="/problems" element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path="/problem/:id" element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
        <Route path="/interviewer/signup" element={!isSignedIn ? <InterviewerSignupPage /> : <Navigate to={"/dashboard"} />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </ErrorBoundary>
  );
}

export default App;
