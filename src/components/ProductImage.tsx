import { useEffect, useState } from "react";
import type { Category } from "@/types";

interface ProductImageProps {
  category: Category;
  color: string;
  /** Photo path under /public. If it's missing or fails to load, a drawing is shown instead. */
  src?: string;
  alt?: string;
  className?: string;
}

const ProductImage = ({ category, color, src, alt = "", className = "" }: ProductImageProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const shade = "rgba(0,0,0,0.22)";
  const light = "rgba(255,255,255,0.85)";

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: `${color}22` }}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-3/4 w-3/4" aria-hidden="true">
            {category === "cakes" && (
              <>
                <rect x="26" y="100" width="68" height="5" rx="2.5" fill={shade} />
                <rect x="30" y="74" width="60" height="26" rx="4" fill={color} />
                <rect x="34" y="60" width="52" height="16" rx="3" fill={light} />
                <rect x="30" y="42" width="60" height="20" rx="4" fill={color} />
                <circle cx="60" cy="34" r="6" fill={shade} />
              </>
            )}
            {category === "breads" && (
              <>
                <path d="M26 88c0-24 14-38 34-38s34 14 34 38v10H26z" fill={color} />
                <rect x="26" y="92" width="68" height="6" rx="3" fill={shade} />
                <path d="M44 64l8 14M60 60v18M76 64l-8 14" stroke={light} strokeWidth="5" strokeLinecap="round" />
              </>
            )}
            {category === "pastries" && (
              <>
                <path
                  d="M20 82c6-28 20-42 40-42s34 14 40 42c-8-9-17-13-26-13-6 0-9 4-14 4s-8-4-14-4c-9 0-18 4-26 13z"
                  fill={color}
                />
                <path d="M44 56l4 14M60 50v18M76 56l-4 14" stroke={shade} strokeWidth="3.5" strokeLinecap="round" />
              </>
            )}
            {category === "specials" && (
              <>
                <circle cx="60" cy="62" r="36" fill={color} />
                <circle cx="60" cy="62" r="36" fill="none" stroke={shade} strokeWidth="3" />
                <circle cx="47" cy="52" r="4.5" fill={shade} />
                <circle cx="70" cy="48" r="4" fill={shade} />
                <circle cx="76" cy="68" r="4.5" fill={shade} />
                <circle cx="54" cy="74" r="4" fill={shade} />
                <circle cx="62" cy="62" r="3" fill={light} />
              </>
            )}
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
