const LINKS = [
  {
    label: "Spotify",
    url: "https://open.spotify.com/artist/30IONe5gqXy6MXSNHVCCYP",
  },
  {
    label: "Apple Music",
    url: "https://music.apple.com/artist/vion-konger/1089085575",
  },
  {
    label: "Deezer",
    url: "https://www.deezer.com/artist/9962704",
  },
  {
    label: "Amazon Music",
    url: "https://music.amazon.com/search/Vion%20Konger",
  },
  {
    label: "Tidal",
    url: "https://listen.tidal.com/search?q=Vion%20Konger",
  },
  {
    label: "YouTube Music",
    url: "https://music.youtube.com/search?q=Vion%20Konger",
  },
  {
    label: "SoundCloud",
    url: "https://soundcloud.com/vionkonger",
  },
  {
    label: "Beatport",
    url: "https://www.beatport.com/artist/vion-konger/539854",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/vionkonger/",
  },
  {
    label: "TikTok",
    url: "https://www.tiktok.com/@vionkonger",
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/VionKonger/",
  },
] as const;

export function LinksPanel() {
  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <ul>
        {LINKS.map((link) => (
          <li key={link.label} className="border-b border-border">
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="label flex w-full items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-foreground hover:text-background"
            >
              <span>{link.label}</span>
              <span aria-hidden>→</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
