"use client";

import { useQuery } from "convex/react";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  createLink,
  createLiveset,
  createRelease,
  createShow,
  deleteLink,
  deleteLiveset,
  deleteRelease,
  deleteShow,
  getContactMessages,
  loginAdmin,
  logoutAdmin,
  seedContent,
  seedOfficialLinks,
  syncBandsintownShows,
  syncSpotifyReleases,
  syncYoutubeLivesets,
  updateSettings,
} from "../actions/admin";

type Tab = "releases" | "shows" | "links" | "livesets" | "settings" | "messages";

type Message = {
  _id: Id<"contactMessages">;
  name: string;
  email: string;
  message: string;
  createdAt: number;
};

export function AdminPanel({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("releases");
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  const releases = useQuery(api.releases.list);
  const shows = useQuery(api.shows.listAll, {});
  const links = useQuery(api.links.list);
  const livesets = useQuery(api.livesets.list);
  const settings = useQuery(api.settings.get);

  useEffect(() => {
    if (authed && tab === "messages") {
      startTransition(async () => {
        try {
          const data = await getContactMessages();
          setMessages(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      });
    }
  }, [authed, tab]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await loginAdmin(password);
        setAuthed(true);
        setPassword("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    });
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6">
        <h1 className="font-display text-2xl uppercase tracking-[0.2em]">Admin</h1>
        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border-b border-border bg-transparent py-3 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            disabled={isPending}
            className="font-display text-[0.7rem] uppercase tracking-[0.35em]"
          >
            Enter
          </button>
          {error && <p className="text-sm text-accent">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-svh max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl uppercase tracking-[0.2em]">Admin</h1>
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await logoutAdmin();
              setAuthed(false);
            })
          }
          className="font-display text-[0.65rem] uppercase tracking-[0.3em] text-muted"
        >
          Log out
        </button>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        {(["releases", "shows", "links", "livesets", "settings", "messages"] as Tab[]).map(
          (item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`font-display text-[0.65rem] uppercase tracking-[0.3em] ${
              tab === item ? "text-foreground" : "text-muted"
            }`}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await seedContent();
            })
          }
          className="font-display text-[0.65rem] uppercase tracking-[0.3em] text-muted"
        >
          Seed placeholders
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-accent">{error}</p>}

      {tab === "releases" && (
        <div className="mt-12 space-y-10">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  setError("");
                  setSyncMessage("");
                  try {
                    const result = await syncSpotifyReleases();
                    setSyncMessage(
                      `Spotify sync: ${result.added} added, ${result.updated} updated (${result.total} total)`,
                    );
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Spotify sync failed");
                  }
                })
              }
              disabled={isPending}
              className="font-display text-[0.65rem] uppercase tracking-[0.3em]"
            >
              Sync from Spotify
            </button>
            {syncMessage && <p className="text-sm text-muted">{syncMessage}</p>}
          </div>
          <ReleaseForm
            onSubmit={(data) =>
              startTransition(async () => {
                await createRelease(data);
              })
            }
          />
          <ul className="divide-y divide-border">
            {releases?.map((release) => (
              <li key={release._id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{release.title}</p>
                    <p className="text-sm text-muted">
                      {release.artists}
                      {release.format ? ` · ${release.format}` : ""}
                      {release.spotifyId ? " · Spotify" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteRelease(release._id);
                      })
                    }
                    className="text-xs uppercase tracking-[0.2em] text-muted"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "shows" && (
        <div className="mt-12 space-y-10">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  setError("");
                  setSyncMessage("");
                  try {
                    const result = await syncBandsintownShows();
                    setSyncMessage(
                      `Bandsintown sync: ${result.added} added, ${result.updated} updated, ${result.removed} removed (${result.total} total)`,
                    );
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Bandsintown sync failed",
                    );
                  }
                })
              }
              disabled={isPending}
              className="font-display text-[0.65rem] uppercase tracking-[0.3em]"
            >
              Sync from Bandsintown
            </button>
            {syncMessage && tab === "shows" && (
              <p className="text-sm text-muted">{syncMessage}</p>
            )}
          </div>
          <ShowForm
            onSubmit={(data) =>
              startTransition(async () => {
                await createShow(data);
              })
            }
          />
          <ul className="divide-y divide-border">
            {shows?.map((show) => (
              <li key={show._id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {show.date} — {show.venue}
                    </p>
                    <p className="text-sm text-muted">
                      {show.city}, {show.country}
                      {show.bandsintownId ? " · Bandsintown" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteShow(show._id);
                      })
                    }
                    className="text-xs uppercase tracking-[0.2em] text-muted"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "links" && (
        <div className="mt-12 space-y-10">
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                setError("");
                setSyncMessage("");
                try {
                  const count = await seedOfficialLinks();
                  setSyncMessage(`Loaded ${count} official DSP + social links`);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to seed links");
                }
              })
            }
            className="font-display text-[0.65rem] uppercase tracking-[0.3em]"
          >
            Load official DSPs + socials
          </button>
          {syncMessage && tab === "links" && (
            <p className="text-sm text-muted">{syncMessage}</p>
          )}
          <LinkForm
            onSubmit={(data) =>
              startTransition(async () => {
                await createLink(data);
              })
            }
          />
          <ul className="divide-y divide-border">
            {links?.map((link) => (
              <li key={link._id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{link.label}</p>
                    <p className="text-sm text-muted">{link.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteLink(link._id);
                      })
                    }
                    className="text-xs uppercase tracking-[0.2em] text-muted"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "livesets" && (
        <div className="mt-12 space-y-10">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  setError("");
                  setSyncMessage("");
                  try {
                    const result = await syncYoutubeLivesets();
                    setSyncMessage(
                      `YouTube sync: ${result.added} added, ${result.updated} updated, ${result.removed} removed (${result.total} total)`,
                    );
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "YouTube sync failed",
                    );
                  }
                })
              }
              disabled={isPending}
              className="font-display text-[0.65rem] uppercase tracking-[0.3em]"
            >
              Sync from YouTube playlist
            </button>
            {syncMessage && tab === "livesets" && (
              <p className="text-sm text-muted">{syncMessage}</p>
            )}
          </div>
          <LivesetForm
            onSubmit={(data) =>
              startTransition(async () => {
                await createLiveset(data);
              })
            }
          />
          <ul className="divide-y divide-border">
            {livesets?.map((liveset) => (
              <li key={liveset._id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{liveset.title}</p>
                    <p className="text-sm text-muted">
                      {liveset.recordedAt}
                      {liveset.city ? ` · ${liveset.city}` : ""}
                      {liveset.youtubeId ? " · YouTube" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteLiveset(liveset._id);
                      })
                    }
                    className="text-xs uppercase tracking-[0.2em] text-muted"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "settings" && (
        <SettingsForm
          key={settings?._id ?? "loading"}
          settings={settings}
          onSubmit={(data) =>
            startTransition(async () => {
              await updateSettings(data);
            })
          }
        />
      )}

      {tab === "messages" && (
        <ul className="mt-12 divide-y divide-border">
          {messages.map((message) => (
            <li key={message._id} className="py-6">
              <p className="font-medium">{message.name}</p>
              <p className="text-sm text-muted">{message.email}</p>
              <p className="mt-3 text-sm leading-7">{message.message}</p>
            </li>
          ))}
          {messages.length === 0 && <li className="py-6 text-muted">No messages yet.</li>}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}

function ReleaseForm({
  onSubmit,
}: {
  onSubmit: (data: {
    title: string;
    artists: string;
    coverUrl?: string;
    linkUrl: string;
    releasedAt: string;
    sortOrder: number;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [artists, setArtists] = useState("Vion Konger");
  const [linkUrl, setLinkUrl] = useState("");
  const [releasedAt, setReleasedAt] = useState("");
  const [sortOrder, setSortOrder] = useState("1");

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          title,
          artists,
          linkUrl,
          releasedAt,
          sortOrder: Number(sortOrder),
        });
        setTitle("");
        setLinkUrl("");
        setReleasedAt("");
      }}
    >
      <Field label="Title" value={title} onChange={setTitle} />
      <Field label="Artists" value={artists} onChange={setArtists} />
      <Field label="Link URL" value={linkUrl} onChange={setLinkUrl} />
      <Field label="Released At" value={releasedAt} onChange={setReleasedAt} type="date" />
      <Field label="Sort Order" value={sortOrder} onChange={setSortOrder} />
      <div className="md:col-span-2">
        <button type="submit" className="font-display text-[0.65rem] uppercase tracking-[0.3em]">
          Add release
        </button>
      </div>
    </form>
  );
}

function ShowForm({
  onSubmit,
}: {
  onSubmit: (data: {
    date: string;
    venue: string;
    city: string;
    country: string;
    ticketUrl?: string;
    soldOut?: boolean;
  }) => void;
}) {
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          date,
          venue,
          city,
          country,
          ticketUrl: ticketUrl || undefined,
        });
        setDate("");
        setVenue("");
        setCity("");
        setCountry("");
        setTicketUrl("");
      }}
    >
      <Field label="Date" value={date} onChange={setDate} type="date" />
      <Field label="Venue" value={venue} onChange={setVenue} />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="Country" value={country} onChange={setCountry} />
      <Field label="Ticket URL" value={ticketUrl} onChange={setTicketUrl} />
      <div className="md:col-span-2">
        <button type="submit" className="font-display text-[0.65rem] uppercase tracking-[0.3em]">
          Add show
        </button>
      </div>
    </form>
  );
}

function LinkForm({
  onSubmit,
}: {
  onSubmit: (data: { label: string; url: string; sortOrder: number }) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("1");

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          label,
          url,
          sortOrder: Number(sortOrder),
        });
        setLabel("");
        setUrl("");
      }}
    >
      <Field label="Label" value={label} onChange={setLabel} />
      <Field label="URL" value={url} onChange={setUrl} />
      <Field label="Sort Order" value={sortOrder} onChange={setSortOrder} />
      <div className="md:col-span-2">
        <button type="submit" className="font-display text-[0.65rem] uppercase tracking-[0.3em]">
          Add link
        </button>
      </div>
    </form>
  );
}

function LivesetForm({
  onSubmit,
}: {
  onSubmit: (data: {
    title: string;
    recordedAt: string;
    venue?: string;
    city?: string;
    url: string;
    coverUrl?: string;
    sortOrder: number;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [recordedAt, setRecordedAt] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [url, setUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("1");

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          title,
          recordedAt,
          venue: venue || undefined,
          city: city || undefined,
          url,
          coverUrl: coverUrl || undefined,
          sortOrder: Number(sortOrder),
        });
        setTitle("");
        setRecordedAt("");
        setVenue("");
        setCity("");
        setUrl("");
        setCoverUrl("");
      }}
    >
      <Field label="Title" value={title} onChange={setTitle} />
      <Field label="Recorded At" value={recordedAt} onChange={setRecordedAt} type="date" />
      <Field label="Venue" value={venue} onChange={setVenue} />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="URL" value={url} onChange={setUrl} />
      <Field label="Cover URL" value={coverUrl} onChange={setCoverUrl} />
      <Field label="Sort Order" value={sortOrder} onChange={setSortOrder} />
      <div className="md:col-span-2">
        <button type="submit" className="font-display text-[0.65rem] uppercase tracking-[0.3em]">
          Add liveset
        </button>
      </div>
    </form>
  );
}

function SettingsForm({
  settings,
  onSubmit,
}: {
  settings:
    | {
        _id?: Id<"siteSettings">;
        instagram?: string;
        spotify?: string;
        soundcloud?: string;
        youtube?: string;
        bookingEmail?: string;
      }
    | null
    | undefined;
  onSubmit: (data: {
    instagram?: string;
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
    bookingEmail?: string;
  }) => void;
}) {
  if (settings === undefined) {
    return <p className="mt-12 text-muted">Loading settings…</p>;
  }

  return (
    <SettingsFields
      initial={{
        instagram: settings?.instagram ?? "",
        spotify: settings?.spotify ?? "",
        soundcloud: settings?.soundcloud ?? "",
        youtube: settings?.youtube ?? "",
        bookingEmail: settings?.bookingEmail ?? "",
      }}
      onSubmit={onSubmit}
    />
  );
}

function SettingsFields({
  initial,
  onSubmit,
}: {
  initial: {
    instagram: string;
    spotify: string;
    soundcloud: string;
    youtube: string;
    bookingEmail: string;
  };
  onSubmit: (data: {
    instagram?: string;
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
    bookingEmail?: string;
  }) => void;
}) {
  const [instagram, setInstagram] = useState(initial.instagram);
  const [spotify, setSpotify] = useState(initial.spotify);
  const [soundcloud, setSoundcloud] = useState(initial.soundcloud);
  const [youtube, setYoutube] = useState(initial.youtube);
  const [bookingEmail, setBookingEmail] = useState(initial.bookingEmail);

  return (
    <form
      className="mt-12 grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          instagram,
          spotify,
          soundcloud,
          youtube,
          bookingEmail,
        });
      }}
    >
      <Field label="Instagram" value={instagram} onChange={setInstagram} />
      <Field label="Spotify" value={spotify} onChange={setSpotify} />
      <Field label="SoundCloud" value={soundcloud} onChange={setSoundcloud} />
      <Field label="YouTube" value={youtube} onChange={setYoutube} />
      <Field label="Booking Email" value={bookingEmail} onChange={setBookingEmail} />
      <div className="md:col-span-2">
        <button type="submit" className="font-display text-[0.65rem] uppercase tracking-[0.3em]">
          Save settings
        </button>
      </div>
    </form>
  );
}
