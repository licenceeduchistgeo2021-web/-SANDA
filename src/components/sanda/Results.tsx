
"use client";

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Button } from '@/components/ui/button';
import { Answers } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Download, RotateCcw } from 'lucide-react';
import { surveyData } from '@/lib/sanda-data';

const axisWeights = {
    axis1: { q1: 1.5, q7: 1.5, q8: 1.4, q9: 1.4, default: 1.0 }, // الفهم
    axis2: { q3: 1.4, q5: 1.3, q11: 1.3, default: 1.0 },         // الحوكمة
    axis3: { q3: 1.5, q8: 1.4, q10: 1.3, default: 1.0 },         // الاستثمار
    axis4: { q2: 1.5, q10: 1.4, q12: 1.4, default: 1.0 }         // الاستعداد
};

const statisticalBasis = [
    {
        axis: 'الفهم',
        basis: 'توزيع Gumbel و Kriging',
        goal: 'قياس دقة التنبؤ بالأحداث النادرة (فترات الرجوع T).',
        class: 'axis-1-border'
    },
    {
        axis: 'الحوكمة',
        basis: 'نظرية Reliability',
        goal: 'قياس صمود "سلاسل القرار" ومنع الفشل المؤسسي.',
        class: 'axis-2-border'
    },
    {
        axis: 'الاستثمار',
        basis: 'نماذج AAL و NPV',
        goal: 'قياس العائد الاقتصادي وخفض الخسارة السنوية المتوقعة.',
        class: 'axis-3-border'
    },
    {
        axis: 'الاستعداد',
        basis: 'نظرية Queueing و Exponential',
        goal: 'قياس سرعة التعافي وإدارة ضغط الموارد البشرية.',
        class: 'axis-4-border'
    }
];

const abbreviations = {
    "الفهم": [
        { abbr: "MHA (تقييم المخاطر المتعددة)", desc: "تحليل شامل يربط بين نوع الخطر وهشاشة المنطقة لتقدير الخسائر المحتملة." },
        { abbr: "Gumbel Distribution (توزيع غومبل)", desc: "النموذج الرياضي الأهم لحساب \"فترات الرجوع\" وتوقع الفيضانات والزلازل النادرة." }
    ],
    "الحوكمة": [
        { abbr: "NISDRM (نظام المعلومات الوطني)", desc: "المنصة الرقمية التي تضمن تدفق البيانات بين العمالة والقطاعات لضمان موثوقية التنسيق." },
        { abbr: "Reliability Theory (نظرية الموثوقية)", desc: "إحصاء هندسي يقيس احتمالية فشل \"نظام القرار\" أثناء وقوع الكارثة." }
    ],
    "الاستثمار": [
        { abbr: "CBA (تحليل التكلفة والعائد)", desc: "دراسة اقتصادية تثبت جدوى الاستثمار الوقائي لتقليل الخسارة السنوية المتوقعة (AAL)." },
        { abbr: "RPS 2000 (ضابط البناء)", desc: "المعايير التقنية التي تضمن صمود البنية التحتية والمباني أمام الهزات الزلزالية." }
    ],
    "الاستعداد": [
        { abbr: "MHEWS (نظام الإنذار المبكر)", desc: "النموذج الإحصائي الذي يقلل زمن الاستجابة ويحسب احتمالية الإنذارات الكاذبة (Bayesian)." },
        { abbr: "BBB (إعادة البناء بشكل أفضل)", desc: "مبدأ هندسي يهدف لرفع مستوى الصمود أثناء مرحلة التعافي لمنع تكرار الكارثة." }
    ],
};

export type AuditResult = {
  governorate: string;
  scores: {
    axis1: number;
    axis2: number;
    axis3: number;
    axis4: number;
  };
  total: number;
  timestamp: number;
  answers: Answers;
};

type ResultsProps = {
  governorate: string;
  answers: Answers;
  onRestart: () => void;
};

function calculateAxisScore(axisId: keyof typeof axisWeights, answers: Answers) {
    let totalWeightedScore = 0;
    let totalWeights = 0;
    const weightsForAxis = axisWeights[axisId];
    const axisAnswers = answers[axisId];
    
    if (!axisAnswers) return 0;

    const questions = Object.keys(axisAnswers);
    // Assuming 20 questions per axis based on the new structure
    const numQuestions = 20;


    for (let i = 1; i <= numQuestions; i++) {
        let qKey = 'q' + i;
        // Ensure we check if the answer exists for the question key
        if(axisAnswers[qKey]) {
            let score = parseInt(axisAnswers[qKey]?.replace('L', '') || '0');
            let weight = (weightsForAxis as any)[qKey] || weightsForAxis.default;

            if (score > 0) {
                totalWeightedScore += score * weight;
                totalWeights += weight;
            }
        }
    }
    return totalWeights > 0 ? parseFloat((totalWeightedScore / totalWeights).toFixed(2)) : 0;
}

