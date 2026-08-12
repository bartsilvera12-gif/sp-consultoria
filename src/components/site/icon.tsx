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
