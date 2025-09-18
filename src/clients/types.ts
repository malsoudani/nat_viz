export interface AuthResponse {
  success: boolean;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  userId: number;
}

export interface NotificationList {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export interface UnreadCount {
  count: number;
}

// File types
export interface FileUpload {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: number;
  createdAt: string;
}

export enum TeamType {
  DEPARTMENT = "DEPARTMENT",
  TEAM = "TEAM",
  DIVISION = "DIVISION",
  COMMITTEE = "COMMITTEE",
  BRANCH = "BRANCH",
  ADMINISTRATION = "ADMINISTRATION",
}

// create an arabic mapping for the team type
export const TeamTypeArabicMapping: Record<TeamType, string> = {
  [TeamType.DEPARTMENT]: "قسم",
  [TeamType.TEAM]: "فريق",
  [TeamType.DIVISION]: "شعبة",
  [TeamType.COMMITTEE]: "لجنة",
  [TeamType.BRANCH]: "فرع",
  [TeamType.ADMINISTRATION]: "إدارة",
};

export enum TeamStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  INACTIVE = "INACTIVE",
}

// create an arabic mapping for the team status
export const TeamStatusArabicMapping: Record<TeamStatus, string> = {
  [TeamStatus.ACTIVE]: "نشط",
  [TeamStatus.INACTIVE]: "غير نشط",
  [TeamStatus.ARCHIVED]: "أرشف",
};

export interface TeamInfo {
  id: number;
  name: string;
  description: string;
  color: string;
  type: TeamType;
  status: TeamStatus;
  archivedAt: string | null;
  parentTeam: TeamInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: number;
  userId: number;
  role: TeamMemberRole;
  user: User;
  permissions?: string[];
}

export type TeamMemberRole = "MEMBER" | "ADMIN";

export const TeamMemberRoleArabicMapping: Record<TeamMemberRole, string> = {
  MEMBER: "عضو",
  ADMIN: "مدير",
};

export enum WorkflowType {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
  INTERNAL = "INTERNAL",
  CIRCULAR = "CIRCULAR",
  ADMIN_ORDER = "ADMIN_ORDER",
}

export const WorkflowTypeArabicMapping: Record<WorkflowType, string> = {
  [WorkflowType.INCOMING]: "وارد",
  [WorkflowType.OUTGOING]: "صادر",
  [WorkflowType.INTERNAL]: "داخلي",
  [WorkflowType.CIRCULAR]: "تعميم",
  [WorkflowType.ADMIN_ORDER]: "أمر إداري",
};

export enum WorkflowPriority {
  NORMAL = "NORMAL",
  URGENT = "URGENT",
  VERY_URGENT = "VERY_URGENT",
  SECRET = "SECRET",
  PERSONAL_SECRET = "PERSONAL_SECRET",
}

export const WorkflowPriorityArabicMapping: Record<WorkflowPriority, string> = {
  [WorkflowPriority.NORMAL]: "عادي",
  [WorkflowPriority.URGENT]: "عاجل",
  [WorkflowPriority.VERY_URGENT]: "عاجل جداً",
  [WorkflowPriority.SECRET]: "سري",
  [WorkflowPriority.PERSONAL_SECRET]: "سري وشخصي",
};

export enum WorkflowStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  FORWARDED = "FORWARDED",
  PENDING_REPLY = "PENDING_REPLY",
  COMPLETED = "COMPLETED",
  SAVED = "SAVED",
  ARCHIVED = "ARCHIVED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export const WorkflowStatusArabicMapping: Record<WorkflowStatus, string> = {
  [WorkflowStatus.DRAFT]: "مسودة",
  [WorkflowStatus.IN_PROGRESS]: "قيد الإنجاز",
  [WorkflowStatus.FORWARDED]: "محول",
  [WorkflowStatus.PENDING_REPLY]: "بانتظار رد",
  [WorkflowStatus.COMPLETED]: "منجز",
  [WorkflowStatus.SAVED]: "محفوظ",
  [WorkflowStatus.ARCHIVED]: "مؤرشف",
  [WorkflowStatus.CANCELLED]: "ملغي",
  [WorkflowStatus.REJECTED]: "مرفوض",
};

export interface Workflow {
  id: number;
  name: string;
  type: WorkflowType;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  userRole: string;
  teamId?: number;
  participantsCount: number;
  elementsCount: number;
  permissions: string[];
  createdAt: string;
}

export interface WorkflowDetails {
  id: number;
  name: string;
  type: WorkflowType;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  createdAt: string;
}

export interface WorkflowParticipant {
  id: number;
  workflowId: number;
  userId: number;
  teamId?: number;
  role: string;
  permissions: { name: string; label: string }[];
  isActive: boolean;
  userName?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  type: WorkflowType;
  priority?: WorkflowPriority;
  teamId?: number;
  documentNumber?: string;
  subject?: string;
  sender?: string;
  receiver?: string;
  summary?: string;
  relatedWorkflowId?: number;
}

export interface AddParticipantMembership {
  userId: number;
  teamId?: number;
  role: string;
  permissions?: string[];
}

export interface Participant {
  userId: number;
  role: string;
}

export interface WorkflowList {
  workflows: Workflow[];
  total: number;
  teamId?: number;
}

export interface WorkflowElement {
  id: number;
  type: string; // e.g., "workflow_created", "comment", "file_uploaded", etc.
  // Optional relational identifiers
  workflowId?: number;
  teamId?: number | null;
  userId?: number;
  // Human fields
  title?: string;
  description?: string;
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  createdAtHuman?: string;
  // Actor and relations
  userName?: string; // legacy convenience
  user?: User; // { id, name, email }
  workflow?: { id: number; name: string };
  team?: TeamInfo | null;
  // Arbitrary payload from backend (icon, color, etc.)
  data: Record<string, unknown>;
}

export interface ParticipantResult {
  userId: number;
  status: "success" | "error";
  data?: Record<string, unknown>;
  message?: string;
}

// Timeline types for teams
export interface TimelineElement {
  id: number;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  userId: number;
  user: User;
}

// View file response for workflow element (camelCased by HttpClient)
export interface ElementFileInfo {
  size: number;
  type: string;
  extension: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElementFileViewData {
  elementId: number;
  fileName: string;
  editableUrl: string;
  downloadUrl: string;
  fileInfo: ElementFileInfo;
}
