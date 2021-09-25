/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cache.d.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/25 12:10:05 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:10:58 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { APIRole } from "discord-api-types/v9";
interface BridgeGuild {
  id: string;
  name: string;
}
interface BridgeRole extends APIRole {
  guildId: string;
}

export interface RevoltUser {
  _id: string;
  username: string;
  avatar: Avatar;
  relations: Relation[];
  badges: number;
  status: Status;
  relationship: string;
  online: boolean;
  flags: number;
  bot: Bot;
}

export interface Avatar {
  _id: string;
  tag: string;
  size: number;
  filename: string;
  metadata: Metadata;
  content_type: string;
}

export interface Metadata {
  type: string;
}

export interface Bot {
  owner: string;
}

export interface Relation {
  status: string;
  _id: string;
}

export interface Status {
  text: string;
  presence: string;
}
