import { type Component } from "solid-js";

const STATUS_LABELS = {
  submitted: 'Soumis',
  under_investigation: 'En cours d\'enquête',
  awaiting_judgment: 'En attente de jugement',
  closed: 'Fermé'
} as const;

const STATUS_COLORS = {
  submitted: 'bg-green-500',
  under_investigation: 'bg-yellow-500',
  awaiting_judgment: 'bg-blue-500',
  closed: 'bg-gray-500'
} as const;

type StatusProps = {
  status: string;
  showDot?: boolean;
  class?: string;
};

export const Status: Component<StatusProps> = (props) => {
  const label = () => STATUS_LABELS[props.status as keyof typeof STATUS_LABELS] || props.status;
  const color = () => STATUS_COLORS[props.status as keyof typeof STATUS_COLORS] || 'bg-gray-500';

  return (
    <div class={`flex items-center gap-2 ${props.class || ''}`}>
      {props.showDot !== false && (
        <span class={`w-2 h-2 rounded-full ${color()}`} />
      )}
      <span>{label()}</span>
    </div>
  );
};
