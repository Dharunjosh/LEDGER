/**
 * Button
 * A single reusable button with a small set of intentional variants.
 * Keep new variants rare — consistency is what makes the UI feel considered.
 */
const VARIANTS = {
  primary:
    'bg-ink text-white hover:bg-ink/90 dark:bg-tab-reminder dark:text-paper-dark dark:hover:bg-tab-reminder/90',
  secondary:
    'bg-transparent text-ink border border-rule hover:bg-paper dark:text-ink-dark dark:border-rule-dark dark:hover:bg-paper-dark',
  ghost:
    'bg-transparent text-ink-soft hover:text-ink hover:bg-paper dark:text-ink-soft-dark dark:hover:text-ink-dark dark:hover:bg-paper-dark',
  danger: 'bg-transparent text-danger hover:bg-danger/10',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex select-none items-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
