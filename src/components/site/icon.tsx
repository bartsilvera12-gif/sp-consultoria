import {
  Target,
  Activity,
  ShieldCheck,
  GraduationCap,
  Search,
  Award,
  Globe,
  Lock,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  target: Target,
  activity: Activity,
  shield: ShieldCheck,
  graduation: GraduationCap,
  search: Search,
  award: Award,
  globe: Globe,
  lock: Lock,
  sliders: SlidersHorizontal,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = map[name] ?? ShieldCheck;
  return <Cmp className={className} strokeWidth={1.6} />;
}

// Íconos propios para las categorías de productos (SVG line, estilo lucide).
// Definidos a mano porque esta versión de lucide no exporta varios de ellos.
const catPaths: Record<string, React.ReactNode> = {
  video: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="8" r="2" />
      <path d="M9 13h6M9 16.5h6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M3 12h18" />
      <circle cx="12" cy="9" r="2" />
    </>
  ),
  "camera-hd": (
    <>
      <rect x="3" y="7.5" width="14" height="7" rx="3.5" />
      <circle cx="7" cy="11" r="1.7" />
      <path d="M17 11h2M11.5 14.5v3.5M8.5 18h6" />
    </>
  ),
  ptz: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
    </>
  ),
  access: (
    <>
      <path d="M5 21V8.5" />
      <circle cx="5" cy="7" r="1.6" />
      <path d="M6.5 6.4 20 4.5" />
      <path d="M3 21h5" />
    </>
  ),
  alarm: (
    <>
      <path d="M6 16h12l-1.6-2.2V10a4.4 4.4 0 0 0-8.8 0v3.8z" />
      <path d="M10.4 19a1.6 1.6 0 0 0 3.2 0" />
    </>
  ),
  network: (
    <>
      <rect x="3" y="4" width="18" height="7" rx="1.6" />
      <rect x="3" y="13" width="18" height="7" rx="1.6" />
      <path d="M11 7.5h6M11 16.5h6" />
      <circle cx="7" cy="7.5" r="0.9" />
      <circle cx="7" cy="16.5" r="0.9" />
    </>
  ),
};

export function CatIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {catPaths[name] ?? catPaths.camera}
    </svg>
  );
}
