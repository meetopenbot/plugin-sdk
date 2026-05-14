import type { AgentDetails, ChannelDetails, ThreadDetails } from './storage.js';
import type { RenderUIWidgetData, UIWidgetSpec } from './ui.js';

export type EventMeta = {
  agentId?: string;
  threadId?: string;
  toolCallId?: string;
  [key: string]: unknown;
};

export type BaseEvent = {
  id?: string;
  type: string;
  meta?: EventMeta;
};

export type AgentInvokeEvent = BaseEvent & {
  type: 'agent:invoke';
  data: {
    role?: 'user' | 'assistant' | 'system';
    content: string;
    agentId?: string;
  };
};

export type AgentOutputEvent = BaseEvent & {
  type: 'agent:output';
  data: {
    content: string;
  };
  meta: EventMeta & {
    agentId: string;
  };
};

export type UIWidgetEvent = BaseEvent & {
  type: 'client:ui:widget';
  data: RenderUIWidgetData;
  meta: EventMeta & {
    agentId: string;
  };
};

export type UIWidgetResponseEvent = BaseEvent & {
  type: 'client:ui:widget:response';
  data: {
    widgetId: string;
    actionId: string;
    values?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
};

/** `action:<toolName>` dispatched when a runtime requests a tool call. */
export type ToolActionEvent<TData = unknown> = BaseEvent & {
  type: `action:${string}`;
  data: TData;
  meta?: EventMeta;
};

/** `action:<toolName>:result` emitted when a tool handler finishes. */
export type ToolResultEvent<TData = unknown> = BaseEvent & {
  type: `action:${string}:result`;
  data: TData;
  meta?: EventMeta;
};

/**
 * Narrow event union for common plugin authoring paths.
 * The host bus accepts additional event types at runtime.
 */
export type PluginEvent =
  | AgentInvokeEvent
  | AgentOutputEvent
  | UIWidgetEvent
  | UIWidgetResponseEvent
  | ToolActionEvent
  | ToolResultEvent;

export type OpenBotEvent = PluginEvent | (BaseEvent & { data?: unknown });

export type ShortTermMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: unknown[] }
  | { role: 'tool'; content: string; toolCallId: string; toolName: string };

/** Runtime state available on Melony handler contexts. */
export interface OpenBotState {
  agentId: string;
  runId: string;
  channelId: string;
  threadId?: string;
  agentDetails?: AgentDetails;
  channelDetails?: ChannelDetails;
  threadDetails?: ThreadDetails;
  triggerEvent?: OpenBotEvent;
  shortTermMessages?: ShortTermMessage[];
}
