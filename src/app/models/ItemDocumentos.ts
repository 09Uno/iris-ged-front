export interface ItemDocumentos {
    Id: Number | null;
    Nome: string;
    Tipo_documento: string;
    Identificador: string;
    Data_documento: string;
    Documento: File | Blob | string 
    Descricao: string;
    Extensao : string;
} 

