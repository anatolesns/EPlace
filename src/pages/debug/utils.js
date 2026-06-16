// FIXME: File that provide utils function for the debug page
import $ from "jquery";
import jwt_decode from "jwt-decode";
import { createAlert } from "../../utils/notify";

export async function displayStudentProfile() {
    const token = localStorage.getItem("token");
    const decoded = jwt_decode(token);

    const _uid = decoded.uid;

    // You have to write a request to fetch your informations
    const request_result = null;

    if (request_result === null) {
        createAlert(
            "debug",
            "Fetch not implemented in the pages/debug/utils.js file",
            "error",
        );
    }

    const student_resources = await request_result?.json();

    $("#profile-info-avatar").attr(
        "src",
        student_resources.avatarURL ?? "/default-avatar.png",
    );

    $("#profile-info-login").text(student_resources.login);
    $("#profile-info-quote").text(student_resources.quote);
}

export function expired() {
    const token = localStorage.getItem("token");
    const splited_token = token.split(".");

    let base64 = splited_token[1].replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4 !== 0) {
        base64 += "=";
    }

    const parts = JSON.parse(atob(base64));

    parts["exp"] = 0;

    const recodedValue = btoa(JSON.stringify(parts))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    splited_token[1] = recodedValue;
    const expiredToken = splited_token.join(".");

    localStorage.setItem("token", expiredToken);
}
