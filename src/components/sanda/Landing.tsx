
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building, Map, FileText, BarChart, CheckCircle, Download } from 'lucide-react';
import type { AuditResult } from '@/components/sanda/Results';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { surveyData } from '@/lib/sanda-data';

const governorates = [
  'عمالة سيدي البرنوصي',
  'عمالة المحمدية',
  'عمالة عين السبع - الحي المحمدي',
];

type LandingProps = {
  onStartAudit: (governorate: string) => void;
  onGoToComparison: () => void;
};


const ExportModal = ({ results }: { results: AuditResult[] }) => {
    const { toast } = useToast();
    const [exportType, setExportType] = useState('excel');
    const [contentLevel, setContentLevel] = useState('summary');
    const [selectedGov, setSelectedGov] = useState<string>('');

    useEffect(() => {
        if (results.length > 0 && !selectedGov) {
            setSelectedGov(results[0].governorate);
        }
    }, [results, selectedGov]);

    const handleExport = () => {
        if (exportType === 'pdf' && !selectedGov) {
            toast({ variant: 'destructive', title: "الرجاء اختيار عمالة لتصدير تقريرها."});
            return;
        }

        if (exportType === 'excel') {
            handleExportCsv(contentLevel === 'detailed');
        } else {
             toast({ variant: 'destructive', title: "تصدير PDF لتقرير شامل قيد التطوير."});
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
                    headers.push(`(${axisId}) ${q.id}: ${q.text.substring(0,50)}...`);
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
        
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
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
            </div>
            <Button onClick={handleExport} className="w-full">تصدير</Button>
        </DialogContent>
    );
};

export default function Landing({ onStartAudit, onGoToComparison }: LandingProps) {
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [completedAudits, setCompletedAudits] = useState<AuditResult[]>([]);
  const [facultyLogoError, setFacultyLogoError] = useState(false);
  const [masterLogoError, setMasterLogoError] = useState(false);
  
  useEffect(() => {
    try {
      const storedResultsRaw = localStorage.getItem('sandaAuditResults');
      if (storedResultsRaw) {
        const parsedResults: AuditResult[] = JSON.parse(storedResultsRaw);
        setCompletedAudits(parsedResults);
      }
    } catch (error) {
      console.error("Failed to load completed audits from localStorage", error);
    }
  }, []);

  const handleStart = () => {
    if (selectedGovernorate) {
        onStartAudit(selectedGovernorate);
    }
  };
  
  const completedGovernorates = completedAudits.map(r => r.governorate);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
            
            {facultyLogoError ? (
              <span className="font-bold">LOGO_FLSHM</span>
            ) : (
              <img
                src="/faculty_logo.png"
                alt="University Logo"
                className="rounded-full hidden md:block"
                style={{maxHeight: '75px', width: 'auto', zIndex: 9999}}
                data-ai-hint="university logo"
                onError={() => setFacultyLogoError(true)}
              />
            )}

            <div className='flex flex-col gap-2'>
              <h1 className="text-3xl md:text-5xl font-bold text-primary">
                أداة التدقيق الرقمي SANDA
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground max-w-4xl mx-auto">
                رسالة الماستر: هندسة تدبير مخاطر الكوارث الطبيعية بعمالات (عين السبع
                - الحي المحمدي، سيدي البرنوصي، والمحمدية): من الوقاية إلى إعادة
                الإعمار وفق مقاربة إطار سنداي - كلية الآداب والعلوم الإنسانية
                المحمدية - جامعة الحسن الثاني.
              </p>
            </div>
            
            {masterLogoError ? (
                <span className="font-bold">LOGO_MASTER</span>
              ) : (
                <img
                  src="/master_logo.png"
                  alt="Master's Program Logo"
                  className="rounded-full hidden md:block"
                  style={{maxHeight: '75px', width: 'auto', zIndex: 9999}}
                  data-ai-hint="program logo"
                  onError={() => setMasterLogoError(true)}
                />
              )}

          </div>
        </header>

        <section className="max-w-2xl mx-auto bg-card p-8 rounded-xl shadow-lg border mb-16">
          <h2 className="text-xl font-semibold text-center mb-2">
            ابدأ التقييم
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            قبل البدء، يرجى تحديد العمالة التي تنتمي إليها
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select
              dir="rtl"
              value={selectedGovernorate}
              onValueChange={setSelectedGovernorate}
            >
              <SelectTrigger className="w-full text-base h-12">
                <SelectValue placeholder="اختر عمالة..." />
              </SelectTrigger>
              <SelectContent>
                {governorates.map((gov) => (
                  <SelectItem key={gov} value={gov} className="text-base">
                     <div className="flex items-center justify-between w-full">
                        <span>{gov}</span>
                        {completedGovernorates.includes(gov) && (
                          <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs">تم ملء الاستمارة</span>
                          </span>
                        )}
                      </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleStart}
              disabled={!selectedGovernorate}
              className="w-full sm:w-auto h-12 px-8 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
            >
             {completedGovernorates.includes(selectedGovernorate) ? 'متابعة أو إعادة التقييم' : 'ابدأ التدقيق الجديد'}
            </Button>
          </div>
           <div className="mt-4 border-t pt-4">
             <Button
              onClick={onGoToComparison}
              className="w-full h-12 px-8 text-lg"
              variant="outline"
            >
              <BarChart className="ml-2 h-5 w-5" />
              الانتقال إلى لوحة المقارنة
            </Button>
           </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  مقارنة العمالات
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">
                  تحليل إحصائي للفوارق في مستويات الصمود.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <Map className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  الخرائط الهندسية
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">
                  عرض النطاقات الجغرافية للمخاطر وفق تقنيات GIS.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  استخراج البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground mb-4">
                  تصدير التقارير والبيانات الخام للتحليل المعمق.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" disabled={completedAudits.length === 0}>
                           <FileText className="ml-2 h-4 w-4" />
                           تصدير التقارير
                        </Button>
                    </DialogTrigger>
                    <ExportModal results={completedAudits} />
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

    