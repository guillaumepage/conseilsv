import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, BookOpen, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import vaccicheckLogo from "@/assets/vaccicheck-logo.png.asset.json";
import rxLogo from "@/assets/rxvigilance-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConseilSV — Vaccination & santé voyage" },
      {
        name: "description",
        content:
          "Portail professionnel donnant accès à VacciCheck, RxVigilance et aux ressources de vaccination et santé voyage.",
      },
      { property: "og:title", content: "ConseilSV" },
      {
        property: "og:description",
        content:
          "Accès sécurisé à VacciCheck, RxVigilance, l'INSPQ Santé voyage et au PIQ.",
      },
    ],
  }),
  component: Landing,
});

const publicResources = [
  {
    title: "VacciCheck intégré",
    text: "Accès direct à votre outil de vérification vaccinale dès la connexion.",
    logo: vaccicheckLogo.url,
    iconClass: "bg-gradient-vaccicheck",
  },
  {
    title: "INSPQ Santé voyage",
    text: "Recommandations vaccinales par pays toujours à portée de clic.",
    icon: Plane,
    iconClass: "bg-gradient-inspq",
  },
  {
    title: "Protocole PIQ",
    text: "Le protocole d'immunisation du Québec, accessible en un instant.",
    icon: BookOpen,
    iconClass: "bg-gradient-piq",
  },
  {
    title: "RxVigilance",
    text: "Formulaires PDF de conseils aux voyageurs regroupés dans le portail.",
    logo: rxLogo.url,
    iconClass: "bg-gradient-rx",
  },
] as const;

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <Logo className="h-10 w-10" />
          <span className="text-lg font-bold text-gradient-brand">ConseilSV</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth">Se connecter</Link>
          </Button>
          <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Créer un compte
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <FileText className="size-3.5 text-primary" />
              Portail professionnel sécurisé
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
              <span className="text-gradient-brand">ConseilSV</span>, votre hub
              santé voyage.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              ConseilSV regroupe en un seul endroit l'accès à VacciCheck, RxVigilance
              et aux ressources de référence pour les professionnels de la santé.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-elegant hover:opacity-90">
                <Link to="/auth">
                  Accéder au portail <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth" search={{ mode: "signup" } as never}>
                  Créer un compte
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 -z-10 bg-gradient-brand opacity-20 blur-3xl" />
            <div className="rounded-3xl glass-card p-8 shadow-elegant">
              <Logo className="h-56 w-56 md:h-72 md:w-72" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {publicResources.map((resource) => (
            <FeatureCard key={resource.title} {...resource} />
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © 2026 ConseilSV — Pour usage professionnel
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  logo,
  iconClass,
  title,
  text,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  logo?: string;
  iconClass: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-2xl glass-card p-6 transition-all hover:shadow-elegant">
      <div className={`inline-flex size-12 items-center justify-center rounded-xl text-primary-foreground shadow-glow ${iconClass}`}>
        {logo ? (
          <img src={logo} alt="" className="size-10 rounded-lg bg-card object-contain p-1" />
        ) : Icon ? (
          <Icon className="size-6" />
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
