# OpenBot Plugin SDK

The official SDK for building plugins for [OpenBot](https://meetopenbot.com). This SDK provides the types and helpers needed to create plugins that can handle events, interact with storage, and render UI widgets within the OpenBot ecosystem.

## Installation

```bash
npm install @meetopenbot/plugin-sdk
```

## How it Works

OpenBot plugins operate on an event-driven architecture powered by [Melony](https://github.com/meetopenbot/melony). Plugin authors work with the OpenBot SDK types and helpers; you do not need to import Melony types in your plugin code.

1. **Registration**: The host loads your plugin and calls the `factory` function with a `PluginContext`.
2. **Subscription**: Your `factory` function uses the `PluginBuilder` to subscribe to specific events (for example, `agent:invoke`).
3. **Processing**: When an event occurs, your handler is called. You can perform logic, interact with `storage`, or call external APIs.
4. **Publication**: Your handler can emit new events back to the bus (for example, `agent:output` or `client:ui:widget` or `client:ui:widget:response`) to communicate with the user or other plugins.

## Core Concepts

### Plugin

A plugin is defined by the `Plugin` or `PluginModule` interface. Use `definePlugin` to get full OpenBot typing without annotating Melony types yourself.

```typescript
import { definePlugin } from '@meetopenbot/plugin-sdk';

export default definePlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'A simple example plugin',
  configSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'Your API Key', format: 'password' },
    },
    required: ['apiKey'],
  },
  toolDefinitions: {
    get_weather: {
      description: 'Get the current weather',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
      },
    },
  },
  factory: (context) => (builder) => {
    builder.on('agent:invoke', async function* (event) {
      // Handle events here
    });
  },
});
```

For community plugins published as npm packages, omit `id` and export a `PluginModule`. The host assigns `id` from the package name.

You can also type a plugin object explicitly with `Plugin` or `PluginModule` if you prefer. The `factory` function returns a `PluginFactory`, which registers handlers on the `PluginBuilder` and receives `PluginHandlerContext` in event handlers.

### Configuration & Tools

- **`configSchema`**: Defines the configuration options for your plugin. The host uses this to validate the configuration provided in `AGENT.md`.
- **`toolDefinitions`**: Defines the tools your plugin provides. Other plugins (like a runtime plugin) can use these definitions to call your plugin's tools.

### Events

Plugins communicate via an event bus. Common event types include:

- `agent:invoke`: Dispatched when a user sends a message to the agent.
- `agent:output`: Emitted by the agent to send a message back to the user.
- `client:ui:widget`: Used to render a UI widget in the client.
- `client:ui:widget:response`: Response from interactive widgets like choice, form etc...
- `action:<toolName>`: Dispatched when a runtime requests a tool call.
- `action:<toolName>:result`: Emitted when a tool handler finishes.

### Agent kind plugins

An **agent kind** plugin is one where your plugin acts as the **agent runtime**. It can subscribe to the full event surface the OpenBot bus exposes (for example `agent:invoke`, `agent:output`, `action:<toolName>` / `action:<toolName>:result`, `client:ui:widget`, and `client:ui:widget:response`). For this pattern, the agent's lifecycle effectively **starts on `agent:invoke`** when the user's turn enters the system; from there you run your loop, emit outputs, drive tools, and render widgets like any other plugin.

Agent kind plugins are aimed at **AI agent behavior**, not only thin translation layers. How you implement that behavior usually falls into one of two paths:

1. **Vendor agent harness**: Use a product or platform that already ships a **ready-made agent stack** (harness, built-in context, tools, and guardrails). Examples include offerings such as the Claude Agent SDK, Stitch, Firecrawl agent SDK, Jules, Codex, and similar "full agent" SDKs. You embed or wrap that harness and connect it to OpenBot via this SDK's events and helpers (`agentOutput`, `toolResult`, `uiWidget`, storage, and so on).
2. **Custom harness**: When the integration target **does not** provide a full agent harness (only an API or a narrower SDK), you typically **build the agent loop yourself**, preferably with an **AI SDK** (for example the [Vercel AI SDK](https://sdk.vercel.ai/docs)) together with that product's official client or HTTP API.

**Output and widgets**: OpenBot is oriented toward **complete messages**, not streaming raw text deltas. Emit **full step text or final text** through **`agent:output`** as your agent progresses. A single plugin may send **more than one** `agent:output` in a turn; there is no requirement to cap it at one. For **tool calls and results**, surface them in the UI with a **collapsible message widget** (or, when it fits the UX better, a richer widget such as **list**, **media** for images and similar assets, **form**, or **choice**).

### Storage

The `PluginContext` provides access to the `storage` interface, allowing plugins to interact with:

- **Channels & Threads**: Manage conversation contexts.
- **Agents**: Access and update agent details.
- **Variables**: Store configuration or secrets.
- **Files**: Read and list files in the channel's workspace.
- **Memories**: Store and retrieve long-term memory records.

### UI Widgets

Plugins can render interactive UI widgets using the `uiWidget` helper. Supported widget types include:

- `message`: Simple text message with optional actions.
- `choice`: A set of buttons for the user to choose from.
- `form`: A form with various field types (text, number, select, etc.).
- `list`: A list of items with status indicators.
- `media`: Images, video, audio, or files in a single-item, grid, or carousel layout.

## Example: Hello World Plugin

This plugin responds to any message with "Hello, World!".

```typescript
import { definePlugin, shouldHandleInvoke, agentOutput } from '@meetopenbot/plugin-sdk';

export default definePlugin({
  id: 'hello-world',
  name: 'Hello World',
  description: 'Responds with Hello World',
  factory: (context) => (builder) => {
    builder.on('agent:invoke', async function* (event) {
      if (shouldHandleInvoke(event, context.agentId)) {
        yield agentOutput({
          agentId: context.agentId,
          content: 'Hello, World!',
          threadId: event.meta?.threadId,
        });
      }
    });
  },
});
```

## API Reference

- [Plugin & Context](./src/plugin.ts)
- [Runtime Types](./src/runtime.ts)
- [Events & State](./src/events.ts)
- [Storage Interface](./src/storage.ts)
- [UI Widget Specs](./src/ui.ts)
- [Helpers](./src/helpers.ts)

## License

MIT
