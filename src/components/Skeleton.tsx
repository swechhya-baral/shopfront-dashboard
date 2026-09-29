const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-line ${className}`} aria-hidden="true" />
);

export default Skeleton;
