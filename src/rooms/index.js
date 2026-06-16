// FIXME: This file should handle the rooms API
// Functions may include:
// - fetchRoomConfig (get the configuration of a room)
// - setCurrentRoomConfig (set the current room configuration and update the DOM accordingly)
// - getCurrentRoomConfig (get the current room configuration)
// - joinRoom (join a room by its slug)
// - listRooms (list all the rooms available)
// - createRoom (create a room)
// - updateRoom (update a room's configuration)
// - deleteRoom (delete a room)
import { authedAPIRequest } from "../utils/auth.js";
import { initCanvas, renderCanvasUpdate } from "./canvas/utils.js";

let roomConfig = null;

export function getCurrentRoomConfig() {
    return roomConfig;
}

export function setCurrentRoomConfig(config) {
    roomConfig = config;

    const name = document.getElementById("room-name");

    if (name) {
        name.textContent = config.metadata.name ?? "";
    }

    console.log(name);

    const desc = document.getElementById("room-description");

    if (desc) {
        if (config.metadata.description) {
            desc.textContent = config.metadata.description;
            desc.style.display = "";
        } else {
            desc.style.display = "none";
        }
    }
}

export async function fetchRoomConfig(slug) {
    const res = await authedAPIRequest(`/rooms/${slug}/config`, {
        method: "GET",
    });

    if (!res) {
        return null;
    }

    const data = await res.json();

    setCurrentRoomConfig(data);
    return data;
}

function decodeCanvas(text, total) {
    const pixels = [];
    let pos = 0;

    while (pixels.length < total) {
        let val = 0;

        for (let i = 0; i < 5; i++) {
            const c = Math.floor((pos + i) / 8);
            const b = 7 - ((pos + i) % 8);

            val = val * 2 + ((text.charCodeAt(c) >> b) & 1);
        }

        pixels.push(val);
        pos += 5;
    }

    return pixels;
}

async function fetchCanvas(slug, config) {
    const res = await authedAPIRequest(`/rooms/${slug}/canvas`, {
        method: "GET",
    });

    if (!res) {
        return null;
    }

    const data = await res.json();

    //const text = await res.text();
    let pixels = data.pixels;
    const byte = new Uint8Array(pixels.length);

    for (let i = 0; i < pixels.length; i++) {
        byte[i] = pixels.charCodeAt(i);
    }

    const size = config.metadata.canvasDimensions;

    pixels = decodeCanvas(pixels, size * size);

    initCanvas(config, pixels);
    return pixels;
}

export async function joinRoom(slug, socket) {
    const queue = [];
    let ready = false;

    socket.on("pixel-update", (msg) => {
        if (!msg.result || !msg.result.data) {
            return;
        }

        const p = msg.result.data.json;

        if (ready) {
            renderCanvasUpdate(p.color, p.posX, p.posY);
        } else {
            queue.push(p);
        }
    });

    const config = await fetchRoomConfig(slug);

    if (!config) {
        return;
    }

    await fetchCanvas(slug, config);
    ready = true;

    for (const q of queue) {
        renderCanvasUpdate(q.color, q.posX, q.posY);
    }
}
