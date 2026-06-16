// FIXME: This file should handle the sockets and the subscriptions
// Exports must include
// - initSocket (initialize the connection to the socket server)
// - socket (variable resulting of initSocket function)

// Functions may include:
// - subscribe (subscribe to a room's stream or chat)
// - unsubscribe (unsubscribe from a room's stream or chat)
// - sendMessage (send a message to a room's chat)

/**
 * Initializes the socket when authenticated
 * returns {Promise<void>}
 */
import { authenticate, refreshToken } from "../utils/auth.js";
import { io } from "socket.io-client";
import { v4 as uuid } from "uuid";
import { redirectToLoginPage } from "./redirect.js";

export let socket;
let id;

export async function initSocket() {
    const auth = authenticate();

    if (!auth || socket != null) {
        return;
    }

    const token = localStorage.getItem("token");

    socket = io(`${import.meta.env.VITE_URL}`, {
        extraHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    id = uuid();

    socket.on("connect_error", async (error) => {
        if (error && error.message && error.message.includes("Token expired")) {
            const refresh_token = await refreshToken();

            if (!refresh_token) {
                return null;
            }

            await initSocket();
        } else if (error && error.message && error.message.includes("401")) {
            localStorage.clear();
            redirectToLoginPage();
        }
    });
}

export function sub_room(slug) {
    return new Promise((resolve) => {
        id = uuid();

        socket.send({
            id: id,
            method: "subscription",
            params: {
                path: "rooms.canvas.getStream",
                input: {
                    json: {
                        roomSlug: slug,
                    },
                },
            },
        });

        socket.on("message", function h(message) {
            if (
                message.result &&
                message.result.type === "started" &&
                message.id == id
            ) {
                socket.off("message", h);
                resolve();
            }
        });
    });
}

export function unsub() {
    socket.send({
        id: id,
        method: "subscription.stop",
    });
}
