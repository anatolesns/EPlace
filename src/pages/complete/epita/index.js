// FIXME: This file should handle the auth redirection
// Get the code from the URL parameters and redirect to the relevant page
import { redirectToLoginPage } from "../../../utils/redirect";
import { getToken } from "../../../utils/auth.js";

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");

if (!code) {
    redirectToLoginPage();
}

const token = await getToken(code);

if (!token) {
    redirectToLoginPage();
}

window.location.href = "/";
