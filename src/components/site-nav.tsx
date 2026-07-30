"use client";

export type Panel = "music" | "tour" | "livesets" | "links" | "contact";

const links: { id: Panel; label: string; short: string }[] = [
  { id: "music", label: "Music", short: "Music" },
  { id: "tour", label: "Tour", short: "Tour" },
  { id: "livesets", label: "Livesets", short: "Live" },
  { id: "links", label: "Links", short: "Links" },
  { id: "contact", label: "Contact", short: "Contact" },
];

export function SiteNav({
  panel,
  onPanelChange,
}: {
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
}) {
  return (
    <nav className="grid w-full min-w-0 shrink-0 grid-cols-5 border-b border-border">
      {links.map((link, index) => (
        <button
          key={link.id}
          type="button"
          onClick={() => onPanelChange(link.id)}
          className={`label min-w-0 overflow-hidden px-0.5 py-1.5 text-center tracking-[0.02em] transition-colors duration-200 md:px-2 md:py-2 md:tracking-[0.04em] ${
            index < links.length - 1 ? "border-r border-border" : ""
          } ${
            panel === link.id
              ? "bg-foreground text-background"
              : "hover:bg-foreground hover:text-background"
          }`}
        >
          <span className="block truncate md:hidden">{link.short}</span>
          <span className="hidden truncate md:block">{link.label}</span>
        </button>
      ))}
    </nav>
  );
}
