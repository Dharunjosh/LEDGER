import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckSquare,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage({ initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forgot password states
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState("request"); // 'request' | 'verify'
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { login, register, forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await register(name, email, password);
        showToast("Account created successfully! Welcome to TeamFlow.", "success");
      } else {
        await login(email, password);
        showToast("Signed in successfully. Welcome back!", "success");
      }
      navigate("/");
    } catch (error) {
      showToast(error.message || "Authentication failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordResetRequest(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await forgotPassword(email);
      showToast(response.message || "Verification code sent.", "success");
      if (response.code) {
        showToast(`Demo verification code: ${response.code}`, "info");
      }
      setResetStep("verify");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordResetSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(email, resetCode, newPassword);
      showToast("Password updated successfully. Please sign in.", "success");
      setShowReset(false);
      setResetStep("request");
      setResetCode("");
      setNewPassword("");
      setPassword("");
      setMode("signin");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBFBFA] px-4 py-8 dark:bg-[#111317]">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-tab-reminder/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-tab-todo/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-tab-notes/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Welcome App Header Card */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-tab-todo via-tab-notes to-tab-reminder text-white shadow-md">
            <CheckSquare size={28} className="stroke-[2.5]" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-ink-dark">
            Welcome to <span className="bg-gradient-to-r from-tab-todo via-tab-notes to-tab-reminder bg-clip-text text-transparent">TeamFlow</span>
          </h1>
          <p className="mt-1.5 text-xs text-ink-soft dark:text-ink-soft-dark sm:text-sm">
            Your integrated workspace for Tasks, Notes & Scheduled Reminders.
          </p>
        </div>

        {/* Auth Box */}
        <div className="rounded-3xl border border-rule/80 bg-paper-card/90 p-6 sm:p-8 shadow-card backdrop-blur-md dark:border-rule-dark/80 dark:bg-paper-card-dark/90 transition-all">
          {!showReset ? (
            <>
              {/* Dual Switcher: Sign In vs Sign Up */}
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-paper p-1.5 border border-rule/70 dark:bg-paper-dark/70 dark:border-rule-dark/70">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    mode === "signin"
                      ? "bg-ink text-white shadow-xs dark:bg-tab-reminder dark:text-paper-dark"
                      : "text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-white"
                  }`}
                >
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    mode === "signup"
                      ? "bg-ink text-white shadow-xs dark:bg-tab-reminder dark:text-paper-dark"
                      : "text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-white"
                  }`}
                >
                  <span>Sign Up</span>
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Full Name field for Sign Up */}
                {mode === "signup" && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark"
                      />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-rule bg-paper py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-rule bg-paper py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password field with Eye Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-ink-soft-dark">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setShowReset(true)}
                        className="text-xs font-semibold text-tab-reminder hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-soft-dark"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-rule bg-paper py-2.5 pl-10 pr-11 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark transition-colors"
                      placeholder={mode === "signup" ? "Create a secure password (6+ chars)" : "Enter your password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-0.5"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-bold text-white shadow-md hover:bg-ink/90 active:scale-[0.99] disabled:opacity-60 transition-all dark:bg-tab-reminder dark:text-paper-dark cursor-pointer"
                >
                  {submitting ? (
                    "Processing..."
                  ) : mode === "signup" ? (
                    <>
                      <span>Create Account & Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Flow */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                  Reset Account Password
                </h2>
                <p className="text-xs text-ink-soft dark:text-ink-soft-dark mt-0.5">
                  {resetStep === "request"
                    ? "Enter your email address to receive a recovery code."
                    : "Enter the code and create your new password."}
                </p>
              </div>

              <form
                onSubmit={
                  resetStep === "request"
                    ? handlePasswordResetRequest
                    : handlePasswordResetSubmit
                }
                className="space-y-3.5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-soft dark:text-ink-soft-dark">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-rule bg-paper px-3.5 py-2 text-sm text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                    placeholder="you@example.com"
                  />
                </div>

                {resetStep === "verify" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink-soft dark:text-ink-soft-dark">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        value={resetCode}
                        onChange={(e) =>
                          setResetCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        className="w-full rounded-xl border border-rule bg-paper px-3.5 py-2 font-mono text-sm text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark tracking-widest text-center"
                        placeholder="123456"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink-soft dark:text-ink-soft-dark">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl border border-rule bg-paper py-2 pl-3.5 pr-11 text-sm text-ink outline-none focus:border-tab-reminder dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                          placeholder="At least 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink dark:text-ink-soft-dark dark:hover:text-ink-dark p-0.5"
                          title={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(false);
                      setResetStep("request");
                      setResetCode("");
                      setNewPassword("");
                    }}
                    className="flex-1 rounded-xl border border-rule bg-paper py-2.5 text-xs font-bold text-ink hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:text-ink-dark"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-ink py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ink/90 active:scale-95 disabled:opacity-60 dark:bg-tab-reminder dark:text-paper-dark"
                  >
                    {submitting
                      ? "Processing..."
                      : resetStep === "request"
                        ? "Send Code"
                        : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
