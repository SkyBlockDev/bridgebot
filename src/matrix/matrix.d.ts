/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   matrix.d.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/22 16:32:16 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:10:56 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface MatrixConfig {
  accessToken: string;
  homeserverUrl?: string;
  syncTimeout?: number;
  userId?: string;

  formatHTMLtoPlain?: (html: string) => string;
}

export interface MatrixUserProfileResponse {
  avatar_url: string;
  displayname: string;
}

export interface MatrixRoomStateResponse {
  name: string;
}

export interface MatrixWhoAmIResponse {
  user_id: string;
}

export interface MatrixJoinedRoomsResponse {
  joined_rooms: string[];
}

export interface MatrixSyncResponse {
  rooms: { join: Map<string, MatrixRoomEvent> };
  next_batch: string;
}

export interface MatrixRoomEvent {
  timeline: {
    events: MatrixTimelineEvent[];
  };
}

export interface MatrixTimelineEvent {
  content: {
    // m.room.message;
    body: string;
    msgtype: string;
    format: string;
    // m.room.message;
    formatted_body: string;
    membership: string;
    displayname: string;
    avatar_url: string;
  };
  type: string;
  event_id: string;
  sender: string;
}
