// Workflow/Tramitação de documento
export interface Workflow {
  id: number;
  documentId: number;
  documentName?: string;
  originDepartment: string;
  destinationDepartment: string;
  originSectorId?: number;
  destinationSectorId?: number;
  sendingUserId: number;
  sendingUserName?: string;
  receivingUserId?: number;
  receivingUserName?: string;
  sendDate: string;
  receiveDate?: string;
  memo?: string;
  notes?: string;
  completed: boolean;
}

// DTO para criar workflow
export interface CreateWorkflowDto {
  documentId: number;
  originDepartment: string;
  destinationDepartment: string;
  originSectorId?: number;
  destinationSectorId?: number;
  sendingUserId: number;
  memo?: string;
  responseDeadlineDays?: number;
}

// DTO para finalizar workflow
export interface CompleteWorkflowDto {
  workflowId: number;
  receivingUserId: number;
  notes?: string;
}

// Status de tramitação do documento
export interface DocumentWorkflowStatus {
  isInTransit: boolean;
  currentSectorId?: number;
  currentSectorName?: string;
  pendingWorkflows: number;
  workflowHistory: Workflow[];
}
