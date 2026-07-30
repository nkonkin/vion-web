import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-background">
      <div className="absolute inset-0">
        <Image
          src="/press.png"
          alt="Vion Konger"
          fill
          priority
          className="object-cover object-[70%_center] opacity-90 md:object-[65%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.12_0.01_260)_0%,oklch(0.12_0.01_260/0.4)_45%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.12_0.01_260)_0%,transparent_35%)]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col justify-end px-6 pb-16 pt-32 md:px-10 md:pb-24">
        <div className="max-w-4xl animate-fade-up">
          <Image
            src="/logo-white.png"
            alt="Vion Konger"
            width={720}
            height={140}
            className="h-auto w-full max-w-[min(90vw,42rem)]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
