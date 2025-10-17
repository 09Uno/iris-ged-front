// Enums do modelo SEI
export enum AccessLevel {
  Publico = 0,    // Sem restrições
  Restrito = 1,   // Requer permissão específica
  Sigiloso = 2    // Alto sigilo
}

export enum RestrictionLevel {
  None = 0,      // Sem restrição (para documentos públicos)
  Usuario = 1,   // Restrição por usuário (pessoal)
  Unidade = 2    // Restrição por unidade/setor
}

// Labels para exibição
export const AccessLevelLabels: Record<AccessLevel, string> = {
  [AccessLevel.Publico]: 'Público',
  [AccessLevel.Restrito]: 'Restrito',
  [AccessLevel.Sigiloso]: 'Sigiloso'
};

export const RestrictionLevelLabels: Record<RestrictionLevel, string> = {
  [RestrictionLevel.None]: 'Nenhuma',
  [RestrictionLevel.Usuario]: 'Usuário (Pessoal)',
  [RestrictionLevel.Unidade]: 'Unidade (Setorial)'
};

// Permissão pessoal de documento
export interface DocumentPersonalPermission {
  id: number;
  documentId: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  canView: boolean;
  canEdit: boolean;
  canSign: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canAddAttachment: boolean;
  canManageVersions: boolean;
  grantedAt: string;
  grantedByUserId: number;
  grantedByUserName?: string;
  justificativa: string;  // ✅ OBRIGATÓRIO
  validUntil?: string;    // ✅ NOVO
  active: boolean;
}

// Permissão setorial de documento
export interface DocumentSectoralPermission {
  id: number;
  documentId: number;
  sectorId: number;
  sectorName?: string;
  canView: boolean;
  canEdit: boolean;
  canSign: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canAddAttachment: boolean;
  canManageVersions: boolean;
  grantedAt: string;
  grantedByUserId: number;
  grantedByUserName?: string;
  justificativa: string;  // ✅ OBRIGATÓRIO
  validUntil?: string;    // ✅ NOVO
  active: boolean;
}

// DTOs para criar/atualizar permissões
export interface CreatePersonalPermissionDto {
  documentId: number;
  userId: number;
  canView: boolean;
  canEdit: boolean;
  canSign: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canAddAttachment: boolean;
  canManageVersions: boolean;
  justificativa: string;  // ✅ OBRIGATÓRIO (mudou de 'reason')
  validUntil?: string;    // ✅ NOVO - Data de validade
}

export interface CreateSectoralPermissionDto {
  documentId: number;
  sectorId: number;
  canView: boolean;
  canEdit: boolean;
  canSign: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canAddAttachment: boolean;
  canManageVersions: boolean;
  justificativa: string;  // ✅ OBRIGATÓRIO (mudou de 'reason')
  validUntil?: string;    // ✅ NOVO - Data de validade
}

// Resposta ao verificar permissão
export interface CheckPermissionResponse {
  hasPermission: boolean;
  isOwner: boolean;
  canView: boolean;
  canEdit: boolean;
  canSign: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canAddAttachment: boolean;
  canManageVersions: boolean;
  source: 'Owner' | 'Personal' | 'Sectoral' | null;
  reason?: string;
}

// Lista de permissões de um documento
export interface DocumentPermissionsResponse {
  documentId: number;
  documentName: string;
  ownerId: number;
  ownerName: string;
  personalPermissions: DocumentPersonalPermission[];
  sectoralPermissions: DocumentSectoralPermission[];
}

// DTO para compartilhar documento
export interface ShareDocumentDto {
  documentId: number;
  userIds?: number[];
  sectorIds?: number[];
  readOnlyMode: boolean;
  allowDownload: boolean;
  allowSign: boolean;
  justificativa: string;  // ✅ OBRIGATÓRIO
  validUntil?: string;    // ✅ NOVO
}
