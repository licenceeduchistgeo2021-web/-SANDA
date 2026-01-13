"use client";

import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { AuditResult } from '@/components/sanda/Results';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Trash2 } from 'lucide-react';

type ComparisonProps = {
  onBackToLanding: () => void;
};

const axisLabels: { [key: string]: string } = {
  axis1: 'المحور 1: الفهم',
  axis2: 'المحور 2: الحوكمة',
  axis3: 'المحور 3: الاستثمار',
  axis4: 'المحور 4: الاستعداد',
};

const axisColors = {
    axis1: 'rgba(39, 174, 96, 0.7)',
    axis2: 'rgba(41, 128, 185, 0.7)',
    axis3: 'rgba(241, 196, 15, 0.7)',
    axis4: 'rgba(192, 57, 43, 0.7)',
};

export default function Comparison({ onBackToLanding }: ComparisonProps) {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [minScores, setMinScores] = useState<{ [key: string]: number }>({});
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    try {
      const storedResultsRaw = localStorage.getItem('sandaAuditResults');
      if (storedResultsRaw) {
        const parsedResults: AuditResult[] = JSON.parse(storedResultsRaw);
        setResults(parsedResults);

        if (parsedResults.length > 0) {
          const newMinScores: { [key: string]: number } = {};
          Object.keys(parsedResults[0].scores).forEach(axis => {
            const scores = parsedResults.map(r => r.scores[axis as keyof typeof r.scores]);
            newMinScores[axis] = Math.min(...scores);
          });
          setMinScores(newMinScores);
        }
      }
    } catch (error) {
      console.error("Failed to load results from localStorage", error);
    }
  }, []);

  const handleClearData = () => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف جميع بيانات المقارنة؟ لا يمكن التراجع عن هذا الإجراء.")) {
        localStorage.removeItem('sandaAuditResults');
        setResults([]);
        setMinScores({});
    }
  };

  useEffect(() => {
    if (chartRef.current && results.length > 0) {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: results.map(r => r.governorate),
                    datasets: Object.keys(axisLabels).map(axisKey => ({
                        label: axisLabels[axisKey],
                        data: results.map(r => r.scores[axisKey as keyof typeof r.scores]),
                        backgroundColor: axisColors[axisKey as keyof typeof axisColors],
                        borderColor: axisColors[axisKey as keyof typeof axisColors].replace('0.7', '1'),
                        borderWidth: 1,
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 5,
                            ticks: { color: 'hsl(var(--foreground))' },
                            grid: { color: 'hsl(var(--border))' }
                        },
                        y: {
                            ticks: { color: 'hsl(var(--foreground))' },
                            grid: { color: 'hsl(var(--border))' }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: 'hsl(var(--foreground))',
                                font: { family: 'Tajawal' }
                            }
                        },
                        title: {
                            display: true,
                            text: 'مقارنة درجات الصمود بين العمالات',
                            color: 'hsl(var(--foreground))',
                            font: { size: 18, family: 'Tajawal' }
                        }
                    }
                }
            });
        }
    }
     return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [results]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">لوحة المقارنة</h1>
            <p className="text-lg text-muted-foreground">تحليل مقارن لمستويات الصمود بين العمالات</p>
        </div>
        <Button onClick={onBackToLanding} variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى الصفحة الرئيسية
        </Button>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>مقارنة النتائج</CardTitle>
            <CardDescription>
              يعرض هذا الجدول نتائج التدقيق لكل عمالة، مع تمييز أقل درجة في كل محور لتحديد فجوات الصمود الجغرافية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="font-bold">إسم العمالة</TableHead>
                        {Object.keys(axisLabels).map(axisKey => (
                            <TableHead key={axisKey} className="text-center">{axisLabels[axisKey]}</TableHead>
                        ))}
                        <TableHead className="text-center font-bold">إجمالي الصمود</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((result) => (
                        <TableRow key={result.governorate}>
                            <TableCell className="font-medium">{result.governorate}</TableCell>
                            {Object.keys(axisLabels).map(axisKey => {
                                const score = result.scores[axisKey as keyof typeof result.scores];
                                const isMin = score === minScores[axisKey];
                                return (
                                <TableCell key={axisKey} className={`text-center font-mono text-lg ${isMin ? 'bg-red-500/20 text-red-900 dark:text-red-200' : ''}`}>
                                    {score.toFixed(2)}
                                </TableCell>
                                );
                            })}
                            <TableCell className="text-center font-bold text-primary text-lg">{result.total.toFixed(2)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات محفوظة للمقارنة. يرجى إكمال تدقيق واحد على الأقل.</p>
            )}
             {results.length > 0 && (
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleClearData} variant="destructive">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف جميع البيانات
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
        
        {results.length > 0 && (
            <Card>
            <CardHeader>
                <CardTitle>التصور الإحصائي</CardTitle>
                <CardDescription>
                    مقارنة مرئية لدرجات المحاور الأربعة لكل عمالة.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative h-[500px]">
                    <canvas ref={chartRef}></canvas>
                </div>
            </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>عرض الخرائط (GIS)</CardTitle>
            <CardDescription>
              (قيد التطوير) سيتم هنا عرض خريطة للعمالات مع تلوينها بناءً على درجة الصمود الإجمالية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">مكان مخصص لعرض الخريطة التفاعلية</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
