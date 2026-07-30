export type SpotifyAlbum = {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  external_urls: { spotify: string };
  images: { url: string }[];
  artists: { name: string }[];
};

export type SpotifyAlbumsResponse = {
  items: SpotifyAlbum[];
  total: number;
  limit: number;
  offset: number;
};

export function parseSpotifyArtistId(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const urlMatch = trimmed.match(/open\.spotify\.com\/artist\/([a-zA-Z0-9]+)/);
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function normalizeReleaseDate(
  date: string,
  precision: SpotifyAlbum["release_date_precision"],
): string {
  if (precision === "day") {
    return date;
  }
  if (precision === "month") {
    return `${date}-01`;
  }
  return `${date}-01-01`;
}

export function formatReleaseType(albumType: string): string {
  switch (albumType) {
    case "single":
      return "Single";
    case "album":
      return "Album";
    case "compilation":
      return "Compilation";
    default:
      return albumType.charAt(0).toUpperCase() + albumType.slice(1);
  }
}

export async function getSpotifyAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify auth failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchArtistAlbums(
  token: string,
  artistId: string,
): Promise<SpotifyAlbum[]> {
  const albums: SpotifyAlbum[] = [];
  let offset = 0;
  const limit = 10;

  while (true) {
    const url = new URL(`https://api.spotify.com/v1/artists/${artistId}/albums`);
    url.searchParams.set("include_groups", "album,single,compilation");
    url.searchParams.set("market", "US");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Spotify albums failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as SpotifyAlbumsResponse;
    albums.push(...data.items);

    if (data.items.length < limit || offset + limit >= data.total) {
      break;
    }

    offset += limit;
  }

  const byId = new Map<string, SpotifyAlbum>();
  for (const album of albums) {
    byId.set(album.id, album);
  }

  return [...byId.values()].sort(
    (a, b) =>
      Date.parse(normalizeReleaseDate(b.release_date, b.release_date_precision)) -
      Date.parse(normalizeReleaseDate(a.release_date, a.release_date_precision)),
  );
}

export function mapAlbumToRelease(album: SpotifyAlbum, sortOrder: number) {
  return {
    spotifyId: album.id,
    title: album.name,
    artists: album.artists.map((artist) => artist.name).join(", "),
    coverUrl: album.images[0]?.url,
    linkUrl: album.external_urls.spotify,
    releasedAt: normalizeReleaseDate(album.release_date, album.release_date_precision),
    format: formatReleaseType(album.album_type),
    sortOrder,
  };
}
