
"use client";

import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { AuditResult } from '@/components/sanda/Results';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { surveyData } from '@/lib/sanda-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const ExportModal = ({ results }: { results: AuditResult[] }) => {
    const { toast } = useToast();
    const [exportType, setExportType] = useState('excel');
    const [contentLevel, setContentLevel] = useState('summary');
    const [selectedGov, setSelectedGov] = useState<string>('');

    const handlePrintReport = (result: AuditResult) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: "لا يمكن فتح نافذة الطباعة. يرجى تعطيل مانع النوافذ المنبثقة." });
            return;
        }

        const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        
        let reportContent = `
            <html>
                <head>
                    <title>تقرير الصمود الرقمي - ${result.governorate}</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Tajawal', sans-serif; direction: rtl; background-color: white; color: black; }
                        @page { size: A4; margin: 20mm; }
                        .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid black; padding-bottom: 1rem; margin-bottom: 2rem; }
                        .print-header img { max-height: 75px; }
                        .print-header div { text-align: center; }
                        h1 { font-size: 24px; font-weight: bold; color: #1a5f7a; }
                        h2 { font-size: 20px; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
                        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #f2f2f2; }
                        tr { page-break-inside: avoid; }
                        .page-break { page-break-before: always; }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                         <img src="/faculty_logo.png" alt="University Logo" />
                         <div>
                            <h1>تقرير تقييم الصمود الرقمي الشامل</h1>
                            <p><strong>العمالة:</strong> ${result.governorate}</p>
                            <p><strong>تاريخ التقرير:</strong> ${today}</p>
                         </div>
                         <img src="/master_logo.png" alt="Master's Program Logo" />
                    </div>
        `;
        
        reportContent += `
            <h2>ملخص النتائج</h2>
            <table>
              <tr><th>المحور</th><th>النتيجة</th></tr>
              <tr><td>المحور الأول: الفهم</td><td>${result.scores.axis1.toFixed(2)}</td></tr>
              <tr><td>المحور الثاني: الحوكمة</td><td>${result.scores.axis2.toFixed(2)}</td></tr>
              <tr><td>المحور الثالث: الاستثمار</td><td>${result.scores.axis3.toFixed(2)}</td></tr>
              <tr><td>المحور الرابع: الاستعداد</td><td>${result.scores.axis4.toFixed(2)}</td></tr>
              <tr><th>المؤشر النهائي للصمود</th><th>${result.total.toFixed(2)}</th></tr>
            </table>
        `;
        
        Object.keys(surveyData).forEach(axisId => {
            const axis = surveyData[axisId];
            reportContent += `<h2 class="page-break">${axis.title}</h2>`;
            reportContent += `<table><thead><tr><th>السؤال</th><th>الإجابة المختارة</th><th>المستوى</th></tr></thead><tbody>`;
            axis.questions.forEach((q, index) => {
                const answerValue = result.answers[axisId as keyof typeof result.answers]?.[q.id];
                const selectedOption = q.options.find(opt => `L${opt.score}` === answerValue);
                reportContent += `
                    <tr>
                        <td>${index + 1}. ${q.text}</td>
                        <td>${selectedOption ? selectedOption.text : 'لم تتم الإجابة'}</td>
                        <td>${answerValue || '-'}</td>
                    </tr>
                `;
            });
            reportContent += `</tbody></table>`;
        });
        
        reportContent += `
                </body>
            </html>
        `;

        printWindow.document.write(reportContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
             printWindow.print();
             printWindow.close();
        }, 500);
    };

    const handleExport = () => {
        if (results.length === 0) {
            toast({ variant: 'destructive', title: "لا توجد بيانات مسجلة حالياً." });
            return;
        }
        
        if (exportType === 'pdf') {
             if (!selectedGov) {
                toast({ variant: 'destructive', title: "الرجاء اختيار عمالة لتصدير تقريرها."});
                return;
             }
             const resultToPrint = results.find(r => r.governorate === selectedGov);
             if (resultToPrint) {
                toast({ title: 'جاري تحضير التقرير...', description: 'سيتم فتح نافذة الطباعة قريباً.' });
                handlePrintReport(resultToPrint);
             } else {
                toast({ variant: 'destructive', title: "لم يتم العثور على بيانات للعمالة المختارة."});
             }
        } else {
            handleExportCsv(contentLevel === 'detailed');
        }
    };
    
    const handleExportCsv = (detailed: boolean) => {
        if (results.length === 0) {
            toast({ variant: "destructive", title: "لا توجد بيانات للتصدير." });
            return;
        }
        toast({ title: 'جاري تحضير الملف...', description: 'سيتم تنزيل ملف CSV قريباً.' });

        const headers = [ "العمالة", "المؤشر النهائي", "محور الفهم", "محور الحوكمة", "محور الاستثمار", "محور الاستعداد" ];

        const allQuestions: { axisId: string, qId: string, text: string }[] = [];
        if (detailed) {
            Object.keys(surveyData).forEach(axisId => {
                surveyData[axisId].questions.forEach(q => {
                    headers.push(`(${surveyData[axisId].title}) ${q.id}: ${q.text.substring(0,50)}...`);
                    allQuestions.push({axisId, qId: q.id, text: q.text});
                });
            });
        }

        const rows = results.map(result => {
            const row = [
                `"${result.governorate}"`,
                result.total.toFixed(2),
                result.scores.axis1.toFixed(2),
                result.scores.axis2.toFixed(2),
                result.scores.axis3.toFixed(2),
                result.scores.axis4.toFixed(2),
            ];

            if (detailed) {
                allQuestions.forEach(({axisId, qId}) => {
                    const axisAnswers = result.answers[axisId as keyof typeof result.answers];
                    const answer = axisAnswers ? axisAnswers[qId] : 'N/A';
                    const questionData = surveyData[axisId].questions.find(q => q.id === qId);
                    const option = questionData?.options.find(opt => `L${opt.score}` === answer);
                    row.push(`"${option ? option.text.replace(/"/g, '""') : 'لم تتم الإجابة'}"`);
                });
            }
            
            return row.join(',');
        });
        
        const csvContent = "\uFEFF" + [headers.join(','), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `SANDA_Data_${detailed ? 'Detailed' : 'Summary'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <DialogContent dir="rtl" className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>إعدادات تصدير البيانات</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div>
                    <Label className="font-bold mb-2 block">نوع التصدير</Label>
                    <RadioGroup value={exportType} onValueChange={setExportType} className="flex gap-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="excel" id="excel" />
                            <Label htmlFor="excel">قاعدة البيانات الكاملة (Excel)</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="pdf" id="pdf" />
                            <Label htmlFor="pdf">تقرير شامل لعمالة واحدة (PDF)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {exportType === 'pdf' && (
                     <div>
                        <Label htmlFor="gov-select" className="font-bold mb-2 block">اختر العمالة</Label>
                        <Select dir="rtl" value={selectedGov} onValueChange={setSelectedGov}>
                            <SelectTrigger id="gov-select">
                                <SelectValue placeholder="اختر عمالة..." />
                            </SelectTrigger>
                            <SelectContent>
                                {results.map(r => (
                                    <SelectItem key={r.governorate} value={r.governorate}>{r.governorate}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                {exportType === 'excel' && (
                  <div>
                      <Label className="font-bold mb-2 block">مستوى المحتوى</Label>
                      <RadioGroup value={contentLevel} onValueChange={setContentLevel} className="flex gap-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value="summary" id="summary" />
                              <Label htmlFor="summary">المؤشرات النهائية فقط</Label>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value="detailed" id="detailed" />
                              <Label htmlFor="detailed">الأجوبة التفصيلية والتحليل</Label>
                          </div>
                      </RadioGroup>
                  </div>
                )}

            </div>
            <Button onClick={handleExport} className="w-full">تصدير</Button>
        </DialogContent>
    );
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
                <div className="mt-6 flex justify-end gap-2">
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                               <Download className="ml-2 h-4 w-4" />
                               تصدير البيانات
                            </Button>
                        </DialogTrigger>
                        <ExportModal results={results} />
                    </Dialog>
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
             سيتم هنا عرض خريطة تفاعلية للعمالات باستخدام Leaflet.js، مع تلوين كل منطقة بناءً على درجة الصمود الإجمالية المحفوظة. سيسمح ذلك بتحليل جغرافي فوري للفجوات. (قيد التطوير)
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

    
