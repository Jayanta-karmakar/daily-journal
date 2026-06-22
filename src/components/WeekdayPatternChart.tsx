import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getWeekdaySpending } from '@/data/calculations';
import type { DayEntry } from '@/data/mockData';
import { CalendarDays } from 'lucide-react';

interface WeekdayPatternChartProps {
  entries: DayEntry[];
}

const chartConfig = {
  total: { label: 'Total spend', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const WeekdayPatternChart = ({ entries }: WeekdayPatternChartProps) => {
  const data = getWeekdaySpending(entries);
  const hasData = data.some((d) => d.count > 0);
  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Weekday Spending Pattern
        </CardTitle>
        <CardDescription className="text-xs">Which days of the week cost you the most</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="shortDay" axisLine={false} tickLine={false} fontSize={10} fontWeight={600} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={600} width={40} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.day ?? ''}
                  />
                }
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Spent">
                {data.map((entry) => (
                  <Cell
                    key={entry.day}
                    fill={entry.total === maxTotal && maxTotal > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary) / 0.6)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-xs italic">
            No spending data available for this selection
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekdayPatternChart;
