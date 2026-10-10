import { useId } from "react";

// Avatar ilustrado y personalizable. Cada rasgo sale de `members.json` (campo `avatar`),
// así que se puede cambiar desde el contenido sin tocar el dibujo.
export type AvatarTraits = {
  skin: string;
  shade: string;
  hair: string;
  style: string;
  beard: boolean;
  glasses: boolean;
  shirt: string;
  bg: string;
};

export function Avatar({
  traits: p,
  label,
  className,
  ...svg
}: {
  traits: AvatarTraits;
  label: string;
  className?: string;
} & Omit<React.SVGProps<SVGSVGElement>, "viewBox">) {
  const clip = useId();
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label} className={className} {...svg}>
      <defs>
        <clipPath id={clip}>
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="200" height="200" fill={p.bg} />
        {p.style === "long" && (
          <path
            d="M44 104 C34 50 68 20 100 20 C132 20 166 50 156 104 L162 160 L140 134 L60 134 L38 160Z"
            fill={p.hair}
          />
        )}
        <rect x="84" y="118" width="32" height="40" fill={p.shade} />
        <path d="M14 210 Q22 156 76 148 Q100 170 124 148 Q178 156 186 210Z" fill={p.shirt} />
        <ellipse cx="55" cy="96" rx="9" ry="13" fill={p.skin} />
        <ellipse cx="145" cy="96" rx="9" ry="13" fill={p.skin} />
        <path
          d="M55 86 C55 48 145 48 145 86 C145 122 124 148 100 148 C76 148 55 122 55 86Z"
          fill={p.skin}
        />
        {p.style === "quiff" ? (
          <>
            <path
              d="M52 92 C42 46 70 20 104 22 C140 22 160 50 148 92 C146 74 138 62 124 58 C112 54 96 56 82 60 C68 64 58 76 52 92Z"
              fill={p.hair}
            />
            <path d="M76 46 C82 22 116 12 138 30 C122 26 108 32 102 46Z" fill={p.hair} />
            <path
              d="M96 34 C108 28 122 28 130 34"
              stroke="#fff"
              strokeOpacity=".18"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <path
            d="M52 92 C46 48 76 28 100 28 C126 28 156 48 148 92 C142 68 126 60 100 60 C76 60 58 68 52 92Z"
            fill={p.hair}
          />
        )}
        {p.beard && (
          <path
            d="M56 100 C58 142 80 152 100 152 C120 152 142 142 144 100 C138 124 122 130 100 130 C78 130 62 124 56 100Z"
            fill={p.hair}
          />
        )}
        <path
          d="M70 80 Q81 73 92 79 M108 79 Q119 73 130 80"
          stroke={p.hair}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="81" cy="94" rx="5" ry="6.2" fill="#1a1412" />
        <ellipse cx="119" cy="94" rx="5" ry="6.2" fill="#1a1412" />
        <circle cx="83" cy="92" r="1.8" fill="#fff" />
        <circle cx="121" cy="92" r="1.8" fill="#fff" />
        {p.glasses && (
          <g fill="none" stroke="#2a150d" strokeWidth="3.5">
            <circle cx="81" cy="94" r="15" />
            <circle cx="119" cy="94" r="15" />
            <path d="M96 94h8" />
          </g>
        )}
        <path
          d="M100 98 Q96 112 102 114"
          stroke={p.shade}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M82 123 Q100 140 118 123Z"
          fill="#fff"
          stroke="#8a4a3a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="72" cy="112" r="8" fill="#e57a6a" opacity=".22" />
        <circle cx="128" cy="112" r="8" fill="#e57a6a" opacity=".22" />
      </g>
    </svg>
  );
}
