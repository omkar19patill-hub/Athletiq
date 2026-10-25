import React from 'react';
import logoSrc from '../public/Logo/Logo.png';

// Official ATHLETIQ logo (src/public/Logo/Logo.png, 1774×887, dark background #0D0C0D).
// We never redraw or stretch it: the image keeps its native aspect ratio and the
// wrapper only clips away the empty background margin around the artwork.
//   full → "A" mark + ATHLETIQ wordmark + tagline (artwork bounds x 417–1361, y 118–787)
//   mark → the "A" mark only (bounds x 534–1297, y 118–534)
// Offsets are percentages of the wrapper width, so the crop scales with any size.
const CROPS = {
  full: { box: [387, 88, 1005, 730] },
  mark: { box: [514, 98, 804, 457] },
};
const SRC_W = 1774;

export const BrandLogo = ({ variant = 'full', className = '', alt = 'ATHLETIQ — Play More. Plan Less.' }) => {
  const [x, y, w, h] = CROPS[variant].box;
  return (
    <span
      className={`relative block shrink-0 overflow-hidden bg-[#0D0C0D] ${className}`}
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      <img
        src={logoSrc}
        alt={alt}
        draggable="false"
        decoding="async"
        className="block h-auto select-none"
        style={{
          width: `${(SRC_W / w) * 100}%`,
          maxWidth: 'none',
          marginLeft: `${(-x / w) * 100}%`,
          marginTop: `${(-y / w) * 100}%`,
        }}
      />
    </span>
  );
};
