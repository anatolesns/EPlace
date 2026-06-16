// FIXME: This file should handle the redirection to the AUTH URL
// Functions may include:
// - createLink (construct and return the URL to redirect the user to the login page)
// - redirectToLoginPage (redirect the user to the Forge ID login page)
export function createLink() {
    const client_id = new URL(`${import.meta.env.VITE_AUTH_URL}/authorize`);

    client_id.searchParams.append("response_type", "code");
    client_id.searchParams.append(
        "client_id",
        `${import.meta.env.VITE_CLIENT_ID}`,
    );
    client_id.searchParams.append(
        "redirect_uri",
        "http://localhost:8080/complete/epita/",
    );
    client_id.searchParams.append("scope", "epita profile picture");

    //console.log(client_id);

    return client_id;
}

export function redirectToLoginPage() {
    window.location.href = createLink();
}
