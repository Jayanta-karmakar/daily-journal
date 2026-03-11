interface GymToggleProps {
  value: 'yes' | 'no' | 'closed';
  onChange: (val: 'yes' | 'no' | 'closed') => void;
  isSunday: boolean;
}

const GymToggle = ({ value, onChange, isSunday }: GymToggleProps) => {
  const options: { val: 'yes' | 'no' | 'closed'; label: string; emoji: string }[] = [
    { val: 'yes', label: 'YES', emoji: '✅' },
    { val: 'no', label: 'NO', emoji: '❌' },
    { val: 'closed', label: 'CLOSED', emoji: '🔒' },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const isSelected = value === opt.val;
        const disabled = isSunday ? opt.val !== 'closed' : opt.val === 'closed';
        let cls = 'flex-1 py-3 rounded-full text-sm font-semibold transition-all text-center cursor-pointer select-none ';
        if (disabled) {
          cls += 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground';
        } else if (isSelected && opt.val === 'yes') {
          cls += 'bg-success text-success-foreground shadow-md';
        } else if (isSelected && opt.val === 'no') {
          cls += 'bg-destructive text-destructive-foreground shadow-md';
        } else if (isSelected && opt.val === 'closed') {
          cls += 'bg-muted text-muted-foreground';
        } else {
          cls += 'bg-card border border-border text-foreground hover:bg-muted';
        }

        return (
          <button
            key={opt.val}
            type="button"
            disabled={disabled}
            className={cls}
            onClick={() => !disabled && onChange(opt.val)}
          >
            {opt.emoji} {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default GymToggle;
