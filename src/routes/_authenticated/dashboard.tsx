import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { issueVacciCheckToken } from "@/lib/vaccicheck.functions";
import { Activity, Baby, Bug, Car, ClipboardList, Clock, Compass, Download, ExternalLink, FileText, GitBranch, Globe, HeartPulse, Lock, LockOpen, Luggage, MapPin, Mountain, Pill, Plane, BookOpen, Ruler, Search, ShieldCheck, Stethoscope, Sun, Syringe, Toilet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMyAdminStatus } from "@/lib/admin.functions";
import diarrheePdf from "@/assets/diarrhee-du-voyage.pdf.asset.json";
import altitudeScalePdf from "@/assets/echelle-du-lac-louise.pdf.asset.json";
import insectesPdf from "@/assets/les-piqures-d-insectes.pdf.asset.json";
import bagagesPdf from "@/assets/liste-de-bagages.pdf.asset.json";
import solairePdf from "@/assets/protection-solaire.pdf.asset.json";
import malariaPdf from "@/assets/le-paludisme-malaria.pdf.asset.json";
import montagnePdf from "@/assets/sejour-en-altitude-mal-des-montagnes.pdf.asset.json";
import hepatiteBPdf from "@/assets/l-hepatite-b.pdf.asset.json";
import hepatiteAPdf from "@/assets/l-hepatite-a.pdf.asset.json";
import zikaPdf from "@/assets/le-virus-zika.pdf.asset.json";
import typhoidePdf from "@/assets/la-typhoide.pdf.asset.json";
import ragePdf from "@/assets/la-rage.pdf.asset.json";
import poliomyelitePdf from "@/assets/la-poliomyelite.pdf.asset.json";
import pestePdf from "@/assets/la-peste.pdf.asset.json";
import transportsPdf from "@/assets/le-mal-des-transports.pdf.asset.json";
import fievreJaunePdf from "@/assets/la-fievre-jaune.pdf.asset.json";
import denguePdf from "@/assets/la-fievre-dengue.pdf.asset.json";
import encephalitePdf from "@/assets/l-encephalite-japonaise.pdf.asset.json";
import choleraPdf from "@/assets/le-cholera.pdf.asset.json";
import chikungunyaPdf from "@/assets/chikungunya.pdf.asset.json";
import grossessePdf from "@/assets/voyager-grossesse.pdf.asset.json";
import decalagePdf from "@/assets/le-decalage-horaire.pdf.asset.json";
import planificationPdf from "@/assets/planification-voyage-prudence-sante.pdf.asset.json";
import avionPdf from "@/assets/le-transport-en-avion.pdf.asset.json";
import feuilletsCombinesPdf from "@/assets/feuillets-essentiels-combines.pdf.asset.json";
import appsqPaludismePdf from "@/assets/appsq-prophylaxie-paludisme.pdf.asset.json";
import appsqDiarrheePdf from "@/assets/appsq-diarrhee-voyageur.pdf.asset.json";
import appsqMontagnesPdf from "@/assets/appsq-mal-aigu-montagnes.pdf.asset.json";
import abcpqPaludismePng from "@/assets/abcpq-prophylaxie-paludisme.png.asset.json";
import abcpqMontagnesPng from "@/assets/abcpq-mal-aigu-montagnes.png.asset.json";
import abcpqDiarrheePng from "@/assets/abcpq-diarrhee-voyageur.png.asset.json";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Accueil — ConseilSV" },
      { name: "description", content: "Accès rapide à VacciCheck, RxVigilance et aux ressources de santé voyage." },
    ],
  }),
  component: Dashboard,
});

// Assets are hosted on Lovable CDN; prepend absolute host so PDFs/PNGs resolve
// when the site is served from Netlify (or any non-Lovable host).
const ASSET_CDN = "https://conseilsv.lovable.app";
const cdn = (path: string) => (path.startsWith("http") ? path : `${ASSET_CDN}${path}`);

type Resource =
  | { kind: "external"; href: string; title: string; desc: string; badge: string; iconClass: string; logo?: string; icon?: React.ComponentType<{ className?: string }> }
  | { kind: "vaccicheck"; title: string; desc: string; badge: string; iconClass: string; icon: React.ComponentType<{ className?: string }> }
  | { kind: "toggle"; toggle: "rx" | "appsq" | "abcpq"; title: string; desc: string; badge: string; iconClass: string; logo?: string; icon?: React.ComponentType<{ className?: string }> };

