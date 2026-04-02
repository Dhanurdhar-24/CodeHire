import { useState } from "react";
import { X, LogIn, Link2 } from "lucide-react";
import { useNavigate } from "react-router";

function JoinSessionModal({ isOpen, onClose }) {
  const [sessionInput, setSessionInput] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoin = (e) => {
    e.preventDefault();
    if (!sessionInput.trim()) return;

    // handle full URLs or just IDs
    let roomId = sessionInput.trim();
    if (roomId.includes("/session/")) {
      roomId = roomId.split("/session/").pop();
    }

    navigate(`/session/${roomId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base-200 w-full max-w-md rounded-3xl shadow-2xl border border-primary/20 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg transform -rotate-6">
                <LogIn className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-base-content">Join Session</h2>
                <p className="text-sm text-base-content/60 font-medium">Enter a link or ID</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-base-content/70">Session Link or ID</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Paste link or type session ID..."
                  className="input input-bordered w-full pl-12 h-14 bg-base-300 border-base-100 focus:border-primary/50 rounded-2xl text-lg transition-all"
                  value={sessionInput}
                  onChange={(e) => setSessionInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn flex-1 h-14 rounded-2xl font-bold bg-base-100 border-none hover:bg-base-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn flex-1 h-14 rounded-2xl font-bold bg-gradient-to-r from-primary to-secondary text-white border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all ${
                  !sessionInput.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!sessionInput.trim()}
              >
                Join Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinSessionModal;
