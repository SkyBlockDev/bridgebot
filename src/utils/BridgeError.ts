/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BridgeError.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/23 12:42:40 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:10:58 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class BridgeError extends Error {
  constructor(message: string | undefined, data?: any) {
    super(message);
    Object.assign(this, data);
  }
}
export function bridgeError<T>(message: string | undefined, data?: T) {
  return new BridgeError(message, data) as BridgeError & T;
}
