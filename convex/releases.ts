import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertAdmin } from "./lib/admin";

const releaseValidator = v.object({
  _id: v.id("releases"),
  _creationTime: v.number(),
  title: v.string(),
  artists: v.string(),
  coverUrl: v.optional(v.string()),
  linkUrl: v.string(),
  releasedAt: v.string(),
  sortOrder: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(releaseValidator),
  handler: async (ctx) => {
    const releases = await ctx.db
      .query("releases")
      .withIndex("by_sort_order")
      .order("desc")
      .collect();
    return releases;
  },
});

export const create = mutation({
  args: {
    adminSecret: v.string(),
    title: v.string(),
    artists: v.string(),
    coverUrl: v.optional(v.string()),
    linkUrl: v.string(),
    releasedAt: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("releases"),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    return await ctx.db.insert("releases", {
      title: args.title,
      artists: args.artists,
      coverUrl: args.coverUrl,
      linkUrl: args.linkUrl,
      releasedAt: args.releasedAt,
      sortOrder: args.sortOrder,
    });
  },
});

export const update = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("releases"),
    title: v.string(),
    artists: v.string(),
    coverUrl: v.optional(v.string()),
    linkUrl: v.string(),
    releasedAt: v.string(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.patch(args.id, {
      title: args.title,
      artists: args.artists,
      coverUrl: args.coverUrl,
      linkUrl: args.linkUrl,
      releasedAt: args.releasedAt,
      sortOrder: args.sortOrder,
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    adminSecret: v.string(),
    id: v.id("releases"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertAdmin(args.adminSecret);
    await ctx.db.delete(args.id);
    return null;
  },
});
