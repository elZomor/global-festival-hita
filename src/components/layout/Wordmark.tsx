import { festivalConfig } from '../../config/festival';

// Brushed ember ring (the kiln mark) around the festival abbreviation, beside
// the festival name. Replaces the old emoji logo.
export const KilnMark = ({ className = 'w-11 h-11' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      d="M32 6c14.6-.4 26.3 11.4 26 25.6-.3 14.4-12.2 26.1-26.4 25.9C17.3 57.3 5.6 45.6 6 31.4 6.4 18.1 16.7 7.4 29.8 6.3"
      fill="none"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
      className="text-ember-500"
      style={{ filter: 'url(#brush)' }}
    />
    <text
      x="32"
      y="36.5"
      textAnchor="middle"
      fontSize="13"
      fontWeight="600"
      letterSpacing="0.06em"
      fill="currentColor"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {festivalConfig.abbreviation}
    </text>
  </svg>
);
