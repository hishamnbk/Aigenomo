import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LanguageCode = "en" | "ar";
type Direction = "ltr" | "rtl";
type SectionId = "case" | "genomic" | "clinical" | "analysis" | "similar" | "chat" | "report";
type MessageRole = "system" | "user" | "assistant";

interface LanguageStrings {
  dir: Direction;
  appName: string;
  appSub: string;
  caseLabel: string;
  searchPlaceholder: string;
  searchButton: string;
  uploadButton: string;
  emptyGateTitle: string;
  emptyGateBody: string;
  noGenomicTitle: string;
  noGenomicBody: string;
  caseDetails: string;
  caseEditable: string;
  caseId: string;
  patientAge: string;
  patientSex: string;
  referringDept: string;
  dateOfAnalysis: string;
  laboratory: string;
  clinicianName: string;
  genomicFindings: string;
  chromosome: string;
  location: string;
  cnvType: string;
  cnvSize: string;
  genes: string;
  acmg: string;
  clinicalInfo: string;
  analysis: string;
  similarCases: string;
  assistant: string;
  report: string;
  activeCase: string;
  uploadHint: string;
  analysisReady: string;
  analysisPending: string;
  searchSuccess: string;
  uploadSuccess: string;
  reportOnly: string;
  assistantPlaceholder: string;
  send: string;
  summaryTitle: string;
  reportTitle: string;
  reportSubtitle: string;
  export: string;
  noData: string;
  searchOrUpload: string;
  analysisNotes: string;
  navWorkspace: string;
}

interface NavItem {
  id: SectionId;
  short: string;
  full: string;
  sym: string;
  locked: boolean;
}

interface CaseInfo {
  caseId: string;
  patientAge: string;
  patientSex: string;
  referringDept: string;
  dateOfAnalysis: string;
  laboratoryName: string;
  clinicianName: string;
}

interface GenomicData {
  chromosome: string;
  location: string;
  cnvType: string;
  cnvSize: string;
  genes: string;
  acmg: string;
  startPos: string;
  endPos: string;
}

interface ClinicalData {
  summary: string;
  symptoms: string;
  notes: string;
}

interface SimilarCase {
  id: string;
  title: string;
  similarity: number;
  summary: string;
}

interface ChatMessage {
  role: MessageRole;
  text: string;
}

interface ExtractedReportData {
  caseInfo: CaseInfo;
  genomic: GenomicData;
  clinical: ClinicalData;
}

interface Theme {
  bg: string;
  panel: string;
  card: string;
  surface: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  green: string;
  red: string;
  amber: string;
  purple: string;
  teal: string;
}

