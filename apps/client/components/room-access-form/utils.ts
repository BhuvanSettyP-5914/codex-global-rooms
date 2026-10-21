/**
 * Utility functions for room management operations.
 * Features:
 * - Room creation handling
 * - Room joining validation
 * - Room ID formatting
 * - Socket communications
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

import { RoomServiceMsg } from "@codex/types/message";
import type { ChangeEvent } from "react";

import { storage } from "@/lib/services/storage";
import { getSocket } from "@/lib/socket";

const DASH_PATTERN = /-/g;
const NON_ALPHANUMERIC_PATTERN = /[^A-Z0-9]/g;
const ROOM_ID_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const ROOM_REQUEST_TIMEOUT_MS = 10_000;

export const createRoom = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    const cleanup = () => {
      socket.off(RoomServiceMsg.CREATE, handleCreate);
      socket.off("connect_error", handleConnectionError);
      clearTimeout(timeout);
    };
    const handleCreate = (roomId: string, userID: string) => {
      cleanup();
      const formattedRoomId = formatRoomId(roomId);

      storage.setRoomId(formattedRoomId);
      storage.setUserId(userID);

      resolve(formattedRoomId);
    };
    const handleConnectionError = (error: Error) => {
      cleanup();
      reject(
        new Error(
          `Could not connect to the room server. Check that the server is running and try again. (${error.message})`
        )
      );
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "The room server did not respond in time. Check your connection and try again."
        )
      );
    }, ROOM_REQUEST_TIMEOUT_MS);

    socket.once(RoomServiceMsg.CREATE, handleCreate);
    socket.once("connect_error", handleConnectionError);
    socket.emit(RoomServiceMsg.CREATE, name);
  });
};

export const joinRoom = (roomId: string, name: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const socket = getSocket();

    const cleanedRoomId = roomId.replace(DASH_PATTERN, "");
    const cleanup = () => {
      socket.off(RoomServiceMsg.JOIN, handleJoin);
      socket.off(RoomServiceMsg.NOT_FOUND, handleNotFound);
      socket.off("connect_error", handleConnectionError);
      clearTimeout(timeout);
    };

    const handleNotFound = () => {
      cleanup();
      reject("Room does not exist. Please check the room ID and try again.");
    };
    const handleJoin = (userID: string) => {
      cleanup();
      storage.setRoomId(cleanedRoomId);
      storage.setUserId(userID);
      resolve(true);
    };
    const handleConnectionError = (error: Error) => {
      cleanup();
      reject(
        new Error(
          `Could not connect to the room server. Check that the server is running and try again. (${error.message})`
        )
      );
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "The room server did not respond in time. Check your connection and try again."
        )
      );
    }, ROOM_REQUEST_TIMEOUT_MS);

    socket.once(RoomServiceMsg.NOT_FOUND, handleNotFound);
    socket.once(RoomServiceMsg.JOIN, handleJoin);
    socket.once("connect_error", handleConnectionError);
    socket.emit(RoomServiceMsg.JOIN, cleanedRoomId, name);
  });
};

/**
 * Handles room ID input changes with formatting
 * @param e - Change event from input element
 */
export const onRoomIdChange = (e: ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value.toUpperCase();
  e.target.value = formatRoomId(rawValue);
};

const formatRoomId = (value: string) => {
  // Remove any non-alphanumeric characters
  const cleaned = value.replace(NON_ALPHANUMERIC_PATTERN, "");

  // Limit to 8 characters
  const truncated = cleaned.slice(0, 8);

  // Add dash after first 4 characters if length > 4
  if (truncated.length > 4) {
    return `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
  }

  return truncated;
};

/**
 * Checks if the room ID is valid (XXXX-XXXX where X is alphanumeric)
 * @param value
 * @returns
 */
export const isRoomIdValid = (value: string) => ROOM_ID_PATTERN.test(value);
