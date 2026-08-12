import Image from "next/image";
import { ArrowRight, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow, Section, Divider } from "@/components/site/primitives";
import { Icon } from "@/components/site/icon";
import {
  hero, about, values, services, feature, method, process, diff, mv, cta, contact,
} from "@/lib/content";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-24 pt-32 sm:px-8">
          <div className="absolute inset-0 -z-10">
            <Image src="/brand/hero.jpg" alt="" fill priority className="object-cover object-right opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1830] via-[#0a1830]/85 to-[#0a1830]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1830] via-transparent to-[#0a1830]/50" />
          </div>
          <div className="mx-auto w-full max-w-[76rem]">
            <Reveal><Eyebrow>{hero.eyebrow}</Eyebrow></Reveal>
            <Reveal delay={90}>
              <h1 className="mt-7 max-w-[15ch] text-balance text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
                <span className="block">{hero.line1}</span>
                <span className="block">{hero.line2}</span>
                <span className="block bg-gradient-to-r from-primary to-[var(--silver)] bg-clip-text text-transparent">{hero.line3}</span>
              </h1>
            </Reveal>
            <Reveal delay={170}>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{hero.sub}</p>
            </Reveal>
            <Reveal delay={250}>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href={contact.wa} target="_blank" rel="noopener" className={cn(buttonVariants(), "group h-12 gap-2 rounded-full px-7 text-[15px] font-semibold")}>
                  {hero.cta1}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a href="#servicios" className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-white/20 bg-transparent px-7 text-[15px] font-semibold hover:bg-white/5")}>
                  {hero.cta2}
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ABOUT */}
        <Section id="nosotros" divider={false}>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Eyebrow>{about.eyebrow}</Eyebrow>
              <h2 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                {about.h1}
                <br />
                <span className="text-muted-foreground">{about.h2}</span>
              </h2>
            </Reveal>
            <Reveal delay={120} className="relative">
              <span className="pointer-events-none absolute -top-12 right-0 select-none text-[8rem] font-bold leading-none text-white/[0.04]">01</span>
              <div className="relative space-y-6 text-[15px] leading-relaxed text-foreground/85 sm:text-base">
                {about.paras.map((p, i) => <p key={i}>{p}</p>)}
                <p className="border-l-2 border-primary/60 pl-5 text-muted-foreground">{about.quote}</p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* VALUES */}
        <Section>
          <Reveal><Eyebrow>{values.eyebrow}</Eyebrow></Reveal>
          <div className="mt-12 border-y border-white/10">
            {values.items.map((v, i) => (
              <Reveal key={v.title} delay={i * 40}>
                <div className="grid items-baseline gap-3 border-b border-white/10 py-7 last:border-b-0 sm:grid-cols-[3.5rem_1fr] sm:gap-8">
                  <span className="font-mono text-sm tabular-nums text-primary">0{i + 1}</span>
                  <div className="grid items-baseline gap-2 sm:grid-cols-[minmax(0,1fr)_1.25fr] sm:gap-10">
                    <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{v.title}</h3>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* SERVICES */}
        <Section id="servicios">
          <Reveal>
            <Eyebrow>{services.eyebrow}</Eyebrow>
            <h2 className="mt-6 max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">{services.title}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{services.sub}</p>
          </Reveal>
          <div className="mt-14 border-t border-white/10">
            {services.items.map((s, i) => (
              <Reveal key={s.title} delay={i * 40}>
                <div className="grid gap-6 border-b border-white/10 py-9 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
                  <div className="flex items-center gap-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                      <Icon name={s.icon} className="size-6" />
                    </span>
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-sm tabular-nums text-muted-foreground">0{i + 1}</span>
                      <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5 lg:justify-end">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] text-foreground/85">{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* FEATURE QUOTE */}
        <section className="relative my-6 overflow-hidden px-5 sm:px-8">
          <div className="absolute inset-0 -z-10">
            <Image src="/brand/feature.jpg" alt="" fill className="object-cover opacity-55" />
            <div className="absolute inset-0 bg-[#070f22]/75" />
          </div>
          <div className="mx-auto max-w-3xl py-28 text-center sm:py-36">
            <Reveal>
              <span className="mx-auto block h-10 w-px bg-gradient-to-b from-primary to-transparent" />
              <p className="mt-8 text-balance text-2xl font-medium leading-snug tracking-tight sm:text-4xl">
                &ldquo;{feature.quote}&rdquo;
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {feature.pillars.map((p, i) => (
                  <span key={p} className="flex items-center gap-4">
                    {i > 0 && <span className="size-1 rounded-full bg-primary/60" />}
                    {p}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* METHOD */}
        <Section id="metodologia" divider={false}>
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <Eyebrow>{method.eyebrow}</Eyebrow>
              <h2 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{method.title}</h2>
              <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">{method.text}</p>
              <div className="mt-10 border-y border-white/10">
                {method.standards.map((st) => (
                  <div key={st.code} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-white/10 py-4 last:border-b-0">
                    <span className="font-semibold tracking-wide text-[var(--silver)]">{st.code}</span>
                    <span className="text-sm text-muted-foreground">{st.name}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120} className="flex justify-center">
              <div className="glass relative grid size-72 place-items-center rounded-full sm:size-80">
                <div className="absolute inset-6 rounded-full border border-white/10" />
                <div className="absolute size-40 rounded-full bg-primary/15 blur-3xl" />
                <Image src="/brand/logo-crest.png" alt="SP Consultoría" width={220} height={120} className="relative h-auto w-40" />
              </div>
            </Reveal>
          </div>
        </Section>

        {/* PROCESS */}
        <Section id="proceso">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <Eyebrow>{process.eyebrow}</Eyebrow>
              <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-5xl">{process.title}</h2>
            </Reveal>
            <div>
              {process.phases.map((p, i) => (
                <Reveal key={p.title} delay={i * 60}>
                  <div className="grid gap-4 border-t border-white/10 py-8 sm:grid-cols-[6rem_1fr] sm:gap-8">
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">Fase 0{i + 1}</span>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{p.title}</h3>
                      <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* DIFFERENTIALS */}
        <Section>
          <Reveal>
            <Eyebrow>{diff.eyebrow}</Eyebrow>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">{diff.title}</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {diff.items.map((d, i) => (
              <Reveal key={d.title} delay={i * 50}>
                <div className="group glass relative h-full overflow-hidden rounded-2xl p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40">
                  <span className="absolute right-5 top-5 font-mono text-xs tabular-nums text-muted-foreground/60">0{i + 1}</span>
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
                    <Icon name={d.icon} className="size-6" />
                  </span>
                  <h3 className="mt-8 text-lg font-semibold tracking-tight">{d.title}</h3>
                  <span className="mt-4 block h-px w-10 bg-primary/50 transition-all duration-500 group-hover:w-full" />
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* MISSION / VISION */}
        <Section>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <div className="glass flex h-full flex-col rounded-3xl p-9 sm:p-11">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-primary">01</span>
                  <span className="h-px w-8 bg-white/20" />
                  <span className="eyebrow">{mv.mission.kicker}</span>
                </div>
                <p className="mt-7 leading-relaxed text-foreground/90">{mv.mission.text}</p>
              </div>
            </Reveal>
            <Reveal delay={120} className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/20 to-primary/[0.05] p-9 sm:p-11">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-[var(--silver)]">02</span>
                  <span className="h-px w-8 bg-white/25" />
                  <span className="eyebrow">{mv.vision.kicker}</span>
                </div>
                <p className="mt-7 leading-relaxed text-foreground/90">{mv.vision.text}</p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contacto">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <div className="flex justify-center"><Eyebrow>{cta.eyebrow}</Eyebrow></div>
              <h2 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{cta.h}</h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">{cta.sub}</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-9 flex flex-col items-center gap-3">
                <a href={contact.wa} target="_blank" rel="noopener" className={cn(buttonVariants(), "h-12 gap-2 rounded-full px-8 text-[15px] font-semibold")}>
                  <MessageCircle className="size-5" /> {cta.button}
                </a>
                <span className="text-sm text-muted-foreground">{cta.note}</span>
              </div>
            </Reveal>
          </div>
          <div className="mt-16 grid gap-5 sm:grid-cols-3">
            {[
              { Ic: Phone, label: "Teléfono", value: contact.phone, href: `tel:${contact.phoneRaw}`, ext: false },
              { Ic: Mail, label: "Correo", value: contact.email, href: `mailto:${contact.email}`, ext: false },
              { Ic: MapPin, label: "Ubicación", value: contact.place, href: contact.maps, ext: true },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 60} className="h-full">
                <a
                  href={c.href}
                  {...(c.ext ? { target: "_blank", rel: "noopener" } : {})}
                  className="glass group flex h-full items-center gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                    <c.Ic className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.label}</span>
                    <span className="mt-1 block truncate font-semibold">{c.value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Section>

        <div className="px-5 sm:px-8"><div className="mx-auto max-w-[76rem]"><Divider /></div></div>
      </main>
      <Footer />
    </>
  );
}
