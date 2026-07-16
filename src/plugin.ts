import type { AgentDetails } from './storage.js';
import type { Storage } from './storage.js';
import type { PluginFactory } from './runtime.js';

/** Plugin reference from AGENT.md frontmatter. */
export interface PluginRef {
  id: string;
  config?: Record<string, unknown>;
}

/** Scalar JSON types used in `configSchema` property definitions. */
export type ConfigSchemaScalarType = 'string' | 'number' | 'boolean' | 'integer';

/** JSON-schema-like description of a single config field. */
export type ConfigSchemaProperty = {
  type: ConfigSchemaScalarType | 'array' | 'object';
  description?: string;
  default?: unknown;
  enum?: unknown[];
  items?: {
    type: ConfigSchemaScalarType;
  };
  minimum?: number;
  maximum?: number;
  format?: 'password' | 'url' | 'email';
  /** When true, the field may be overridden per `agent:invoke` from the composer. */
  override?: boolean;
};

/** JSON-schema-like description of per-plugin config in AGENT.md. */
export type ConfigSchema = {
  type: 'object';
  properties: {
    [key: string]: ConfigSchemaProperty;
  };
  required?: string[];
};

/** Tool metadata merged across plugins and exposed to runtime plugins. */
export interface ToolDefinition {
  description: string;
  inputSchema: unknown;
}

/** Context passed to `factory` when the host wires a plugin onto the bus. */
export interface PluginContext {
  agentId: string;
  agentDetails: AgentDetails;
  config: Record<string, unknown>;
  storage: Storage;
  tools: Record<string, ToolDefinition>;
}

/**
 * Plugin contract expected by the OpenBot host.
 * Roles (runtime, tool, middleware) are defined by which events `factory` handles.
 */
export interface Plugin {
  id: string;
  name: string;
  description: string;
  image?: string;
  configSchema?: ConfigSchema;
  toolDefinitions?: Record<string, ToolDefinition>;
  factory: (context: PluginContext) => PluginFactory;
}

/** Community plugin module export. The host assigns `id` from the npm package name. */
export type PluginModule = Omit<Plugin, 'id'>;

/** Define a plugin with full OpenBot typing. */
export function definePlugin<T extends PluginModule>(definition: T): T;
export function definePlugin<T extends Plugin>(definition: T): T;
export function definePlugin<T extends Plugin | PluginModule>(definition: T): T {
  return definition;
}
