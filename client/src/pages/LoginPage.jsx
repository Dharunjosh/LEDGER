import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState("request");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { login, forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      showToast(error.message, "error");
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
      showToast("Password updated successfully.", "success");
      setShowReset(false);
      setResetStep("request");
      setResetCode("");
      setNewPassword("");
      setPassword("");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-dark">
      <div className="w-full max-w-sm rounded-card border border-rule bg-paper-card p-6 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
        <h1 className="text-xl font-semibold text-ink dark:text-ink-dark">
          Log in to Ledger
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
          Your tasks, notes and reminders, synced everywhere.
        </p>

        {!showReset ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-ink dark:text-ink-dark">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium text-ink dark:text-ink-dark">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
                placeholder="••••••••"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-left text-xs font-medium text-tab-reminder hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-tab-reminder"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={
              resetStep === "request"
                ? handlePasswordResetRequest
                : handlePasswordResetSubmit
            }
            className="mt-6 space-y-4"
          >
            <label className="block text-sm font-medium text-ink dark:text-ink-dark">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
                placeholder="you@example.com"
              />
            </label>

            {resetStep === "verify" && (
              <>
                <label className="block text-sm font-medium text-ink dark:text-ink-dark">
                  Verification code
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
                    className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
                    placeholder="123456"
                  />
                </label>
                <label className="block text-sm font-medium text-ink dark:text-ink-dark">
                  New password
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
                    placeholder="At least 6 characters"
                  />
                </label>
              </>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetStep("request");
                  setResetCode("");
                  setNewPassword("");
                }}
                className="flex-1 rounded-lg border border-rule px-4 py-2 text-sm font-medium text-ink dark:border-rule-dark dark:text-ink-dark"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-tab-reminder"
              >
                {submitting
                  ? "Processing..."
                  : resetStep === "request"
                    ? "Send code"
                    : "Reset password"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-ink-soft dark:text-ink-soft-dark">
          No account yet?{" "}
          <Link
            to="/register"
            className="font-medium text-tab-reminder hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
