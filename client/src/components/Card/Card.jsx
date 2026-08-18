/**
 * Card
 * The app's signature visual element: a paper index card with a small
 * colored "folder tab" peeking above its top-left corner. The tab color
 * ties each card back to its section (coral = tasks, amber = notes,
 * teal = reminders) the same way a physical filing system color-codes tabs.
 *
 * tabColor accepts a Tailwind background class, e.g. "bg-tab-todo".
 * If omitted, the card renders without a tab (used for neutral containers).
 */
export default function Card({ tabColor, tabLabel, children, className = '', as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`relative rounded-card border border-rule bg-paper-card shadow-card dark:border-rule-dark dark:bg-paper-card-dark ${
        tabColor ? 'mt-2' : ''
      } ${className}`}
      {...rest}
    >
      {tabColor && (
        <span
          className={`absolute -top-2 left-4 h-4 rounded-t-md px-2 text-[10px] font-mono font-medium leading-4 text-white shadow-tab ${tabColor} ${
            tabLabel ? 'min-w-[1rem]' : 'w-8'
          }`}
        >
          {tabLabel}
        </span>
      )}
      {children}
    </Tag>
  );
}
