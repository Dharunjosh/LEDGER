export default function DuplicateNoteDialog({ title, onOverwrite, onKeepSeparate, onCancel }) {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="duplicate-title">
    <div className="w-full max-w-md rounded-card border border-rule bg-paper-card p-5 shadow-card dark:border-rule-dark dark:bg-paper-card-dark">
      <h2 id="duplicate-title" className="text-lg font-semibold">A note already has this title</h2>
      <p className="mt-2 text-sm text-ink-soft dark:text-ink-soft-dark">“{title}” already exists. Choose whether to update that note or create another one.</p>
      <div className="mt-5 flex flex-wrap justify-end gap-2"><button onClick={onCancel} className="rounded-lg border border-rule px-3 py-2 text-sm font-medium dark:border-rule-dark">Cancel</button><button onClick={onKeepSeparate} className="rounded-lg border border-rule px-3 py-2 text-sm font-medium text-ink dark:border-rule-dark dark:text-ink-dark">Keep separate</button><button onClick={onOverwrite} className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white dark:bg-tab-reminder">Overwrite</button></div>
    </div>
  </div>;
}
