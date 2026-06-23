import clsx from 'clsx';

interface ProgressBarProps {
  label: string;
  percentage: number;
  levelText: string;
  colorType: 'green' | 'yellow' | 'red';
}

export default function ProgressBar({ label, percentage, levelText, colorType }: ProgressBarProps) {
  
  // Mapeo dinámico a colores semánticos premium
  const colorStyles = {
    green: { text: "text-success", bg: "bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" },
    yellow: { text: "text-warning", bg: "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]" },
    red: { text: "text-danger", bg: "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]" }
  };

  const selectedColors = colorStyles[colorType];

  return (
    <div className="group">
      <div className="flex justify-between text-xs font-bold mb-1.5 px-0.5">
        <span className={clsx("uppercase tracking-wider opacity-90", selectedColors.text)}>{label}</span>
        <span className={clsx("opacity-90", selectedColors.text)}>{percentage}% ({levelText})</span>
      </div>
      <div className="w-full bg-border/40 rounded-full h-2.5 overflow-hidden">
        <div 
          className={clsx("h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 relative", selectedColors.bg)} 
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}></div>
        </div>
      </div>
    </div>
  );
}
