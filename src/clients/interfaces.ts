import { TaskEither } from "fp-ts/TaskEither";
import { HttpError } from "./httpClient";
import {
  AddParticipantMembership,
  AuthResponse,
  ElementFileViewData,
  FileUpload,
  Membership,
  NotificationList,
  ParticipantResult,
  TeamInfo,
  TimelineElement,
  UnreadCount,
  User,
} from "./types";

// Workflow response data interfaces
export interface WorkflowDetailsData {
  workflow: WorkflowDetails;
  elements: WorkflowElement[];
  participants: WorkflowParticipant[];
}

export interface CreateWorkflowData {
  id: number;
  name: string;
  type: string;
  priority: string;
  status: string;
  ownerId: number;
  createdAt: string;
}

export interface ParticipantsData {
  successful: ParticipantResult[];
  failed: ParticipantResult[];
  total: number;
}

export interface StatusData {
  workflowId: number;
  oldStatus: string;
  newStatus: string;
}

export interface CommentData {
  elementId: number;
  comment: string;
  isReply: boolean;
}

export interface CommentWithFileData {
  elementId: number;
  comment: string;
  attachmentName: string;
}

export interface FileUploadData {
  elementId: number;
  fileName: string;
  fileSize: number;
}

export interface CreateFileData {
  elementId: number;
  fileName: string;
  editableUrl: string;
}

export interface IAuthenticationClient {
  /** Attempt login; stores token on success */
  login(email: string, password: string): TaskEither<HttpError, AuthResponse>;

  /** Fetch current user */
  getMe(): TaskEither<HttpError, User>;

  /** Invalidate session */
  logout(): TaskEither<HttpError, void>;

  /** Refresh token */
  refresh(): TaskEither<HttpError, AuthResponse>;
}

export interface INotificationsClient {
  getNotifications(
    page?: number,
    perPage?: number
  ): TaskEither<HttpError, NotificationList>;
  getUnreadCount(): TaskEither<HttpError, UnreadCount>;
  markAsRead(notificationId?: number): TaskEither<HttpError, void>;
  deleteNotification(notificationId: number): TaskEither<HttpError, void>;
}

export interface FileLinkData {
  element: unknown;
  file: FileUpload;
  downloadUrl: string;
  viewUrl: string;
  editableUrl?: string;
}

export interface IFilesClient {
  uploadFile(file: FormData): TaskEither<HttpError, FileUpload>;
  uploadToTeam(
    teamId: number,
    file: FormData
  ): TaskEither<HttpError, FileUpload>;
  getFile(fileId: number): TaskEither<HttpError, FileLinkData>;
  deleteFile(fileId: number): TaskEither<HttpError, void>;
}

export interface ITeamClient {
  getUserTeams(): TaskEither<HttpError, TeamInfo[]>;
  getTeamInfo(teamId: number): TaskEither<HttpError, TeamInfo>;
  updateTeamInfo(
    teamId: number,
    data: Partial<Pick<TeamInfo, "name" | "description" | "color">>
  ): TaskEither<HttpError, TeamInfo>;
  archiveTeam(teamId: number): TaskEither<HttpError, void>;
  listAllUsers(): TaskEither<HttpError, User[]>;
  listMemberships(teamId: number): TaskEither<HttpError, Membership[]>;
  addMembers(
    teamId: number,
    userIds: number[]
  ): TaskEither<HttpError, Membership[]>;
  removeMember(
    teamId: number,
    membershipId: number
  ): TaskEither<HttpError, void>;
  getTimeline(
    teamId: number,
    page?: number,
    perPage?: number
  ): TaskEither<HttpError, { elements: TimelineElement[] }>;
  uploadFile(teamId: number, file: FormData): TaskEither<HttpError, FileUpload>;
}

export interface IWorkflowClient {
  getWorkflows(teamId?: number): TaskEither<HttpError, WorkflowList>;
  getWorkflowDetails(
    workflowId: number,
    page?: number,
    perPage?: number
  ): TaskEither<HttpError, WorkflowDetailsData>;
  createWorkflow(
    data: CreateWorkflowRequest
  ): TaskEither<HttpError, CreateWorkflowData>;
  addMultipleParticipants(
    workflowId: number,
    memberships: AddParticipantMembership[]
  ): TaskEither<HttpError, ParticipantsData>;
  getParticipants(
    workflowId: number
  ): TaskEither<HttpError, WorkflowParticipant[]>;
  updateStatus(
    workflowId: number,
    status: WorkflowStatus
  ): TaskEither<HttpError, StatusData>;
  deleteWorkflow(workflowId: number): TaskEither<HttpError, null>;
  addComment(
    workflowId: number,
    comment: string,
    parentId?: number
  ): TaskEither<HttpError, CommentData>;
  addCommentWithFile(
    workflowId: number,
    comment: string,
    file: File,
    parentCommentId?: number
  ): TaskEither<HttpError, CommentWithFileData>;
  uploadFile(
    workflowId: number,
    file: File,
    description?: string
  ): TaskEither<HttpError, FileUploadData>;
  createFile(
    workflowId: number,
    filename: string,
    extension: string,
    content?: string
  ): TaskEither<HttpError, CreateFileData>;

  // Files (per workflow element)
  getElementFileView(
    workflowId: number,
    elementId: number
  ): TaskEither<HttpError, ElementFileViewData>;
  getElementFileDownloadUrl(workflowId: number, elementId: number): string;
}
