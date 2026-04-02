import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { BriefcaseIcon, Building2Icon, Loader2Icon, MailIcon, LockIcon, UserIcon } from "lucide-react";

function InterviewerSignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // start the signup process
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          role: "interviewer",
          organization,
        },
      });

      // send the email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // verify the email address
  const onPressVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-primary/10">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
          <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <BriefcaseIcon className="size-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Interviewer Registration</h1>
          <p className="opacity-90">Join CodeHire as an Interviewer and manage your technical hiring.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="alert alert-error mb-6 py-3 rounded-xl text-sm">
              <span>{error}</span>
            </div>
          )}

          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 ml-1">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10 rounded-xl"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 ml-1">Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-10 rounded-xl"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 ml-1">Organization Name</label>
                <div className="relative">
                  <Building2Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10 rounded-xl"
                    placeholder="e.g. Google, Meta"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 ml-1">Work Email</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10 rounded-xl"
                    placeholder="john@company.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 ml-1">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                  <input
                    type="password"
                    className="input input-bordered w-full pl-10 rounded-xl"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full rounded-xl mt-6 h-12 text-lg font-bold shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2Icon className="size-5 animate-spin" /> : "Create Interviewer Account"}
              </button>

              <p className="text-center text-sm mt-6 text-base-content/60">
                Are you a participant?{" "}
                <Link to="/" className="text-primary font-bold hover:underline">
                  Sign up here
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={onPressVerify} className="space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verify your email</h2>
                <p className="text-base-content/60 text-sm">
                  We've sent a 6-digit verification code to <span className="font-bold text-base-content">{emailAddress}</span>
                </p>
              </div>

              <div className="space-y-1">
                <input
                  className="input input-bordered w-full text-center text-3xl font-black tracking-[0.5em] rounded-2xl h-16"
                  placeholder="000000"
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full rounded-xl h-12 text-lg font-bold"
              >
                {loading ? <Loader2Icon className="size-5 animate-spin" /> : "Verify & Finish"}
              </button>

              <div className="p-4 bg-primary/5 rounded-xl text-sm border border-primary/10">
                <p className="text-primary font-medium">
                  Note: Your account will be pending until verified by the CodeHire admin.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewerSignupPage;
