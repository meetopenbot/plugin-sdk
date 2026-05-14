export type UIWidgetAction = {
  id: string;
  label: string;
  value?: unknown;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export type UIWidgetField = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: unknown;
};

export type UIWidgetListItem = {
  id: string;
  label: string;
  description?: string;
  /** URL for a thumbnail or an icon name */
  image?: string;
  /** Optional badge text (e.g., "New", "Sale", "10") */
  badge?: string;
  /** Actions specific to this list item */
  actions?: UIWidgetAction[];
  status?: 'pending' | 'in_progress' | 'done' | 'error' | 'cancelled';
  metadata?: Record<string, unknown>;
};

export type UIMediaItem = {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  title?: string;
  alt?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
};

export type UIWidgetBase = {
  widgetId: string;
  title?: string;
  description?: string;
  /** Optional hero media for the widget */
  media?: UIMediaItem;
  /** Optional actions for the widget */
  actions?: UIWidgetAction[];
  state?: 'open' | 'submitted' | 'cancelled' | 'error';
  display?: 'expanded' | 'collapsed';
  size?: 'small' | 'medium' | 'large' | 'full';
  metadata?: Record<string, unknown>;
};

export type UIMessageWidget = UIWidgetBase & {
  kind: 'message';
  body?: string;
};

export type UIChoiceWidget = UIWidgetBase & {
  kind: 'choice';
  /** Choice widgets require at least one action */
  actions: UIWidgetAction[];
};

export type UIFormWidget = UIWidgetBase & {
  kind: 'form';
  fields: UIWidgetField[];
  submitLabel?: string;
};

export type UIListWidget = UIWidgetBase & {
  kind: 'list';
  items: UIWidgetListItem[];
};

export type UIMediaWidget = UIWidgetBase & {
  kind: 'media';
  items: UIMediaItem[];
  layout?: 'single' | 'grid' | 'carousel';
};

export type UIWidgetSpec =
  | UIMessageWidget
  | UIChoiceWidget
  | UIFormWidget
  | UIListWidget
  | UIMediaWidget;

export type RenderUIWidgetData =
  | (Omit<UIMessageWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIChoiceWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIFormWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIListWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIMediaWidget, 'widgetId'> & { widgetId?: string });
