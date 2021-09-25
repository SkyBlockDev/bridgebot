/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   environment.d.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/22 16:31:53 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:11:00 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type ENVS = "PROD" | "DEV";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      MATRIX_TOKEN: string;
      REVOLT_TOKEN: string;
      ENVIRONMENT: ENVS;
    }
  }
}
