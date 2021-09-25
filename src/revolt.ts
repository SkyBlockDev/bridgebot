/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   revolt.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/25 11:20:07 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:31:48 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//FORK OF THE REVOLT WEBSOCKET https://github.com/revoltchat/revolt.js/blob/9f4f1e7bdbdb926489a44871c5d7890694012e4b/src/websocket/client.ts
import type { GateWayManager } from "./manager.js";

import { bridgeError } from "./utils/BridgeError.js";
import { ulid } from "./utils/ulid.js";
import fetch from "node-fetch";
import WebSocket from "ws";

export interface RevoltOptions {
  ws: any;
  session: string | { email: string; password: string };
}

export class RevoltWebsocket {
  ws?: WebSocket;

  hb = 30;
  heartbeat?: number;
  connected: boolean;
  ready: boolean;

  user: any;

  ping?: number;

  constructor(public manager: GateWayManager, public config: RevoltOptions) {
    this.connected = false;
    this.ready = false;
  }
  async sendMessage(channel: string, content: string) {
    return await this.runRestMethod(`channels/${channel}/messages`, { content: content.substring(0, 2000), nonce: ulid() }, "POST");
  }

  async sendRevoltMessage({ channel, username, content, chat, files }: { channel: string; username: string; content: string; chat: string; files?: string[] }) {
    return await this.sendMessage(channel, `(${chat})${username}: ${content} ${files?.length !== 0 ? files?.join("\n") : ""}`);
  }

  async runRestMethod<T = any>(endpoint: string, input: any = undefined, method: string = "GET") {
    const res = await fetch(`https://api.revolt.chat/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "x-bot-token": `${this.config.session}`,
      },
      body: input ? JSON.stringify(input) : undefined,
    });
    this.manager.logger.info(`${method} ${res.status} /${endpoint}`);
    if (!res.ok)
      throw bridgeError(`[${res.status}]: ${res.statusText}`, {
        body: await res.json().catch((e) => undefined),
        method: method,
        input: input,
        endpoint: endpoint,
      });
    if (res.status == 204) return null as unknown as T;
    return <T>await res.json();
  }

  /**
   * Disconnect the WebSocket and disable heartbeats.
   */
  disconnect() {
    clearInterval(this.heartbeat);
    this.connected = false;
    this.ready = false;

    if (typeof this.ws !== "undefined" && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  /**
   * Send a notification
   * @param notification Serverbound notification
   */
  send(notification: any) {
    if (typeof this.ws === "undefined" || this.ws.readyState !== WebSocket.OPEN) return;

    let data = JSON.stringify(notification);
    if (this.manager.dev) this.manager.logger.debug("[<] PACKET", data);
    this.ws.send(data);
  }

  /**
   * Connect the WebSocket
   * @param disallowReconnect Whether to disallow reconnection
   */
  connect(disallowReconnect?: boolean): Promise<void> {
    this.manager.logger.debug("connecting");

    return new Promise((resolve, $reject) => {
      let thrown = false;
      const reject = (err: any) => {
        if (!thrown) {
          thrown = true;
          $reject(err);
        }
      };

      this.disconnect();

      if (typeof this.config.ws === "undefined") {
        throw new Error("Attempted to open WebSocket without syncing configuration from server.");
      }

      if (typeof this.config.session === "undefined") {
        throw new Error("Attempted to open WebSocket without valid session.");
      }

      let ws = new WebSocket(this.config.ws);
      this.ws = ws;

      ws.onopen = () => {
        if (typeof this.config.session === "string") {
          this.send({ type: "Authenticate", token: this.config.session! });
        } else {
          this.send({ type: "Authenticate", ...this.config.session! });
        }
      };

      let timeouts: Record<string, any> = {};
      let handle = async (msg: WebSocket.MessageEvent) => {
        let data = msg.data;
        if (typeof data !== "string") return;

        if (this.manager.dev) this.manager.logger.debug("[>] PACKET", data);
        let packet = JSON.parse(data);
        await this.manager.RevoltPacketHandler(packet);
        switch (packet.type) {
          case "Error": {
            reject(packet.error);
            break;
          }

          case "Authenticated": {
            disallowReconnect = false;
            this.manager.logger.debug("connected");
            this.connected = true;
            break;
          }

          case "Ready": {
            if (packet.type !== "Ready") throw 0;

            for (let user of packet.users) {
              this.manager.cache.r.users.set(user._id, user);
            }

            for (let channel of packet.channels) {
              this.manager.cache.r.channels.set(channel._id, channel);
            }

            for (let server of packet.servers) {
              this.manager.cache.r.guilds.set(server._id, server);
            }

            for (let member of packet.members) {
              this.manager.cache.r.members.set(member._id, member);
            }

            this.user = this.manager.cache.r.users.get(packet.users.find((x: any) => x.relationship === "User")!._id)!;

            this.ready = true;
            resolve();

            if (this.hb! > 0) {
              this.send({ type: "Ping", data: +new Date() });
              this.manager.logger.debug("ping /revolt");
              this.heartbeat = setInterval(() => this.send({ type: "Ping", data: +new Date() }), this.hb * 1e3) as any;
            }

            break;
          }

          case "Message":
            await this.manager;
            break;

          case "Pong": {
            this.ping = +new Date() - packet.data;
            break;
          }

          default:
            this.manager.dev && this.manager.logger.warn(`Warning: Unhandled packet! ${packet.type}`);
        }
      };

      let processing = false;
      let queue: WebSocket.MessageEvent[] = [];
      ws.onmessage = async (data: any) => {
        queue.push(data);

        if (!processing) {
          processing = true;
          while (queue.length > 0) {
            await handle(queue.shift() as any);
          }
          processing = false;
        }
      };

      ws.onerror = (err: any) => {
        reject(err);
      };

      ws.onclose = () => {
        this.manager.logger.debug("dropped");
        this.connected = false;
        this.ready = false;

        Object.keys(timeouts)
          .map((k) => timeouts[k])
          .forEach(clearTimeout);

        // runInAction(() => {
        //   [...this.client.users.values()].forEach((user) => (user.online = false));
        //   [...this.client.channels.values()].forEach((channel) => channel.typing_ids.clear());
        // });

        // if (!disallowReconnect && this.client.autoReconnect) {
        //   backOff(() => this.connect(true)).catch(reject);
        // }
      };
    });
  }
}
