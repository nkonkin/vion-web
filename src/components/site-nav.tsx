"use client";

export type Panel = "music" | "tour" | "livesets" | "links" | "contact";

const links: { id: Panel; label: string }[] = [
  { id: "music", label: "Music" },
  { id: "tour", label: "Tour" },
  { id: "livesets", label: "Livesets" },
  { id: "links", label: "Links" },
  { id: "contact", label: "Contact" },
];

export function SiteNav({
  panel,
  onPanelChange,
}: {
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
}) {
  return (
    <nav className="grid shrink-0 grid-cols-5 border-b border-border">
      {links.map((link, index) => (
        <button
          key={link.id}
          type="button"
          onClick={() => onPanelChange(link.id)}
          className={`label px-1 py-3 text-center transition-colors duration-200 ${
            index < links.length - 1 ? "border-r border-border" : ""
          } ${
            panel === link.id
              ? "bg-foreground text-background"
              : "hover:bg-foreground hover:text-background"
          }`}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}
