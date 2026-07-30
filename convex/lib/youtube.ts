const DEFAULT_PLAYLIST_ID = "PLddaWcog6of3njcVvnLeSpV2qawulNjg0";

const INNERTUBE_CONTEXT = {
  client: {
    clientName: "WEB",
    clientVersion: "2.20240730.00.00",
    hl: "en",
    gl: "US",
  },
};

export type YoutubePlaylistItem = {
  youtubeId: string;
  title: string;
  coverUrl?: string;
  publishedAt?: string;
};

export type MappedLiveset = {
  youtubeId: string;
  title: string;
  recordedAt: string;
  venue?: string;
  city?: string;
  url: string;
  coverUrl?: string;
  sortOrder: number;
};

export function parsePlaylistId(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (fromUrl?.[1]) {
    return fromUrl[1];
  }
  if (/^PL[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }
  throw new Error(`Invalid YouTube playlist id: ${input}`);
}

function walkCollect(
  node: unknown,
  visit: (obj: Record<string, unknown>) => void,
): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      walkCollect(item, visit);
    }
    return;
  }
  if (!node || typeof node !== "object") {
    return;
  }
  const obj = node as Record<string, unknown>;
  visit(obj);
  for (const value of Object.values(obj)) {
    walkCollect(value, visit);
  }
}

function extractContinuationToken(payload: unknown): string | null {
  let token: string | null = null;
  walkCollect(payload, (obj) => {
    if (token) return;
    const command = obj.continuationCommand;
    if (command && typeof command === "object") {
      const t = (command as { token?: string }).token;
      if (typeof t === "string" && t.length > 0) {
        token = t;
      }
    }
  });
  return token;
}

function extractItems(payload: unknown): YoutubePlaylistItem[] {
  const items: YoutubePlaylistItem[] = [];
  const seen = new Set<string>();

  walkCollect(payload, (obj) => {
    if (obj.playlistVideoRenderer && typeof obj.playlistVideoRenderer === "object") {
      const r = obj.playlistVideoRenderer as {
        videoId?: string;
        title?: { runs?: { text?: string }[]; simpleText?: string };
      };
      const youtubeId = r.videoId;
      if (!youtubeId || seen.has(youtubeId)) return;
      const title =
        r.title?.runs?.[0]?.text ?? r.title?.simpleText ?? "Untitled";
      seen.add(youtubeId);
      items.push({
        youtubeId,
        title,
        coverUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      });
      return;
    }

    if (
      obj.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" &&
      typeof obj.contentId === "string"
    ) {
      const youtubeId = obj.contentId;
      if (seen.has(youtubeId)) return;
      const metadata = obj.metadata as
        | {
            lockupMetadataViewModel?: {
              title?: { content?: string };
            };
          }
        | undefined;
      const title =
        metadata?.lockupMetadataViewModel?.title?.content ??
        (
          obj.rendererContext as
            | { accessibilityContext?: { label?: string } }
            | undefined
        )?.accessibilityContext?.label
          ?.replace(/\s+\d+\s+minutes?$/i, "")
          ?.trim() ??
        "Untitled";

      seen.add(youtubeId);
      items.push({
        youtubeId,
        title,
        coverUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      });
    }
  });

  return items;
}

async function innertubeBrowse(body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(
    "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        context: INNERTUBE_CONTEXT,
        ...body,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YouTube browse error ${response.status}: ${text}`);
  }

  return await response.json();
}

async function fetchPlaylistItemsInnertube(
  playlistId: string,
): Promise<YoutubePlaylistItem[]> {
  const collected: YoutubePlaylistItem[] = [];
  const seen = new Set<string>();

  let payload: unknown = await innertubeBrowse({ browseId: `VL${playlistId}` });
  let pages = 0;

  while (payload && pages < 20) {
    pages += 1;
    for (const item of extractItems(payload)) {
      if (seen.has(item.youtubeId)) continue;
      seen.add(item.youtubeId);
      collected.push(item);
    }

    const token = extractContinuationToken(payload);
    if (!token) break;
    payload = await innertubeBrowse({ continuation: token });
  }

  return collected;
}

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items?: Array<{
    snippet?: {
      title?: string;
      resourceId?: { videoId?: string };
      thumbnails?: {
        maxres?: { url?: string };
        standard?: { url?: string };
        high?: { url?: string };
        medium?: { url?: string };
      };
    };
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
  }>;
  error?: { message?: string };
};

async function fetchPlaylistItemsDataApi(
  playlistId: string,
  apiKey: string,
): Promise<YoutubePlaylistItem[]> {
  const collected: YoutubePlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", apiKey);
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString());
    const data = (await response.json()) as PlaylistItemsResponse;

    if (!response.ok) {
      throw new Error(
        data.error?.message ?? `YouTube Data API error ${response.status}`,
      );
    }

    for (const item of data.items ?? []) {
      const youtubeId =
        item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (!youtubeId) continue;

      const thumbs = item.snippet?.thumbnails;
      const coverUrl =
        thumbs?.maxres?.url ??
        thumbs?.standard?.url ??
        thumbs?.high?.url ??
        thumbs?.medium?.url ??
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

      const publishedAt = item.contentDetails?.videoPublishedAt?.slice(0, 10);

      collected.push({
        youtubeId,
        title: item.snippet?.title ?? "Untitled",
        coverUrl,
        publishedAt: /^\d{4}-\d{2}-\d{2}$/.test(publishedAt ?? "")
          ? publishedAt
          : undefined,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return collected;
}

export async function fetchPlaylistItems(
  playlistIdInput: string,
): Promise<YoutubePlaylistItem[]> {
  const playlistId = parsePlaylistId(playlistIdInput);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    return await fetchPlaylistItemsDataApi(playlistId, apiKey);
  }

  // No API key: public playlist browse still works from Convex
  return await fetchPlaylistItemsInnertube(playlistId);
}

export function getDefaultPlaylistId(): string {
  return process.env.YOUTUBE_PLAYLIST_ID ?? DEFAULT_PLAYLIST_ID;
}

/** Parse "ARTIST LIVE @ VENUE, CITY" style titles */
export function parseLivesetMeta(title: string): {
  venue?: string;
  city?: string;
} {
  const match = title.match(/@\s*(.+)$/i);
  if (!match?.[1]) return {};

  const rest = match[1].trim();
  const parts = rest.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      venue: parts.slice(0, -1).join(", "),
      city: parts[parts.length - 1],
    };
  }
  return { venue: rest };
}

export function mapPlaylistItemToLiveset(
  item: YoutubePlaylistItem,
  sortOrder: number,
  playlistId: string,
): MappedLiveset {
  const meta = parseLivesetMeta(item.title);
  return {
    youtubeId: item.youtubeId,
    title: item.title,
    recordedAt: item.publishedAt ?? "1970-01-01",
    venue: meta.venue,
    city: meta.city,
    url: `https://www.youtube.com/watch?v=${item.youtubeId}&list=${playlistId}`,
    coverUrl: item.coverUrl,
    sortOrder,
  };
}
