import type { MelonyBuilder, MelonyPlugin, RuntimeContext } from 'melony';
import type { OpenBotEvent, OpenBotState } from './events.js';

/** Context passed to plugin event handlers. */
export type PluginHandlerContext = RuntimeContext<OpenBotState, OpenBotEvent>;

/** Fluent builder surface exposed to plugin factories. */
export type PluginBuilder = MelonyBuilder<OpenBotState, OpenBotEvent>;

/** Function returned from `Plugin.factory` to register handlers on the bus. */
export type PluginFactory = MelonyPlugin<OpenBotState, OpenBotEvent>;
