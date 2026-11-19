/**
 * User IDs name a person's UserHub and prefix their bots (`<userId>:<botId>`),
 * so two Access emails must never share one.
 */

/** Prefix of hashed IDs. `_` never appears in a legacy ID. */
const HASHED_PREFIX = "u_"

/**
 * The ID for an Access email: a SHA-256 of the lowercased address. Two
 * different emails get different IDs. Only `[a-z0-9_]`, so it is safe in
 * Durable Object names, URLs and `<userId>.<botId>@` email addresses.
 */
export async function userIdForEmail(email: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(email.toLowerCase())
  )
  const hex = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")
  return `${HASHED_PREFIX}${hex.slice(0, 32)}`
}

/**
 * The ID earlier versions used. It folds `.`, `-`, `_`, `+` and `@` into
 * `-`, so different emails can collide: only use it to find hubs created
 * before hashed IDs.
 */
export function legacyUserIdForEmail(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}
