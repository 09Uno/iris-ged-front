# Implementação do Sistema de Documentos - Frontend

## ✅ Implementações Concluídas

### 1. Interfaces TypeScript e DTOs

#### Classes Documentais (e-ARQ Brasil)
- ✅ `DocumentClass` - Interface completa para classes documentais
- ✅ `CreateDocumentClassDto` - DTO para criar nova classe
- ✅ `UpdateDocumentClassDto` - DTO para atualizar classe
- ✅ `DocumentClassHierarchy` - Interface para hierarquia de classes
- ✅ Enum `DestinacaoFinal` - Destinação final dos documentos

#### Tipos de Documento
- ✅ `DocumentType` - Interface atualizada com novos campos:
  - `classeDocumentalId` - ID da classe documental associada
  - `classeDocumentalCodigo` - Código da classe
  - `classeDocumentalDescricao` - Descrição da classe
  - `htmlTemplateFileName` - Nome do arquivo template HTML
  - `hasHtmlTemplate` - Flag indicando se possui template
  - `supportsHtmlEditing` - Flag indicando suporte a edição HTML
  - `htmlTemplateContent` - Conteúdo do template HTML
- ✅ `CreateDocumentTypeDto` - DTO para criar tipo de documento
- ✅ `UpdateDocumentTypeDto` - DTO para atualizar tipo de documento

#### Versionamento de Documentos
- ✅ `DocumentVersion` - Interface para versões de documentos
- ✅ `CreateDocumentVersionDto` - DTO para criar nova versão
- ✅ `DocumentVersionListResponse` - Resposta com lista de versões

### 2. Serviços

#### DocumentClassService
Localização: `src/app/services/documents/document-class.service.ts`

Métodos implementados:
- ✅ `getAll()` - Buscar todas as classes documentais
- ✅ `getById(id)` - Buscar classe por ID
- ✅ `getByCode(code)` - Buscar classe por código
- ✅ `getHierarchy()` - Buscar hierarquia completa
- ✅ `getByParent(parentId?)` - Buscar classes filhas
- ✅ `create(dto)` - Criar nova classe
- ✅ `update(id, dto)` - Atualizar classe
- ✅ `delete(id)` - Deletar classe
- ✅ `getActiveClasses()` - Buscar apenas classes ativas

Endpoints utilizados:
- `GET /v1/DocumentClass` - Listar todas
- `GET /v1/DocumentClass/{id}` - Buscar por ID
- `GET /v1/DocumentClass/code/{code}` - Buscar por código
- `GET /v1/DocumentClass/hierarchy` - Buscar hierarquia
- `GET /v1/DocumentClass/children/{parentId?}` - Buscar filhas
- `POST /v1/DocumentClass` - Criar
- `PUT /v1/DocumentClass/{id}` - Atualizar
- `DELETE /v1/DocumentClass/{id}` - Deletar

#### GedApiService (Atualizações)
Localização: `src/app/ged.api.service.ts`

Novos métodos:
- ✅ `updateDocumentType(id, dto)` - Atualizar tipo de documento
- ✅ `getDocumentTypeById(id)` - Buscar tipo por ID

### 3. Componentes

#### AddDocumentTypeModalComponent
Localização: `src/app/domains/admin/components/add-document-type-modal/`

Atualizações:
- ✅ Adicionado campo de seleção de Classe Documental (e-ARQ Brasil)
- ✅ Adicionado campo de descrição
- ✅ Integração com `DocumentClassService` para carregar classes ativas
- ✅ Atualizado para usar `CreateDocumentTypeDto`
- ✅ Suporte para templates HTML quando formato HTML é selecionado
- ✅ Geração automática de `templateFileName` baseado no código

Novos campos no formulário:
- `classeDocumentalId` (opcional) - Dropdown com classes documentais
- `description` (opcional) - Textarea para descrição
- `htmlContent` (condicional) - Editor Quill para conteúdo HTML

#### EditorHtmlComponent
Localização: `src/app/features/editor-html/`

