// FIXME: This is the entry point of the application, write your code here

import { calculateLayout } from "./utils";
//import { redirectToLoginPage } from "../utils/redirect";
import { authenticate } from "../utils/auth.js";
import { createAlert } from "../utils/notify.js";
import { initSocket, sub_room, socket } from "../utils/streams.js";
import { joinRoom } from "../rooms/index.js";

// Initialize the layout
calculateLayout();

const auth = await authenticate();

if (!auth) {
    createAlert("First Auth", "not authentificate", "error");
} else {
    createAlert("First Auth", "authorize", "success");
    await initSocket();
    let urlcourante = document.location.href;

    urlcourante = urlcourante.replace(/\/$/, "");

    const queue_url = urlcourante.substring(urlcourante.lastIndexOf("/") + 1);

    let slug = queue_url;

    if (queue_url !== "") {
        createAlert("room", queue_url, "success");
        slug = "epi-place";
    }

    await sub_room(slug);
    await joinRoom(slug, socket);
}