const resources: readonly Resource[] = [
  { kind: "vaccicheck", title: "VacciCheck", desc: "Outil d'aide à la décision vaccinale. Réservé aux abonnés payants ConseilSV.", icon: Syringe, badge: "Abonnement payant", iconClass: "bg-gradient-vaccicheck" },
  { kind: "toggle", toggle: "rx", title: "RxVigilance", desc: "Formulaires PDF pratiques pour vos conseils aux voyageurs.", icon: Pill, badge: "Formulaires PDF", iconClass: "bg-gradient-rx" },
  { kind: "external", href: "https://msss.gouv.qc.ca/professionnels/vaccination/piq-vaccins/", title: "PIQ — Protocole d'immunisation", desc: "Protocole d'immunisation du Québec, ministère de la Santé.", icon: BookOpen, badge: "MSSS", iconClass: "bg-gradient-piq" },
  { kind: "external", href: "https://faius.santepublique.rtss.qc.ca/", title: "Registre de vaccination", desc: "Registre de vaccination du Québec. Seulement accessible sur un poste de travail configuré pour l'accès au DSQ (Visualiseur DSQ ou Visualiseur Cristal Net).", icon: ShieldCheck, badge: "Québec", iconClass: "bg-gradient-registre" },
  { kind: "external", href: "https://www.inspq.qc.ca/sante-voyage/guide/pays", title: "INSPQ — Santé voyage", desc: "Guide d'intervention santé voyage : recommandations vaccinales par pays.", icon: Plane, badge: "Référence officielle", iconClass: "bg-gradient-inspq" },
  { kind: "external", href: "https://wwwnc.cdc.gov/travel/destinations/list", title: "CDC — Travel Health", desc: "Recommandations santé voyage par destination des Centers for Disease Control.", icon: Globe, badge: "International", iconClass: "bg-gradient-cdc" },
  { kind: "external", href: "https://voyage.gc.ca/", title: "Gouvernement du Canada — Voyage et tourisme", desc: "Conseils aux voyageurs et avertissements du gouvernement du Canada.", icon: MapPin, badge: "Canada", iconClass: "bg-gradient-canada" },
  { kind: "external", href: "https://www.who.int/travel-advice", title: "OMS — Travel Advice", desc: "Conseils aux voyageurs de l'Organisation mondiale de la Santé.", icon: HeartPulse, badge: "International", iconClass: "bg-gradient-oms" },
  { kind: "external", href: "https://travelhealthpro.org.uk/countries", title: "NaTHNaC — TravelHealthPro", desc: "Recommandations santé voyage par pays (Royaume-Uni).", icon: Compass, badge: "Royaume-Uni", iconClass: "bg-gradient-nathnac" },
  { kind: "external", href: "https://www.openevidence.com/", title: "OpenEvidence", desc: "Moteur de recherche médical basé sur les données probantes.", icon: Search, badge: "Recherche clinique", iconClass: "bg-gradient-openevidence" },
  { kind: "toggle", toggle: "appsq", title: "APPSQ", desc: "Outils cliniques de l'APPSQ pour la santé voyage.", icon: Stethoscope, badge: "Formulaires PDF", iconClass: "bg-gradient-appsq" },
  { kind: "toggle", toggle: "abcpq", title: "ABCPQ", desc: "Algorithmes d'aide à la décision de l'ABCPQ.", icon: GitBranch, badge: "Algorithmes", iconClass: "bg-gradient-abcpq" },
];

