/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   manager.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/22 16:32:11 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 22:03:00 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { GatewayMessageCreateDispatch, GatewayReadyDispatch, GatewayInteractionCreateDispatch, GatewayGuildCreateDispatch } from "discord-api-types/v9";
import type { SlashCommandNames, SlashCommandOptions } from "./discord/slashCommands.js";
import type { MatrixTimelineEvent, MatrixConfig } from "./matrix/matrix.d";
import type { DiscordGatewayOptions } from "./discord/discord.js";
import type { RevoltOptions } from "./revolt.js";
import type { ENVS } from "./environment.d";

import { slashCommands } from "./discord/slashCommands.js";
import { DiscordGateway } from "./discord/discord.js";
import { MatrixBot } from "./matrix/matrix.js";
import { LoggerWithoutCallSite } from "tslog";
import { RevoltWebsocket } from "./revolt.js";
import { Cache } from "./utils/cache.js";
import prism from "@prisma/client";

type Options = {
  env: ENVS;
  discord: DiscordGatewayOptions;
  matrix: MatrixConfig;
  revolt: RevoltOptions;
};

export class GateWayManager extends prism.PrismaClient {
  discord: DiscordGateway;
  matrix: MatrixBot;
  revolt: RevoltWebsocket;
  logger: LoggerWithoutCallSite;
  dev: boolean;
  cache: Cache;
  constructor(options: Options) {
    super({
      log: [
        {
          level: "query",
          emit: "event",
        },
      ],
    });
    this.dev = options.env == "DEV";
    this.logger = new LoggerWithoutCallSite({
      exposeStack: false,
      exposeErrorCodeFrame: true,
      displayFilePath: "hidden",
      displayDateTime: false,
    });
    this.discord = new DiscordGateway(this, options.discord);
    this.matrix = new MatrixBot(this, options.matrix);
    this.revolt = new RevoltWebsocket(this, options.revolt);
    this.cache = new Cache(this);
    //@ts-ignore -
    this.$on("query", (args) => this.logger.info("[QUERY]", args.query));
  }
  async startALL() {
    this.revolt.connect();
    this.discord.connect(this.discord.gatewayURL);
    await this.matrix.start();
  }
  async start() {
    await this.startALL();
  }
  async broadCastMessage(options: { username: string; content: string; chat: string; avatar?: string; from: string; files?: string[] }) {
    if (!content) return;
    const query: any = {
      select: {
        discord: true,
        matrix: true,
        revolt: true,
        token: true,
      },
      where: {
        [options.chat.toLowerCase()]: options.from,
      },
    };
    delete query.select[options.chat.toLowerCase()];
    const serverData = await this.bridge.findFirst(query);
    if (serverData) {
      this.logger.info(`username: ${options.username}`, `${options.chat}@${options.from}`);
    }

    if (serverData?.token !== null) return;
    if (serverData?.discord) {
      await this.discord.sendServerMessage({
        channel: serverData.discord,
        username: options.username,
        content: options.content,
        chat: options.chat,
      });
    }
    if (serverData?.matrix) {
      await this.matrix.sendMatrixMessage({
        channel: serverData.matrix,
        username: options.username,
        content: options.content,
        chat: options.chat,
        files: options.files,
      });
    }
    if (serverData?.revolt) {
      await this.revolt.sendRevoltMessage({
        channel: serverData.revolt,
        username: options.username,
        content: options.content,
        chat: options.chat,
        files: options.files,
      });
    }
  }
  async discordPacketHandler(data: GatewayMessageCreateDispatch | GatewayInteractionCreateDispatch | GatewayReadyDispatch | GatewayGuildCreateDispatch) {
    if (data.t == "GUILD_CREATE") {
      if (data.d.unavailable) return;
      await this.discord.runRestMethod(`applications/${this.discord.user.id}/guilds/${data.d.id}/commands`, slashCommands, "PUT");
      this.cache.addDiscordGuild(data.d);
      await this.discord.syncSlashCommands();
    }
    if (data.t == "INTERACTION_CREATE") {
      const interaction = data.d;
      if (interaction.member?.user) this.cache.d.users.set(interaction.member?.user.id, interaction.member?.user);
      if (interaction.type == 2) {
        const name: SlashCommandNames = interaction.data.name as SlashCommandNames;

        let options: SlashCommandOptions | Record<string, string> = {};

        //@ts-expect-error -
        if (interaction.data?.options) {
          //@ts-expect-error -
          for (const option of interaction.data?.options) {
            if (option?.value) {
              options[option.name] = option.value;
            }
          }
        }
        if (name == "help") {
          await this.discord.sendInteractionResponse(interaction, {
            type: 4,
            data: { content: "Hello im bridge bot and you can use my to connect discord channels and matrix channels\n\nTo get started use /setup <discordchannel> <matrixChannel> or <revoltchannel> then i will send you a code which you can use in the matrix channel to connect them both" },
          });
        } else if (name == "setup") {
          const roles = this.cache.d.roles.filter((x) => interaction.member?.roles.includes(x.id) || false);
          let permissions = 0n;
          permissions |=
            [...roles.values()]
              .map((id) => BigInt(this.cache.d.roles.get(id.id)?.permissions || 0n) || 0n)
              // Removes any edge case undefined
              .filter((perm) => perm)
              .reduce((bits, perms) => {
                bits! |= perms!;
                return bits;
              }, 0n) || 0n;
          if ((permissions & 8n) == 0n)
            await this.discord.sendInteractionResponse(interaction, {
              type: 4,
              data: { content: "You need to be a admin to use this command" },
            });
          const exist = await this.bridge.findFirst({
            where: {
              OR: [{ discord: options.discord }, { matrix: options.matrix }, { revolt: options.revolt }],
            },
          });
          if (exist)
            await this.discord.sendInteractionResponse(interaction, {
              type: 4,
              data: { content: "Theres already a bridge on one of those channels please make sure you did everything right" },
            });
          //https://stackoverflow.com/a/8084248/16944952
          const token = (Math.random() + 1).toString(36).substring(7);
          await this.bridge.create({
            data: {
              token: token,
              discord: options.discord,
              matrix: options.matrix,
              revolt: options.revolt,
            },
          });
          await this.discord.sendInteractionResponse(interaction, {
            type: 4,
            data: { content: `Part one of the setup complete please use \`!link ${token}\` in the matrix or revolt chat make sure the bot is added to there too :)` },
          });
        }
      }
    }
    if (data.t == "READY") {
      this.cache.d.users.set(data.d.user.id, data.d.user);
      this.discord.user = data.d.user;
    }
    if (data.t == "MESSAGE_CREATE") {
      this.cache.d.users.set(data.d.author.id, data.d.author);
      let message = data.d;
      if (message.webhook_id) return;
      if (message.author.bot) return;

      await this.broadCastMessage({
        from: message.channel_id,
        username: `${message.author.username}#${message.author.discriminator}`,
        content: message.content,
        chat: "Discord",
        files: message?.attachments?.map((x) => x.url),
      });
    }
  }
  async RevoltPacketHandler(packet: any) {
    if (packet.type == "Pong") {
      this.logger.debug("PONG /REVOLT");
    }
    if (packet.type == "Message") {
      let user = await this.cache.r.getUser(packet.author);
      if (!user || user?.bot?.owner) return;
      if (user.username == "bridger") return;
      if (packet.content.startsWith("!link")) {
        const chat = await this.bridge.findFirst({
          select: {
            revolt: true,
            id: true,
          },
          where: {
            token: packet.content.split(" ")[1],
          },
        });
        if (!chat) {
          return this.revolt.sendMessage(packet.channel, "Invalid token");
        }
        await this.bridge.update({
          where: {
            id: chat.id,
          },
          data: {
            token: null,
          },
        });
        return this.revolt.sendMessage(packet.channel, "Linking completed");
      }

      await this.broadCastMessage({
        username: user?.username,
        content: packet.content,
        chat: "Revolt",
        // avatar: user.avatar.
        from: packet.channel,
      });
    }
  }
  async matrixHandler(roomId: string, event: MatrixTimelineEvent) {
    if ((event.type == "m.room.message" || event.type == "m.text") && event.sender !== this.matrix.ownUserId) {
      if (event.content.body.startsWith("!link")) {
        const chat = await this.bridge.findFirst({
          select: {
            matrix: true,
            id: true,
          },
          where: {
            token: event.content.body.split(" ")[1],
          },
        });
        if (!chat) {
          return this.matrix.sendRoomText(roomId, "Invalid token");
        }
        await this.bridge.update({
          where: {
            id: chat.id,
            // token: event.content.body.split(" ")[1],
          },
          data: {
            //@ts-ignore -
            token: null,
          },
        });
        return this.matrix.sendRoomText(roomId, "Linking completed");
      }
      await this.broadCastMessage({
        from: roomId,
        username: event.sender.split(":")[0].replace("@", ""),
        content: event.content.body,
        chat: "Matrix",
      });
    }
  }
}
