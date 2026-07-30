import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Image
          src="/logo-white.png"
          alt="Vion Konger"
          width={160}
          height={32}
          className="h-4 w-auto opacity-70"
        />
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          © {year} Vion Konger
        </p>
      </div>
    </footer>
  );
}
