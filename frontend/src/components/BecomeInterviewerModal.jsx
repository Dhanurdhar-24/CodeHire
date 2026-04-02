import { Building2Icon, Loader2Icon, SparklesIcon, XIcon } from "lucide-react";
import { useState } from "react";

function BecomeInterviewerModal({ isOpen, onClose, onConvert, isSubmitting }) {
  const [organization, setOrganization] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConvert(organization);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md bg-base-100 rounded-3xl border border-primary/20 shadow-2xl relative overflow-hidden">
        {/* Background Sparkle decorator */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4 hover:bg-base-200"
        >
          <XIcon className="size-5" />
        </button>

        <div className="text-center mb-8">
          <div className="size-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <SparklesIcon className="size-8 text-white" />
          </div>
          <h3 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Become an Interviewer
          </h3>
          <p className="text-base-content/60 mt-2">
            Upgrade your account to create sessions and host interviews.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 ml-1">
              Organization Name
            </label>
            <div className="relative">
              <Building2Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
              <input
                type="text"
                autoFocus
                className="input input-bordered w-full pl-10 rounded-xl focus:border-primary transition-all"
                placeholder="e.g. Google, Airbnb, Freelance"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>
            <p className="text-[10px] text-base-content/40 ml-1 italic">
              * Note: Your account will require admin approval after switching.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1 rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !organization.trim()}
              className="btn btn-primary flex-1 rounded-xl shadow-lg shadow-primary/20 gap-2"
            >
              {isSubmitting ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-base-300/80 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
}

export default BecomeInterviewerModal;
