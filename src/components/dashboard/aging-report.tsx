
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';

interface AgingReportProps {
  data: { range: string; amount: number; color: string }[];
}

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AgingReport({ data }: AgingReportProps) {
  return (
    <Card className="col-span-1 lg:col-span-2 border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">Aging Report</CardTitle>
        <CardDescription>Accounts payable distribution by overdue age</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="range" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => `₹${val/1000}k`}
              />
              <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent hideLabel />} 
              />
              <Bar 
                dataKey="amount" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
