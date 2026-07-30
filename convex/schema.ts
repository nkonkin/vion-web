import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  releases: defineTable({
    title: v.string(),
    artists: v.string(),
    coverUrl: v.optional(v.string()),
    linkUrl: v.string(),
    releasedAt: v.string(),
    sortOrder: v.number(),
    spotifyId: v.optional(v.string()),
    format: v.optional(v.string()),
  })
    .index("by_sort_order", ["sortOrder"])
    .index("by_spotify_id", ["spotifyId"]),

  shows: defineTable({
    date: v.string(),
    venue: v.string(),
    city: v.string(),
    country: v.string(),
    ticketUrl: v.optional(v.string()),
    soldOut: v.optional(v.boolean()),
    bandsintownId: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_bandsintown_id", ["bandsintownId"]),

  siteSettings: defineTable({
    key: v.literal("default"),
    instagram: v.optional(v.string()),
    spotify: v.optional(v.string()),
    soundcloud: v.optional(v.string()),
    youtube: v.optional(v.string()),
    bookingEmail: v.optional(v.string()),
  }).index("by_key", ["key"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_email_and_created", ["email", "createdAt"]),

  links: defineTable({
    label: v.string(),
    url: v.string(),
    sortOrder: v.number(),
  }).index("by_sort_order", ["sortOrder"]),

  livesets: defineTable({
    title: v.string(),
    recordedAt: v.string(),
    venue: v.optional(v.string()),
    city: v.optional(v.string()),
    url: v.string(),
    coverUrl: v.optional(v.string()),
    sortOrder: v.number(),
    youtubeId: v.optional(v.string()),
  })
    .index("by_sort_order", ["sortOrder"])
    .index("by_youtube_id", ["youtubeId"]),
});
