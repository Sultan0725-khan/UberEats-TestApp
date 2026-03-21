import { EventEmitter } from "events";
import {
  idempotencyService,
  UberWebhookEvent,
} from "../services/idempotencyService";

class WebhookWorker extends EventEmitter {
  constructor() {
    super();
    // Maps the background processor to the local event router listener
    this.on("process-event", this.processEvent.bind(this));
  }

  /**
   * Enqueues an event for completely decoupled asynchronous execution.
   */
  enqueue(event: UberWebhookEvent) {
    this.emit("process-event", event);
  }

  /**
   * Primary asynchronous Event Router Logic (Message Queue Processor equivalent)
   */
  private async processEvent(event: UberWebhookEvent) {
    idempotencyService.updateEventStatus(event.event_id, "processing");
    console.log(
      `[Worker] Started processing: ${event.event_type} (${event.event_id})`,
    );

    try {
      switch (event.event_type) {
        case "orders.notification":
          await this.handleOrderNotification(event);
          break;
        case "orders.cancel":
          await this.handleOrderCancel(event);
          break;
        default:
          console.log(
            `[Worker] No specific logic required for ${event.event_type}. Handled automatically.`,
          );
          break;
      }

      idempotencyService.updateEventStatus(event.event_id, "completed");
      console.log(
        `[Worker] Completed successfully: ${event.event_type} (${event.event_id})`,
      );
    } catch (error) {
      console.error(
        `[Worker] FATAL FAILURE processing ${event.event_id}:`,
        error,
      );
      // Dead Letter logic representation
      idempotencyService.updateEventStatus(event.event_id, "failed");
    }
  }

  /* -------------------- BUSINESS LOGIC HANDLERS -------------------- */

  private async handleOrderNotification(event: UberWebhookEvent) {
    // Simulate real database I/O, validations, user notifications, etc.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(
      `[Service] Notification acknowledged successfully Order ID: ${event.meta?.resource_id}`,
    );
  }

  private async handleOrderCancel(event: UberWebhookEvent) {
    // Standard mock processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(
      `[Service] Cancellations fully processed Order ID: ${event.meta?.resource_id}`,
    );
  }
}

// Export a robust Singleton Instance representing the internal Queue
export const webhookWorker = new WebhookWorker();
