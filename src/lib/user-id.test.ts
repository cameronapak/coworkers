import { describe, expect, it } from "vitest"
import { legacyUserIdForEmail, userIdForEmail } from "./user-id"

describe("userIdForEmail", () => {
  it("gives emails that differ only in punctuation different IDs", async () => {
    const emails = [
      "a.b@x.com",
      "a-b@x.com",
      "a_b@x.com",
      "a+b@x.com",
      "a@b.x.com",
    ]
    const ids = await Promise.all(emails.map(userIdForEmail))
    expect(new Set(ids).size).toBe(emails.length)
    // The legacy mapping is what collided.
    expect(new Set(emails.map(legacyUserIdForEmail)).size).toBe(1)
  })

  it("ignores case", async () => {
    expect(await userIdForEmail("A.B@X.com")).toBe(
      await userIdForEmail("a.b@x.com")
    )
  })

  it("is safe in instance names and can never equal a legacy ID", async () => {
    const id = await userIdForEmail("a.b@x.com")
    expect(id).toMatch(/^u_[0-9a-f]{32}$/)
    expect(legacyUserIdForEmail(id)).not.toBe(id)
  })
})
