import $ from "jquery";
import debugHtml from "./debug.html";
import { displayStudentProfile, expired } from "./utils";
import { createAlert } from "../../utils/notify";

const { authedAPIRequest, authenticate } = await import("../../utils/auth.js");
const authed = authedAPIRequest ?? (() => {});

function clearLocalStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
}

function clearUserProfile(log = true) {
    $("#profile-info-login").text("No login");
    $("#profile-info-quote").text("No quote");
    log && createAlert("Debug", "Clear user profile info", "success");
}

function refreshLocalStorage() {
    $("#token").text(localStorage.getItem("token") ?? "N/A");
    $("#refresh_token").text(localStorage.getItem("refresh_token") ?? "N/A");
}

async function refreshProfile() {
    await displayStudentProfile()
        .then(() => {
            createAlert("Debug", "Display profile succeed", "success");
        })
        .catch((_error) => {
            createAlert("Debug", "Cannot display profile", "error");
            clearUserProfile(false);
        });
}

async function refresh() {
    refreshLocalStorage();
    await refreshProfile();
}

(() => {
    if (import.meta.env.MODE !== "debug") {
        return;
    }

    $.get(debugHtml, function (response) {
        $("body").html(response);
        refreshLocalStorage();
    }).fail(function (_xhr, _status, error) {
        console.error("Error fetching debug HTML:", error);
    });

    $(document).on("click", "#launchOIDC", async function () {
        clearLocalStorage();
        if (await authenticate()) {
            createAlert("Debug", "OIDC succeed", "error");
        } else {
            createAlert("Debug", "OIDC failed", "error");
        }

        await refresh();
    });
    $(document).on("click", "#displayProfile", refreshProfile);
    $(document).on("click", "#hideProfile", clearUserProfile);
    $(document).on("click", "#errorBtn", async function () {
        await authed("/tests/error", { method: "GET" });
        createAlert("Debug", "Error response generated", "success");
        await refresh();
    });

    $(document).on("click", "#invalidToken", async function () {
        await authedAPIRequest("/tests/invalid-token", { method: "POST" });
        createAlert("Debug", "Invalid token response generated", "success");
        await refresh();
    });

    $(document).on("click", "#expiredTokenBtn", async function () {
        expired();
        let res = await authedAPIRequest("/tests/valid", { method: "GET" });

        res = await res.json();
        if (res.response === "A valid response") {
            createAlert(
                "Debug",
                "Token has been refreshed and the request has been re-send",
                "success",
            );
        } else {
            createAlert("Debug", "An error occured", "error");
        }

        await refresh();
    });

    $(document).on("click", "#deleteTokenBtn", async function () {
        localStorage.removeItem("token");
        createAlert("Debug", "Token removed from local storage", "success");
        await refresh();
    });

    $(document).on("click", "#deleteRefreshTokenBtn", async function () {
        localStorage.removeItem("refresh_token");
        createAlert(
            "Debug",
            "Refresh token removed from local storage",
            "success",
        );
        await refresh();
    });

    $(document).on("click", "#clearTokens", async function () {
        createAlert(
            "Debug",
            "Token and refresh token removed from local storage",
            "success",
        );
        clearLocalStorage();
        await refresh();
    });

    refresh();
})();
