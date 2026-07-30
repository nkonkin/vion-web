"use client";

import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../../convex/_generated/api";

export function ContactForm() {
  const settings = useQuery(api.settings.get);
  const submit = useMutation(api.contact.submit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await submit({ name, email, message });
      setName("");
      setEmail("");
      setMessage("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <section id="contact" className="border-t border-border px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-display text-[0.7rem] uppercase tracking-[0.45em] text-muted">
            Contact
          </p>
          <p className="mt-8 max-w-sm text-sm leading-7 text-muted">
            Booking, press, and general inquiries. Messages are stored securely and reviewed
            regularly.
          </p>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.65rem] uppercase tracking-[0.35em] transition-opacity duration-300 hover:opacity-60"
              >
                Instagram ↗
              </a>
            )}
            {settings?.spotify && (
              <a
                href={settings.spotify}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.65rem] uppercase tracking-[0.35em] transition-opacity duration-300 hover:opacity-60"
              >
                Spotify ↗
              </a>
            )}
            {settings?.soundcloud && (
              <a
                href={settings.soundcloud}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.65rem] uppercase tracking-[0.35em] transition-opacity duration-300 hover:opacity-60"
              >
                SoundCloud ↗
              </a>
            )}
            {settings?.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[0.65rem] uppercase tracking-[0.35em] transition-opacity duration-300 hover:opacity-60"
              >
                YouTube ↗
              </a>
            )}
          </div>

          {settings?.bookingEmail && (
            <p className="mt-10 text-sm text-muted">
              Booking:{" "}
              <a
                href={`mailto:${settings.bookingEmail}`}
                className="text-foreground transition-opacity duration-300 hover:opacity-60"
              >
                {settings.bookingEmail}
              </a>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted focus:border-foreground"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted focus:border-foreground"
            />
          </div>
          <div>
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              required
              rows={5}
              className="w-full resize-none border-b border-border bg-transparent py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted focus:border-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="font-display text-[0.7rem] uppercase tracking-[0.4em] transition-opacity duration-300 hover:opacity-60 disabled:opacity-40"
          >
            {status === "loading" ? "Sending…" : "Send"}
          </button>

          {status === "success" && (
            <p className="text-sm text-muted">Message sent. We&apos;ll be in touch.</p>
          )}
          {status === "error" && <p className="text-sm text-accent">{error}</p>}
        </form>
      </div>
    </section>
  );
}
