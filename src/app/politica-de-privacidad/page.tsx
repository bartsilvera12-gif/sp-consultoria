import type { Metadata } from "next";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { contact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Política de Privacidad — SP Consultoría, Estrategia y Seguridad",
  description:
    "Política de privacidad y tratamiento de datos personales de SP Consultoría, Estrategia y Seguridad.",
  robots: { index: false, follow: false },
};

const UPDATED = "13 de agosto de 2026";

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-28">
      <h2 className="flex items-baseline gap-3 text-xl font-bold text-navy sm:text-2xl">
        <span className="text-sm font-bold text-[var(--navy-2)]">{String(n).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PoliticaDePrivacidad() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Encabezado */}
        <section className="relative overflow-hidden bg-[var(--navy)] px-5 pb-16 pt-32 text-white sm:px-8 sm:pt-36">
          <div className="pointer-events-none absolute -right-[15%] -top-[30%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(65,90,119,0.38),transparent_62%)]" />
          <div className="relative mx-auto max-w-[52rem]">
            <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-white/80">
              <span className="h-px w-7 bg-white/50" /> Legal
            </span>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
              Política de Privacidad
            </h1>
            <p className="mt-4 text-white/70">Última actualización: {UPDATED}</p>
          </div>
        </section>

        {/* Contenido */}
        <section className="bg-gradient-to-b from-white to-[#f6f8fb] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[52rem] space-y-10">
            <p className="leading-relaxed text-muted-foreground">
              En <strong className="text-navy">SP Consultoría, Estrategia y Seguridad</strong> valoramos y
              respetamos tu privacidad. Esta política describe qué datos personales tratamos, con qué
              finalidad, en qué nos basamos para hacerlo y cuáles son tus derechos. Al utilizar este sitio y
              contactarnos, aceptás las prácticas descritas a continuación.
            </p>

            <Block n={1} title="Responsable del tratamiento">
              <p>
                El responsable del tratamiento de tus datos es SP Consultoría, Estrategia y Seguridad, con
                domicilio en {contact.place}.
              </p>
              <ul className="space-y-1">
                <li>Correo: <a className="font-medium text-[var(--navy-2)] hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a></li>
                <li>Teléfono: <a className="font-medium text-[var(--navy-2)] hover:underline" href={`tel:${contact.phoneRaw}`}>{contact.phone}</a></li>
              </ul>
            </Block>

            <Block n={2} title="Datos que recopilamos">
              <p>Tratamos únicamente los datos que nos proporcionás de forma voluntaria, principalmente cuando te comunicás con nosotros. Estos pueden incluir:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Nombre y apellido.</li>
                <li>Datos de contacto (teléfono, correo electrónico).</li>
                <li>El contenido del mensaje o consulta que nos envíes (por ejemplo, vía WhatsApp o correo).</li>
                <li>Datos técnicos básicos de navegación que el servidor registra de forma estándar (como la dirección IP), con fines de seguridad y funcionamiento del sitio.</li>
              </ul>
              <p>No solicitamos ni tratamos datos sensibles a través de este sitio.</p>
            </Block>

            <Block n={3} title="Finalidad del tratamiento">
              <p>Utilizamos tus datos personales para:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Responder tus consultas y solicitudes de información o de servicios.</li>
                <li>Gestionar la relación profesional y elaborar propuestas o presupuestos.</li>
                <li>Garantizar la seguridad y el correcto funcionamiento del sitio.</li>
                <li>Cumplir con obligaciones legales que resulten aplicables.</li>
              </ul>
            </Block>

            <Block n={4} title="Base legal y consentimiento">
              <p>
                El tratamiento de tus datos se basa en el consentimiento que otorgás al contactarnos, en la
                necesidad de gestionar una relación precontractual o contractual, y en nuestro interés legítimo
                de operar el sitio de forma segura. Podés retirar tu consentimiento en cualquier momento.
              </p>
            </Block>

            <Block n={5} title="Conservación de los datos">
              <p>
                Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades
                indicadas y, posteriormente, durante los plazos exigidos por la normativa aplicable. Cuando
                dejen de ser necesarios, serán eliminados de forma segura.
              </p>
            </Block>

            <Block n={6} title="Compartir datos con terceros">
              <p>
                No vendemos ni cedemos tus datos personales a terceros. Solo podríamos compartirlos con
                proveedores que nos prestan servicios (por ejemplo, alojamiento del sitio y plataformas de
                mensajería como WhatsApp) en la medida estrictamente necesaria, o cuando exista una obligación
                legal de hacerlo. Estas comunicaciones pueden implicar el tratamiento de datos por parte de
                dichos proveedores conforme a sus propias políticas.
              </p>
            </Block>

            <Block n={7} title="Cookies y tecnologías similares">
              <p>
                Este sitio es de carácter informativo y no utiliza cookies de seguimiento ni de publicidad con
                fines de perfilado. En caso de incorporar herramientas de medición o de terceros en el futuro,
                actualizaremos esta política y, cuando corresponda, solicitaremos tu consentimiento.
              </p>
            </Block>

            <Block n={8} title="Seguridad de la información">
              <p>
                Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos
                no autorizados, pérdida o alteración. Sin embargo, ningún medio de transmisión por Internet es
                completamente infalible, por lo que no podemos garantizar una seguridad absoluta.
              </p>
            </Block>

            <Block n={9} title="Tus derechos">
              <p>
                Como titular de los datos, podés ejercer tus derechos de acceso, rectificación, actualización y
                supresión de tu información personal, así como oponerte a su tratamiento, de conformidad con la
                normativa vigente en la República del Paraguay (incluida la garantía constitucional de hábeas
                data, artículo 135 de la Constitución Nacional).
              </p>
              <p>
                Para ejercerlos, escribinos a{" "}
                <a className="font-medium text-[var(--navy-2)] hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>. Responderemos tu solicitud en un plazo razonable.
              </p>
            </Block>

            <Block n={10} title="Menores de edad">
              <p>
                Nuestros servicios y este sitio están dirigidos a personas mayores de edad. No recopilamos de
                forma intencionada datos de menores; si detectamos que hemos recibido datos de un menor sin la
                debida autorización, los eliminaremos.
              </p>
            </Block>

            <Block n={11} title="Cambios en esta política">
              <p>
                Podemos actualizar esta Política de Privacidad para reflejar cambios legales o en nuestras
                prácticas. La versión vigente será siempre la publicada en esta página, con su fecha de última
                actualización.
              </p>
            </Block>

            <Block n={12} title="Contacto">
              <p>
                Si tenés preguntas sobre esta política o sobre el tratamiento de tus datos, contactanos:
              </p>
              <ul className="space-y-1">
                <li>Correo: <a className="font-medium text-[var(--navy-2)] hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a></li>
                <li>Teléfono: <a className="font-medium text-[var(--navy-2)] hover:underline" href={`tel:${contact.phoneRaw}`}>{contact.phone}</a></li>
                <li>Dirección: {contact.place}</li>
              </ul>
            </Block>

            <div className="border-t border-black/10 pt-8">
              <a href="/" className="text-sm font-semibold text-[var(--navy-2)] hover:underline">← Volver al inicio</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
