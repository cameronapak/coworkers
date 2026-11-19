import { describe, expect, it } from "vitest"
import type { ToolPolicyInput } from "./tool-policy"
import { decideToolPolicy, isUntrustedTrigger } from "./tool-policy"

const shell: ToolPolicyInput = {
  policy: "allow",
  ruled: true,
  background: true,
  untrusted: false,
  appTool: false,
  readOnlyAppTool: false,
  appsInBackground: false,
}
const readOnlyApp: ToolPolicyInput = {
  ...shell,
  policy: "ask",
  appTool: true,
  readOnlyAppTool: true,
}

describe("isUntrustedTrigger", () => {
  it("covers email and webhooks only", () => {
    expect(isUntrustedTrigger({ kind: "email", name: "a@b.test" })).toBe(true)
    expect(isUntrustedTrigger({ kind: "webhook", name: "github" })).toBe(true)
    expect(isUntrustedTrigger({ kind: "routine", name: "Daily" })).toBe(false)
    expect(isUntrustedTrigger({ kind: "bot", name: "Research" })).toBe(false)
    expect(isUntrustedTrigger(undefined)).toBe(false)
  })
})

describe("decideToolPolicy", () => {
  it("keeps the user's rule in chat", () => {
    expect(decideToolPolicy({ ...shell, background: false })).toBe("allow")
    expect(decideToolPolicy({ ...readOnlyApp, background: false })).toBe("ask")
  })

  it("lets other background turns use allowed and read-only tools", () => {
    expect(decideToolPolicy(shell)).toBe("allow")
    expect(decideToolPolicy(readOnlyApp)).toBe("allow")
    expect(decideToolPolicy({ ...shell, policy: "ask" })).toBe("block")
    expect(
      decideToolPolicy({
        ...readOnlyApp,
        readOnlyAppTool: false,
        appsInBackground: true,
      })
    ).toBe("allow")
  })

  it("blocks exec and read-only app tools in email and webhook turns", () => {
    const untrusted = { untrusted: true }
    expect(decideToolPolicy({ ...shell, ...untrusted })).toBe("block")
    expect(decideToolPolicy({ ...readOnlyApp, ...untrusted })).toBe("block")
    expect(
      decideToolPolicy({ ...readOnlyApp, ...untrusted, appsInBackground: true })
    ).toBe("block")
  })

  it("still lets untrusted turns use tools no rule governs", () => {
    expect(decideToolPolicy({ ...shell, ruled: false, untrusted: true })).toBe(
      "allow"
    )
  })

  it("never lifts a block", () => {
    expect(
      decideToolPolicy({ ...shell, policy: "block", background: false })
    ).toBe("block")
  })
})