const rxForms = [
  { title: "Feuillets essentiels (combiné imprimable)", asset: cdn(feuilletsCombinesPdf.url), icon: ClipboardList },
  { title: "Diarrhée du voyage", asset: cdn(diarrheePdf.url), icon: Toilet },
  { title: "Échelle du Lac Louise", asset: cdn(altitudeScalePdf.url), icon: Ruler },
  { title: "Les piqûres d'insectes", asset: cdn(insectesPdf.url), icon: Bug },
  { title: "Liste de bagages", asset: cdn(bagagesPdf.url), icon: Luggage },
  { title: "Protection solaire", asset: cdn(solairePdf.url), icon: Sun },
  { title: "Le paludisme (malaria)", asset: cdn(malariaPdf.url), icon: Bug },
  { title: "Séjour en altitude — le mal des montagnes", asset: cdn(montagnePdf.url), icon: Mountain },
  { title: "L’hépatite B", asset: cdn(hepatiteBPdf.url), icon: Syringe },
  { title: "L’hépatite A", asset: cdn(hepatiteAPdf.url), icon: Syringe },
  { title: "Le virus Zika", asset: cdn(zikaPdf.url), icon: Bug },
  { title: "La typhoïde", asset: cdn(typhoidePdf.url), icon: Syringe },
  { title: "La rage", asset: cdn(ragePdf.url), icon: Syringe },
  { title: "La poliomyélite", asset: cdn(poliomyelitePdf.url), icon: Syringe },
  { title: "La peste", asset: cdn(pestePdf.url), icon: Bug },
  { title: "Le mal des transports", asset: cdn(transportsPdf.url), icon: Car },
  { title: "La fièvre jaune", asset: cdn(fievreJaunePdf.url), icon: Syringe },
  { title: "La fièvre dengue", asset: cdn(denguePdf.url), icon: Bug },
  { title: "L’encéphalite japonaise", asset: cdn(encephalitePdf.url), icon: Syringe },
  { title: "Le choléra", asset: cdn(choleraPdf.url), icon: Syringe },
  { title: "Chikungunya", asset: cdn(chikungunyaPdf.url), icon: Bug },
  { title: "Voyager durant la grossesse", asset: cdn(grossessePdf.url), icon: Baby },
  { title: "Le décalage horaire", asset: cdn(decalagePdf.url), icon: Clock },
  { title: "Planification voyage — prudence santé", asset: cdn(planificationPdf.url), icon: ClipboardList },
  { title: "Le transport en avion", asset: cdn(avionPdf.url), icon: Plane },
] as const;

const appsqForms = [
  { title: "Prophylaxie du paludisme", asset: cdn(appsqPaludismePdf.url), icon: Bug },
  { title: "Diarrhée du voyageur", asset: cdn(appsqDiarrheePdf.url), icon: Toilet },
  { title: "Prophylaxie du mal aigu des montagnes", asset: cdn(appsqMontagnesPdf.url), icon: Mountain },
] as const;

const abcpqAlgos = [
  { title: "Prophylaxie du paludisme", asset: cdn(abcpqPaludismePng.url), icon: Bug },
  { title: "Prophylaxie du mal aigu des montagnes", asset: cdn(abcpqMontagnesPng.url), icon: Mountain },
  { title: "Diarrhée du voyageur", asset: cdn(abcpqDiarrheePng.url), icon: Toilet },
] as const;

