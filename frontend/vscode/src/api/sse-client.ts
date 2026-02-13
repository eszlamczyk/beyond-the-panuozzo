import * as http from "node:http";
import * as https from "node:https";
import { IOrderClient, OrderEvent } from "./client";
import { MenuItem, Order, WishlistItem } from "../types";

/** Minimum delay between reconnection attempts (ms). */
const BASE_RECONNECT_MS = 1_000;
/** Maximum delay between reconnection attempts (ms). */
const MAX_RECONNECT_MS = 30_000;

/**
 * Real backend client that receives order events over SSE.
 *
 * Connects to `GET /orders/events` with a Bearer JWT in the
 * `Authorization` header and parses the chunked SSE stream.
 *
 * REST methods (getActiveOrder, getMenu, etc.) are not yet implemented
 * and will throw — they'll be wired up when the corresponding backend
 * endpoints exist.
 */
export class SseOrderClient implements IOrderClient {
  private readonly listeners: ((event: OrderEvent) => void)[] = [];
  private request: http.ClientRequest | undefined;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private reconnectDelay = BASE_RECONNECT_MS;
  private disposed = false;

  constructor(
    private readonly backendUrl: string,
    private readonly getToken: () => Promise<string | undefined>,
  ) {}

  /** Opens the SSE connection. Safe to call multiple times — disconnects first. */
  async connect(): Promise<void> {
    this.disconnectInternal();

    const token = await this.getToken();
    if (!token || this.disposed) {
      return;
    }

    const url = new URL("/orders/events", this.backendUrl);
    const mod = url.protocol === "https:" ? https : http;

    const req = mod.request(
      url,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume(); // drain
          this.scheduleReconnect();
          return;
        }

        // Successfully connected — reset backoff
        this.reconnectDelay = BASE_RECONNECT_MS;

        let buffer = "";
        res.setEncoding("utf-8");

        res.on("data", (chunk: string) => {
          buffer += chunk;
          // SSE messages are separated by double newlines
          const parts = buffer.split("\n\n");
          // Keep the last (potentially incomplete) part in the buffer
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            this.handleSseMessage(part);
          }
        });

        res.on("end", () => {
          if (!this.disposed) {
            this.scheduleReconnect();
          }
        });

        res.on("error", () => {
          if (!this.disposed) {
            this.scheduleReconnect();
          }
        });
      },
    );

    req.on("error", () => {
      if (!this.disposed) {
        this.scheduleReconnect();
      }
    });

    req.end();
    this.request = req;
  }

  /** Closes the SSE connection. */
  disconnect(): void {
    this.disconnectInternal();
  }

  onOrderEvent(listener: (event: OrderEvent) => void): { dispose(): void } {
    this.listeners.push(listener);
    return {
      dispose: () => {
        const idx = this.listeners.indexOf(listener);
        if (idx !== -1) {
          this.listeners.splice(idx, 1);
        }
      },
    };
  }

  async getActiveOrder(): Promise<Order | undefined> {
    throw new Error("Not implemented");
  }

  async getMenu(): Promise<MenuItem[]> {
    throw new Error("Not implemented");
  }

  async addWishlistItem(_orderId: string, _item: WishlistItem): Promise<void> {
    throw new Error("Not implemented");
  }

  async removeWishlistItem(_orderId: string, _menuItemId: string): Promise<void> {
    throw new Error("Not implemented");
  }

  dispose(): void {
    this.disposed = true;
    this.disconnectInternal();
    this.listeners.length = 0;
  }

  // -------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------

  private disconnectInternal(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    if (this.request) {
      this.request.destroy();
      this.request = undefined;
    }
  }

  /** Parses a single SSE frame and emits the event to listeners. */
  private handleSseMessage(raw: string): void {
    let data = "";
    for (const line of raw.split("\n")) {
      if (line.startsWith("data:")) {
        // Append data field (strip "data:" prefix and optional leading space)
        data += line.slice(line[5] === " " ? 6 : 5);
      }
      // Ignore other SSE fields (id:, event:, retry:, comments) for now
    }

    if (!data) {
      return;
    }

    try {
      const event = JSON.parse(data) as OrderEvent;
      for (const listener of [...this.listeners]) {
        listener(event);
      }
    } catch {
      // Ignore malformed messages
    }
  }

  /** Schedules a reconnection with exponential backoff. */
  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.connect();
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_MS);
  }
}
