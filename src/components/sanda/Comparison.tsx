
"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import type { AuditResult } from '@/components/sanda/Results';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Trash2, Download, CloudDownload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

const axisLabels: { [key: string]: string } = {
  axis1: 'الجانب التقني',
  axis2: 'الحكامة',
  axis3: 'الاستثمار',
  axis4: 'التكوين',
};

const axisColors = {
    axis1: 'rgba(39, 174, 96, 0.7)',
    axis2: 'rgba(41, 128, 185, 0.7)',
    axis3: 'rgba(241, 196, 15, 0.7)',
    axis4: 'rgba(192, 57, 43, 0.7)',
};

export default function Comparison({ onBackToLanding }: { onBackToLanding: () => void }) {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [useCloudData, setUseCloudData] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { toast } = useToast();
  const db = useFirestore();

  const reportsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
  }, [db]);

  const { data: cloudReports, loading: cloudLoading } = useCollection(reportsQuery);

  useEffect(() => {
    if (useCloudData && cloudReports) {
      setResults(cloudReports as unknown as AuditResult[]);
    } else {
      const stored = localStorage.getItem('sandaAuditResults');
      if (stored) setResults(JSON.parse(stored));
    }
  }, [useCloudData, cloudReports]);

  useEffect(() => {
    if (chartRef.current && results.length > 0) {
        if (chartInstance.current) chartInstance.current.destroy();
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
                    }))
                },
                options: {
                    indexAxis: 'y',
                    scales: { x: { beginAtZero: true, max: 5 } },
                    plugins: { legend: { labels: { font: { family: 'Tajawal' } } } }
                }
            });
        }
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2">لوحة المقارنة</h1>
            <p className="text-lg text-muted-foreground">تحليل مقارن لمستويات الصمود بين العمالات</p>
        </div>
        <div className="flex gap-4">
            <Button onClick={() => setUseCloudData(!useCloudData)} variant={useCloudData ? "default" : "outline"}>
                {useCloudData ? (
                    <><CloudDownload className="ml-2 h-4 w-4" /> بيانات السحابة</>
                ) : (
                    "بيانات محلية"
                )}
            </Button>
            <Button onClick={onBackToLanding} variant="outline">
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة
            </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>مقارنة النتائج {useCloudData && cloudLoading && <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right">إسم العمالة</TableHead>
                        <TableHead className="text-center">الحكامة</TableHead>
                        <TableHead className="text-center">الجانب التقني</TableHead>
                        <TableHead className="text-center">الاستثمار</TableHead>
                        <TableHead className="text-center">التكوين</TableHead>
                        <TableHead className="text-center font-bold">الإجمالي</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map((result, idx) => (
                        <TableRow key={idx}>
                            <TableCell className="font-medium text-right">{result.governorate}</TableCell>
                            <TableCell className="text-center">{result.scores.axis2.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{result.scores.axis1.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{result.scores.axis3.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{result.scores.axis4.toFixed(2)}</TableCell>
                            <TableCell className="text-center font-bold text-primary">{result.total.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>التصور الإحصائي</CardTitle></CardHeader>
            <CardContent><div className="relative h-[400px]"><canvas ref={chartRef}></canvas></div></CardContent>
        </Card>
      </main>
    </div>
  );
}