interface PillStyle {
  bg: string;
  text: string;
  border: string;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface HeaderBarProps {
  activeItem: NavItem | undefined;
  caseInfo: CaseInfo;
  genomic: GenomicData;
  hasAnalysisData: boolean;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  searchCaseId: string;
  onSearchCaseIdChange: (value: string) => void;
  onSearch: () => void;
  strings: LanguageStrings;
  theme: Theme;
}

interface SidebarProps {
  activeSection: SectionId;
  items: NavItem[];
  caseInfo: CaseInfo;
  genomic: GenomicData;
  hasAnalysisData: boolean;
  onSelect: (section: SectionId) => void;
  strings: LanguageStrings;
  theme: Theme;
}

interface CaseSectionProps {
  caseInfo: CaseInfo;
  setCaseInfo: Dispatch<SetStateAction<CaseInfo>>;
  strings: LanguageStrings;
  theme: Theme;
  onUploadFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface GenomicSectionProps {
  genomic: GenomicData;
  hasAnalysisData: boolean;
  strings: LanguageStrings;
  theme: Theme;
}

interface ClinicalSectionProps {
  clinical: ClinicalData;
  strings: LanguageStrings;
  theme: Theme;
}

interface AnalysisSectionProps {
  genomic: GenomicData;
  strings: LanguageStrings;
  theme: Theme;
}

interface SimilarSectionProps {
  strings: LanguageStrings;
  theme: Theme;
}

interface ChatSectionProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (seedText?: string) => void;
  strings: LanguageStrings;
  theme: Theme;
}

interface ReportSectionProps {
  caseInfo: CaseInfo;
  genomic: GenomicData;
  clinical: ClinicalData;
  strings: LanguageStrings;
  theme: Theme;
}

interface EmptyStateProps {
  title: string;
  body: string;
  theme: Theme;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const THEME: Theme = {
  bg: "#080e1a",
  panel: "#0a1120",
  card: "#0f1623",
  surface: "#141f30",
  border: "#1a2740",
  borderLight: "#24355a",
  text: "#dce6f5",
  textSecondary: "#9fb3cc",
  textMuted: "#6f86a4",
  accent: "#3d80f0",
  accentSoft: "#93c5fd",
  green: "#10b981",
  red: "#f05252",
  amber: "#f59e0b",
  purple: "#a855f7",
  teal: "#14b8a6",
};

const NAV_SYMBOLS: Record<SectionId, string> = {
  case: "◈",
  genomic: "⬡",
  clinical: "◉",
  analysis: "✦",
  similar: "⊞",
  chat: "◎",
  report: "▤",
};

const PILL_STYLES: Record<string, PillStyle> = {
  accent: { bg: "#0c1d40", text: "#93c5fd", border: "#1f3d70" },
  success: { bg: "#08261c", text: "#86efac", border: "#14532d" },
  warning: { bg: "#2a1c08", text: "#fcd34d", border: "#713f12" },
  danger: { bg: "#2e0d12", text: "#fca5a5", border: "#7f1d1d" },
  purple: { bg: "#1d1133", text: "#d8b4fe", border: "#5b21b6" },
  default: { bg: "#141f30", text: "#9fb3cc", border: "#24355a" },
};

const INITIAL_CASE_INFO: CaseInfo = {
  caseId: "",
  patientAge: "",
  patientSex: "",
  referringDept: "Clinical Genetics",
  dateOfAnalysis: "",
  laboratoryName: "ClinGenoAI Lab",
  clinicianName: "",
};

const INITIAL_GENOMIC_DATA: GenomicData = {
  chromosome: "",
  location: "",
  cnvType: "",
  cnvSize: "",
  genes: "",
  acmg: "",
  startPos: "",
  endPos: "",
};

const INITIAL_CLINICAL_DATA: ClinicalData = {
  summary: "",
  symptoms: "",
  notes: "",
};

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  role: "system",
  text: "Upload a report or search for a case to activate the AI context.",
};

const HARD_CODED_REPORT_DATA: ExtractedReportData = {
  caseInfo: {
    caseId: "CG24000521",
    patientAge: "8 years",
    patientSex: "Female",
    referringDept: "Clinical Genetics",
    dateOfAnalysis: "2026-04-17",
    laboratoryName: "ClinGenoAI Core Lab",
    clinicianName: "Dr. Sarah Alqahtani",
  },
  genomic: {
    chromosome: "chr1",
    location: "149103973-149799592",
    cnvType: "Loss",
    cnvSize: "696 kb",
    genes: "NOTCH2NLC, NBPF19, FCGR1A",
    acmg: "Unknown Significance",
    startPos: "149103973",
    endPos: "149799592",
  },
  clinical: {
    summary: "Simulated extraction from .cyhd report completed successfully.",
    symptoms: "Phenotype correlation pending. Core genomic result loaded for analyst review.",
    notes: "This is mock extracted data for UI workflow validation and interactive navigation testing.",
  },
};

const SIMILAR_CASES: SimilarCase[] = [
  {
    id: "SC-001",
    title: "1q21 loss reported cohort",
    similarity: 92,
    summary: "Overlap in interval size and shared NOTCH2NLC / NBPF family involvement.",
  },
  {
    id: "SC-002",
    title: "Developmental CNV literature case",
    similarity: 84,
    summary: "Partial phenotypic overlap with uncertain-significance copy number loss.",
  },
  {
    id: "SC-003",
    title: "Public CNV reference entry",
    similarity: 71,
    summary: "Regionally similar locus with variable expressivity and uncertain inheritance.",
  },
];

const ANALYSIS_SCORE_DATA: ChartPoint[] = [
  { label: "Genomic", value: 88 },
  { label: "Region", value: 82 },
  { label: "Genes", value: 79 },
  { label: "ACMG", value: 67 },
];

const ANALYSIS_SUPPORT_DATA: ChartPoint[] = [
  { label: "NOTCH2NLC", value: 92 },
  { label: "NBPF19", value: 74 },
  { label: "FCGR1A", value: 61 },
];

const CHAT_STARTERS: string[] = [
  "Summarize the CNV finding.",
  "What genes are involved?",
  "What does Unknown Significance imply?",
];

const STRINGS: Record<LanguageCode, LanguageStrings> = {
  en: {
    dir: "ltr",
    appName: "ClinGenoAI",
    appSub: "Clinical Genomics Platform",
    caseLabel: "Case",
    searchPlaceholder: "Search Case ID",
    searchButton: "Search",
    uploadButton: "Upload Report (.cyhd)",
    emptyGateTitle: "Data unavailable",
    emptyGateBody: "البيانات غير متوفرة، يرجى البحث عن حالة أو رفع ملف أولاً",
    noGenomicTitle: "No genomic data yet",
    noGenomicBody: "Search for a case or upload a .cyhd report to load the extracted variant details.",
    caseDetails: "Case & Patient Details",
    caseEditable: "Editable registration fields with simulated report ingestion",
    caseId: "Case ID",
    patientAge: "Patient Age",
    patientSex: "Patient Sex",
    referringDept: "Referring Department",
    dateOfAnalysis: "Date of Analysis",
    laboratory: "Laboratory",
    clinicianName: "Clinician Name",
    genomicFindings: "Genomic Findings",
    chromosome: "Chromosome",
    location: "Location",
    cnvType: "CNV Type",
    cnvSize: "Size",
    genes: "Genes",
    acmg: "ACMG",
    clinicalInfo: "Clinical Information",
    analysis: "Data Analysis",
    similarCases: "Similar Cases",
    assistant: "AI Assistant",
    report: "Report",
    activeCase: "Active Case",
    uploadHint: "Loading a report simulates genomic extraction and unlocks downstream sections.",
    analysisReady: "Analysis data available",
    analysisPending: "Waiting for report data",
    searchSuccess: "Case data loaded from simulated report extraction.",
    uploadSuccess: "Report uploaded and parsed successfully (simulated).",
    reportOnly: "Research support only. Clinical validation is still required.",
    assistantPlaceholder: "Ask about the extracted genomic finding...",
    send: "Send",
    summaryTitle: "Summary",
    reportTitle: "Clinical Genomics Report",
    reportSubtitle: "Auto-generated from simulated .cyhd extraction",
    export: "Export / Print",
    noData: "No data",
    searchOrUpload: "Search or upload first",
    analysisNotes:
      "Hardcoded report data: CG24000521 · chr1 · 149103973-149799592 · 696 kb · Loss · NOTCH2NLC, NBPF19, FCGR1A · Unknown Significance",
    navWorkspace: "Workspace",
  },
  ar: {
    dir: "rtl",
    appName: "ClinGenoAI",
    appSub: "منصة الجينومات السريرية",
    caseLabel: "الحالة",
    searchPlaceholder: "ابحث برقم الحالة",
    searchButton: "بحث",
    uploadButton: "رفع ملف التقرير (.cyhd)",
    emptyGateTitle: "البيانات غير متوفرة",
    emptyGateBody: "البيانات غير متوفرة، يرجى البحث عن حالة أو رفع ملف أولاً",
    noGenomicTitle: "لا توجد بيانات جينومية بعد",
    noGenomicBody: "ابحث عن حالة أو ارفع ملف .cyhd لتحميل تفاصيل المتغير الجيني المستخرجة.",
    caseDetails: "تفاصيل الحالة والمريض",
    caseEditable: "حقول قابلة للتعديل مع محاكاة رفع التقرير واستخراج البيانات",
    caseId: "رقم الحالة",
    patientAge: "عمر المريض",
    patientSex: "جنس المريض",
    referringDept: "الجهة المحيلة",
    dateOfAnalysis: "تاريخ التحليل",
    laboratory: "المختبر",
    clinicianName: "اسم الطبيب",
    genomicFindings: "النتائج الجينومية",
    chromosome: "الكروموسوم",
    location: "الموضع",
    cnvType: "نوع التغير",
    cnvSize: "الحجم",
    genes: "الجينات",
    acmg: "تصنيف ACMG",
    clinicalInfo: "المعلومات السريرية",
    analysis: "تحليل البيانات",
    similarCases: "الحالات المشابهة",
    assistant: "المساعد الذكي",
    report: "التقرير",
    activeCase: "الحالة النشطة",
    uploadHint: "رفع التقرير يحاكي استخراج البيانات الجينومية ويفتح الأقسام اللاحقة.",
    analysisReady: "بيانات التحليل متوفرة",
    analysisPending: "بانتظار بيانات التقرير",
    searchSuccess: "تم تحميل بيانات الحالة من خلال محاكاة استخراج التقرير.",
    uploadSuccess: "تم رفع التقرير وتحليل بياناته بنجاح بشكل تجريبي.",
    reportOnly: "للدعم البحثي فقط، وما زال التحقق السريري مطلوبًا.",
    assistantPlaceholder: "اسأل عن النتيجة الجينومية المستخرجة...",
    send: "إرسال",
    summaryTitle: "الملخص",
    reportTitle: "تقرير الجينومات السريرية",
    reportSubtitle: "تم توليده تلقائيًا من محاكاة استخراج ملف .cyhd",
    export: "تصدير / طباعة",
    noData: "لا توجد بيانات",
    searchOrUpload: "ابحث أو ارفع ملفًا أولاً",
    analysisNotes:
      "بيانات التقرير الثابتة: CG24000521 · chr1 · 149103973-149799592 · 696 kb · Loss · NOTCH2NLC, NBPF19, FCGR1A · Unknown Significance",
    navWorkspace: "مساحة العمل",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

/** Return a merged object representing the simulated extracted report data. */
function buildExtractedReportData(caseId?: string): ExtractedReportData {
  const nextCaseId = caseId?.trim() || HARD_CODED_REPORT_DATA.caseInfo.caseId;

  return {
    caseInfo: {
      ...HARD_CODED_REPORT_DATA.caseInfo,
      caseId: nextCaseId,
    },
    genomic: { ...HARD_CODED_REPORT_DATA.genomic },
    clinical: { ...HARD_CODED_REPORT_DATA.clinical },
  };
}

/** Build ordered sidebar items while keeping all items unlocked. */
function buildNavItems(strings: LanguageStrings): NavItem[] {
  return [
    { id: "case", short: strings.caseLabel, full: strings.caseDetails, sym: NAV_SYMBOLS.case, locked: false },
    { id: "genomic", short: strings.genomicFindings, full: strings.genomicFindings, sym: NAV_SYMBOLS.genomic, locked: false },
    { id: "clinical", short: strings.clinicalInfo, full: strings.clinicalInfo, sym: NAV_SYMBOLS.clinical, locked: false },
    { id: "analysis", short: strings.analysis, full: strings.analysis, sym: NAV_SYMBOLS.analysis, locked: false },
    { id: "similar", short: strings.similarCases, full: strings.similarCases, sym: NAV_SYMBOLS.similar, locked: false },
    { id: "chat", short: strings.assistant, full: strings.assistant, sym: NAV_SYMBOLS.chat, locked: false },
    { id: "report", short: strings.report, full: strings.report, sym: NAV_SYMBOLS.report, locked: false },
  ];
}

/** Decide whether a section is accessible before analysis data exists. */
function canOpenSection(section: SectionId, hasAnalysisData: boolean): boolean {
  if (hasAnalysisData) {
    return true;
  }

  return section === "case" || section === "genomic";
}

/** Convert assistant markdown-like lines into simple UI blocks. */
function renderMessageLine(line: string, index: number, theme: Theme): ReactNode {
  const trimmed = line.trim();

  if (!trimmed) {
    return <div key={index} style={{ height: 6 }} />;
  }

  if (trimmed.startsWith("•")) {
    return (
      <div key={index} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <span style={{ color: theme.accentSoft }}>•</span>
        <span style={{ color: theme.textSecondary, lineHeight: 1.6 }}>{trimmed.slice(1).trim()}</span>
      </div>
    );
  }

  return (
    <p key={index} style={{ margin: 0, color: theme.textSecondary, lineHeight: 1.7, fontSize: 12 }}>
      {trimmed}
    </p>
  );
}

/** Build a lightweight assistant answer from the currently extracted genomic data. */
function buildAssistantReply(genomic: GenomicData, query: string): string {
  const lc = query.toLowerCase();

  if (lc.includes("gene") || lc.includes("جين")) {
    return `Genes involved:\n• ${genomic.genes}\n\nThese are the genes currently loaded from the simulated .cyhd report.`;
  }

  if (lc.includes("significance") || lc.includes("acmg") || lc.includes("دلالة") || lc.includes("تصنيف")) {
    return `ACMG classification:\n• ${genomic.acmg}\n\nThis means the current CNV should be interpreted cautiously and correlated with phenotype and additional evidence.`;
  }

  return `Extracted CNV summary:\n• Chromosome: ${genomic.chromosome}\n• Location: ${genomic.location}\n• Size: ${genomic.cnvSize}\n• Type: ${genomic.cnvType}\n• Genes: ${genomic.genes}\n• ACMG: ${genomic.acmg}`;
}

/** Build printable report sections from the current loaded data. */
function buildReportSections(
  caseInfo: CaseInfo,
  genomic: GenomicData,
  clinical: ClinicalData,
  strings: LanguageStrings,
): Array<{ title: string; body: string }> {
  return [
    {
      title: strings.caseDetails,
      body: `${strings.caseId}: ${caseInfo.caseId}\n${strings.patientAge}: ${caseInfo.patientAge || strings.noData}\n${strings.patientSex}: ${caseInfo.patientSex || strings.noData}\n${strings.referringDept}: ${caseInfo.referringDept || strings.noData}\n${strings.dateOfAnalysis}: ${caseInfo.dateOfAnalysis || strings.noData}\n${strings.laboratory}: ${caseInfo.laboratoryName || strings.noData}\n${strings.clinicianName}: ${caseInfo.clinicianName || strings.noData}`,
    },
    {
      title: strings.genomicFindings,
      body: `${strings.chromosome}: ${genomic.chromosome}\n${strings.location}: ${genomic.location}\n${strings.cnvType}: ${genomic.cnvType}\n${strings.cnvSize}: ${genomic.cnvSize}\n${strings.genes}: ${genomic.genes}\n${strings.acmg}: ${genomic.acmg}`,
    },
    {
      title: strings.clinicalInfo,
      body: `${strings.summaryTitle}: ${clinical.summary}\n\n${clinical.symptoms}\n\n${clinical.notes}`,
    },
  ];
}

/** Return a generic inline style for card containers. */
function getCardStyle(theme: Theme, extra?: CSSProperties): CSSProperties {
  return {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    ...extra,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI micro-components
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={style}>{children}</div>;
}

function CardHeader({ title, sub, theme }: { title: string; sub?: string; theme: Theme }) {
  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${theme.border}` }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.text }}>{title}</p>
      {sub ? <p style={{ margin: "4px 0 0", fontSize: 11, color: theme.textMuted }}>{sub}</p> : null}
    </div>
  );
}

function Pill({ label, variant = "default" }: { label: string; variant?: keyof typeof PILL_STYLES }) {
  const style = PILL_STYLES[variant] ?? PILL_STYLES.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 999,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function Field({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, color: theme.textMuted }}>{label}</p>
      <p style={{ margin: 0, fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{value || "—"}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  theme,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", marginBottom: 4, fontSize: 10, color: theme.textMuted }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "9px 11px",
          borderRadius: 8,
          border: `1px solid ${theme.borderLight}`,
          background: theme.surface,
          color: theme.text,
          outline: "none",
          fontSize: 12,
        }}
      />
    </label>
  );
}

function EmptyState({ title, body, theme }: EmptyStateProps) {
  return (
    <Card style={getCardStyle(theme, { padding: 20 })}>
      <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: theme.text }}>{title}</p>
      <p style={{ margin: 0, fontSize: 12, color: theme.textSecondary, lineHeight: 1.8 }}>{body}</p>
    </Card>
  );
}

function MiniBarChart({ data, theme }: { data: ChartPoint[]; theme: Theme }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 110 }}>
      {data.map((item) => (
        <div key={item.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: "100%",
              height: `${(item.value / maxValue) * 72}px`,
              minHeight: 10,
              borderRadius: "8px 8px 2px 2px",
              background: `linear-gradient(180deg, ${theme.accent}, ${theme.purple})`,
            }}
          />
          <span style={{ fontSize: 10, color: theme.textMuted }}>{item.label}</span>
          <span style={{ fontSize: 10, color: theme.text }}>{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section components
// ─────────────────────────────────────────────────────────────────────────────

function HeaderBar({
  activeItem,
  caseInfo,
  genomic,
  hasAnalysisData,
  language,
  onLanguageChange,
  searchCaseId,
  onSearchCaseIdChange,
  onSearch,
  strings,
  theme,
}: HeaderBarProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px",
        background: theme.card,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.text }}>{activeItem?.full ?? strings.caseDetails}</p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: theme.textMuted }}>
          {hasAnalysisData ? `${caseInfo.caseId} · ${genomic.chromosome} · ${genomic.cnvSize}` : strings.searchOrUpload}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <input
          value={searchCaseId}
          onChange={(event) => onSearchCaseIdChange(event.target.value)}
          placeholder={strings.searchPlaceholder}
          style={{
            width: 190,
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.borderLight}`,
            background: theme.surface,
            color: theme.text,
            outline: "none",
            fontSize: 12,
          }}
        />
        <button
          onClick={onSearch}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "none",
            background: theme.accent,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {strings.searchButton}
        </button>
        <div style={{ display: "flex", border: `1px solid ${theme.borderLight}`, borderRadius: 8, overflow: "hidden" }}>
          {(["en", "ar"] as LanguageCode[]).map((item) => (
            <button
              key={item}
              onClick={() => onLanguageChange(item)}
              style={{
                padding: "8px 10px",
                border: "none",
                cursor: "pointer",
                background: language === item ? theme.accent : theme.surface,
                color: language === item ? "#fff" : theme.textSecondary,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {item === "en" ? "EN" : "ع"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  activeSection,
  items,
  caseInfo,
  genomic,
  hasAnalysisData,
  onSelect,
  strings,
  theme,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: 228,
        background: theme.panel,
        borderRight: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 16, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            ⬡
          </div>
          <div>
            <p style={{ margin: 0, color: theme.text, fontWeight: 700, fontSize: 12 }}>{strings.appName}</p>
            <p style={{ margin: "3px 0 0", color: theme.textMuted, fontSize: 10 }}>{strings.appSub}</p>
          </div>
        </div>

        <Card style={getCardStyle(theme, { padding: 12, background: "#060d1a" })}>
          <p style={{ margin: "0 0 6px", color: theme.textMuted, fontSize: 10 }}>{strings.activeCase}</p>
          <p style={{ margin: "0 0 6px", color: theme.accentSoft, fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
            {caseInfo.caseId || strings.searchOrUpload}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Pill label={hasAnalysisData ? strings.analysisReady : strings.analysisPending} variant={hasAnalysisData ? "success" : "warning"} />
            {genomic.cnvType ? <Pill label={genomic.cnvType} variant="danger" /> : null}
          </div>
        </Card>
      </div>

      <div style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
        <p style={{ margin: "0 8px 8px", color: theme.textMuted, fontSize: 10 }}>{strings.navWorkspace}</p>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
              padding: "10px 12px",
              borderRadius: 9,
              border: `1px solid ${activeSection === item.id ? `${theme.accent}40` : "transparent"}`,
              background: activeSection === item.id ? "#111d32" : "transparent",
              color: activeSection === item.id ? theme.text : theme.textSecondary,
              cursor: "pointer",
            }}
          >
            <span style={{ width: 18, color: activeSection === item.id ? theme.accentSoft : theme.textMuted }}>{item.sym}</span>
            <span style={{ flex: 1, textAlign: "left", fontSize: 12, fontWeight: activeSection === item.id ? 700 : 500 }}>{item.short}</span>
            {item.locked ? <Pill label="Locked" variant="warning" /> : null}
          </button>
        ))}
      </div>
    </aside>
  );
}

function CaseSection({ caseInfo, setCaseInfo, strings, theme, onUploadFile }: CaseSectionProps) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card style={getCardStyle(theme)}>
        <CardHeader title={strings.caseDetails} sub={strings.caseEditable} theme={theme} />
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <InputField label={strings.caseId} value={caseInfo.caseId} onChange={(value) => setCaseInfo((prev) => ({ ...prev, caseId: value }))} theme={theme} />
            <InputField label={strings.dateOfAnalysis} value={caseInfo.dateOfAnalysis} onChange={(value) => setCaseInfo((prev) => ({ ...prev, dateOfAnalysis: value }))} theme={theme} />
            <InputField label={strings.patientAge} value={caseInfo.patientAge} onChange={(value) => setCaseInfo((prev) => ({ ...prev, patientAge: value }))} theme={theme} />
            <InputField label={strings.patientSex} value={caseInfo.patientSex} onChange={(value) => setCaseInfo((prev) => ({ ...prev, patientSex: value }))} theme={theme} />
            <InputField label={strings.referringDept} value={caseInfo.referringDept} onChange={(value) => setCaseInfo((prev) => ({ ...prev, referringDept: value }))} theme={theme} />
            <InputField label={strings.laboratory} value={caseInfo.laboratoryName} onChange={(value) => setCaseInfo((prev) => ({ ...prev, laboratoryName: value }))} theme={theme} />
            <InputField label={strings.clinicianName} value={caseInfo.clinicianName} onChange={(value) => setCaseInfo((prev) => ({ ...prev, clinicianName: value }))} theme={theme} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: theme.accent,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {strings.uploadButton}
              <input type="file" accept=".cyhd" onChange={onUploadFile} style={{ display: "none" }} />
            </label>
            <Pill label={strings.uploadHint} variant="accent" />
          </div>
        </div>
      </Card>

      <Card style={getCardStyle(theme, { padding: 16, background: "#060d1a" })}>
        <p style={{ margin: 0, color: theme.textSecondary, fontSize: 12, lineHeight: 1.8 }}>{strings.reportOnly}</p>
      </Card>
    </div>
  );
}

function GenomicSection({ genomic, hasAnalysisData, strings, theme }: GenomicSectionProps) {
  if (!hasAnalysisData) {
    return <EmptyState title={strings.noGenomicTitle} body={strings.noGenomicBody} theme={theme} />;
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <Card style={getCardStyle(theme, { padding: 14 })}><Field label={strings.chromosome} value={genomic.chromosome} theme={theme} /></Card>
        <Card style={getCardStyle(theme, { padding: 14 })}><Field label={strings.cnvSize} value={genomic.cnvSize} theme={theme} /></Card>
        <Card style={getCardStyle(theme, { padding: 14 })}><Field label={strings.acmg} value={genomic.acmg} theme={theme} /></Card>
      </div>

      <Card style={getCardStyle(theme)}>
        <CardHeader title={strings.genomicFindings} sub={strings.analysisNotes} theme={theme} />
        <div style={{ padding: 16 }}>
          <Field label={strings.chromosome} value={genomic.chromosome} theme={theme} />
          <Field label={strings.location} value={genomic.location} theme={theme} />
          <Field label={strings.cnvType} value={genomic.cnvType} theme={theme} />
          <Field label={strings.cnvSize} value={genomic.cnvSize} theme={theme} />
          <Field label={strings.genes} value={genomic.genes} theme={theme} />
          <Field label={strings.acmg} value={genomic.acmg} theme={theme} />
        </div>
      </Card>
    </div>
  );
}

function ClinicalSection({ clinical, strings, theme }: ClinicalSectionProps) {
  return (
    <Card style={getCardStyle(theme)}>
      <CardHeader title={strings.clinicalInfo} theme={theme} />
      <div style={{ padding: 16 }}>
        <Field label={strings.summaryTitle} value={clinical.summary} theme={theme} />
        <Field label="Symptoms / Status" value={clinical.symptoms} theme={theme} />
        <Field label="Notes" value={clinical.notes} theme={theme} />
      </div>
    </Card>
  );
}

function AnalysisSection({ genomic, strings, theme }: AnalysisSectionProps) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card style={getCardStyle(theme)}>
          <CardHeader title={strings.analysis} sub="CNV confidence profile" theme={theme} />
          <div style={{ padding: 16 }}>
            <MiniBarChart data={ANALYSIS_SCORE_DATA} theme={theme} />
          </div>
        </Card>

        <Card style={getCardStyle(theme)}>
          <CardHeader title={strings.genes} sub="Gene-level support" theme={theme} />
          <div style={{ padding: 16 }}>
            <MiniBarChart data={ANALYSIS_SUPPORT_DATA} theme={theme} />
          </div>
        </Card>
      </div>

      <Card style={getCardStyle(theme, { padding: 16 })}>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: theme.text }}>{strings.summaryTitle}</p>
        <p style={{ margin: 0, fontSize: 12, color: theme.textSecondary, lineHeight: 1.8 }}>
          {genomic.chromosome} {genomic.cnvType} at {genomic.location} with size {genomic.cnvSize}. The currently loaded gene set is {genomic.genes},
          and the report-level interpretation is {genomic.acmg}.
        </p>
      </Card>
    </div>
  );
}

