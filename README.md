# OpenBot Plugin SDK

The official SDK for building plugins for [OpenBot](https://meetopenbot.com). This SDK provides the types and helpers needed to create plugins that can handle events, interact with storage, and render UI widgets within the OpenBot ecosystem.

## Installation

```bash
npm install @meetopenbot/plugin-sdk
```

## How it Works

OpenBot plugins operate on an event-driven architecture powered by [Melony](https://github.com/meetopenbot/melony). 

1.  **Registration**: The host loads your plugin and calls the `factory` function with a `PluginContext`.
2.  **Subscription**: Your `factory` function uses the `MelonyBuilder` to subscribe to specific events (e.g., `agent:invoke`).
3.  **Processing**: When an event occurs, your handler is called. You can perform logic, interact with `storage`, or call external APIs.
4.  **Publication**: Your handler can publish new events back to the bus (e.g., `agent:output` or `client:ui:widget`) to communicate with the user or other plugins.

## Core Concepts

### Plugin

A plugin is defined by the `Plugin` interface. It requires an `id`, `name`, `description`, and a `factory` function.

```typescript
import { Plugin, PluginContext, MelonyPlugin, OpenBotState, OpenBotEvent } from '@meetopenbot/plugin-sdk';

export const myPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'A simple example plugin',
  configSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'Your API Key', format: 'password' }
    },
    required: ['apiKey']
  },
  toolDefinitions: {
    'get_weather': {
      description: 'Get the current weather',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        }
      }
    }
  },
  factory: (context: PluginContext): MelonyPlugin<OpenBotState, OpenBotEvent> => {
    return (builder) => {
      // Handle events here
    };
  },
};
```

### Configuration & Tools

- **`configSchema`**: Defines the configuration options for your plugin. The host uses this to validate the configuration provided in `AGENT.md`.
- **`toolDefinitions`**: Defines the tools your plugin provides. Other plugins (like a runtime plugin) can use these definitions to call your plugin's tools.

### Events

Plugins communicate via an event bus. Common event types include:

- `agent:invoke`: Dispatched when a user sends a message to the agent.
- `agent:output`: Emitted by the agent to send a message back to the user.
- `client:ui:widget`: Used to render a UI widget in the client.
- `action:<toolName>`: Dispatched when a runtime requests a tool call.
- `action:<toolName>:result`: Emitted when a tool handler finishes.

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

## Example: Hello World Plugin

This plugin responds to any message with "Hello, World!".

```typescript
import { Plugin, shouldHandleInvoke, agentOutput } from '@meetopenbot/plugin-sdk';

export const helloWorldPlugin: Plugin = {
  id: 'hello-world',
  name: 'Hello World',
  description: 'Responds with Hello World',
  factory: (context) => (builder) => {
    builder.on('agent:invoke', async (event, { bus }) => {
      if (shouldHandleInvoke(event, context.agentId)) {
        await bus.publish(agentOutput({
          agentId: context.agentId,
          content: 'Hello, World!',
          threadId: event.meta?.threadId,
        }));
      }
    });
  },
};
```

## API Reference

- [Plugin & Context](./src/plugin.ts)
- [Events & State](./src/events.ts)
- [Storage Interface](./src/storage.ts)
- [UI Widget Specs](./src/ui.ts)
- [Helpers](./src/helpers.ts)

## License

MIT