const PrintHeader = ({ governorate }: { governorate: string }) => {
    const [facultyLogoError, setFacultyLogoError] = useState(false);
    const [masterLogoError, setMasterLogoError] = useState(false);
    const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="hidden print:block">
            <header className="text-center border-b-2 border-black pb-4 mb-8 flex justify-between items-center">
               {facultyLogoError ? (
                  <span className="font-bold">LOGO_FLSHM</span>
                ) : (
                  <img
                    src="/faculty_logo.png"
                    alt="FLSHM Logo"
                    style={{maxHeight: '75px', width: 'auto'}}
                    onError={() => setFacultyLogoError(true)}
                  />
                )}
                <div>
                    <h1 className="text-xl font-bold">Master SANDA - University Hassan II</h1>
                    <p className="text-lg mt-1"><strong>تقرير تقييم الصمود الرقمي الشامل</strong></p>
                    <p><strong>العمالة:</strong> {governorate}</p>
                    <p><strong>الطالب الباحث:</strong> محمد لعرانتي</p>
                    <p><strong>تاريخ التقرير:</strong> {today}</p>
                </div>
                {masterLogoError ? (
                  <span className="font-bold">LOGO_MASTER</span>
                ) : (
                  <img
                    src="/master_logo.png"
                    alt="Master SANDA Logo"
                    style={{maxHeight: '75px', width: 'auto'}}
                    onError={() => setMasterLogoError(true)}
                  />
                )}
            </header>
        </div>
    );
};