function SimilarSection({ strings, theme }: SimilarSectionProps) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {SIMILAR_CASES.map((item) => (
        <Card key={item.id} style={getCardStyle(theme, { padding: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.text }}>{item.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: theme.textMuted }}>{item.id}</p>
            </div>
            <Pill label={`${item.similarity}%`} variant="purple" />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: theme.textSecondary, lineHeight: 1.7 }}>{item.summary}</p>
        </Card>
      ))}
    </div>
  );
}

function ChatSection({ messages, inputValue, onInputChange, onSend, strings, theme }: ChatSectionProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CHAT_STARTERS.map((starter) => (
          <button
            key={starter}
            onClick={() => onSend(starter)}
            style={{
              borderRadius: 999,
              border: `1px solid ${theme.borderLight}`,
              background: theme.surface,
              color: theme.textSecondary,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            {starter}
          </button>
        ))}
      </div>

      <Card style={getCardStyle(theme, { flex: 1, padding: 16, overflowY: "auto" })}>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 12px",
                borderRadius: 10,
                background: message.role === "user" ? "#0c1d40" : theme.surface,
                border: `1px solid ${message.role === "user" ? "#214d8f" : theme.border}`,
              }}
            >
              {message.role === "user" ? (
                <p style={{ margin: 0, fontSize: 12, color: theme.accentSoft, lineHeight: 1.6 }}>{message.text}</p>
              ) : (
                message.text.split("\n").map((line, lineIndex) => renderMessageLine(line, lineIndex, theme))
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </Card>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend();
            }
          }}
          placeholder={strings.assistantPlaceholder}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${theme.borderLight}`,
            background: theme.surface,
            color: theme.text,
            outline: "none",
          }}
        />
        <button
          onClick={() => onSend()}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: 8,
            background: theme.accent,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {strings.send}
        </button>
      </div>
    </div>
  );
}

function ReportSection({ caseInfo, genomic, clinical, strings, theme }: ReportSectionProps) {
  const sections = buildReportSections(caseInfo, genomic, clinical, strings);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.text }}>{strings.reportTitle}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: theme.textMuted }}>{strings.reportSubtitle}</p>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            padding: "9px 14px",
            border: "none",
            borderRadius: 8,
            background: theme.accent,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {strings.export}
        </button>
      </div>

      {sections.map((section) => (
        <Card key={section.title} style={getCardStyle(theme)}>
          <CardHeader title={section.title} theme={theme} />
          <div style={{ padding: 16 }}>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                lineHeight: 1.8,
                fontSize: 12,
                color: theme.textSecondary,
              }}
            >
              {section.body}
            </pre>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root app
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [activeSection, setActiveSection] = useState<SectionId>("case");
  const [caseInfo, setCaseInfo] = useState<CaseInfo>(INITIAL_CASE_INFO);
  const [genomic, setGenomic] = useState<GenomicData>(INITIAL_GENOMIC_DATA);
  const [clinical, setClinical] = useState<ClinicalData>(INITIAL_CLINICAL_DATA);
  const [hasAnalysisData, setHasAnalysisData] = useState<boolean>(false);
  const [searchCaseId, setSearchCaseId] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [chatInput, setChatInput] = useState<string>("");

  const strings = STRINGS[language];
  const navItems = useMemo(() => buildNavItems(strings), [strings]);
  const activeItem = navItems.find((item) => item.id === activeSection);

  /** Apply the hardcoded cyhd extraction result into state. */
  function activateAnalysisData(source: "search" | "upload"): void {
    const extracted = buildExtractedReportData(searchCaseId);

    setCaseInfo(extracted.caseInfo);
    setGenomic(extracted.genomic);
    setClinical(extracted.clinical);
    setHasAnalysisData(true);
    setSearchCaseId(extracted.caseInfo.caseId);
    setStatusMessage(source === "search" ? strings.searchSuccess : strings.uploadSuccess);
    setChatMessages([
      INITIAL_ASSISTANT_MESSAGE,
      {
        role: "assistant",
        text: buildAssistantReply(extracted.genomic, "Summarize the CNV finding."),
      },
    ]);
  }

  /** Handle search button click and simulate report-based extraction. */
  function handleSearch(): void {
    activateAnalysisData("search");
  }

  /** Handle uploaded cyhd file and simulate data extraction. */
  function handleUploadFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    activateAnalysisData("upload");
    event.target.value = "";
  }

  /** Change section while applying the pre-analysis availability gate. */
  function handleSectionChange(section: SectionId): void {
    setActiveSection(section);

    if (!canOpenSection(section, hasAnalysisData)) {
      setStatusMessage(strings.emptyGateBody);
    } else {
      setStatusMessage("");
    }
  }

  /** Send a new assistant message using loaded genomic data. */
  function handleSendMessage(seedText?: string): void {
    const nextText = (seedText ?? chatInput).trim();

    if (!nextText || !hasAnalysisData) {
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: nextText },
      { role: "assistant", text: buildAssistantReply(genomic, nextText) },
    ]);
    setChatInput("");
  }

  const sectionView = (() => {
    if (!canOpenSection(activeSection, hasAnalysisData)) {
      return <EmptyState title={strings.emptyGateTitle} body={strings.emptyGateBody} theme={THEME} />;
    }

    switch (activeSection) {
      case "case":
        return (
          <CaseSection
            caseInfo={caseInfo}
            setCaseInfo={setCaseInfo}
            strings={strings}
            theme={THEME}
            onUploadFile={handleUploadFile}
          />
        );
      case "genomic":
        return <GenomicSection genomic={genomic} hasAnalysisData={hasAnalysisData} strings={strings} theme={THEME} />;
      case "clinical":
        return <ClinicalSection clinical={clinical} strings={strings} theme={THEME} />;
      case "analysis":
        return <AnalysisSection genomic={genomic} strings={strings} theme={THEME} />;
      case "similar":
        return <SimilarSection strings={strings} theme={THEME} />;
      case "chat":
        return (
          <ChatSection
            messages={chatMessages}
            inputValue={chatInput}
            onInputChange={setChatInput}
            onSend={handleSendMessage}
            strings={strings}
            theme={THEME}
          />
        );
      case "report":
        return <ReportSection caseInfo={caseInfo} genomic={genomic} clinical={clinical} strings={strings} theme={THEME} />;
      default:
        return null;
    }
  })();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: "'IBM Plex Sans','Noto Sans Arabic',ui-sans-serif,system-ui,sans-serif",
        direction: strings.dir,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #24355a; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar
        activeSection={activeSection}
        items={navItems}
        caseInfo={caseInfo}
        genomic={genomic}
        hasAnalysisData={hasAnalysisData}
        onSelect={handleSectionChange}
        strings={strings}
        theme={THEME}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <HeaderBar
          activeItem={activeItem}
          caseInfo={caseInfo}
          genomic={genomic}
          hasAnalysisData={hasAnalysisData}
          language={language}
          onLanguageChange={setLanguage}
          searchCaseId={searchCaseId}
          onSearchCaseIdChange={setSearchCaseId}
          onSearch={handleSearch}
          strings={strings}
          theme={THEME}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {statusMessage ? (
            <div
              style={{
                marginBottom: 14,
                padding: "12px 14px",
                borderRadius: 10,
                background: hasAnalysisData ? "#08261c" : "#2a1c08",
                border: `1px solid ${hasAnalysisData ? "#14532d" : "#713f12"}`,
                color: hasAnalysisData ? "#86efac" : "#fcd34d",
                fontSize: 12,
              }}
            >
              {statusMessage}
            </div>
          ) : null}

          {sectionView}
        </main>
      </div>
    </div>
  );
}