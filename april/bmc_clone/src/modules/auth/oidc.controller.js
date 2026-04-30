import * as oidcService from "./oidc.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const OIDC_COOKIES = {
  pkce: "oidc_pkce",
  state: "oidc_state",
};

/** Public origin for redirects — must match the host the browser used (localhost vs 127.0.0.1). */
const getRequestPublicBase = (req) => {
  const host = req.get("host") || `127.0.0.1:${process.env.PORT || 5000}`;
  let proto = req.protocol || "http";
  const xfProto = req.get("x-forwarded-proto");
  if (xfProto) proto = xfProto.split(",")[0].trim();
  return `${proto}://${host}`;
};

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
  path: "/",
});

const clearOidcCookies = (res) => {
  const opts = { ...cookieBase(), maxAge: 0 };
  res.clearCookie(OIDC_COOKIES.pkce, opts);
  res.clearCookie(OIDC_COOKIES.state, opts);
};

const redirectLoginOidcError = (res, req, message) => {
  const base = getRequestPublicBase(req);
  res.redirect(
    `${base}/login?oidc_error=${encodeURIComponent(message)}`,
  );
};

const startOidcLogin = async (req, res) => {
  try {
    const redirectUri = oidcService.resolveRedirectUri(req);
    if (!redirectUri) {
      return redirectLoginOidcError(
        res,
        req,
        "Could not build redirect URI. Set OIDC_REDIRECT_URI or CLIENT_URL in .env.",
      );
    }

    const config = await oidcService.getOidcConfig(redirectUri);
    const codeVerifier = oidcService.oidc.randomPKCECodeVerifier();
    const codeChallenge =
      await oidcService.oidc.calculatePKCECodeChallenge(codeVerifier);
    const state = oidcService.oidc.randomState();

    const c = cookieBase();
    res.cookie(OIDC_COOKIES.pkce, codeVerifier, c);
    res.cookie(OIDC_COOKIES.state, state, c);

    const params = {
      redirect_uri: redirectUri,
      scope: oidcService.getScope(),
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    };

    const redirectTo = oidcService.oidc.buildAuthorizationUrl(config, params);
    res.redirect(redirectTo.href);
  } catch (err) {
    console.error("[OIDC] login start failed:", err);
    return redirectLoginOidcError(
      res,
      req,
      err?.message ||
        "Could not reach the identity provider. Check OIDC_ISSUER and that the IdP is running.",
    );
  }
};

const oidcCallback = async (req, res) => {
  const idpError = req.query?.error;
  if (idpError) {
    const desc =
      (typeof req.query?.error_description === "string" &&
        req.query.error_description) ||
      String(idpError);
    clearOidcCookies(res);
    return redirectLoginOidcError(res, req, `Identity provider: ${desc}`);
  }

  const codeVerifier = req.cookies?.[OIDC_COOKIES.pkce];
  const expectedState = req.cookies?.[OIDC_COOKIES.state];

  if (!codeVerifier || !expectedState) {
    clearOidcCookies(res);
    return redirectLoginOidcError(
      res,
      req,
      "OIDC session cookies were missing (expired, blocked, or wrong site). Use the same host as OIDC_REDIRECT_URI (e.g. only localhost or only 127.0.0.1) and try “Continue with OpenID Connect” again.",
    );
  }

  try {
    const redirectUri = oidcService.resolveRedirectUri(req);
    if (!redirectUri) {
      return redirectLoginOidcError(
        res,
        req,
        "Could not resolve redirect URI for OIDC callback. Set OIDC_REDIRECT_URI or CLIENT_URL.",
      );
    }

    const config = await oidcService.getOidcConfig(redirectUri);
    const base = getRequestPublicBase(req);
    const currentUrl = new URL(req.originalUrl, base);

    const tokens = await oidcService.oidc.authorizationCodeGrant(
      config,
      currentUrl,
      {
        pkceCodeVerifier: codeVerifier,
        expectedState,
        idTokenExpected: true,
      },
    );

    clearOidcCookies(res);

    const claims = tokens.claims();
    if (!claims) {
      return redirectLoginOidcError(
        res,
        req,
        "No ID token in the token response. Ensure the IdP returns an id_token for scope openid.",
      );
    }

    const { accessToken, refreshToken } =
      await oidcService.completeOidcLogin(claims);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const baseNorm = base.replace(/\/$/, "");
    const pathOrUrl = (
      process.env.OIDC_POST_LOGIN_REDIRECT || "/dashboard"
    ).trim();
    const absolute = pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${baseNorm}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;

    const targetUrl = new URL(absolute);
    targetUrl.hash = `access_token=${encodeURIComponent(accessToken)}&token_type=Bearer`;

    res.redirect(targetUrl.href);
  } catch (err) {
    console.error("[OIDC] callback failed:", err);
    clearOidcCookies(res);
    const msg =
      err?.message ||
      err?.cause?.message ||
      "OIDC sign-in failed. Check server logs.";
    return redirectLoginOidcError(res, req, msg);
  }
};

const oidcStatus = (req, res) => {
  try {
    ApiResponse.ok(res, "OIDC configuration", {
      enabled: oidcService.isOidcConfigured(),
      redirectUri: oidcService.getRedirectUri() || null,
    });
  } catch {
    ApiResponse.ok(res, "OIDC configuration", {
      enabled: false,
      redirectUri: null,
    });
  }
};

export { startOidcLogin, oidcCallback, oidcStatus };
