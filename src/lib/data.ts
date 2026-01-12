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

const optionsL1_L5: QuestionOption[] = [
    { text: "L1", score: 1 },
    { text: "L2", score: 2 },
    { text: "L3", score: 3 },
    { text: "L4", score: 4 },
    { text: "L5", score: 5 },
];

export const auditData: Axis[] = [
  {
    id: 'understanding',
    title: 'المحور 1: الفهم',
    icon: Lightbulb,
    questions: [
      { id: 1, text: "وضوح الأهداف الاستراتيجية للإدارة", options: optionsL1_L5 },
      { id: 2, text: "تناسق أهداف الإدارة مع رؤية وأهداف العمالة", options: optionsL1_L5 },
      { id: 3, text: "تحديد مؤشرات الأداء الرئيسية ومتابعتها", options: optionsL1_L5 },
      { id: 4, text: "تحديد المخاطر التشغيلية والاستراتيجية", options: optionsL1_L5 },
      { id: 5, text: "فهم دور الموظفين في تحقيق رؤية العمالة", options: optionsL1_L5 },
      { id: 6, text: "وضوح الأدوار والمسؤوليات لدى الموظفين", options: optionsL1_L5 },
      { id: 7, text: "توصيل التغييرات في السياسات بفعالية", options: optionsL1_L5 },
      { id: 8, text: "تحديد الصلاحيات والمسؤوليات بوضوح", options: optionsL1_L5 },
      { id: 9, text: "وجود قنوات تواصل فعالة", options: optionsL1_L5 },
      { id: 10, text: "الوعي بمتطلبات الامتثال القانوني والتنظيمي", options: optionsL1_L5 },
      { id: 11, text: "تحديد الأطراف المعنية وتوقعاتها", options: optionsL1_L5 },
      { id: 12, text: "تحديد العمليات الرئيسية وتوثيقها", options: optionsL1_L5 },
      { id: 13, text: "تقييم العمليات وتحسينها بانتظام", options: optionsL1_L5 },
      { id: 14, text: "تحديد القدرات والموارد اللازمة", options: optionsL1_L5 },
      { id: 15, text: "فهم ثقافة وقيم العمالة", options: optionsL1_L5 },
      { id: 16, text: "تحديد فرص التحسين والتطوير", options: optionsL1_L5 },
      { id: 17, text: "تحديد الشركاء الرئيسيين وإدارة العلاقات معهم", options: optionsL1_L5 },
      { id: 18, text: "فهم بيئة العمل الداخلية والخارجية", options: optionsL1_L5 },
      { id: 19, text: "تحديد نقاط القوة والضعف", options: optionsL1_L5 },
      { id: 20, text: "الوعي بالتحديات المستقبلية المحتملة", options: optionsL1_L5 }
    ],
  },
  {
    id: 'governance',
    title: 'المحور 2: الحوكمة',
    icon: Landmark,
    questions: [
      { id: 21, text: "وجود هياكل حوكمة محددة وفعالة", options: optionsL1_L5 },
      { id: 22, text: "شفافية عمليات اتخاذ القرار", options: optionsL1_L5 },
      { id: 23, text: "وجود آلية واضحة للمساءلة", options: optionsL1_L5 },
      { id: 24, text: "مراجعة أداء الهيئة الحاكمة بانتظام", options: optionsL1_L5 },
      { id: 25, text: "تطبيق سياسات تضارب المصالح", options: optionsL1_L5 },
      { id: 26, text: "وجود إطار لإدارة المخاطر", options: optionsL1_L5 },
      { id: 27, text: "وجود وظيفة تدقيق داخلي مستقلة", options: optionsL1_L5 },
      { id: 28, text: "وجود لجنة تدقيق فعالة", options: optionsL1_L5 },
      { id: 29, text: "الالتزام بالمتطلبات القانونية والتنظيمية", options: optionsL1_L5 },
      { id: 30, text: "وجود سياسات وإجراءات مكتوبة ومعتمدة", options: optionsL1_L5 },
      { id: 31, text: "وجود نظام لإدارة الشكاوى والبلاغات", options: optionsL1_L5 },
      { id: 32, text: "وجود قواعد سلوك وأخلاقيات مهنية", options: optionsL1_L5 },
      { id: 33, text: "حماية أصول وممتلكات العمالة", options: optionsL1_L5 },
      { id: 34, text: "وجود نظام فعال للرقابة الداخلية", options: optionsL1_L5 },
      { id: 35, text: "تقييم أداء الموظفين بشكل دوري", options: optionsL1_L5 },
      { id: 36, text: "وجود خطط تعاقب وظيفي للوظائف القيادية", options: optionsL1_L5 },
      { id: 37, text: "إدارة أداء الموردين وتقييمهم", options: optionsL1_L5 },
      { id: 38, text: "وجود نظام لإدارة التغيير", options: optionsL1_L5 },
      { id: 39, text: "ضمان أمن المعلومات وحماية البيانات", options: optionsL1_L5 },
      { id: 40, text: "وجود سياسة واضحة لتفويض السلطات", options: optionsL1_L5 }
    ],
  },
  {
    id: 'investment',
    title: 'المحور 3: الاستثمار',
    icon: TrendingUp,
    questions: [
      { id: 41, text: "توافق قرارات الاستثمار مع الأهداف الاستراتيجية", options: optionsL1_L5 },
      { id: 42, text: "تقييم العائد على الاستثمار للمشاريع الكبرى", options: optionsL1_L5 },
      { id: 43, text: "وجود عملية رسمية لتخصيص الموارد المالية", options: optionsL1_L5 },
      { id: 44, text: "الاستثمار الكافي في تطوير مهارات الموظفين", options: optionsL1_L5 },
      { id: 45, text: "استكشاف فرص استثمارية جديدة بانتظام", options: optionsL1_L5 },
      { id: 46, text: "وجود دراسات جدوى للمشاريع الاستثمارية", options: optionsL1_L5 },
      { id: 47, text: "إدارة المخاطر المرتبطة بالاستثمارات", options: optionsL1_L5 },
      { id: 48, text: "الاستثمار في التكنولوجيا والابتكار", options: optionsL1_L5 },
      { id: 49, text: "وجود معايير واضحة لاختيار المشاريع الاستثمارية", options: optionsL1_L5 },
      { id: 50, text: "تقييم أداء الاستثمارات بشكل دوري", options: optionsL1_L5 },
      { id: 51, text: "الاستثمار في تحسين البنية التحتية", options: optionsL1_L5 },
      { id: 52, text: "تخصيص ميزانية للبحث والتطوير", options: optionsL1_L5 },
      { id: 53, text: "الاستثمار في بناء شراكات استراتيجية", options: optionsL1_L5 },
      { id: 54, text: "وجود خطة استثمارية طويلة الأجل", options: optionsL1_L5 },
      { id: 55, text: "تنويع محفظة الاستثمارات لتقليل المخاطر", options: optionsL1_L5 },
      { id: 56, text: "الاستثمار في مبادرات الاستدامة والمسؤولية الاجتماعية", options: optionsL1_L5 },
      { id: 57, text: "تقييم الأثر الاقتصادي والاجتماعي للاستثمارات", options: optionsL1_L5 },
      { id: 58, text: "وجود فريق متخصص لإدارة الاستثمارات", options: optionsL1_L5 },
      { id: 59, text: "الاستفادة من الحوافز والإعفاءات الاستثمارية المتاحة", options: optionsL1_L5 },
      { id: 60, text: "مراجعة وتحديث استراتيجية الاستثمار بانتظام", options: optionsL1_L5 }
    ],
  },
  {
    id: 'readiness',
    title: 'المحور 4: الاستعداد',
    icon: ClipboardCheck,
    questions: [
      { id: 61, text: "الاستعداد للتعامل مع الأزمات والطوارئ", options: optionsL1_L5 },
      { id: 62, text: "وجود خطط استمرارية عمل محدثة ومختبرة", options: optionsL1_L5 },
      { id: 63, text: "قدرة البنية التحتية التكنولوجية على دعم الاحتياجات المستقبلية", options: optionsL1_L5 },
      { id: 64, text: "مرونة الموظفين وقدرتهم على التكيف مع التغيير", options: optionsL1_L5 },
      { id: 65, text: "تقييم الاستعداد للمستقبل كجزء من التخطيط الاستراتيجي", options: optionsL1_L5 },
      { id: 66, text: "وجود خطط لإدارة الكوارث والتعافي منها", options: optionsL1_L5 },
      { id: 67, text: "القدرة على توقع التغيرات في البيئة الخارجية والاستجابة لها", options: optionsL1_L5 },
      { id: 68, text: "امتلاك المهارات والكفاءات اللازمة للمستقبل", options: optionsL1_L5 },
      { id: 69, text: "الاستعداد لتبني التقنيات الجديدة", options: optionsL1_L5 },
      { id: 70, text: "وجود خطط لتطوير القيادات المستقبلية", options: optionsL1_L5 },
      { id: 71, text: "القدرة على إدارة النمو والتوسع المستقبلي", options: optionsL1_L5 },
      { id: 72, text: "الاستعداد لمواجهة التحديات الأمنية السيبرانية", options: optionsL1_L5 },
      { id: 73, text: "وجود ثقافة تشجع على التعلم المستمر والتطوير", options: optionsL1_L5 },
      { id: 74, text: "القدرة على جذب واستقطاب المواهب والاحتفاظ بها", options: optionsL1_L5 },
      { id: 75, text: "الاستعداد لتلبية توقعات الأطراف المعنية المتغيرة", options: optionsL1_L5 },
      { id: 76, text: "القدرة على الابتكار وتطوير خدمات جديدة", options: optionsL1_L5 },
      { id: 77, text: "وجود خطط للتوسع في أسواق جديدة", options: optionsL1_L5 },
      { id: 78, text: "الاستعداد للتعامل مع التغيرات الديموغرافية والاجتماعية", options: optionsL1_L5 },
      { id: 79, text: "مرونة سلسلة التوريد وقدرتها على مواجهة الاضطرابات", options: optionsL1_L5 },
      { id: 80, text: "تقييم جاهزية المنافسين وتوقع تحركاتهم", options: optionsL1_L5 }
    ],
  },
];

export const governorates: string[] = [
  'عمالة مقاطعات عين السبع - الحي المحمدي',
  'عمالة مقاطعات سيدي البرنوصي',
  'عمالة المحمدية',
];
