import * as oidc from "openid-client";
import User from "./auth.model.js";
import ApiError from "../../common/utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/jwt.utils.js";
import crypto from "crypto";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getIssuerUrl = () => {
  const raw = process.env.OIDC_ISSUER?.trim();
  if (!raw) return null;
  try {
    return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
  } catch {
    return null;
  }
};

const getRedirectUri = () => {
  const explicit = process.env.OIDC_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const base = process.env.CLIENT_URL?.trim()?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/api/auth/oidc/callback`;
};

/**
 * redirect_uri sent to the IdP — must match the browser address and IdP registration.
 * Prefer OIDC_REDIRECT_URI; else CLIENT_URL; else the incoming request origin.
 */
const resolveRedirectUri = (req) => {
  const explicit = process.env.OIDC_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const base = process.env.CLIENT_URL?.trim()?.replace(/\/$/, "");
  if (base) return `${base}/api/auth/oidc/callback`;
  if (!req?.get) return null;
  const host = req.get("host");
  if (!host) return null;
  let proto = req.protocol || "http";
  const xf = req.get("x-forwarded-proto");
  if (xf) proto = xf.split(",")[0].trim();
  return `${proto}://${host}/api/auth/oidc/callback`;
};

const getScope = () =>
  (process.env.OIDC_SCOPE?.trim() || "openid email profile").replace(
    /^\s+|\s+$/g,
    "",
  );

let discoveryCache = null;
let discoveryKey = "";

const getOidcConfig = async (redirectUriOverride) => {
  const rawIssuer = process.env.OIDC_ISSUER?.trim();
  const issuer = getIssuerUrl();
  const clientId = process.env.OIDC_CLIENT_ID?.trim();
  const clientSecret = process.env.OIDC_CLIENT_SECRET?.trim() || "";
  const redirectUri = redirectUriOverride ?? getRedirectUri();

  if (!issuer || !clientId || !redirectUri) {
    const missing = [];
    if (!rawIssuer) missing.push("OIDC_ISSUER");
    else if (!issuer) missing.push("OIDC_ISSUER (value is not a valid URL)");
    if (!clientId) missing.push("OIDC_CLIENT_ID");
    if (!redirectUri) missing.push("OIDC_REDIRECT_URI or CLIENT_URL");
    throw ApiError.badRequest(
      `OIDC env not loaded or incomplete — missing: ${missing.join(", ")}. Put .env next to server.js and restart; Node cwd is ${process.cwd()}.`,
    );
  }

  const key = `${issuer.href}|${clientId}|${redirectUri}|${clientSecret}`;
  if (discoveryCache && discoveryKey === key) return discoveryCache;

  const metadata = {
    redirect_uris: [redirectUri],
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  };

  discoveryCache = await oidc.discovery(issuer, clientId, metadata);
  discoveryKey = key;
  return discoveryCache;
};

const isOidcConfigured = () => {
  try {
    return Boolean(
      getIssuerUrl() &&
        process.env.OIDC_CLIENT_ID?.trim() &&
        getRedirectUri(),
    );
  } catch {
    return false;
  }
};

/**
 * After a successful OIDC token exchange: find or create user, issue app JWTs.
 */
const completeOidcLogin = async (idClaims) => {
  const iss = String(idClaims.iss || "");
  const sub = String(idClaims.sub || "");
  if (!iss || !sub) {
    throw ApiError.badRequest("ID token missing iss or sub");
  }

  const emailRaw = idClaims.email;
  if (!emailRaw || typeof emailRaw !== "string") {
    throw ApiError.badRequest(
      "Your identity provider did not return an email claim. Add the email scope or map email in the IdP.",
    );
  }
  const email = emailRaw.toLowerCase().trim();
  const name =
    (typeof idClaims.name === "string" && idClaims.name.trim()) ||
    email.split("@")[0];

  let user = await User.findOne({ oidcIssuer: iss, oidcSub: sub });
  if (user) {
    if (user.name !== name || user.email !== email) {
      user.name = name;
      user.email = email;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    const byEmail = await User.findOne({ email });
    if (byEmail) {
      if (byEmail.oidcSub && byEmail.oidcIssuer) {
        throw ApiError.conflict(
          "This email is already linked to another OIDC account.",
        );
      }
      byEmail.oidcIssuer = iss;
      byEmail.oidcSub = sub;
      byEmail.isVerified = true;
      if (name) byEmail.name = name;
      await byEmail.save({ validateBeforeSave: false });
      user = byEmail;
    } else {
      user = await User.create({
        name,
        email,
        oidcIssuer: iss,
        oidcSub: sub,
        isVerified: true,
      });
    }
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

export {
  getOidcConfig,
  getRedirectUri,
  resolveRedirectUri,
  getScope,
  isOidcConfigured,
  completeOidcLogin,
  oidc,
};
