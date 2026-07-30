type BandsintownVenue = {
  name?: string;
  city?: string;
  country?: string;
  region?: string;
  location?: string;
};

type BandsintownOffer = {
  type?: string;
  url?: string;
  status?: string;
};

export type BandsintownEvent = {
  id: string;
  url?: string;
  datetime?: string;
  title?: string;
  description?: string;
  venue?: BandsintownVenue;
  offers?: BandsintownOffer[];
};

export type MappedShow = {
  bandsintownId: string;
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl?: string;
  soldOut?: boolean;
};

export function getBandsintownArtistPath(artistId: string): string {
  const trimmed = artistId.trim();
  if (/^\d+$/.test(trimmed)) {
    return `id_${trimmed}`;
  }
  if (trimmed.startsWith("id_")) {
    return trimmed;
  }
  return encodeURIComponent(trimmed);
}

export async function fetchArtistEvents(
  appId: string,
  artistId: string,
  date: "upcoming" | "all" = "all",
): Promise<BandsintownEvent[]> {
  const artistPath = getBandsintownArtistPath(artistId);
  const url = new URL(
    `https://rest.bandsintown.com/artists/${artistPath}/events`,
  );
  url.searchParams.set("app_id", appId);
  url.searchParams.set("date", date);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Bandsintown API error ${response.status}: ${body}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Bandsintown API returned unexpected payload");
  }

  return data as BandsintownEvent[];
}

function pickTicket(offers: BandsintownOffer[] | undefined): {
  ticketUrl?: string;
  soldOut?: boolean;
} {
  if (!offers?.length) {
    return {};
  }

  const preferred =
    offers.find((o) => (o.type ?? "").toLowerCase().includes("ticket")) ??
    offers[0];

  if (!preferred) {
    return {};
  }

  const status = (preferred.status ?? "").toLowerCase();
  return {
    ticketUrl: preferred.url,
    soldOut: status.includes("sold") || status === "unavailable",
  };
}

export function mapEventToShow(event: BandsintownEvent): MappedShow | null {
  if (!event.id || !event.datetime) {
    return null;
  }

  const date = event.datetime.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const venue = event.venue?.name?.trim() || "TBA";
  const city =
    event.venue?.city?.trim() ||
    event.venue?.location?.trim() ||
    "TBA";
  const country = event.venue?.country?.trim() || "TBA";
  const { ticketUrl, soldOut } = pickTicket(event.offers);

  return {
    bandsintownId: String(event.id),
    date,
    venue,
    city,
    country,
    ticketUrl: ticketUrl ?? event.url,
    soldOut,
  };
}
