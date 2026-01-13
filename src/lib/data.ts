import { Lightbulb, Landmark, TrendingUp, ClipboardCheck } from 'lucide-react';
import type { ComponentType } from 'react';

export type Option = {
  text: string;
  score: number;
};

export type Question = {
  id: number;
  text: string;
  options: Option[];
};

export type Axis = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  questions: Question[];
};

export type Answer = { [questionId: number]: number };

export const GOVERNORATES = [
  'عمالة سيدي البرنوصي',
  'عمالة المحمدية',
  'عمالة عين السبع - الحي المحمدي',
];

export const AUDIT_DATA: Axis[] = [
  {
    id: 'axis1',
    title: 'المحور الأول: الفهم',
    icon: Lightbulb,
    questions: [
        {
            id: 1,
            text: "هل لدى الجهة خرائط متعددة لمخاطر الكوارث (MHA) محدثة وشاملة لكافة الأخطار؟",
            options: [
                { text: "لا توجد خرائط مخاطر موثقة أو أنها تركز على خطر واحد قديم.", score: 1 },
                { text: "توجد خرائط أولية أو جزئية (كالفيضانات)، لكنها غير متكاملة وتُحدث نادرًا.", score: 2 },
                { text: "وجود أطلس مخاطر وطني يغطي الأخطار الكبرى (زلازل، فيضانات)، ويُحدث دورياً.", score: 3 },
                { text: "تتوفر خرائط مخاطر شاملة لمعظم أنواع الأخطار وللمناطق الحيوية، مع تحديث دوري.", score: 4 },
                { text: "وجود منصة معلومات جغرافية (GIS) وطنية مركزية تدمج تحليلات المخاطر في الوقت الحقيقي.", score: 5 }
            ]
        },
        {
            id: 2,
            text: "إلى أي مدى يتم قياس وتحليل الضعف والتعرض (Vulnerability & Exposure) للسكان والأصول الحيوية بشكل كمي؟",
            options: [
                { text: "التقييمات تقتصر على تحديد الأخطار نفسها دون تحليل دقيق للسكان أو الأصول.", score: 1 },
                { text: "توجد بيانات أولية للتعرض، لكنها غير مصنفة حسب النوع أو الحالة الاقتصادية.", score: 2 },
                { text: "يتم قياس الضعف والتعرض لبعض القطاعات الرئيسية، وتستخدم قواعد بيانات محدودة.", score: 3 },
                { text: "بيانات التعرض والضعف شبه كاملة، وتُجرى تقييمات منهجية للمشاريع الجديدة.", score: 4 },
                { text: "تنفيذ تقييمات مخاطر كمية (QRA) على مستوى البنية التحتية الحيوية، وتصنيف البيانات بالكامل.", score: 5 }
            ]
        },
        // ... Add all other questions for Axis 1
    ]
  },
  {
    id: 'axis2',
    title: 'المحور الثاني: الحوكمة',
    icon: Landmark,
    questions: [
      // Questions for Axis 2
    ]
  },
    {
    id: 'axis3',
    title: 'المحور الثالث: الاستثمار',
    icon: TrendingUp,
    questions: [
      // Questions for Axis 3
    ]
  },
  {
    id: 'axis4',
    title: 'المحور الرابع: الاستعداد',
    icon: ClipboardCheck,
    questions: [
      // Questions for Axis 4
    ]
  },
];


export const TOTAL_QUESTIONS = AUDIT_DATA.reduce((total, axis) => total + axis.questions.length, 0);

export type AxisScore = {
  axis: string;
  score: number;
  maxScore: number;
};
