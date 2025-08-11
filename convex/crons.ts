import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Run every hour to purge messages older than 24 hours
crons.interval(
  "delete-expired-messages-hourly",
  { hours: 1 },
  api.mutations.deleteExpiredMessages,
  {}
);

export default crons;