function Dashboard() {
  const [openSection, setOpenSection] = useState<null | "rx" | "appsq" | "abcpq">(null);
  const [openingVC, setOpeningVC] = useState(false);
  const issueToken = useServerFn(issueVacciCheckToken);
  const fetchAccess = useServerFn(getMyAdminStatus);
  const { data: access } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => fetchAccess(),
    staleTime: 60_000,
  });
  const hasVacciCheckAccess = !!access?.hasVacciCheckAccess;

  const toggle = (key: "rx" | "appsq" | "abcpq") =>
    setOpenSection((prev) => (prev === key ? null : key));

  const openVacciCheck = async () => {
    if (openingVC) return;
    setOpeningVC(true);
    // Open a controlled blank tab synchronously so pop-up blockers don't fire.
    // Avoid the "noopener" feature here because some browsers return null and leave
    // an unreachable about:blank tab behind.
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Impossible d'ouvrir VacciCheck. Autorisez les fenêtres contextuelles puis réessayez.");
      setOpeningVC(false);
      return;
    }

    win.document.title = "Ouverture de VacciCheck…";
    win.document.body.innerHTML = '<p style="font-family:system-ui;margin:24px;color:#334155">Ouverture de VacciCheck…</p>';
    try {
      const { token } = await issueToken();
      const url = `https://vaccicheckapp.netlify.app/?vct=${encodeURIComponent(token)}`;
      try {
        win.opener = null;
      } catch {
        // Ignore browsers that block updating opener.
      }
      win.location.replace(url);
    } catch (err) {
      win.close();
      const message = err instanceof Error && err.message ? err.message : "Impossible d'ouvrir VacciCheck. Réessayez.";
      toast.error(message);
      console.error(err);
    } finally {
      setOpeningVC(false);
    }
  };


  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="pb-1 text-3xl font-extrabold leading-[1.15] md:text-4xl">
          Bienvenue sur <span className="text-gradient-brand">ConseilSV</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Toutes vos ressources de vaccination et santé voyage en un seul endroit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {resources.map((r) => {
          const logo = "logo" in r ? r.logo : undefined;
          const isVC = r.kind === "vaccicheck";
          const locked = isVC && !hasVacciCheckAccess;
          const content = (
            <>
              <div className="flex items-start justify-between">
                <div className={`inline-flex size-12 items-center justify-center rounded-xl text-primary-foreground shadow-glow ${r.iconClass}`}>
                  {logo ? (
                    <img src={logo} alt="" className="size-10 rounded-lg border-[6px] border-card bg-card object-contain p-1" />
                  ) : r.icon ? (
                    <r.icon className="size-6" />
                  ) : null}
                </div>
                {isVC ? (
                  locked ? (
                    <Lock className="size-4 text-muted-foreground" aria-label="Verrouillé" />
                  ) : (
                    <LockOpen className="size-4 text-primary" aria-label="Déverrouillé" />
                  )
                ) : r.kind === "toggle" ? (
                  <FileText className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                ) : (
                  <ExternalLink className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                )}
              </div>
              <span className="mt-4 text-xs font-medium uppercase tracking-wider text-primary">{r.badge}</span>
              <h2 className="mt-1 text-xl font-semibold">{r.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {isVC ? (
                  locked ? (
                    <>Abonnement payant requis <Lock className="size-3.5" /></>
                  ) : (
                    <>Ouvrir <LockOpen className="size-3.5" /></>
                  )
                ) : r.kind === "toggle" ? (
                  <>Voir les documents <FileText className="size-3.5" /></>
                ) : (
                  <>Ouvrir <ExternalLink className="size-3.5" /></>
                )}
              </span>
            </>
          );

          const cardClass = `group flex flex-col rounded-2xl glass-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-elegant ${locked ? "opacity-70" : ""}`;

          if (r.kind === "external") {
            return (
              <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                {content}
              </a>
            );
          }
          if (r.kind === "vaccicheck") {
            return (
              <button
                key={r.title}
                type="button"
                onClick={() => {
                  if (locked) {
                    toast.error("VacciCheck est réservé aux abonnés payants ConseilSV.");
                    return;
                  }
                  openVacciCheck();
                }}
                disabled={openingVC}
                className={cardClass}
              >
                {content}
              </button>
            );
          }
          return (
            <button key={r.title} type="button" onClick={() => toggle(r.toggle)} className={cardClass}>
              {content}
            </button>
          );
        })}
      </div>


      {openSection === "rx" && (
        <FormsSection
          id="rxvigilance"
          title="RxVigilance"
          subtitle="Formulaires PDF de conseil voyage, accessibles rapidement au même endroit."
          items={rxForms as unknown as ItemEntry[]}
          gradient="bg-gradient-rx"
        />
      )}
      {openSection === "appsq" && (
        <FormsSection
          id="appsq"
          title="APPSQ"
          subtitle="Documents cliniques de l'Association des pharmaciens propriétaires sur la santé voyage."
          items={appsqForms as unknown as ItemEntry[]}
          gradient="bg-gradient-appsq"
        />
      )}
      {openSection === "abcpq" && (
        <FormsSection
          id="abcpq"
          title="ABCPQ"
          subtitle="Algorithmes d'aide à la décision en santé voyage."
          items={abcpqAlgos as unknown as ItemEntry[]}
          gradient="bg-gradient-abcpq"
        />
      )}
    </main>
  );
}

type ItemEntry = { title: string; asset: string; icon: React.ComponentType<{ className?: string }> };

function FormsSection({ id, title, subtitle, items, gradient }: { id: string; title: string; subtitle: string; items: ItemEntry[]; gradient: string }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((form) => (
          <a
            key={form.title}
            href={form.asset}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl glass-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
          >
            <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground shadow-soft ${gradient}`}>
              <form.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1 font-medium">{form.title}</span>
            <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        ))}
      </div>
    </section>
  );
}
