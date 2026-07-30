const CONTACTS = [
  {
    label: "Booking",
    email: "bookings@resonate-artists.com",
  },
  {
    label: "Management",
    email: "n@nkonkin.com",
  },
] as const;

export function ContactPanel() {
  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <ul>
        {CONTACTS.map((contact) => (
          <li key={contact.label} className="border-b border-border">
            <a
              href={`mailto:${contact.email}`}
              className="label flex w-full items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-foreground hover:text-background"
            >
              <span>
                {contact.label}
                <span className="ml-3 text-muted">{contact.email}</span>
              </span>
              <span aria-hidden>→</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
