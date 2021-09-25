/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cache.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/23 12:42:33 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 14:09:46 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { APIGuild, APIChannel, APIUser } from "discord-api-types/v9";
import type { BridgeGuild, BridgeRole, RevoltUser } from "./cache.d";
import type { GateWayManager } from "../manager.js";

import { Collection } from "@discordjs/collection";

export class CacheMap<T, V> extends Collection<T, V> {}

export class Cache {
  constructor(public manager: GateWayManager) {}
  addDiscordGuild(DATA: APIGuild) {
    DATA.channels?.forEach((c) => this.d.channels.set(c.id, c));
    DATA.roles.forEach((r) =>
      this.d.roles.set(r.id, {
        ...r,
        guildId: DATA.id,
      })
    );
    DATA.members?.forEach((m) => m.user && this.d.users.set(m.user.id, m.user));
    let guild: BridgeGuild = {
      id: DATA.id,
      name: DATA.name,
    };

    this.d.guilds.set(guild.id, guild);
  }
  r = {
    guilds: new CacheMap<string, BridgeGuild>(),
    roles: new CacheMap<string, BridgeRole>(),
    users: new CacheMap<string, RevoltUser>(),
    members: new CacheMap<string, APIUser>(),
    channels: new CacheMap<string, APIChannel>(),
    messages: new CacheMap<string, APIChannel>(),
    getUser: async (user: string) => {
      let data = this.r.users.get(user);
      if (!data) data = await this.manager.revolt.runRestMethod<RevoltUser>(`users/${user}`, undefined, "GET");
      return data;
    },
  };
  d = {
    guilds: new CacheMap<string, BridgeGuild>(),
    roles: new CacheMap<string, BridgeRole>(),
    users: new CacheMap<string, APIUser>(),
    channels: new CacheMap<string, APIChannel>(),
  };
  m = {
    guilds: new CacheMap(),
    users: new CacheMap(),
  };
}
