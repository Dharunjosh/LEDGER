import { UserRound, Mail, Shield, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-ink dark:text-ink-dark">
          Profile & Account
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">
          Manage your personal workspace credentials and device synchronization.
        </p>
      </div>

      <div className="rounded-2xl border border-rule bg-paper-card p-6 shadow-card dark:border-rule-dark dark:bg-paper-card-dark transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule/70 pb-5 dark:border-rule-dark/70">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tab-reminder/15 text-tab-reminder font-bold text-xl shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserRound size={24} />}
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink dark:text-ink-dark">{user?.name || "Team Member"}</h2>
              <div className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-ink-soft-dark mt-0.5">
                <Mail size={13} />
                <span>{user?.email || "No email linked"}</span>
              </div>
            </div>
          </div>

          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success self-start sm:self-auto">
            ● Active Account
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-xl border border-rule bg-paper p-3 hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:hover:bg-paper-card-dark transition-all"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-500">
              <Shield size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">Security PIN</p>
              <p className="text-[10px] text-ink-soft dark:text-ink-soft-dark">Configure private lock</p>
            </div>
          </Link>

          <Link
            to="/archive"
            className="flex items-center gap-3 rounded-xl border border-rule bg-paper p-3 hover:bg-paper-card dark:border-rule-dark dark:bg-paper-dark dark:hover:bg-paper-card-dark transition-all"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tab-notes/15 text-tab-notes">
              <Calendar size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">Archived Workspace</p>
              <p className="text-[10px] text-ink-soft dark:text-ink-soft-dark">View past items</p>
            </div>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-rule/60 dark:border-rule-dark/60">
          <p className="text-xs text-ink-soft dark:text-ink-soft-dark">
            Signed in on this browser
          </p>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-all active:scale-95 shadow-xs"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