Novas funcionalidades:
- ✅ **Sistema de Versionamento**:
  - Painel lateral com histórico de versões
  - Indicador de alterações não salvas
  - Botão para toggle do painel de versões
  - Lista de versões com data, autor e descrição
  - Botão para restaurar versões anteriores (UI pronta, aguarda backend)

- ✅ **Controle de Mudanças**:
  - Detecção automática de alterações no conteúdo
  - Indicador visual de documento não salvo (*)
  - Banner informativo com número da versão atual
  - Desabilita botão salvar quando não há mudanças

- ✅ **Interface Aprimorada**:
  - Toolbar reorganizada e estilizada
  - Painel de versões com animação suave
  - Estilos consistentes com o tema do sistema
  - Feedback visual claro do estado do documento

### 4. Estilos
- ✅ Estilos completos para o painel de versionamento
- ✅ Estilos para indicadores de estado (não salvo, versão atual)
- ✅ Responsividade do editor com painel lateral
- ✅ Animações e transições suaves

## 🔄 Implementações Parciais (Aguardando Backend)

### Sistema de Versionamento

**Frontend implementado, backend pendente:**

#### Endpoints necessários:

1. **Listar versões de um documento**
```
GET /v1/Document/{documentId}/versions
Response: DocumentVersionListResponse
```

2. **Criar nova versão (ao salvar)**
```
POST /v1/Document/{documentId}/versions
Body: CreateDocumentVersionDto
Response: DocumentVersion
```

3. **Buscar conteúdo de uma versão específica**
```
GET /v1/Document/{documentId}/versions/{versionNumber}
Response: { htmlContent: string, version: DocumentVersion }
```

4. **Restaurar versão anterior**
```
POST /v1/Document/{documentId}/versions/{versionNumber}/restore
Response: { updatedDocument: Document, newVersion: DocumentVersion }
```

#### Backend precisa implementar:

1. **Tabela de Versionamento**:
```csharp
public class DocumentVersion
{
    public long Id { get; set; }
    public long DocumentId { get; set; }
    public int VersionNumber { get; set; }
    public string HtmlContent { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public string CreatedBy { get; set; } // Nome do usuário
    public string? ChangeDescription { get; set; }
    public long FileSize { get; set; }
    public string? Checksum { get; set; } // Para validação de integridade

    // Relacionamentos
    public Document Document { get; set; }
    public User CreatedByUser { get; set; }
}
```

2. **Lógica de Versionamento**:
   - Ao salvar documento HTML, criar automaticamente nova versão
   - Incrementar número da versão
   - Calcular checksum (MD5 ou SHA256) do conteúdo
   - Registrar tamanho do arquivo
   - Associar ao usuário que fez a alteração
   - Manter histórico completo (não deletar versões antigas)

3. **Service/Repository**:
```csharp
public interface IDocumentVersionService
{
    Task<List<DocumentVersion>> GetVersionsAsync(long documentId);
    Task<DocumentVersion> CreateVersionAsync(CreateDocumentVersionDto dto, int userId);
    Task<DocumentVersion> GetVersionAsync(long documentId, int versionNumber);
    Task<Document> RestoreVersionAsync(long documentId, int versionNumber, int userId);
    Task<int> GetLatestVersionNumberAsync(long documentId);
}
```

4. **Considerações de Armazenamento**:
   - Implementar compressão do conteúdo HTML (GZip)
   - Considerar política de retenção (ex: manter últimas 50 versões)
   - Implementar soft delete para versões antigas se necessário
   - Indexar por documentId e versionNumber para performance

### Templates HTML para Tipos de Documento

**Frontend implementado, backend precisa:**

1. **Armazenamento de Templates**:
   - Salvar `HtmlTemplateContent` ao criar/atualizar DocumentType
   - Gerar `TemplateFileName` automaticamente ou usar fornecido
   - Marcar `SupportsHtmlEditing = true` quando template presente

2. **Endpoint para buscar template**:
```
GET /v1/Document/GetDocumentType/{id}/template
Response: { htmlTemplateContent: string, fileName: string }
```

3. **Uso de Templates ao criar documentos**:
   - Quando usuário criar documento baseado em tipo com template
   - Pré-preencher editor HTML com conteúdo do template
   - Permitir que usuário edite conforme necessário

