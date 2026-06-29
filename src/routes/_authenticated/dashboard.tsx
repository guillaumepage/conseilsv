import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Baby, Bug, Car, ClipboardList, Clock, Download, ExternalLink, FileText, Luggage, Mountain, Plane, BookOpen, Ruler, Sun, Syringe, Toilet } from "lucide-react";
import vaccicheckLogo from "@/assets/vaccicheck-logo.png.asset.json";
import rxLogo from "@/assets/rxvigilance-logo.png.asset.json";
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

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Accueil — ConseilSV" },
      { name: "description", content: "Accès rapide à VacciCheck, RxVigilance et aux ressources de santé voyage." },
    ],
  }),
  component: Dashboard,
});

const resources = [
  {
    href: "https://vaccicheckapp.netlify.app/",
    title: "VacciCheck",
    desc: "Votre outil d'aide à la décision vaccinale. Accès complet à l'application.",
    logo: vaccicheckLogo.url,
    badge: "Application principale",
    iconClass: "bg-gradient-vaccicheck",
    external: true,
  },
  {
    href: "https://www.inspq.qc.ca/sante-voyage/guide/pays",
    title: "INSPQ — Santé voyage",
    desc: "Guide d'intervention santé voyage : recommandations vaccinales par pays.",
    icon: Plane,
    badge: "Référence officielle",
    iconClass: "bg-gradient-inspq",
    external: true,
  },
  {
    href: "https://msss.gouv.qc.ca/professionnels/vaccination/piq-vaccins/",
    title: "PIQ — Protocole d'immunisation",
    desc: "Protocole d'immunisation du Québec, ministère de la Santé.",
    icon: BookOpen,
    badge: "MSSS",
    iconClass: "bg-gradient-piq",
    external: true,
  },
  {
    title: "RxVigilance",
    desc: "Formulaires PDF pratiques pour vos conseils aux voyageurs.",
    logo: rxLogo.url,
    badge: "Formulaires PDF",
    iconClass: "bg-gradient-rx",
    external: false,
  },
] as const;

const rxForms = [
  { title: "Diarrhée du voyage", asset: diarrheePdf.url, icon: Toilet },
  { title: "Échelle du Lac Louise", asset: altitudeScalePdf.url, icon: Ruler },
  { title: "Les piqûres d'insectes", asset: insectesPdf.url, icon: Bug },
  { title: "Liste de bagages", asset: bagagesPdf.url, icon: Luggage },
  { title: "Protection solaire", asset: solairePdf.url, icon: Sun },
  { title: "Le paludisme (malaria)", asset: malariaPdf.url, icon: Bug },
  { title: "Séjour en altitude — le mal des montagnes", asset: montagnePdf.url, icon: Mountain },
  { title: "L’hépatite B", asset: hepatiteBPdf.url, icon: Syringe },
  { title: "L’hépatite A", asset: hepatiteAPdf.url, icon: Syringe },
  { title: "Le virus Zika", asset: zikaPdf.url, icon: Bug },
  { title: "La typhoïde", asset: typhoidePdf.url, icon: Syringe },
  { title: "La rage", asset: ragePdf.url, icon: Syringe },
  { title: "La poliomyélite", asset: poliomyelitePdf.url, icon: Syringe },
  { title: "La peste", asset: pestePdf.url, icon: Bug },
  { title: "Le mal des transports", asset: transportsPdf.url, icon: Car },
  { title: "La fièvre jaune", asset: fievreJaunePdf.url, icon: Syringe },
  { title: "La fièvre dengue", asset: denguePdf.url, icon: Bug },
  { title: "L’encéphalite japonaise", asset: encephalitePdf.url, icon: Syringe },
  { title: "Le choléra", asset: choleraPdf.url, icon: Syringe },
  { title: "Chikungunya", asset: chikungunyaPdf.url, icon: Bug },
  { title: "Voyager durant la grossesse", asset: grossessePdf.url, icon: Baby },
  { title: "Le décalage horaire", asset: decalagePdf.url, icon: Clock },
  { title: "Planification voyage — prudence santé", asset: planificationPdf.url, icon: ClipboardList },
  { title: "Le transport en avion", asset: avionPdf.url, icon: Plane },
] as const;

function Dashboard() {
  const [showRxForms, setShowRxForms] = useState(false);

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
          const content = (
            <>
            <div className="flex items-start justify-between">
              <div className={`inline-flex size-12 items-center justify-center rounded-xl text-primary-foreground shadow-glow ${r.iconClass}`}>
                {"logo" in r ? (
                  <img src={r.logo} alt="" className="size-10 rounded-lg border-[6px] border-card bg-card object-contain p-1" />
                ) : (
                  <r.icon className="size-6" />
                )}
              </div>
              {r.external ? (
                <ExternalLink className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              ) : (
                <FileText className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              )}
            </div>
            <span className="mt-4 text-xs font-medium uppercase tracking-wider text-primary">{r.badge}</span>
            <h2 className="mt-1 text-xl font-semibold">{r.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {r.external ? "Ouvrir" : "Voir les PDF"} {r.external ? <ExternalLink className="size-3.5" /> : <FileText className="size-3.5" />}
            </span>
            </>
          );

          return r.external ? (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl glass-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              {content}
            </a>
          ) : (
            <button
              key={r.title}
              type="button"
              onClick={() => setShowRxForms((open) => !open)}
              className="group flex flex-col rounded-2xl glass-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              {content}
            </button>
          );
        })}
      </div>

      {showRxForms && <section id="rxvigilance" className="mt-12 scroll-mt-24">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">RxVigilance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Formulaires PDF de conseil voyage, accessibles rapidement au même endroit.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rxForms.map((form) => (
            <a
              key={form.title}
              href={form.asset}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl glass-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-rx text-primary-foreground shadow-soft">
                <form.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 font-medium">{form.title}</span>
              <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </a>
          ))}
        </div>
      </section>}
    </main>
  );
}
