import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const livesetValidator = v.object({
  _id: v.id("livesets"),
  _creationTime: v.number(),
  title: v.string(),
  recordedAt: v.string(),
  venue: v.optional(v.string()),
  city: v.optional(v.string()),
  url: v.string(),
  coverUrl: v.optional(v.string()),
  sortOrder: v.number(),
  youtubeId: v.optional(v.string()),
});

export const list = query({
  args: {},
  returns: v.array(livesetValidator),
  handler: async (ctx) => {
    const livesets = await ctx.db
      .query("livesets")
      .withIndex("by_sort_order")
      .order("desc")
      .collect();
    return livesets;
  },
});

export const create = mutation({
  args: {
    adminSecret: v.string(),
    title: v.string(),
    recordedAt: v.string(),
    venue: v.optional(v.string()),
    city: v.optional(v.string()),
    url: v.string(),
    coverUrl: v.optional(v.string()),
    sortOrder: v.number(),
  },
  returns: v.id("livesets"),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db.insert("livesets", {
      title: args.title,
      recordedAt: args.recordedAt,
      venue: args.venue,
      city: args.city,
      url: args.url,
      coverUrl: args.coverUrl,
      sortOrder: args.sortOrder,
    });
  },
});

export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("livesets"),
    title: v.string(),
    recordedAt: v.string(),
    venue: v.optional(v.string()),
    city: v.optional(v.string()),
    url: v.string(),
    coverUrl: v.optional(v.string()),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.patch(args.id, {
      title: args.title,
      recordedAt: args.recordedAt,
      venue: args.venue,
      city: args.city,
      url: args.url,
      coverUrl: args.coverUrl,
      sortOrder: args.sortOrder,
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("livesets"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.delete(args.id);
    return null;
  },
});
