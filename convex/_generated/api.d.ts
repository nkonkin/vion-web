/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bandsintownSync from "../bandsintownSync.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_bandsintown from "../lib/bandsintown.js";
import type * as lib_spotify from "../lib/spotify.js";
import type * as lib_youtube from "../lib/youtube.js";
import type * as links from "../links.js";
import type * as livesets from "../livesets.js";
import type * as releases from "../releases.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as shows from "../shows.js";
import type * as spotifySync from "../spotifySync.js";
import type * as youtubeSync from "../youtubeSync.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bandsintownSync: typeof bandsintownSync;
  contact: typeof contact;
  crons: typeof crons;
  "lib/admin": typeof lib_admin;
  "lib/bandsintown": typeof lib_bandsintown;
  "lib/spotify": typeof lib_spotify;
  "lib/youtube": typeof lib_youtube;
  links: typeof links;
  livesets: typeof livesets;
  releases: typeof releases;
  seed: typeof seed;
  settings: typeof settings;
  shows: typeof shows;
  spotifySync: typeof spotifySync;
  youtubeSync: typeof youtubeSync;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
