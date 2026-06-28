import logo from "@/assets/conseilsv-logo.png.asset.json";

export function Logo({ className = "h-12 w-12" }: { className?: string }) {
  return <img src={logo.url} alt="ConseilSV" className={className} />;
}
