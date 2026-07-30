import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "sync spotify releases",
  {
    dayOfWeek: "friday",
    hourUTC: 0,
    minuteUTC: 0,
  },
  internal.spotifySync.run,
);

crons.daily(
  "sync bandsintown shows",
  {
    hourUTC: 6,
    minuteUTC: 0,
  },
  internal.bandsintownSync.run,
);

crons.weekly(
  "sync youtube livesets",
  {
    dayOfWeek: "monday",
    hourUTC: 6,
    minuteUTC: 30,
  },
  internal.youtubeSync.run,
);

export default crons;
