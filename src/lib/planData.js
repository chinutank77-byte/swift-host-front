import DOMAINS from "@/data/domains.json";

const PLANS = {
  drop: {
    name: "Drop",
    price: 0,
    description: "Instant inbox. No account needed.",
    reqPerSec: 5,
    retention: "1 hour",
    concurrentInboxes: 5,
    apiAccess: false,
    adFree: false,
    otpExtraction: false,
    encryptedInboxes: false,
  },
  spark: {
    name: "Spark",
    price: 1.99,
    description: "API access and essentials.",
    reqPerSec: 20,
    retention: "24 hours",
    concurrentInboxes: 25,
    apiAccess: true,
    adFree: true,
    otpExtraction: false,
    encryptedInboxes: false,
  },
  rush: {
    name: "Rush",
    price: 2.99,
    description: "OTP extraction, priority support.",
    reqPerSec: 50,
    retention: "7 days",
    concurrentInboxes: 100,
    apiAccess: true,
    adFree: true,
    otpExtraction: true,
    encryptedInboxes: false,
  },
  apex: {
    name: "Apex",
    price: 4.99,
    description: "Unlimited everything. Fully encrypted.",
    reqPerSec: "Unlimited",
    retention: "30 days",
    concurrentInboxes: "Unlimited",
    apiAccess: true,
    adFree: true,
    otpExtraction: true,
    encryptedInboxes: true,
  },
};

// Server-side rate limits: auth endpoints use flat per-IP limit (6/min).
// Plan-based API rate limits are enforced backend-side using api key.
const RATE_LIMITS = {
  drop:   { authPerMin: 6, apiPerSec: 5 },
  spark:  { authPerMin: 6, apiPerSec: 20 },
  rush:   { authPerMin: 6, apiPerSec: 50 },
  apex:   { authPerMin: 6, apiPerSec: Infinity },
};

export { DOMAINS, PLANS, RATE_LIMITS };
