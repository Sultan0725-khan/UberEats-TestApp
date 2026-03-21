export interface WebhookMeta {
  client_id?: string;
  webhook_config_id?: string;
  webhook_msg_timestamp?: number;
  webhook_msg_uuid?: string;
}

export interface UberWebhookEvent {
  event_id: string;
  event_type: string;
  event_time: number;
  resource_href: string;
  meta?: { resource_id?: string; user_id?: string };
  webhook_meta?: WebhookMeta;
  [key: string]: any;

  // Custom Architecture Status fields
  status?: "pending" | "processing" | "completed" | "failed";
  created_at?: string;
}

// In-process DB representations
const eventStore: UberWebhookEvent[] = [];
// LRU Cache for idempotency keys to intelligently prevent Out-Of-Memory errors
const idempotencyCache = new Map<string, number>();
const MAX_CACHE_SIZE = 5000;
const MAX_DB_SIZE = 500;

export const idempotencyService = {
  /**
   * Attempts to acquire an idempotency lock for this event.
   * Returns `true` if it's a NEW event, `false` if it's a DUPLICATE delivery.
   */
  acquireLock: (eventId: string): boolean => {
    if (idempotencyCache.has(eventId)) {
      return false; // Already processed
    }

    if (idempotencyCache.size >= MAX_CACHE_SIZE) {
      // Find and gracefully evict the oldest key to simulate Redis TTL
      const oldestKey = Array.from(idempotencyCache.entries()).sort(
        (a, b) => a[1] - b[1],
      )[0][0];
      idempotencyCache.delete(oldestKey);
    }

    idempotencyCache.set(eventId, Date.now());
    return true;
  },

  /**
   * Safe persistence layer into the event array store with metadata.
   */
  saveEvent: (event: UberWebhookEvent) => {
    const storedEvent = {
      ...event,
      status: "pending" as const,
      created_at: new Date().toISOString(),
    };
    eventStore.unshift(storedEvent);

    // Limit memory visual DB size globally
    if (eventStore.length > MAX_DB_SIZE) {
      eventStore.pop();
    }
  },

  /**
   * Status mutation function accessible to Workers safely tracking success/failures
   */
  updateEventStatus: (
    eventId: string,
    status: "processing" | "completed" | "failed",
  ) => {
    const event = eventStore.find((e) => e.event_id === eventId);
    if (event) {
      event.status = status;
    }
  },

  /** Readonly exports */
  getEvents: () => eventStore,

  clearAll: () => {
    eventStore.length = 0;
    idempotencyCache.clear();
  },
};
