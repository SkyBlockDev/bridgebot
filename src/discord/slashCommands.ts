/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   slashCommands.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/23 08:22:57 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:15:30 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const slashCommands = [
  {
    name: "help",
    description: "i need support please help",
    default_permission: true,
    options: [],
  },
  {
    name: "setup",
    description: "set the bot up",
    default_permission: true,
    options: [
      {
        type: 7,
        name: "discord",
        description: "the channel in discord to link to matrix",
        required: true,
      },
      {
        type: 3,
        name: "matrix",
        description: "the channel the bot should link to in matrix",
        required: false,
      },
      {
        type: 3,
        name: "revolt",
        description: "the channel the bot should link to in revolt",
        required: false,
      },
    ],
  },
] as const;
export type SlashCommandNames = typeof slashCommands[number]["name"];
export type SlashCommandOptions = Record<typeof slashCommands[number]["options"][number]["name"], string>;
