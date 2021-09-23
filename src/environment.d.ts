/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   environment.d.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/22 16:31:53 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/23 12:42:18 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type ENVS = "PROD" | "DEV";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      MATRIX_TOKEN: string;
      ENVIRONMENT: ENVS;
    }
  }
}
