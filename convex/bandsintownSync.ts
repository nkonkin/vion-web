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
  fetchArtistEvents,
  mapEventToShow,
  type MappedShow,
} from "./lib/bandsintown";

const syncItemValidator = v.object({
  bandsintownId: v.string(),
  date: v.string(),
  venue: v.string(),
  city: v.string(),
  country: v.string(),
  ticketUrl: v.optional(v.string()),
  soldOut: v.optional(v.boolean()),
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

async function syncShows(ctx: ActionCtx): Promise<SyncResult> {
  const appId = process.env.BANDSINTOWN_APP_ID;
  const artistId = process.env.BANDSINTOWN_ARTIST_ID ?? "12435471";

  if (!appId) {
    throw new Error("BANDSINTOWN_APP_ID must be set in Convex env");
  }

  const events = await fetchArtistEvents(appId, artistId, "all");
  const currentYear = String(new Date().getUTCFullYear());
  const items: MappedShow[] = [];
  for (const event of events) {
    const mapped = mapEventToShow(event);
    if (mapped && mapped.date.startsWith(currentYear)) {
      items.push(mapped);
    }
  }

  const result = await ctx.runMutation(internal.bandsintownSync.applySync, {
    items,
  });

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
    let removed = 0;

    const incomingIds = new Set(args.items.map((item) => item.bandsintownId));

    const existing = await ctx.db.query("shows").collect();
    for (const show of existing) {
      if (show.bandsintownId && !incomingIds.has(show.bandsintownId)) {
        await ctx.db.delete(show._id);
        removed += 1;
      }
    }

    for (const item of args.items) {
      const match = await ctx.db
        .query("shows")
        .withIndex("by_bandsintown_id", (q) =>
          q.eq("bandsintownId", item.bandsintownId),
        )
        .unique();

      if (match) {
        await ctx.db.patch(match._id, {
          date: item.date,
          venue: item.venue,
          city: item.city,
          country: item.country,
          ticketUrl: item.ticketUrl,
          soldOut: item.soldOut,
          bandsintownId: item.bandsintownId,
        });
        updated += 1;
      } else {
        await ctx.db.insert("shows", item);
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
    return await syncShows(ctx);
  },
});

export const syncNow = action({
  args: {
    adminSecret: v.string(),
  },
  returns: syncResultValidator,
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await syncShows(ctx);
  },
});
