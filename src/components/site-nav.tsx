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
  nextShowLabel,
}: {
  panel: Panel;
  onPanelChange: (panel: Panel) => void;
  nextShowLabel?: string | null;
}) {
  return (
    <nav className="flex shrink-0 items-stretch border-b border-border">
      <div className="flex min-w-0 flex-1 overflow-x-auto">
        {links.map((link, index) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onPanelChange(link.id)}
            className={`label shrink-0 px-3 py-3 transition-colors duration-200 md:px-5 ${
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
      </div>
      {nextShowLabel && (
        <p className="label hidden shrink-0 items-center border-l border-border px-4 text-muted lg:flex">
          {nextShowLabel}
        </p>
      )}
    </nav>
  );
}
