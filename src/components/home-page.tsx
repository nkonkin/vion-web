"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ContactForm } from "./contact-form";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Nav } from "./nav";
import { Releases, Shows } from "./sections";

export function HomePage() {
  const settings = useQuery(api.settings.get);

  return (
    <>
      <Nav socials={settings ?? undefined} />
      <main>
        <Hero />
        <Releases />
        <Shows />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
