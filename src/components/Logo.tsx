import logo from "@/assets/vacciconseil-logo.png.asset.json";

export function Logo({ className = "h-12 w-12" }: { className?: string }) {
  return <img src={logo.url} alt="VacciConseil" className={className} />;
}
