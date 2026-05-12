import type { PluginRef } from './plugin.js';

export type Agent = {
  id: string;
  name: string;
  description: string;
  image?: string;
  plugins: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type AgentDetails = Agent & {
  instructions: string;
  pluginRefs: PluginRef[];
};

export type Channel = {
  id: string;
  name: string;
  description: string;
  cwd?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ThreadDetails = {
  id: string;
  title: string;
  spec: string;
  state: unknown;
};

export type ChannelDetails = {
  id: string;
  name: string;
  spec: string;
  state: unknown;
  cwd?: string;
  threads?: Thread[];
};

export type MemoryRecord = {
  id: string;
  scope: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ListMemoriesArgs = {
  scopes?: string[];
  query?: string;
  tag?: string;
  limit?: number;
};

/** Storage surface available on `PluginContext.storage`. */
export interface Storage {
  getChannels: () => Promise<Channel[]>;
  createChannel: (args: {
    channelId: string;
    spec?: string;
    initialState?: Record<string, unknown>;
    cwd?: string;
  }) => Promise<void>;
  createThread: (args: {
    channelId: string;
    threadId: string;
    threadTitle?: string;
    spec?: string;
    initialState?: Record<string, unknown>;
  }) => Promise<void>;
  getThreads: (args: { channelId: string }) => Promise<Thread[]>;
  getThreadDetails: (args: { channelId: string; threadId: string }) => Promise<ThreadDetails>;
  getAgents: () => Promise<Agent[]>;
  getAgentDetails: (args: { agentId: string }) => Promise<AgentDetails>;
  createAgent: (args: {
    agentId: string;
    name: string;
    description?: string;
    instructions: string;
    plugins: PluginRef[];
  }) => Promise<void>;
  updateAgent: (args: {
    agentId: string;
    name?: string;
    description?: string;
    instructions?: string;
    plugins?: PluginRef[];
  }) => Promise<void>;
  deleteAgent: (args: { agentId: string }) => Promise<void>;
  getEvents: (args: { channelId: string; threadId?: string }) => Promise<unknown[]>;
  getChannelDetails: (args: { channelId: string }) => Promise<ChannelDetails>;
  patchChannelState: (args: { channelId: string; state: unknown }) => Promise<void>;
  patchThreadState: (args: {
    channelId: string;
    threadId: string;
    state: unknown;
  }) => Promise<void>;
  patchChannelSpec: (args: { channelId: string; spec: string }) => Promise<void>;
  patchThreadSpec: (args: { channelId: string; threadId: string; spec: string }) => Promise<void>;
  getVariables: () => Promise<Record<string, string | { value: string; secret: boolean }>>;
  createVariable: (args: { key: string; value: string; secret?: boolean }) => Promise<void>;
  deleteVariable: (args: { key: string }) => Promise<void>;
  listFiles: (args: {
    channelId: string;
    path?: string;
  }) => Promise<Array<{ name: string; isDirectory: boolean }>>;
  readFile: (args: { channelId: string; path: string }) => Promise<string>;
  appendMemory: (args: {
    scope: string;
    content: string;
    tags?: string[];
  }) => Promise<MemoryRecord>;
  listMemories: (args?: ListMemoriesArgs) => Promise<MemoryRecord[]>;
  deleteMemory: (args: { id: string }) => Promise<boolean>;
  updateMemory: (args: { id: string; content?: string; tags?: string[] }) => Promise<boolean>;
}
