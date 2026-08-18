import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="rounded-card border border-dashed border-rule bg-paper-card p-10 text-center shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
      <h1 className="text-2xl font-semibold">That page is not in this notebook.</h1>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-soft-dark">Use the dashboard to find your way back.</p>
      <Link to="/" className="mt-5 inline-flex text-sm font-medium text-tab-reminder hover:underline">Return to dashboard</Link>
    </div>
  );
}
