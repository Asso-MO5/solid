import { For, type VoidComponent } from "solid-js"

type BarChartItem = {
  label: string;
  value: number;
  percentage?: number;
}

type BarChartProps = {
  items: BarChartItem[];
  maxValue?: number;
  showValues?: boolean;
  showPercentages?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const BarChart: VoidComponent<BarChartProps> = (props) => {
  const items = () => props.items || []
  const maxValue = () => props.maxValue || Math.max(...items().map(i => i.value), 1)
  const showValues = () => props.showValues ?? true
  const showPercentages = () => props.showPercentages ?? false
  const orientation = () => props.orientation || 'horizontal'

  if (orientation() === 'vertical') {
    return (
      <div class="flex items-end justify-between gap-2 h-48">
        <For each={items()}>
          {(item) => {
            const height = (item.value / maxValue()) * 100
            const percentage = item.percentage ?? (item.value / maxValue()) * 100
            return (
              <div class="flex flex-col items-center gap-1 flex-1">
                <div class="relative w-full h-full flex items-end">
                  <div
                    class="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>
                <div class="text-xs text-gray-600 text-center truncate w-full" title={item.label}>
                  {item.label}
                </div>
                {showValues() && (
                  <div class="text-xs font-semibold text-gray-800">
                    {item.value}
                  </div>
                )}
                {showPercentages() && (
                  <div class="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                )}
              </div>
            )
          }}
        </For>
      </div>
    )
  }

  return (
    <div class="space-y-2">
      <For each={items()}>
        {(item) => {
          const width = (item.value / maxValue()) * 100
          const percentage = item.percentage ?? (item.value / maxValue()) * 100
          return (
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700 font-medium">{item.label}</span>
                <div class="flex items-center gap-2">
                  {showValues() && (
                    <span class="text-gray-800 font-semibold">{item.value}</span>
                  )}
                  {showPercentages() && (
                    <span class="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  )}
                </div>
              </div>
              <div class="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary transition-all flex items-center justify-end pr-2"
                  style={{ width: `${width}%` }}
                >
                  {showPercentages() && width > 20 && (
                    <span class="text-xs text-white font-medium">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}

