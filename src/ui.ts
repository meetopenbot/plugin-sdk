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
  status?: 'pending' | 'in_progress' | 'done' | 'error' | 'cancelled';
  metadata?: Record<string, unknown>;
};

export type UIWidgetBase = {
  widgetId: string;
  title?: string;
  description?: string;
  body?: string;
  state?: 'open' | 'submitted' | 'cancelled' | 'error';
  metadata?: Record<string, unknown>;
};

export type UIMessageWidget = UIWidgetBase & {
  kind: 'message';
  actions?: UIWidgetAction[];
};

export type UIChoiceWidget = UIWidgetBase & {
  kind: 'choice';
  actions: UIWidgetAction[];
};

export type UIFormWidget = UIWidgetBase & {
  kind: 'form';
  fields: UIWidgetField[];
  submitLabel?: string;
  actions?: UIWidgetAction[];
};

export type UIListWidget = UIWidgetBase & {
  kind: 'list';
  items: UIWidgetListItem[];
  actions?: UIWidgetAction[];
};

export type UIWidgetSpec = UIMessageWidget | UIChoiceWidget | UIFormWidget | UIListWidget;

export type RenderUIWidgetData =
  | (Omit<UIMessageWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIChoiceWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIFormWidget, 'widgetId'> & { widgetId?: string })
  | (Omit<UIListWidget, 'widgetId'> & { widgetId?: string })
  | {
      kind: 'approval' | 'todo_list';
      widgetId?: string;
      title?: string;
      props?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };
