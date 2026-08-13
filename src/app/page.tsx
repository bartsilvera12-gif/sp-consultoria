import Image from "next/image";
import { ArrowRight, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow, Section, SectionHeading } from "@/components/site/primitives";
import { Icon } from "@/components/site/icon";
import {
  hero, about, values, services, method, process, diff, mv, cta, contact,
} from "@/lib/content";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ===== HERO (dark cover) ===== */}
        <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-24 pt-32 text-white sm:px-8">
          <div className="absolute inset-0 -z-10 bg-[#06130c]">
            {/* foto real: centro de operaciones / sala de control */}
            <Image src="/brand/hero-soc.jpg" alt="" fill priority className="object-cover object-center" />
            {/* velo verde para unificar con la marca */}
            <div className="absolute inset-0 bg-[#0c2a18]/45 mix-blend-multiply" />
            {/* oscurecido a la izquierda para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#06130c] via-[#06130c]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06130c]/70 via-transparent to-[#06130c]/25" />
            {/* fundido inferior hacia la siguiente seccion */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0b1d12]" />
          </div>
          <div className="mx-auto w-full max-w-[74rem]">
            <Reveal>
              <Eyebrow light>{hero.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-7 max-w-[18ch] text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                {hero.line1}<br />{hero.line2}<br />
                <span className="text-[var(--silver)]">{hero.line3}</span>
              </h1>
            </Reveal>
            <Reveal delay={170}>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{hero.sub}</p>
            </Reveal>
            <Reveal delay={250}>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href={contact.wa} target="_blank" rel="noopener" className={cn(buttonVariants(), "group h-12 gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-navy hover:bg-white/90")}>
                  {hero.cta1}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a href="#servicios" className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-white/30 bg-transparent px-7 text-[15px] font-semibold text-white hover:bg-white/10")}>
                  {hero.cta2}
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===== QUIÉNES SOMOS ===== */}
        <Section id="nosotros" tone="white" divider={false}>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow>Quiénes somos</Eyebrow>
              <h2 className="section-title mt-4 text-3xl sm:text-4xl md:text-5xl">{about.h1}<br /><span className="text-muted-foreground">{about.h2}</span></h2>
              <div className="mt-7 space-y-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                {about.paras.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <p className="mt-6 border-l-2 border-[var(--navy-2)] pl-5 text-[15px] leading-relaxed text-foreground/80">{about.quote}</p>
            </Reveal>
            <Reveal delay={140} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                <Image src="/brand/about.jpg" alt="Equipo de SP Consultoría" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/25 to-transparent" />
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ===== MISIÓN / VISIÓN ===== */}
        <Section tone="muted">
          <Reveal><Eyebrow>Nuestro propósito</Eyebrow></Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
                <span className="inline-flex w-fit rounded-full bg-[var(--navy-2)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">{mv.mission.kicker}</span>
                <p className="mt-6 leading-relaxed text-muted-foreground">{mv.mission.text}</p>
              </div>
            </Reveal>
            <Reveal delay={120} className="h-full">
              <div className="flex h-full flex-col rounded-2xl bg-[var(--navy)] p-8 text-white shadow-md sm:p-10">
                <span className="inline-flex w-fit rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white">{mv.vision.kicker}</span>
                <p className="mt-6 leading-relaxed text-white/80">{mv.vision.text}</p>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ===== VALORES ===== */}
        <Section tone="white">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
            <Reveal className="order-2 lg:order-1">
              <div className="relative aspect-[3/4] max-h-[30rem] overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                <Image src="/brand/teamwork.jpg" alt="Equipo SP" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/40 to-transparent" />
              </div>
            </Reveal>
            <div className="order-1 lg:order-2">
              <Reveal>
                <Eyebrow>Nuestros valores</Eyebrow>
                <h2 className="section-title mt-4 text-3xl sm:text-4xl md:text-[2.6rem]">Lo que sostiene cada trabajo.</h2>
              </Reveal>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {values.items.map((v, i) => (
                  <Reveal key={v.title} delay={i * 50}>
                    <div className="group flex h-full items-start gap-4 rounded-xl border border-black/5 bg-[var(--muted)] p-4 transition-all duration-300 hover:border-[var(--navy-2)]/25 hover:bg-white hover:shadow-md">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--navy-2)] font-mono text-sm font-semibold text-white">0{i + 1}</span>
                      <div>
                        <h3 className="text-[15px] font-bold text-navy">{v.title}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{v.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ===== SERVICIOS ===== */}
        <Section id="servicios" tone="muted">
          <Reveal>
            <SectionHeading eyebrow="Servicios" title={<>Cinco líneas de trabajo,<br className="hidden sm:block" /> un mismo estándar.</>} />
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{services.sub}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {services.items.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="group h-full rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--navy-2)]/8 text-navy transition-colors group-hover:bg-[var(--navy-2)] group-hover:text-white">
                      <Icon name={s.icon} className="size-6" />
                    </span>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-navy">{s.title}</h3>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {s.tags.map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-muted-foreground">
                        <span className="size-1.5 shrink-0 rounded-full bg-[var(--navy-2)]" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ===== METODOLOGÍA ===== */}
        <Section id="metodologia" tone="white">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading eyebrow="Metodología de trabajo" title="¿Cómo trabajamos?" />
              <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">{method.text}</p>
              <div className="relative mt-10 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                <Image
                  src="/brand/handshake.jpg"
                  alt="Acompañamiento profesional de SP Consultoría"
                  width={880}
                  height={560}
                  className="h-60 w-full object-cover sm:h-72"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--navy)]/70 via-[var(--navy)]/10 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                <span className="absolute bottom-4 left-5 text-sm font-semibold tracking-tight text-white/95">
                  Confianza, método y confidencialidad
                </span>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <span className="inline-flex rounded-full bg-[var(--navy-2)] px-5 py-2 text-sm font-semibold text-white">Estándares de referencia</span>
              <div className="mt-7 space-y-4">
                {method.standards.map((st) => (
                  <div key={st.code} className="flex items-start gap-4 border-b border-black/5 pb-4 last:border-b-0">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--navy-2)]" />
                    <div>
                      <span className="font-bold text-navy">{st.code}</span>
                      <span className="text-muted-foreground"> — {st.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ===== DIFERENCIALES ===== */}
        <Section tone="muted">
          <Reveal>
            <SectionHeading eyebrow="Por qué elegirnos" title="Nuestros diferenciales" />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {diff.items.map((d, i) => (
              <Reveal key={d.title} delay={i * 50}>
                <div className="group flex h-full items-center gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--navy-2)]/8 text-navy transition-colors group-hover:bg-[var(--navy-2)] group-hover:text-white">
                    <Icon name={d.icon} className="size-5" />
                  </span>
                  <h3 className="text-[15px] font-bold text-navy">{d.title}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ===== PROCESO ===== */}
        <Section id="proceso" tone="white">
          <Reveal>
            <SectionHeading eyebrow="Proceso de trabajo" title="Un proceso estructurado." />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {process.phases.map((p, i) => (
              <Reveal key={p.title} delay={i * 60}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-black/5 bg-[var(--muted)] p-7 sm:p-8">
                  <span className="pointer-events-none absolute -right-2 -top-4 select-none text-7xl font-extrabold text-[var(--navy-2)]/[0.06]">0{i + 1}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--navy-2)]">Fase 0{i + 1}</span>
                  <h3 className="mt-3 text-xl font-bold text-navy">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ===== CONTACTO (navy CTA) ===== */}
        <Section
          id="contacto"
          tone="navy"
          divider={false}
          className="overflow-hidden [background-image:linear-gradient(135deg,#1f7a33_0%,#145a26_46%,#0b3016_100%)]"
        >
          {/* glows para dar vida */}
          <div className="pointer-events-none absolute -left-32 -top-28 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(46,196,84,0.30),transparent_65%)]" />
          <div className="pointer-events-none absolute -bottom-32 -right-24 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(32,182,62,0.22),transparent_68%)]" />
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <Eyebrow light>{cta.eyebrow}</Eyebrow>
              <h2 className="mt-5 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{cta.h}</h2>
              <p className="mt-5 leading-relaxed text-white/75">{cta.sub}</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-9 flex flex-col items-center gap-3">
                <a href={contact.wa} target="_blank" rel="noopener" className={cn(buttonVariants(), "h-12 gap-2 rounded-full bg-white px-8 text-[15px] font-semibold text-navy hover:bg-white/90")}>
                  <MessageCircle className="size-5" /> {cta.button}
                </a>
                <span className="text-sm text-white/65">{cta.note}</span>
              </div>
            </Reveal>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { Ic: Phone, label: "Teléfono", value: contact.phone, href: `tel:${contact.phoneRaw}`, ext: false },
              { Ic: Mail, label: "Correo", value: contact.email, href: `mailto:${contact.email}`, ext: false },
              { Ic: MapPin, label: "Ubicación", value: contact.place, href: contact.maps, ext: true },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 60} className="h-full">
                <a
                  href={c.href}
                  {...(c.ext ? { target: "_blank", rel: "noopener" } : {})}
                  className="flex h-full items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.06] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/12 text-white">
                    <c.Ic className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{c.label}</span>
                    <span className="mt-1 block break-words font-semibold leading-snug text-white">{c.value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
