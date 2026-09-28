import { describe, expect, it } from "bun:test"
import { inProcessClient } from "@nifrajs/client"
import { createWebApp } from "@nifrajs/web"
import { backend } from "../backend"

const app = createWebApp({
  adapter: {
    renderToStream: () => new ReadableStream<Uint8Array>(),
    hydrationHead: () => "",
  },
  manifest: { routes: [], layouts: {} },
  clientEntry: "/assets/client.js",
  api: inProcessClient(backend),
})

const disabledJev = {
  INTENTDECK_JEV_ENABLED: "false",
  TYPESAFE_API_KEY: "",
  JEV_MODEL: "jev-test",
}

describe("web API mount", () => {
  it("serves the backend under /api with the server-provided environment", async () => {
    const response = await app.fetch(new Request("http://intentdeck.test/api/jev/status"), {
      env: disabledJev,
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ available: false })
  })

  it("does not call Jev when assist is disabled", async () => {
    const response = await app.fetch(
      new Request("http://intentdeck.test/api/jev/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(20) }),
      }),
      { env: disabledJev },
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("not configured") })
  })

  it("rejects Jev prompts shorter than 20 characters before checking availability", async () => {
    const response = await app.fetch(
      new Request("http://intentdeck.test/api/jev/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(19) }),
      }),
      { env: disabledJev },
    )

    expect(response.status).toBe(422)
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("20 characters") })
  })

  it("rejects live intent prompts shorter than 20 characters", async () => {
    const response = await app.fetch(
      new Request("http://intentdeck.test/api/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(19) }),
      }),
      { env: disabledJev },
    )

    expect(response.status).toBe(422)
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("20 characters") })
  })
})
