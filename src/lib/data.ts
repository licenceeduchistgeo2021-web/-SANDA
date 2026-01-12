import { Lightbulb, Landmark, TrendingUp, ClipboardCheck } from 'lucide-react';
import type { ComponentType } from 'react';

export type QuestionOption = {
  text: string;
  score: number;
};

export type Question = {
  id: number;
  text: string;
  options: QuestionOption[];
};

export type Axis = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  questions: Question[];
};

export type Answer = { [questionId: number]: number };

export type AxisScore = {
  axis: string;
  score: number;
  maxScore: number;
};

const options: QuestionOption[] = [
  { text: "غير موافق بشدة", score: 1 },
  { text: "غير موافق", score: 2 },
  { text: "محايد", score: 3 },
  { text: "موافق", score: 4 },
  { text: "موافق بشدة", score: 5 },
];

// For demonstration, we'll create 5 questions per axis. The full app would have 20 per axis (80 total).
export const auditData: Axis[] = [
  {
    id: 'understanding',
    title: 'المحور 1: الفهم',
    icon: Lightbulb,
    questions: [
      { id: 1, text: 'هل يتم فهم الأهداف الاستراتيجية بوضوح عبر الإدارة؟', options },
      { id: 2, text: 'هل هناك فهم مشترك للمخاطر الرئيسية التي تواجه العمالة؟', options },
      { id: 3, text: 'هل يعرف الموظفون دورهم في تحقيق رؤية العمالة؟', options },
      { id: 4, text: 'هل يتم توصيل التغييرات في السياسات بشكل فعال لجميع الأقسام؟', options },
      { id: 5, text: 'هل يوجد وعي كافٍ بمتطلبات الامتثال القانوني والتنظيمي؟', options },
    ],
  },
  {
    id: 'governance',
    title: 'المحور 2: الحوكمة',
    icon: Landmark,
    questions: [
      { id: 21, text: 'هل هياكل الحوكمة محددة جيدًا وتعمل بفعالية؟', options },
      { id: 22, text: 'هل هناك شفافية في عمليات اتخاذ القرار؟', options },
      { id: 23, text: 'هل توجد آلية واضحة للمساءلة على جميع المستويات؟', options },
      { id: 24, text: 'هل يتم مراجعة أداء مجلس الإدارة أو الهيئة الحاكمة بانتظام؟', options },
      { id: 25, text: 'هل سياسات تضارب المصالح مطبقة ويتم الالتزام بها؟', options },
    ],
  },
  {
    id: 'investment',
    title: 'المحور 3: الاستثمار',
    icon: TrendingUp,
    questions: [
      { id: 41, text: 'هل تتماشى قرارات الاستثمار مع الأهداف الاستراتيجية؟', options },
      { id: 42, text: 'هل يتم تقييم عائد الاستثمار للمشاريع الكبرى بشكل منهجي؟', options },
      { id: 43, text: 'هل هناك عملية رسمية لتخصيص الموارد المالية للمبادرات الجديدة؟', options },
      { id: 44, text: 'هل يتم الاستثمار بشكل كافٍ في تطوير مهارات الموظفين؟', options },
      { id: 45, text: 'هل يتم استكشاف فرص استثمارية جديدة بانتظام لتعزيز النمو؟', options },
    ],
  },
  {
    id: 'readiness',
    title: 'المحور 4: الاستعداد',
    icon: ClipboardCheck,
    questions: [
      { id: 61, text: 'هل العمالة مستعدة للتعامل مع الأزمات والطوارئ؟', options },
      { id: 62, text: 'هل هناك خطط استمرارية عمل محدثة ومختبرة؟', options },
      { id: 63, text: 'هل البنية التحتية التكنولوجية قادرة على دعم الاحتياجات المستقبلية؟', options },
      { id: 64, text: 'هل يتمتع الموظفون بالمرونة والقدرة على التكيف مع التغيير؟', options },
      { id: 65, text: 'هل يتم تقييم الاستعداد للمستقبل كجزء من التخطيط الاستراتيجي؟', options },
    ],
  },
];

export const governorates: string[] = [
  'عمالة مقاطعات عين السبع - الحي المحمدي',
  'عمالة مقاطعات سيدي البرنوصي',
  'عمالة المحمدية',
];
