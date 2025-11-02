'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';

type Props = {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
};

export default function IndicatorChart({
  label,
  value,
  unit,
  icon,
  color,
}: Props) {
  const chartData = [
    { name: label, value: value, fill: color },
    {
      name: 'rest',
      value: Math.max(0, (label === 'Morosidad' ? 10 : 20) - value),
      fill: 'hsl(var(--muted))',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-2 self-start">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <ChartContainer
        config={{
          [label]: {
            label: label,
            color: color,
          },
        }}
        className="mx-auto aspect-square h-[80px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel hideIndicator />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={24}
            strokeWidth={5}
            startAngle={90}
            endAngle={450}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="text-2xl font-bold"
                        fill="hsl(var(--foreground))"
                      >
                        {value.toFixed(1)}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 12}
                        className="text-xs"
                        fill="hsl(var(--muted-foreground))"
                      >
                        {unit}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
