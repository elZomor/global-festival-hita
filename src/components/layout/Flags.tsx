// Inline SVG flags for the language switch (emoji flags do not render on Windows).

export const EgyptFlag = ({ className = 'w-6 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
    <rect width="30" height="20" fill="#000" />
    <rect width="30" height="13.33" fill="#fff" />
    <rect width="30" height="6.67" fill="#ce1126" />
    {/* Eagle of Saladin, simplified */}
    <g fill="#c09300">
      <path d="M15 7.6c-.5 0-.8.4-.8.8v.4l-1.9.6.5 2.3 1.4-.3.1 1.4h1.4l.1-1.4 1.4.3.5-2.3-1.9-.6v-.4c0-.4-.3-.8-.8-.8z" />
      <rect x="13.6" y="11.9" width="2.8" height="0.6" rx="0.2" />
    </g>
  </svg>
);

export const UKFlag = ({ className = 'w-6 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
    <clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
    <clipPath id="uk-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
    <g clipPath="url(#uk-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);
