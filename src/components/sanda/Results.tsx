
"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Chart from 'chart.js/auto';
import { Button } from '@/components/ui/button';
import { Answers } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { Download, RotateCcw, CloudUpload, CheckCircle2 } from 'lucide-react';
import { surveyData } from '@/lib/sanda-data';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const VulnerabilityMap = dynamic(() => import('./VulnerabilityMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-slate-100 rounded-lg animate-pulse" />
});

const axisWeights = {
    axis1: { q1: 1.5, q7: 1.5, q8: 1.4, q9: 1.4, default: 1.0 },
    axis2: { q3: 1.4, q5: 1.3, q11: 1.3, default: 1.0 },
    axis3: { q3: 1.5, q8: 1.4, q10: 1.3, default: 1.0 },
    axis4: { q2: 1.5, q10: 1.4, q12: 1.4, default: 1.0 }
};

const statisticalBasis = [
    { axis: 'الجانب التقني', basis: 'توزيع Gumbel و Kriging', goal: 'قياس دقة التنبؤ بالأحداث النادرة.', class: 'axis-1-border' },
    { axis: 'الحكامة', basis: 'نظرية Reliability', goal: 'قياس صمود سلاسل القرار ومنع الفشل.', class: 'axis-2-border' },
    { axis: 'الاستثمار', basis: 'نماذج AAL و NPV', goal: 'قياس العائد الاقتصادي وخفض الخسارة السنوية.', class: 'axis-3-border' },
    { axis: 'التكوين', basis: 'نظرية Queueing و Exponential', goal: 'قياس سرعة التعافي وإدارة الضغط.', class: 'axis-4-border' }
];

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
  userEmail?: string;
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
    const numQuestions = surveyData[axisId].questions.length;
    for (let i = 1; i <= numQuestions; i++) {
        let qKey = 'q' + i;
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
    const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
        <div className="hidden print:block">
            <header className="text-center border-b-2 border-black pb-4 mb-8 flex justify-between items-center">
                <img src="/faculty_logo.png" alt="FLSHM Logo" style={{maxHeight: '75px'}} />
                <div>
                    <h1 className="text-xl font-bold">Master SANDA - University Hassan II</h1>
                    <p className="text-lg mt-1"><strong>تقرير تقييم الصمود الرقمي الشامل</strong></p>
                    <p><strong>العمالة:</strong> {governorate}</p>
                    <p><strong>تاريخ التقرير:</strong> {today}</p>
                </div>
                <img src="/master_logo.png" alt="Master SANDA Logo" style={{maxHeight: '75px'}} />
            </header>
        </div>
    );
};

export default function Results({ governorate, answers, onRestart }: ResultsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const score1 = calculateAxisScore('axis1', answers);
  const score2 = calculateAxisScore('axis2', answers);
  const score3 = calculateAxisScore('axis3', answers);
  const score4 = calculateAxisScore('axis4', answers);
  const totalScore = (score1 + score2 + score3 + score4) / 4;

  useEffect(() => {
    // Save locally first
    try {
        const newResult: AuditResult = {
            governorate,
            scores: { axis1: score1, axis2: score2, axis3: score3, axis4: score4 },
            total: totalScore,
            timestamp: Date.now(),
            answers: answers,
            userEmail: user?.email || undefined
        };
        const existingResultsRaw = localStorage.getItem('sandaAuditResults');
        const existingResults: AuditResult[] = existingResultsRaw ? JSON.parse(existingResultsRaw) : [];
        const filteredResults = existingResults.filter(r => r.governorate !== governorate);
        localStorage.setItem('sandaAuditResults', JSON.stringify([...filteredResults, newResult]));
        localStorage.removeItem(`sanda-draft-${governorate}`);
    } catch (error) {
        console.error("Local save failed", error);
    }
  }, [governorate, score1, score2, score3, score4, totalScore, user, answers]);

  const handleSyncToCloud = () => {
    if (!db || !user) return;
    setIsSyncing(true);
    
    const reportRef = doc(db, 'reports', `${governorate}-${Date.now()}`);
    const reportData = {
        governorate,
        scores: { axis1: score1, axis2: score2, axis3: score3, axis4: score4 },
        total: totalScore,
        answers: answers,
        timestamp: Date.now(),
        userId: user.uid,
        userEmail: user.email,
        serverTime: serverTimestamp()
    };

    setDoc(reportRef, reportData)
        .then(() => {
            setIsSynced(true);
            toast({ title: "تم الحفظ سحابياً", description: "تمت مزامنة التقرير مع قاعدة البيانات السحابية بنجاح." });
        })
        .catch(async (err) => {
            const permissionError = new FirestorePermissionError({
                path: reportRef.path,
                operation: 'create',
                requestResourceData: reportData
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ variant: "destructive", title: "فشل المزامنة", description: "تأكد من اتصالك بالإنترنت وحاول مرة أخرى." });
        })
        .finally(() => setIsSyncing(false));
  };

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['الجانب التقني', 'الحكامة', 'الاستثمار', 'التكوين'],
            datasets: [{
              label: `مؤشر صمود: ${governorate}`,
              data: [score1, score2, score3, score4],
              backgroundColor: 'rgba(26, 95, 122, 0.2)',
              borderColor: '#1a5f7a',
              borderWidth: 3,
            }]
          },
          options: {
            scales: { r: { min: 0, max: 5 } },
            plugins: { legend: { labels: { font: { family: 'Tajawal' } } } }
          }
        });
      }
    }
  }, [governorate, score1, score2, score3, score4]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <PrintHeader governorate={governorate} />
      
      <header className="max-w-6xl mx-auto text-center mb-8 no-print flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold text-primary mb-2 text-right">تقرير تقييم الصمود الرقمي</h1>
            <p className="text-lg text-muted-foreground text-right">عمالة: {governorate}</p>
        </div>
        <div className="flex gap-2">
            {!isSynced ? (
                <Button onClick={handleSyncToCloud} disabled={isSyncing} className="bg-primary hover:bg-primary/90">
                    <CloudUpload className="ml-2 h-4 w-4" />
                    {isSyncing ? "جاري الحفظ..." : "حفظ في السحابة"}
                </Button>
            ) : (
                <Button variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    تم الحفظ سحابياً
                </Button>
            )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto bg-card p-8 rounded-xl shadow-lg border printable-area">
        <div className="flex justify-around items-center bg-gray-100 p-6 rounded-lg mb-12">
            <div className="text-center">
                <p className="text-lg font-semibold">المؤشر النهائي للصمود</p>
                <p className="text-6xl font-bold text-primary my-2">{totalScore.toFixed(2)}</p>
            </div>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
            <canvas ref={chartRef}></canvas>
        </div>

        <div className="mb-12">
            <VulnerabilityMap />
        </div>

        <div className="mt-12 text-center flex justify-center gap-4 no-print">
          <Button onClick={() => window.print()} variant="outline">
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
