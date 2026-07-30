import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  type ActionCtx,
} from "./_generated/server";
import { assertAdmin } from "./lib/admin";
import {
  fetchPlaylistItems,
  getDefaultPlaylistId,
  mapPlaylistItemToLiveset,
  parsePlaylistId,
  type MappedLiveset,
} from "./lib/youtube";

const syncItemValidator = v.object({
  youtubeId: v.string(),
  title: v.string(),
  recordedAt: v.string(),
  venue: v.optional(v.string()),
  city: v.optional(v.string()),
  url: v.string(),
  coverUrl: v.optional(v.string()),
  sortOrder: v.number(),
});

const syncResultValidator = v.object({
  added: v.number(),
  updated: v.number(),
  removed: v.number(),
  total: v.number(),
});

type SyncResult = {
  added: number;
  updated: number;
  removed: number;
  total: number;
};

async function syncLivesets(ctx: ActionCtx): Promise<SyncResult> {
  const playlistId = parsePlaylistId(getDefaultPlaylistId());
  const items = await fetchPlaylistItems(playlistId);

  const mapped: MappedLiveset[] = items.map((item, index) =>
    mapPlaylistItemToLiveset(item, items.length - index, playlistId),
  );

  const result = await ctx.runMutation(internal.youtubeSync.applySync, {
    items: mapped,
  });

  return {
    ...result,
    total: mapped.length,
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
    let removed = 0;

    const incomingIds = new Set(args.items.map((item) => item.youtubeId));
    const existing = await ctx.db.query("livesets").collect();

    for (const liveset of existing) {
      if (liveset.youtubeId && !incomingIds.has(liveset.youtubeId)) {
        await ctx.db.delete(liveset._id);
        removed += 1;
      }
    }

    for (const item of args.items) {
      const match = await ctx.db
        .query("livesets")
        .withIndex("by_youtube_id", (q) => q.eq("youtubeId", item.youtubeId))
        .unique();

      if (match) {
        await ctx.db.patch(match._id, {
          title: item.title,
          recordedAt: item.recordedAt,
          venue: item.venue,
          city: item.city,
          url: item.url,
          coverUrl: item.coverUrl,
          sortOrder: item.sortOrder,
          youtubeId: item.youtubeId,
        });
        updated += 1;
      } else {
        await ctx.db.insert("livesets", item);
        added += 1;
      }
    }

    return {
      added,
      updated,
      removed,
      total: args.items.length,
    };
  },
});

export const run = internalAction({
  args: {},
  returns: syncResultValidator,
  handler: async (ctx) => {
    return await syncLivesets(ctx);
  },
});

export const syncNow = action({
  args: {
    adminSecret: v.string(),
  },
  returns: syncResultValidator,
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await syncLivesets(ctx);
  },
});
