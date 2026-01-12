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

const descriptiveOptions: QuestionOption[] = [
    { text: "غير موجود", score: 1 },
    { text: "موجود وغير موثق", score: 2 },
    { text: "موثق", score: 3 },
    { text: "موثق ومُعمم", score: 4 },
    { text: "مُراجع ومُحسن", score: 5 },
];

export const auditData: Axis[] = [
  {
    id: 'understanding',
    title: 'المحور 1: الفهم',
    icon: Lightbulb,
    questions: [
      { id: 1, text: "وضوح الأهداف الاستراتيجية للإدارة", options: descriptiveOptions },
      { id: 2, text: "تناسق أهداف الإدارة مع رؤية وأهداف العمالة", options: descriptiveOptions },
      { id: 3, text: "تحديد مؤشرات الأداء الرئيسية ومتابعتها", options: descriptiveOptions },
      { id: 4, text: "تحديد المخاطر التشغيلية والاستراتيجية", options: descriptiveOptions },
      { id: 5, text: "فهم دور الموظفين في تحقيق رؤية العمالة", options: descriptiveOptions },
      { id: 6, text: "وضوح الأدوار والمسؤوليات لدى الموظفين", options: descriptiveOptions },
      { id: 7, text: "توصيل التغييرات في السياسات بفعالية", options: descriptiveOptions },
      { id: 8, text: "تحديد الصلاحيات والمسؤوليات بوضوح", options: descriptiveOptions },
      { id: 9, text: "وجود قنوات تواصل فعالة", options: descriptiveOptions },
      { id: 10, text: "الوعي بمتطلبات الامتثال القانوني والتنظيمي", options: descriptiveOptions },
      { id: 11, text: "تحديد الأطراف المعنية وتوقعاتها", options: descriptiveOptions },
      { id: 12, text: "تحديد العمليات الرئيسية وتوثيقها", options: descriptiveOptions },
      { id: 13, text: "تقييم العمليات وتحسينها بانتظام", options: descriptiveOptions },
      { id: 14, text: "تحديد القدرات والموارد اللازمة", options: descriptiveOptions },
      { id: 15, text: "فهم ثقافة وقيم العمالة", options: descriptiveOptions },
      { id: 16, text: "تحديد فرص التحسين والتطوير", options: descriptiveOptions },
      { id: 17, text: "تحديد الشركاء الرئيسيين وإدارة العلاقات معهم", options: descriptiveOptions },
      { id: 18, text: "فهم بيئة العمل الداخلية والخارجية", options: descriptiveOptions },
      { id: 19, text: "تحديد نقاط القوة والضعف", options: descriptiveOptions },
      { id: 20, text: "الوعي بالتحديات المستقبلية المحتملة", options: descriptiveOptions }
    ],
  },
  {
    id: 'governance',
    title: 'المحور 2: الحوكمة',
    icon: Landmark,
    questions: [
      { id: 21, text: "وجود هياكل حوكمة محددة وفعالة", options: descriptiveOptions },
      { id: 22, text: "شفافية عمليات اتخاذ القرار", options: descriptiveOptions },
      { id: 23, text: "وجود آلية واضحة للمساءلة", options: descriptiveOptions },
      { id: 24, text: "مراجعة أداء الهيئة الحاكمة بانتظام", options: descriptiveOptions },
      { id: 25, text: "تطبيق سياسات تضارب المصالح", options: descriptiveOptions },
      { id: 26, text: "وجود إطار لإدارة المخاطر", options: descriptiveOptions },
      { id: 27, text: "وجود وظيفة تدقيق داخلي مستقلة", options: descriptiveOptions },
      { id: 28, text: "وجود لجنة تدقيق فعالة", options: descriptiveOptions },
      { id: 29, text: "الالتزام بالمتطلبات القانونية والتنظيمية", options: descriptiveOptions },
      { id: 30, text: "وجود سياسات وإجراءات مكتوبة ومعتمدة", options: descriptiveOptions },
      { id: 31, text: "وجود نظام لإدارة الشكاوى والبلاغات", options: descriptiveOptions },
      { id: 32, text: "وجود قواعد سلوك وأخلاقيات مهنية", options: descriptiveOptions },
      { id: 33, text: "حماية أصول وممتلكات العمالة", options: descriptiveOptions },
      { id: 34, text: "وجود نظام فعال للرقابة الداخلية", options: descriptiveOptions },
      { id: 35, text: "تقييم أداء الموظفين بشكل دوري", options: descriptiveOptions },
      { id: 36, text: "وجود خطط تعاقب وظيفي للوظائف القيادية", options: descriptiveOptions },
      { id: 37, text: "إدارة أداء الموردين وتقييمهم", options: descriptiveOptions },
      { id: 38, text: "وجود نظام لإدارة التغيير", options: descriptiveOptions },
      { id: 39, text: "ضمان أمن المعلومات وحماية البيانات", options: descriptiveOptions },
      { id: 40, text: "وجود سياسة واضحة لتفويض السلطات", options: descriptiveOptions }
    ],
  },
  {
    id: 'investment',
    title: 'المحور 3: الاستثمار',
    icon: TrendingUp,
    questions: [
      { id: 41, text: "توافق قرارات الاستثمار مع الأهداف الاستراتيجية", options: descriptiveOptions },
      { id: 42, text: "تقييم العائد على الاستثمار للمشاريع الكبرى", options: descriptiveOptions },
      { id: 43, text: "وجود عملية رسمية لتخصيص الموارد المالية", options: descriptiveOptions },
      { id: 44, text: "الاستثمار الكافي في تطوير مهارات الموظفين", options: descriptiveOptions },
      { id: 45, text: "استكشاف فرص استثمارية جديدة بانتظام", options: descriptiveOptions },
      { id: 46, text: "وجود دراسات جدوى للمشاريع الاستثمارية", options: descriptiveOptions },
      { id: 47, text: "إدارة المخاطر المرتبطة بالاستثمارات", options: descriptiveOptions },
      { id: 48, text: "الاستثمار في التكنولوجيا والابتكار", options: descriptiveOptions },
      { id: 49, text: "وجود معايير واضحة لاختيار المشاريع الاستثمارية", options: descriptiveOptions },
      { id: 50, text: "تقييم أداء الاستثمارات بشكل دوري", options: descriptiveOptions },
      { id: 51, text: "الاستثمار في تحسين البنية التحتية", options: descriptiveOptions },
      { id: 52, text: "تخصيص ميزانية للبحث والتطوير", options: descriptiveOptions },
      { id: 53, text: "الاستثمار في بناء شراكات استراتيجية", options: descriptiveOptions },
      { id: 54, text: "وجود خطة استثمارية طويلة الأجل", options: descriptiveOptions },
      { id: 55, text: "تنويع محفظة الاستثمارات لتقليل المخاطر", options: descriptiveOptions },
      { id: 56, text: "الاستثمار في مبادرات الاستدامة والمسؤولية الاجتماعية", options: descriptiveOptions },
      { id: 57, text: "تقييم الأثر الاقتصادي والاجتماعي للاستثمارات", options: descriptiveOptions },
      { id: 58, text: "وجود فريق متخصص لإدارة الاستثمارات", options: descriptiveOptions },
      { id: 59, text: "الاستفادة من الحوافز والإعفاءات الاستثمارية المتاحة", options: descriptiveOptions },
      { id: 60, text: "مراجعة وتحديث استراتيجية الاستثمار بانتظام", options: descriptiveOptions }
    ],
  },
  {
    id: 'readiness',
    title: 'المحور 4: الاستعداد',
    icon: ClipboardCheck,
    questions: [
      { id: 61, text: "الاستعداد للتعامل مع الأزمات والطوارئ", options: descriptiveOptions },
      { id: 62, text: "وجود خطط استمرارية عمل محدثة ومختبرة", options: descriptiveOptions },
      { id: 63, text: "قدرة البنية التحتية التكنولوجية على دعم الاحتياجات المستقبلية", options: descriptiveOptions },
      { id: 64, text: "مرونة الموظفين وقدرتهم على التكيف مع التغيير", options: descriptiveOptions },
      { id: 65, text: "تقييم الاستعداد للمستقبل كجزء من التخطيط الاستراتيجي", options: descriptiveOptions },
      { id: 66, text: "وجود خطط لإدارة الكوارث والتعافي منها", options: descriptiveOptions },
      { id: 67, text: "القدرة على توقع التغيرات في البيئة الخارجية والاستجابة لها", options: descriptiveOptions },
      { id: 68, text: "امتلاك المهارات والكفاءات اللازمة للمستقبل", options: descriptiveOptions },
      { id: 69, text: "الاستعداد لتبني التقنيات الجديدة", options: descriptiveOptions },
      { id: 70, text: "وجود خطط لتطوير القيادات المستقبلية", options: descriptiveOptions },
      { id: 71, text: "القدرة على إدارة النمو والتوسع المستقبلي", options: descriptiveOptions },
      { id: 72, text: "الاستعداد لمواجهة التحديات الأمنية السيبرانية", options: descriptiveOptions },
      { id: 73, text: "وجود ثقافة تشجع على التعلم المستمر والتطوير", options: descriptiveOptions },
      { id: 74, text: "القدرة على جذب واستقطاب المواهب والاحتفاظ بها", options: descriptiveOptions },
      { id: 75, text: "الاستعداد لتلبية توقعات الأطراف المعنية المتغيرة", options: descriptiveOptions },
      { id: 76, text: "القدرة على الابتكار وتطوير خدمات جديدة", options: descriptiveOptions },
      { id: 77, text: "وجود خطط للتوسع في أسواق جديدة", options: descriptiveOptions },
      { id: 78, text: "الاستعداد للتعامل مع التغيرات الديموغرافية والاجتماعية", options: descriptiveOptions },
      { id: 79, text: "مرونة سلسلة التوريد وقدرتها على مواجهة الاضطرابات", options: descriptiveOptions },
      { id: 80, text: "تقييم جاهزية المنافسين وتوقع تحركاتهم", options: descriptiveOptions }
    ],
  },
];

export const governorates: string[] = [
  'عمالة مقاطعات عين السبع - الحي المحمدي',
  'عمالة مقاطعات سيدي البرنوصي',
  'عمالة المحمدية',
];
