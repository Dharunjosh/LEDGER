import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-dark">
      <div className="w-full max-w-sm rounded-card border border-rule bg-paper-card p-6 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
        <h1 className="text-xl font-semibold text-ink dark:text-ink-dark">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-soft-dark">Set up Ledger in a few seconds.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-ink dark:text-ink-dark">
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
              placeholder="Your name"
            />
          </label>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-rule bg-transparent px-3 py-2 text-sm font-normal dark:border-rule-dark"
              placeholder="At least 6 characters"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-tab-reminder"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft dark:text-ink-soft-dark">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-tab-reminder hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
