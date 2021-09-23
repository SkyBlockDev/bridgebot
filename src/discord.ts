/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   discord.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/22 16:32:02 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/23 13:02:32 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { RESTGetAPIChannelWebhooksResult, APIUser, GatewayInteractionCreateDispatchData } from "discord-api-types/v9";
import type { GateWayManager } from "./manager.js";

import { slashCommands } from "./slashCommands.js";
import { bridgeError } from "./BridgeError.js";
import { Gateway } from "detritus-client-socket";
import fetch from "node-fetch";
export interface DiscordGatewayOptions {
  token: string;
  ownerId: string;
  gatewayURL?: string;
  avatarURL?: string;
  options?: Gateway.SocketOptions;
}
type Webhook = {
  token: string;
  id: string;
};
export class DiscordGateway extends Gateway.Socket {
  gatewayURL: string;
  manager: GateWayManager;
  avatarURL: string;
  webhooks = new Map<string, Webhook>();
  user!: APIUser;
  constructor(manager: GateWayManager, { token, avatarURL = "https://eu.ui-avatars.com/api/?background=0080ff&name=", gatewayURL = "wss://gateway.discord.gg/", options }: DiscordGatewayOptions) {
    super(token, options);
    this.gatewayURL = gatewayURL;
    this.manager = manager;
    this.avatarURL = avatarURL;
    this.on("packet", (p: any) => {
      return this.manager.discordPacketHandler(p);
    });
  }
  async sendInteractionResponse(interaction: GatewayInteractionCreateDispatchData, data: any) {
    await this.runRestMethod(`interactions/${interaction.id}/${interaction.token}/callback`, data, "POST");
  }
  async syncSlashCommands(): Promise<Array<any>> {
    let results: any[] = [];
    for (const guild of this.manager.cache.d.guilds.values()) {
      await this.runRestMethod(`applications/${this.user.id}/guilds/${guild.id}/commands`, slashCommands, "PUT");
    }

    return results;
  }
  async getChannelWebhook(channel: string) {
    const webhooks = await this.runRestMethod<RESTGetAPIChannelWebhooksResult>(`channels/${channel}/webhooks`);
    let webhook = webhooks.find((x) => x.token);
    if (!webhook) {
      const webhookDATA = await this.runRestMethod(
        `channels/${channel}/webhooks`,
        {
          name: "bridgebot",
        },
        "POST"
      );
      webhook = webhookDATA;
    }
    if (!webhook) {
      this.manager.logger.trace(`COULDN'T FETCH WEBHOOKS FOR ${channel}`);
      throw bridgeError(`COULDN'T FETCH WEBHOOKS FOR ${channel}`, {
        channel: channel,
      });
    }
    const data = {
      token: webhook.token as string,
      id: webhook.id,
    };
    this.webhooks.set(channel, data);
    return data;
  }

  async sendServerMessage({ channel, username, content, chat }: { channel: string; username: string; content: string; chat: string }) {
    let webhookDATA = this.webhooks.get(channel);
    if (!webhookDATA) {
      webhookDATA = await this.getChannelWebhook(channel);
    }
    await this.runRestMethod(
      `webhooks/${webhookDATA.id}/${webhookDATA.token}`,
      {
        content,
        avatar_url: `${this.avatarURL}${encodeURI(username)}`,
        username: `${username} (${chat})`,
      },
      "POST"
    );
  }
  async runRestMethod<T = any>(endpoint: string, input: any = undefined, method: string = "GET") {
    const res = await fetch(`https://discord.com/api/v9/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${this.token}`,
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
}
// const token = '';
// const client = new Gateway.Socket(token, {
//   presence: {
//     status: 'dnd',
//   },
// });

// client.on('ready', () => {
//   console.log('ready');
// });

// client.on('packet', (packet) => console.log('packet', packet));
// client.on('close', (event) => console.log('client close', event));
// client.on('warn', console.error);

// client.connect('wss://gateway.discord.gg/');
