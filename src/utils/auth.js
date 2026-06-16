import { redirectToLoginPage } from "./redirect";
// FIXME: This file should handle the authentication
// Functions may include:
// - getToken (exchanges the code for a token)
// - refreshToken (refreshes the token using the refresh_token)
// - authenticate (checks if the user is authenticated)
// - authedAPIRequest (makes an authenticated request to the API)

/**
 * @param {string} code the authorization code received from the OIDC
 * provider
 * @returns {Promise<boolean>} true if the token was fetched, false otherwise
 */

export async function getToken(code) {
    const ask = new FormData();

    ask.append("grant_type", "authorization_code");
    ask.append("code", code);
    ask.append("redirect_uri", `${import.meta.env.VITE_URL}/complete/epita/`);
    ask.append("client_id", `${import.meta.env.VITE_CLIENT_ID}`);

    try {
        const res = await fetch(`${import.meta.env.VITE_URL}/auth-api/token`, {
            method: "POST",
            body: ask,
        });

        if (!res.ok) {
            localStorage.clear();
            redirectToLoginPage();
            return false;
        }

        const data = await res.json();

        localStorage.setItem("token", data.id_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        return true;
    } catch {
        localStorage.clear();
        redirectToLoginPage();
        return false;
    }
}

/**
 * @param {string} refreshToken the refresh token (optional)
 * @returns {Promise<boolean>} whether the token has been refreshed or not
 */
export async function refreshToken(refreshToken) {
    let token = refreshToken;

    if (!token) {
        token = localStorage.getItem("refresh_token");
    }

    if (!token) {
        localStorage.clear();
        redirectToLoginPage();
        return false;
    }

    const ask = new FormData();

    ask.append("grant_type", "refresh_token");
    ask.append("refresh_token", token);
    ask.append("client_id", `${import.meta.env.VITE_CLIENT_ID}`);

    try {
        const res = await fetch(`${import.meta.env.VITE_URL}/auth-api/token`, {
            method: "POST",
            body: ask,
        });

        if (!res.ok) {
            localStorage.clear();
            redirectToLoginPage();
            return false;
        }

        const data = await res.json();

        localStorage.setItem("token", data.id_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        return true;
    } catch {
        localStorage.clear();
        redirectToLoginPage();
        return false;
    }
}

/**
 * @returns {boolean} true if the user is authenticated, false otherwise
 */
export async function authenticate() {
    let token = localStorage.getItem("token");

    if (token) {
        return true;
    }

    token = localStorage.getItem("refresh_token");
    if (!token) {
        redirectToLoginPage();
        return false;
    }

    return await refreshToken(token);
}

/**
 * @param {string} endpoint
 * @param {object} options this object should at least contain the method.
 * @returns {Promise<Response>} the response or null
 * We want a {Promise<Response>} so we can read the headers as well as the
 * body, rather than just the body
 */
export async function authedAPIRequest(endpoint, options) {
    const auth = await authenticate();

    if (!auth) {
        localStorage.clear();
        redirectToLoginPage();
        return null;
    }

    let token = localStorage.getItem("token");

    let res = await fetch(`${import.meta.env.VITE_URL}/api${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (res.ok) {
        return res;
    }

    if (res.status === 401) {
        const txt = await res.text();

        if (!txt.includes("Token expired")) {
            localStorage.clear();
            redirectToLoginPage();
            return null;
        }

        const refresh_token = await refreshToken();

        if (!refresh_token) {
            return null;
        }

        token = localStorage.getItem("token");

        res = await fetch(`${import.meta.env.VITE_URL}/api${endpoint}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        return res;
    }

    return res;
}
