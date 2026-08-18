import { UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold sm:text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">Your account, synced across every device you log into.</p>

      <div className="mt-6 rounded-card border border-rule bg-paper-card p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tab-reminder/15 text-tab-reminder">
            <UserRound size={22} />
          </span>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-ink-soft dark:text-ink-soft-dark">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-lg border border-rule px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 dark:border-rule-dark"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
