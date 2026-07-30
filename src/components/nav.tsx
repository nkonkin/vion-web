import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#music", label: "Music" },
  { href: "#tour", label: "Tour" },
  { href: "#contact", label: "Contact" },
];

type SocialLinks = {
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
};

export function Nav({ socials }: { socials?: SocialLinks | null }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" aria-label="Vion Konger home">
          <Image
            src="/logo-white.png"
            alt="Vion Konger"
            width={120}
            height={24}
            className="h-5 w-auto md:h-6"
            priority
          />
        </Link>

        <nav className="flex items-center gap-6 md:gap-10">
          <ul className="hidden items-center gap-8 sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-display text-[0.7rem] uppercase tracking-[0.35em] text-foreground transition-opacity duration-300 hover:opacity-60"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.65rem] uppercase tracking-[0.3em] text-foreground transition-opacity duration-300 hover:opacity-60"
              >
                IG
              </a>
            )}
            {socials?.spotify && (
              <a
                href={socials.spotify}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.65rem] uppercase tracking-[0.3em] text-foreground transition-opacity duration-300 hover:opacity-60"
              >
                SP
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
