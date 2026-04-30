/**
 * OIDC callback redirects here with #access_token=... (see oidc.controller).
 * Must run before any check that sends unauthenticated users to /login.
 */
(function () {
  function consumeOidcFragment() {
    const h = window.location.hash;
    if (!h || h.length < 2) return false;
    const params = new URLSearchParams(h.slice(1));
    const accessToken = params.get("access_token");
    if (!accessToken) return false;
    localStorage.setItem("accessToken", accessToken);
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    return true;
  }

  async function hydrateUserFromApi() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const r = await fetch("/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
        credentials: "include",
      });
      if (!r.ok) return;
      const body = await r.json();
      if (body && body.data) localStorage.setItem("user", JSON.stringify(body.data));
    } catch (_) {
      /* ignore */
    }
  }

  window.initOidcReturnFromHash = async function initOidcReturnFromHash() {
    const consumed = consumeOidcFragment();
    if (consumed) await hydrateUserFromApi();
    return consumed;
  };
})();
