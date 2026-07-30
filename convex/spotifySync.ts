import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  action,
  type ActionCtx,
} from "./_generated/server";
import { assertAdmin } from "./lib/admin";
import {
  fetchArtistAlbums,
  getSpotifyAccessToken,
  mapAlbumToRelease,
  parseSpotifyArtistId,
} from "./lib/spotify";

const syncItemValidator = v.object({
  spotifyId: v.string(),
  title: v.string(),
  artists: v.string(),
  coverUrl: v.optional(v.string()),
  linkUrl: v.string(),
  releasedAt: v.string(),
  format: v.optional(v.string()),
  sortOrder: v.number(),
});

const syncResultValidator = v.object({
  added: v.number(),
  updated: v.number(),
  total: v.number(),
});

async function resolveArtistId(ctx: ActionCtx): Promise<string> {
  const fromEnv = process.env.SPOTIFY_ARTIST_ID;
  const parsedEnv = parseSpotifyArtistId(fromEnv);
  if (parsedEnv) {
    return parsedEnv;
  }

  const settings = await ctx.runQuery(internal.settings.getInternal);
  const fromSettings = parseSpotifyArtistId(settings?.spotify);
  if (fromSettings) {
    return fromSettings;
  }

  throw new Error(
    "Set SPOTIFY_ARTIST_ID in Convex env or add a Spotify artist URL in site settings",
  );
}

type SyncResult = {
  added: number;
  updated: number;
  total: number;
};

async function syncReleases(ctx: ActionCtx): Promise<SyncResult> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in Convex env");
  }

  const artistId = await resolveArtistId(ctx);
  const token = await getSpotifyAccessToken(clientId, clientSecret);
  const albums = await fetchArtistAlbums(token, artistId);

  const items = albums.map((album, index) =>
    mapAlbumToRelease(album, albums.length - index),
  );

  const result = await ctx.runMutation(internal.spotifySync.applySync, { items });

  return {
    ...result,
    total: items.length,
  };
}

export const applySync = internalMutation({
  args: {
    items: v.array(syncItemValidator),
  },
  returns: syncResultValidator,
  handler: async (ctx, args) => {
    let added = 0;
    let updated = 0;

    for (const item of args.items) {
      const existing = await ctx.db
        .query("releases")
        .withIndex("by_spotify_id", (q) => q.eq("spotifyId", item.spotifyId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: item.title,
          artists: item.artists,
          coverUrl: item.coverUrl,
          linkUrl: item.linkUrl,
          releasedAt: item.releasedAt,
          format: item.format,
          sortOrder: item.sortOrder,
        });
        updated += 1;
      } else {
        await ctx.db.insert("releases", item);
        added += 1;
      }
    }

    return {
      added,
      updated,
      total: args.items.length,
    };
  },
});

export const run = internalAction({
  args: {},
  returns: syncResultValidator,
  handler: async (ctx) => {
    return await syncReleases(ctx);
  },
});

export const syncNow = action({
  args: {
    adminSecret: v.string(),
  },
  returns: syncResultValidator,
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await syncReleases(ctx);
  },
});
