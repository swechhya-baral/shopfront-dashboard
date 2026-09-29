interface LogoProps {
  className?: string;
  bg?: string;
  fg?: string;
}

const Logo = ({ className = "h-8 w-8", bg = "var(--brand)", fg = "var(--on-brand)" }: LogoProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="7" fill={bg} />
    <path d="M6.5 23c0-6.5 4-11 9.5-11s9.5 4.5 9.5 11v1.5h-19z" fill={fg} />
    <path d="M11.5 18.5l2 4M16 17.5v5M20.5 18.5l-2 4" stroke={bg} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default Logo;
