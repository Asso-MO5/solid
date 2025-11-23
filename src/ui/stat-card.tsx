type StatCardProps = {

  title: string;
  value: number;
  unit?: string;
  unitPlural: string;
}

export const StatCard = (props: StatCardProps) => {
  const formatValue = (value: number, unit?: string) => {
    if (unit === '€') {
      return value.toFixed(2).replace('.', ',')
    }
    return value.toLocaleString('fr-FR')
  }

  const unitValue = () => props.value

  const unit = () => {
    return unitValue() > 1 ? props.unitPlural : props.unit
  }

  return (
    <div class="border border-border rounded-md p-4 flex flex-col items-center justify-center gap-2 bg-white">
      <div class="text-sm text-gray-500">{props.title}</div>
      <div class="flex items-center justify-center gap-2">
        <span class="font-bold text-5xl text-amber-500">
          {formatValue(props.value, props.unit)}
        </span>
        <span class="text-lg text-gray-600">
          {unit()}
        </span>
      </div>
    </div>
  )
}