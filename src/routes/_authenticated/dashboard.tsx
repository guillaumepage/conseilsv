import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck, Plane, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Accueil — VacciConseil" },
      { name: "description", content: "Accès rapide à VacciCheck et aux ressources de santé voyage." },
    ],
  }),
  component: Dashboard,
});

const resources = [
  {
    href: "https://vaccicheckapp.netlify.app/",
    title: "VacciCheck",
    desc: "Votre outil d'aide à la décision vaccinale. Accès complet à l'application.",
    icon: ShieldCheck,
    badge: "Application principale",
    iconClass: "bg-gradient-brand",
  },
  {
    href: "https://www.inspq.qc.ca/sante-voyage/guide/pays",
    title: "INSPQ — Santé voyage",
    desc: "Guide d'intervention santé voyage : recommandations vaccinales par pays.",
    icon: Plane,
    badge: "Référence officielle",
    iconClass: "bg-gradient-inspq",
  },
  {
    href: "https://msss.gouv.qc.ca/professionnels/vaccination/piq-vaccins/",
    title: "PIQ — Protocole d'immunisation",
    desc: "Protocole d'immunisation du Québec, ministère de la Santé.",
    icon: BookOpen,
    badge: "MSSS",
    iconClass: "bg-gradient-piq",
  },
] as const;

function Dashboard() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Bienvenue sur <span className="text-gradient-brand">VacciConseil</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Toutes vos ressources de vaccination et santé voyage en un seul endroit.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {resources.map((r) => (
          <a
            key={r.href}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl glass-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <r.icon className="size-6" />
              </div>
              <ExternalLink className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <span className="mt-4 text-xs font-medium uppercase tracking-wider text-primary">{r.badge}</span>
            <h2 className="mt-1 text-xl font-semibold">{r.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Ouvrir <ExternalLink className="size-3.5" />
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
