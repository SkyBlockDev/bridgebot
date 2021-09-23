/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/22 16:31:50 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/23 12:41:03 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { GateWayManager } from "./manager.js";
import { inspect } from "util";
const options = {
  env: process.env.ENVIRONMENT,
  discord: {
    token: process.env.DISCORD_TOKEN,
    //Change this if your selfhosting it
    ownerId: "336465356304678913",
  },
  matrix: {
    accessToken: process.env.MATRIX_TOKEN,
    userId: "@bridger:matrix.org",
    syncTimeout: 20000,
    formatHTMLtoPlain: (html: string) => html.replace(/<[^>]+>/g, ""),
    homeserverUrl: "https://matrix.org",
  },
};

process.on("uncaughtException", (e) => console.error(inspect(e, true, 5, true)));
process.on("unhandledRejection", (e) => console.error(inspect(e, true, 5, true)));
const manager = new GateWayManager(options);
manager.start();
