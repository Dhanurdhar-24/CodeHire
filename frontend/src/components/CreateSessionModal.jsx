import { Code2Icon, LoaderIcon, PlusIcon, CopyIcon, CheckCircleIcon, ArrowRightIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";
import { Link } from "react-router";
import toast from "react-hot-toast";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
  createdSessionId,
}) {
  const problems = Object.values(PROBLEMS);

  if (!isOpen) return null;

  const sessionLink = createdSessionId ? `${window.location.origin}/session/${createdSessionId}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionLink);
    toast.success("Session link copied to clipboard!");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {!createdSessionId ? (
          <>
            <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

            <div className="tabs tabs-boxed mb-6 p-1 bg-base-200">
              <button 
                className={`tab flex-1 ${!roomConfig.isCustom ? "tab-active bg-primary text-primary-content" : ""}`}
                onClick={() => setRoomConfig({ ...roomConfig, isCustom: false, problem: "", difficulty: "" })}
              >
                Predefined Problem
              </button>
              <button 
                className={`tab flex-1 ${roomConfig.isCustom ? "tab-active bg-primary text-primary-content" : ""}`}
                onClick={() => setRoomConfig({ ...roomConfig, isCustom: true, problem: "", difficulty: "easy", customDescription: "" })}
              >
                Custom Problem
              </button>
            </div>

            <div className="space-y-6">
              {!roomConfig.isCustom ? (
                <>
                  <div className="space-y-2">
                    <label className="label text-base">
                      <span className="label-text font-semibold">Select Problem</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>

                    <select
                      className="select select-bordered w-full"
                      value={roomConfig.problem}
                      onChange={(e) => {
                        const selectedProblem = problems.find((p) => p.title === e.target.value);
                        setRoomConfig({
                          ...roomConfig,
                          difficulty: selectedProblem.difficulty,
                          problem: e.target.value,
                        });
                      }}
                    >
                      <option value="" disabled>Choose a coding problem...</option>
                      {problems.map((problem) => (
                        <option key={problem.id} value={problem.title}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>
                  {roomConfig.problem && (
                    <div className="alert alert-success mt-8 bg-success/10 border border-success/20">
                      <Code2Icon className="size-5 text-success" />
                      <div>
                        <p className="font-semibold text-success">Room Summary:</p>
                        <p className="text-sm">Problem: <span className="font-medium text-white">{roomConfig.problem}</span></p>
                        <p className="text-sm">Max Participants: <span className="font-medium text-white">2 (1-on-1 session)</span></p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="label text-base">
                      <span className="label-text font-semibold">Custom Problem Title</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Implement a Binary Search Tree" 
                      className="input input-bordered w-full" 
                      value={roomConfig.problem}
                      onChange={(e) => setRoomConfig({ ...roomConfig, problem: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-base">
                      <span className="label-text font-semibold">Problem Difficulty</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={roomConfig.difficulty}
                      onChange={(e) => setRoomConfig({ ...roomConfig, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label text-base">
                      <span className="label-text font-semibold">Problem Description</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <textarea 
                      placeholder="Describe the problem, input/output formats, constraints, etc." 
                      className="textarea textarea-bordered w-full h-32" 
                      value={roomConfig.customDescription}
                      onChange={(e) => setRoomConfig({ ...roomConfig, customDescription: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-action mt-8 pt-4 border-t border-base-300">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary gap-2"
                onClick={onCreateRoom}
                disabled={
                  isCreating || 
                  !roomConfig.problem || 
                  (roomConfig.isCustom && (!roomConfig.customDescription || !roomConfig.difficulty))
                }
              >
                {isCreating ? <LoaderIcon className="size-5 animate-spin" /> : <PlusIcon className="size-5" />}
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-6 py-6">
              <div className="flex justify-center">
                <div className="size-16 bg-success/10 text-success flex items-center justify-center rounded-full">
                  <CheckCircleIcon className="size-8" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-2xl mb-2">Session Created!</h3>
                <p className="text-base-content/70">
                  Your private session is ready. Share this link with your participant to invite them.
                </p>
              </div>

              <div className="bg-base-200 p-4 rounded-xl flex items-center justify-between gap-4">
                <code className="text-sm truncate flex-1 text-left select-all">{sessionLink}</code>
                <button 
                  className="btn btn-secondary btn-sm gap-2"
                  onClick={handleCopyLink}
                >
                  <CopyIcon className="size-4" />
                  Copy
                </button>
              </div>
            </div>

            <div className="modal-action justify-center mt-8 gap-4 pt-4 border-t border-base-300">
              <button className="btn btn-ghost border border-base-300" onClick={onClose}>Close</button>
              <Link to={`/session/${createdSessionId}`} className="btn btn-primary gap-2" onClick={onClose}>
                Join Session
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