## 📋 Checklist de Integração Backend

### Classes Documentais
- [x] Controller implementado
- [x] Endpoints testados
- [x] Frontend integrado

### Tipos de Documento
- [ ] Adicionar campos no modelo:
  - `ClasseDocumentalId` (nullable long)
  - `HtmlTemplateContent` (nullable string/text)
  - `TemplateFileName` (nullable string)
  - `SupportsHtmlEditing` (bool)
- [ ] Atualizar DTOs (Create/Update)
- [ ] Atualizar endpoint de criação
- [ ] Atualizar endpoint de atualização
- [ ] Endpoint para buscar template por tipo
- [ ] Testes

### Versionamento de Documentos
- [ ] Criar tabela `DocumentVersions`
- [ ] Criar DTOs de versionamento
- [ ] Implementar service/repository
- [ ] Criar endpoints:
  - Listar versões
  - Criar versão (automático ao salvar)
  - Buscar versão específica
  - Restaurar versão
- [ ] Implementar lógica de checksum
- [ ] Implementar compressão (opcional)
- [ ] Testes
- [ ] Atualizar método de salvar documento para criar versão automaticamente

### Editor HTML
- [ ] Endpoint de salvamento já cria versão automaticamente
- [ ] Retornar número da versão na resposta
- [ ] Validar permissões para restaurar versões

## 🎯 Próximos Passos

### Para o Backend Developer:

1. **Implementar Versionamento (Prioridade Alta)**:
   - Criar migration para tabela DocumentVersions
   - Implementar service de versionamento
   - Criar endpoints listados acima
   - Atualizar endpoint de salvar documento HTML para criar versão automática

2. **Atualizar DocumentType (Prioridade Alta)**:
   - Adicionar campos de template HTML
   - Atualizar endpoints existentes
   - Criar endpoint para buscar template

3. **Testes**:
   - Unit tests para service de versionamento
   - Integration tests para endpoints
   - Validar performance com muitas versões

### Para o Frontend Developer:

1. **Conectar versionamento real**:
   - Substituir dados mockados pelos endpoints reais
   - Implementar tratamento de erros
   - Adicionar loading states

2. **Melhorias futuras**:
   - Diff visual entre versões
   - Exportar documento para PDF
   - Comentários em versões
   - Notificações de conflito

## 📝 Notas Importantes

1. **Segurança**:
   - Validar permissões do usuário antes de restaurar versões
   - Implementar audit log para alterações em versões
   - Sanitizar conteúdo HTML para evitar XSS

2. **Performance**:
   - Considerar paginação para lista de versões (muitas versões)
   - Implementar cache para versões antigas
   - Indexar tabela de versões adequadamente

3. **Conformidade e-ARQ Brasil**:
   - Manter metadados completos de cada versão
   - Garantir rastreabilidade de alterações
   - Implementar destinação final conforme classe documental

## 🔗 Arquivos Modificados/Criados

### Novos Arquivos:
- `src/app/services/documents/document-class.service.ts`
- `IMPLEMENTACAO_DOCUMENTOS.md` (este arquivo)

### Arquivos Modificados:
- `src/app/types/document.types.ts`
- `src/app/ged.api.service.ts`
- `src/app/domains/admin/components/add-document-type-modal/add-document-type-modal.component.ts`
- `src/app/domains/admin/components/add-document-type-modal/add-document-type-modal.component.html`
- `src/app/features/editor-html/editor-html.component.ts`
- `src/app/features/editor-html/editor-html.component.html`
- `src/app/features/editor-html/editor-html.component.scss`

## 🎨 Screenshots/UI

### Modal de Adicionar Tipo de Documento
- Campo de seleção de Classe Documental integrado
- Campo de descrição adicionado
- Suporte a templates HTML via editor Quill

### Editor HTML com Versionamento
- Botão "Versões" na toolbar
- Painel lateral com histórico
- Indicador visual de alterações não salvas
- Banner informativo com versão atual
- Botões para restaurar versões anteriores

---

**Data de Implementação**: 2025-10-06
**Desenvolvedor Frontend**: Claude
**Status**: Frontend completo, aguardando implementação backend para versionamento
