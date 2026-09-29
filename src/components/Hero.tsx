import { useEffect, useState } from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  /** Path under /public, e.g. "/hero.jpg". Falls back to a plain colour if missing. */
  src?: string;
}

/*A banner image with text sitting on top of it.*/

const Hero = ({ title, subtitle, src }: HeroProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className="relative mb-8 h-56 overflow-hidden rounded-lg sm:h-72">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-brand-soft" />
      )}

      {/* Darkens the photo so the text is readable on any image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{title}</h1>
        <p className="mt-2 max-w-xl text-white/90 drop-shadow-sm">{subtitle}</p>
      </div>
    </div>
  );
};

export default Hero;
