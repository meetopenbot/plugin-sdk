# OpenBot Plugin SDK

The official SDK for building plugins for [OpenBot](https://meetopenbot.com). This SDK provides the types and helpers needed to create plugins that act as **agent runtimes**—handling events, interacting with storage, and rendering UI widgets within the OpenBot ecosystem.

## Installation

```bash
npm install @meetopenbot/plugin-sdk
```

OpenBot plugins **must** be **ESM** (ECMAScript modules): `import` / `export` in the plugin entry, with a package configured as a module (for example `"type": "module"` in `package.json`, or an `.mjs` entry). CommonJS (`require`) is not supported.

## How it Works

OpenBot plugins operate as the **agent runtime** on an event-driven architecture powered by [Melony](https://github.com/meetopenbot/melony).

1. **Registration**: The host loads your plugin and calls the `factory` function with a `PluginContext`.
2. **Subscription**: Your `factory` function uses the `PluginBuilder` to subscribe to the full event surface (e.g., `agent:invoke`).
3. **Processing**: When a user sends a message, `agent:invoke` is dispatched. Your plugin runs its loop, performs logic, interacts with `storage`, or calls external APIs.
4. **Communication**: Your plugin emits events back to the bus (e.g., `agent:output` or `client:ui:widget`) to communicate with the user or the parent agent.

## Core Concepts

### Plugin

A plugin is defined by the `Plugin` or `PluginModule` interface. Use `definePlugin` to get full OpenBot typing.

```typescript
import { definePlugin } from "@meetopenbot/plugin-sdk";

export default definePlugin({
  id: "my-agent",
  name: "My Agent",
  description: "A custom AI agent",
  configSchema: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "Your API Key",
        format: "password",
      },
    },
    required: ["apiKey"],
  },
  factory: (context) => (builder) => {
    builder.on("agent:invoke", async function* (event) {
      // Handle agent logic here
    });
  },
});
```

### Events

Plugins communicate via an event bus. Core events include:

- `agent:invoke`: Dispatched when a user sends a message to the agent.
- `agent:output`: Emitted by the plugin to send messages back to the user or feedback final results to a parent agent.
- `client:ui:widget`: Used to render interactive UI widgets (forms, choices, etc.) in the client.
- `client:ui:widget:response`: Dispatched when a user interacts with a widget (e.g., submits a form or clicks a choice).
- `action:<toolName>`: Dispatched when a tool call is requested.
- `action:<toolName>:result`: Emitted when a tool handler finishes. Must include `data.output: string` to be fed back to the model.
- `action:webhook`: Dispatched when a third-party provider POSTs to `/api/webhooks/:provider`.
- `action:webhook:http-response`: Yield from a webhook handler to control the HTTP response (challenges, acks, errors).

### Inbound webhooks

The OpenBot host exposes `POST /api/webhooks/:provider` for third-party integrations (Slack, Linear, GitHub, etc.). The route is intentionally thin: it forwards the request onto the event bus and lets **existing plugins** handle verification, transforms, and HTTP responses.

**Host behavior:**

1. Preserves the **raw request body** (base64 in the event) for HMAC signature checks.
2. Dispatches `action:webhook` to the `system` agent on the `uncategorized` channel.
3. **Awaits** the plugin run and uses the first `action:webhook:http-response` yield as the HTTP reply (defaults to `200 {}`).
4. Fans out subsequent events (`agent:invoke`, etc.) over SSE like `/api/publish`.

**Plugin responsibilities:**

- Filter on `event.data.provider` (matches the `:provider` URL segment).
- Verify signatures using `event.data.headers` and `decodeWebhookRawBody(event)`.
- Yield `webhookHttpResponse(...)` for URL challenges, 401s, or custom acks.
- Transform into normal bus events (typically `agent:invoke`).

```typescript
import {
  definePlugin,
  decodeWebhookRawBody,
  getWebhookHeader,
  webhookHttpResponse,
  type WebhookEvent,
} from "@meetopenbot/plugin-sdk";

export default definePlugin({
  name: "Slack",
  description: "Inbound Slack Events API webhooks",
  configSchema: {
    type: "object",
    properties: {
      signingSecret: {
        type: "string",
        description: "Slack signing secret",
        format: "password",
      },
    },
    required: ["signingSecret"],
  },
  factory:
    ({ config }) =>
    (builder) => {
      builder.on("action:webhook", async function* (event) {
        const webhook = event as WebhookEvent;
        if (webhook.data.provider !== "slack") return;

        const rawBody = decodeWebhookRawBody(webhook);
        const payload = JSON.parse(rawBody.toString("utf8"));

        if (payload.type === "url_verification") {
          yield webhookHttpResponse({
            status: 200,
            body: { challenge: payload.challenge },
          });
          return;
        }

        // verify signature, then ack + transform...
        yield webhookHttpResponse({ status: 200, body: {} });
        yield {
          type: "agent:invoke",
          data: { role: "user", content: payload.event?.text ?? "" },
          meta: { threadId: payload.event?.thread_ts ?? payload.event?.ts },
        };
      });
    },
});
```

Register the plugin on your webhook agent (usually `system`) in `AGENT.md`, then point the provider at `https://<host>/api/webhooks/slack`.

### Output and Communication

OpenBot is oriented toward **complete messages**. Use the `agentOutput` helper to emit full step text or final results.

- **Multiple Outputs**: A single plugin can emit multiple `agent:output` events during a single turn to show progress.
- **Parent Communication**: The **latest `agentOutput`** is the primary way to communicate with a parent agent and provide the final results of the agent's execution.

### Implementation Strategies

OpenBot plugins are designed for **AI agent behavior**, not just thin translation layers. You can implement this behavior in two primary ways:

1. **Third-Party Agent Harness**: If your target platform provides a full agent stack (built-in tools, context management, and reasoning), you can wrap it directly. Examples include **Claude Code**, **Codex**, or other "full agent" SDKs. You connect their internal lifecycle to OpenBot via this SDK's events.
2. **Custom Agentic Logic**: If the third-party provider only offers a regular API, SDK, or CLI without agentic intelligence, it is recommended to use the [**Vercel AI SDK**](https://sdk.vercel.ai/docs) to build the agent loop. This allows you to add the necessary "intelligence" and tool-calling capabilities on top of the raw integration.

### Storage

The `PluginContext` provides access to the `storage` interface for interacting with:

- **Channels & Threads**: Manage conversation contexts.
- **Variables**: Store configuration or secrets.
- **Files**: Read and list files in the workspace.
- **Memories**: Store and retrieve long-term memory records.

### UI Widgets

Plugins can render interactive UI widgets using the `uiWidget` helper and handle user interactions by subscribing to `client:ui:widget:response`:

- `message`: Simple text message with optional actions.
- `choice`: A set of buttons for the user to choose from.
- `form`: A form with various field types.
- `list`: A list of items with status indicators.
- `media`: Images, video, audio, or files.

## Example: Hello World Agent

This agent responds to any message with "Hello, World!".

```typescript
import {
  definePlugin,
  shouldHandleInvoke,
  agentOutput,
} from "@meetopenbot/plugin-sdk";

export default definePlugin({
  id: "hello-world",
  name: "Hello World",
  description: "Responds with Hello World",
  factory: (context) => (builder) => {
    builder.on("agent:invoke", async function* (event) {
      if (shouldHandleInvoke(event, context.agentId)) {
        yield agentOutput({
          agentId: context.agentId,
          content: "Hello, World!",
          threadId: event.meta?.threadId,
        });
      }
    });
  },
});
```

## API Reference

- [Plugin & Context](./src/plugin.ts)
- [Events & State](./src/events.ts)
- [Storage Interface](./src/storage.ts)
- [UI Widget Specs](./src/ui.ts)
- [Helpers](./src/helpers.ts) (`decodeWebhookRawBody`, `getWebhookHeader`, `webhookHttpResponse`)

## License

MIT
