"use client";

import type { AxisScore } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from "recharts";

interface AuditResultsProps {
  scores: AxisScore[];
  onStartOver: () => void;
  governorate: string;
}

export default function AuditResults({ scores, onStartOver, governorate }: AuditResultsProps) {
  const chartData = scores.map(s => ({
    axis: s.axis.split(': ')[1], // Get just the name, e.g., "الفهم"
    score: Math.round((s.score / s.maxScore) * 100), // Show as percentage
  }));
  
  const chartConfig = {};
  chartData.forEach(item => {
    chartConfig[item.axis] = { label: item.axis };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-bold text-primary">تقرير تدقيق SANDA</h1>
        <p className="text-lg text-muted-foreground">العمالة: {governorate}</p>
      </div>

      <Card className="w-full shadow-lg print:shadow-none print:border-0 print:bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl text-center">نتائج التدقيق</CardTitle>
          <CardDescription className="text-center pt-2">
            تمثل هذه الرسوم البيانية مستوى النضج لكل محور بناءً على إجاباتك.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
            <RadarChart data={chartData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <PolarGrid />
              <Radar
                name={governorate}
                dataKey="score"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.6}
              />
               <Radar
                name="Benchmark"
                dataKey="fullMark"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                className="opacity-50"
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6 print:hidden">
          <Button onClick={onStartOver} variant="outline">
            إجراء تدقيق جديد
          </Button>
          <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
            تصدير التقرير (PDF)
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
