import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import JoinSessionModal from "../components/JoinSessionModal";
import BecomeInterviewerModal from "../components/BecomeInterviewerModal";
import { Loader2Icon } from "lucide-react";
import { useConvertToInterviewer } from "../hooks/useUsers";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBecomeInterviewerModal, setShowBecomeInterviewerModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "", isCustom: false, customDescription: "" });
  const [createdSessionId, setCreatedSessionId] = useState(null);

  const createSessionMutation = useCreateSession();
  const convertToInterviewerMutation = useConvertToInterviewer();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;
    if (roomConfig.isCustom && !roomConfig.customDescription) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
        isCustom: roomConfig.isCustom,
        customDescription: roomConfig.customDescription
      },
      {
        onSuccess: (data) => {
          setCreatedSessionId(data.session._id);
        },
      }
    );
  };

  const handleBecomeInterviewer = (organization) => {
    convertToInterviewerMutation.mutate({ organization }, {
      onSuccess: () => setShowBecomeInterviewerModal(false)
    });
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user?.id) return false;
    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar onBecomeInterviewer={() => setShowBecomeInterviewerModal(true)} />
        <WelcomeSection
          onCreateSession={() => setShowCreateModal(true)}
          onJoinSession={() => setShowJoinModal(true)}
          onBecomeInterviewer={() => setShowBecomeInterviewerModal(true)}
        />

        {user?.publicMetadata?.role === "interviewer" && !user?.publicMetadata?.isApproved && (
          <div className="container mx-auto px-6 mb-8">
            <div className="alert alert-warning bg-warning/10 border-warning/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 p-6 shadow-lg shadow-warning/5">
              <div className="size-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
                <Loader2Icon className="size-6 text-warning animate-spin" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-warning">Verification Pending</h3>
                <p className="text-warning/80">Please standby as you are being verified by our team. You'll be able to create sessions once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Grid layout */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreatedSessionId(null);
        }}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
        createdSessionId={createdSessionId}
      />

      <JoinSessionModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />

      <BecomeInterviewerModal
        isOpen={showBecomeInterviewerModal}
        onClose={() => setShowBecomeInterviewerModal(false)}
        onConvert={handleBecomeInterviewer}
        isSubmitting={convertToInterviewerMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;
