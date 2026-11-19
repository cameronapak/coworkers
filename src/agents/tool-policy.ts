import type { MessageOrigin, RulePolicy } from "@/lib/types"

/**
 * Triggers anyone outside the account can send: mail to the bot's address
 * and posts to its webhook. Their turns may read and report, but not act.
 */
const UNTRUSTED_TRIGGERS: ReadonlySet<MessageOrigin["kind"]> = new Set([
  "email",
  "webhook",
])

export function isUntrustedTrigger(origin: MessageOrigin | undefined) {
  return origin !== undefined && UNTRUSTED_TRIGGERS.has(origin.kind)
}

export interface ToolPolicyInput {
  /** The user's rule for the tool, or "allow" for tools no rule governs. */
  policy: RulePolicy
  /** A user rule governs the tool: a built-in action class or an app tool. */
  ruled: boolean
  background: boolean
  /** The turn was started by an untrusted trigger (see isUntrustedTrigger). */
  untrusted: boolean
  appTool: boolean
  readOnlyAppTool: boolean
  appsInBackground: boolean
}

/**
 * The user's rule for one call, adjusted for who started the turn.
 * Background turns have nobody to approve, so "ask" becomes "block", while
 * read-only app tools run so the bot can look around. Untrusted turns get
 * none of that: every ruled tool (shell, files, browser, apps, bots, email,
 * routines, saved credentials) is blocked, so injected text has no way to
 * act or send the owner's data out.
 */
export function decideToolPolicy(input: ToolPolicyInput): RulePolicy {
  if (input.policy === "block") return "block"
  if (input.untrusted && input.ruled) return "block"
  if (!input.background) return input.policy
  if (input.readOnlyAppTool) return "allow"
  if (input.appTool && input.appsInBackground) return "allow"
  return input.policy === "ask" ? "block" : "allow"
}
