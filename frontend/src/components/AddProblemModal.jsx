import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

function AddProblemModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onAddProblem,
  isAdding,
}) {
  const problems = Object.values(PROBLEMS);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Add New Problem</h3>

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
                    <p className="font-semibold text-success">Problem Summary:</p>
                    <p className="text-sm">Problem: <span className="font-medium text-white">{roomConfig.problem}</span></p>
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
          <button className="btn btn-ghost" onClick={onClose} disabled={isAdding}>Cancel</button>
          <button
            className="btn btn-primary gap-2"
            onClick={onAddProblem}
            disabled={
              isAdding || 
              !roomConfig.problem || 
              (roomConfig.isCustom && (!roomConfig.customDescription || !roomConfig.difficulty))
            }
          >
            {isAdding ? <LoaderIcon className="size-5 animate-spin" /> : <PlusIcon className="size-5" />}
            {isAdding ? "Adding..." : "Add Problem"}
          </button>
        </div>
      </div>
      {!isAdding && <div className="modal-backdrop" onClick={onClose}></div>}
    </div>
  );
}

export default AddProblemModal;
