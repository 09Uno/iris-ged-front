export interface Sector {
  id: number;
  name: string;
  acronym: string;
  active: boolean;
}

export interface CreateSectorDto {
  name: string;
  acronym: string;
  active?: boolean;
}

export interface UpdateSectorDto {
  name?: string;
  acronym?: string;
  active?: boolean;
}