const FullAnswersTable = ({ answers }: { answers: Answers }) => {
    return (
        <div className="hidden print:block page-break-before">
            <h2 className="text-2xl font-bold text-center mb-6 text-primary">القسم 3: سجل الأجوبة الكامل</h2>
            {Object.keys(surveyData).map(axisId => {
                const axis = surveyData[axisId as keyof typeof surveyData];
                const axisAnswers = answers[axisId as keyof typeof answers];
                if (!axisAnswers) return null;

                return (
                    <div key={axisId} className="mb-8 page-break-inside-avoid">
                        <h3 className="text-xl font-bold mb-4 bg-muted p-2 rounded-md">{axis.title}</h3>
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-2 w-1/2">السؤال</th>
                                    <th className="border p-2">الإجابة المختارة</th>
                                    <th className="border p-2">المستوى</th>
                                </tr>
                            </thead>
                            <tbody>
                                {axis.questions.map((q, index) => {
                                    const answerValue = axisAnswers[q.id];
                                    const selectedOption = q.options.find(opt => `L${opt.score}` === answerValue);
                                    return (
                                        <tr key={q.id} className="even:bg-gray-50 page-break-inside-avoid">
                                            <td className="border p-2">{index + 1}. {q.text}</td>
                                            <td className="border p-2">{selectedOption ? selectedOption.text : 'لم تتم الإجابة'}</td>
                                            <td className="border p-2 text-center font-bold">{answerValue || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
};


export default function Results({ governorate, answers, onRestart }: ResultsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { toast } = useToast();

  const score1 = calculateAxisScore('axis1', answers);
  const score2 = calculateAxisScore('axis2', answers);
  const score3 = calculateAxisScore('axis3', answers);
  const score4 = calculateAxisScore('axis4', answers);
  const totalScore = (score1 + score2 + score3 + score4) / 4;

  useEffect(() => {
    // Save to localStorage
    try {
        const newResult: AuditResult = {
            governorate,
            scores: {
                axis1: score1,
                axis2: score2,
                axis3: score3,
                axis4: score4,
            },
            total: totalScore,
            timestamp: Date.now(),
            answers: answers,
        };

        const existingResultsRaw = localStorage.getItem('sandaAuditResults');
        const existingResults: AuditResult[] = existingResultsRaw ? JSON.parse(existingResultsRaw) : [];
        
        // Remove previous result for the same governorate to keep only the latest
        const filteredResults = existingResults.filter(r => r.governorate !== governorate);
        
        const updatedResults = [...filteredResults, newResult];
        localStorage.setItem('sandaAuditResults', JSON.stringify(updatedResults));
        toast({
          title: "تم حفظ البيانات بنجاح",
          description: "يمكنك الآن استخراج التقارير."
        })
    } catch (error) {
        console.error("Failed to save results to localStorage", error);
    }
  }, [governorate, score1, score2, score3, score4, totalScore, toast, answers]);

  const handlePrint = () => {
    toast({ title: 'جاري تحضير الملف...', description: 'سيتم فتح نافذة الطباعة قريباً.' });
    setTimeout(() => window.print(), 500);
  };

  const scores = [
      { axis: 'الفهم', score: score1, badge: 'MHA | GIS', analysis: 'يقيس القدرة على النمذجة العلمية وتوقع المخاطر بناءً على بيانات DesInventar وتوقعات GIEC.', class: 'axis-1' },
      { axis: 'الحوكمة', score: score2, badge: 'NISDRM | KPI', analysis: 'يقيس موثوقية التنسيق المؤسسي والالتزام بالقوانين التنظيمية مثل قانون 110.14.', class: 'axis-2' },
      { axis: 'الاستثمار', score: score3, badge: 'CBA | RPS 2000', analysis: 'يقيس كفاءة الاستثمار في البنية التحتية الصامدة بناءً على تحليل التكلفة والعائد (CBA).', class: 'axis-3' },
      { axis: 'الاستعداد', score: score4, badge: 'MHEWS | BBB', analysis: 'يقيس سرعة الاستجابة الميدانية والقدرة على "إعادة البناء بشكل أفضل" (BBB).', class: 'axis-4' },
  ];

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['الفهم P1', 'الحوكمة P2', 'الاستثمار P3', 'الاستعداد P4'],
            datasets: [{
              label: `مؤشر صمود: ${governorate}`,
              data: [score1, score2, score3, score4],
              backgroundColor: 'rgba(26, 95, 122, 0.2)',
              borderColor: '#1a5f7a',
              borderWidth: 3,
              pointBackgroundColor: '#1a5f7a',
            }]
          },
          options: {
            animation: false,
            scales: {
              r: {
                min: 0,
                max: 5,
                ticks: { stepSize: 1, backdropColor: 'transparent', color: 'hsl(var(--muted-foreground))' },
                grid: { color: 'hsl(var(--border))' },
                angleLines: { color: 'hsl(var(--border))' },
                pointLabels: { font: { size: 14, weight: 'bold', family: 'Tajawal' }, color: 'hsl(var(--foreground))' }
              }
            },
            plugins: {
              legend: {
                labels: {
                  color: 'hsl(var(--foreground))',
                  font: {
                    size: 16,
                    family: 'Tajawal'
                  }
                }
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
  }, [governorate, score1, score2, score3, score4]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
        <style jsx global>{`
            .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; direction: rtl; }
            .result-card { padding: 25px; border-radius: 15px; border-right: 8px solid; background: var(--card); box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.2s; }
            .result-card:hover { transform: translateY(-5px); }
            .axis-1 { border-color: #27ae60; }
            .axis-2 { border-color: #2980b9; }
            .axis-3 { border-color: #f1c40f; }
            .axis-4 { border-color: #c0392b; }
            .axis-1-border { border-color: #27ae60 !important; }
            .axis-2-border { border-color: #2980b9 !important; }
            .axis-3-border { border-color: #f1c40f !important; }
            .axis-4-border { border-color: #c0392b !important; }
            .score { font-size: 3em; font-weight: 800; color: var(--foreground); margin: 15px 0; text-align: center; }
            .abbr-badge { background: var(--muted); padding: 4px 10px; border-radius: 20px; font-size: 0.8em; color: var(--muted-foreground); }
            .card-header { display: flex; justify-content: space-between; align-items: center; }
            .analysis-text { font-size: 0.95em; color: var(--muted-foreground); line-height: 1.6; }
            .integrative-description { background: var(--card); padding: 20px; border: 1px dashed var(--border); margin-top: 20px; text-align: right; border-radius: 10px; }
            .stats-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                padding: 20px 0;
                direction: rtl;
            }
            .stat-card {
                background: var(--card);
                border-right: 5px solid var(--border);
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.07);
                transition: transform 0.3s ease;
            }
            .stat-card:hover {
                transform: translateY(-5px);
            }
            .abbr-title {
                font-weight: bold;
                color: var(--foreground);
                font-size: 1.1em;
                display: block;
                margin-bottom: 5px;
            }
            .abbr-desc {
                font-size: 0.9em;
                color: var(--muted-foreground);
                line-height: 1.4;
            }
            @media print {
              body {
                background-color: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
              .printable-area {
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
              }
              .page-break-before {
                 page-break-before: always;
              }
               .page-break-inside-avoid {
                page-break-inside: avoid;
              }
              table {
                width: 100%;
              }
            }
        `}</style>

      <PrintHeader governorate={governorate} />
      
      <header className="max-w-6xl mx-auto text-center mb-8 no-print">
        <h1 className="text-4xl font-bold text-primary mb-2">تقرير تقييم الصمود الرقمي</h1>
        <p className="text-lg text-muted-foreground">عمالة: {governorate}</p>
      </header>

      <div className="max-w-6xl mx-auto bg-card p-8 rounded-xl shadow-lg border printable-area">
        
        <div className="results-header mb-12 page-break-inside-avoid">
            <h2 className="text-2xl font-bold mb-6 text-right text-primary">القسم 1: نتائج تقييم مؤشر الصمود</h2>
             <div className="flex justify-around items-center bg-gray-100 p-6 rounded-lg mb-6">
                <div className="text-center">
                    <p className="text-lg font-semibold">المؤشر النهائي للصمود</p>
                    <p className="text-6xl font-bold text-primary my-2">{totalScore.toFixed(2)}</p>
                </div>
            </div>
            <div className="results-grid">
                {scores.map(item => (
                    <div key={item.axis} className={`result-card ${item.class}`}>
                        <div className="card-header">
                            <h3 className="text-xl font-bold">{item.axis}</h3>
                            <span className="abbr-badge">{item.badge}</span>
                        </div>
                        <div className="score">{item.score.toFixed(2)}</div>
                        <p className="analysis-text">{item.analysis}</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="chart-section my-12 page-break-inside-avoid">
          <h3 className="text-2xl font-bold text-center mb-6 text-primary">خلاصة العلاقة التكاملية بين محاور الصمود</h3>
          <div className="max-w-2xl mx-auto">
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center mt-4">
              <p className="text-muted-foreground">مكان مخصص لعرض الخريطة التفاعلية</p>
          </div>
          <p className="integrative-description">
            <strong>رؤية شاملة:</strong> تظهر العلاقة التكاملية أن الفهم الجيد (P1) يوجه الحوكمة (P2) لفرض استثمارات (P3) ترفع الجاهزية (P4). 
            أي انكماش في زوايا المبيان يحدد "فجوة الصمود" التي تحتاج تدخلًا استراتيجيًا.
          </p>
        </div>

        <div className="my-12 page-break-before page-break-inside-avoid">
            <h3 className="text-2xl font-bold text-center mb-6 text-primary">القسم 2: الأساس الإحصائي والهندسي للمؤشرات</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className='bg-muted'>
                        <tr>
                            <th className="p-3 font-bold uppercase text-muted-foreground border border-border">المحور</th>
                            <th className="p-3 font-bold uppercase text-muted-foreground border border-border">الأساس الإحصائي المطبق</th>
                            <th className="p-3 font-bold uppercase text-muted-foreground border border-border">الهدف الهندسي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statisticalBasis.map(item => (
                            <tr key={item.axis} className="bg-card hover:bg-muted/50">
                                <td className={`p-3 text-foreground border border-border font-semibold`}>
                                    <span className={`w-3 h-3 inline-block ml-2 rounded-full ${item.class.replace('-border', '')}`}></span>
                                    {item.axis}
                                </td>
                                <td className="p-3 text-foreground border border-border">{item.basis}</td>
                                <td className="p-3 text-foreground border border-border">{item.goal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        <FullAnswersTable answers={answers} />

        <div className="my-12 page-break-before">
            <h3 className="text-2xl font-bold text-center mb-6 text-primary">شرح مختصر للمصطلحات التقنية</h3>
            {Object.entries(abbreviations).map(([axis, items]) => (
                 <div key={axis} className="mb-6 page-break-inside-avoid">
                     <h4 className={`text-xl font-bold mb-4 ${scores.find(s => s.axis === axis)?.class}`}>{axis}</h4>
                     <div className="stats-container pt-0">
                         {items.map(item => (
                            <div key={item.abbr} className={`stat-card ${scores.find(s => s.axis === axis)?.class}-border`}>
                                <span className="abbr-title">{item.abbr}</span>
                                <p className="abbr-desc">{item.desc}</p>
                            </div>
                         ))}
                     </div>
                 </div>
            ))}
        </div>

        <div className="mt-12 text-center flex justify-center gap-4 no-print">
          <Button onClick={handlePrint} variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تحميل التقرير الكامل (PDF)
          </Button>
          <Button onClick={onRestart} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <RotateCcw className="ml-2 h-4 w-4" />
            إجراء تقييم جديد
          </Button>
        </div>
      </div>
    </div>
  );
}

    