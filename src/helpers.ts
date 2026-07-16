import type {
  AgentInvokeEvent,
  AgentOutputEvent,
  EventMeta,
  ToolResultEvent,
  UIWidgetEvent,
  WebhookEvent,
  WebhookHttpResponseEvent,
} from "./events.js";
import type { RenderUIWidgetData } from "./ui.js";

/** Return true when this agent should handle an `agent:invoke` event. */
export function shouldHandleInvoke(
  event: AgentInvokeEvent,
  agentId: string,
): boolean {
  const routedTo = event.data?.agentId;
  return !(typeof routedTo === "string" && routedTo && routedTo !== agentId);
}

/** Build an `agent:output` event. */
export function agentOutput(args: {
  agentId: string;
  content: string;
  threadId?: string;
  meta?: EventMeta;
}): AgentOutputEvent {
  return {
    type: "agent:output",
    data: { content: args.content },
    meta: {
      ...(args.meta ?? {}),
      agentId: args.agentId,
      ...(args.threadId ? { threadId: args.threadId } : {}),
    },
  };
}

/** Build an `action:<toolName>:result` event while preserving request meta. */
export function toolResult<TData>(
  toolName: string,
  request: { meta?: EventMeta },
  data: TData,
): ToolResultEvent<TData> {
  return {
    type: `action:${toolName}:result`,
    data,
    meta: request.meta,
  };
}

/** Build a `client:ui:widget` event. */
export function uiWidget(args: {
  agentId: string;
  widget: RenderUIWidgetData;
  threadId?: string;
  meta?: EventMeta;
}): UIWidgetEvent {
  return {
    type: "client:ui:widget",
    data: args.widget,
    meta: {
      ...(args.meta ?? {}),
      agentId: args.agentId,
      ...(args.threadId ? { threadId: args.threadId } : {}),
    },
  };
}

/** Copy `meta` from a source bus event onto a new event payload. */
export function withMeta<T extends { meta?: EventMeta }>(
  source: { meta?: EventMeta },
  event: T,
): T & { meta?: EventMeta } {
  if (!source.meta) return event;
  return {
    ...event,
    meta: {
      ...source.meta,
      ...(event.meta ?? {}),
    },
  };
}

/** Decode `action:webhook` raw body bytes from base64. */
export function decodeWebhookRawBody(event: WebhookEvent): Buffer {
  return Buffer.from(event.data.rawBody, "base64");
}

/** Read a single header value from a webhook event (case-insensitive). */
export function getWebhookHeader(
  event: WebhookEvent,
  name: string,
): string | undefined {
  const headers = event.data.headers;
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0];
  return typeof direct === "string" ? direct : undefined;
}

/** Build an `action:webhook:http-response` event for the host HTTP reply. */
export function webhookHttpResponse(args: {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}): WebhookHttpResponseEvent {
  return {
    type: "action:webhook:http-response",
    data: args,
  };
}
