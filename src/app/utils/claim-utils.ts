// claim-utils.ts
export function createClaimsTable(claims: any): any[] {
    const claimsTable: any[] = [];
    
    if (claims) {
      for (const key in claims) {
        if (claims.hasOwnProperty(key)) {
          claimsTable.push({
            claim: key,
            value: claims[key],
            description: getClaimDescription(key)
          });
        }
      }
    }
  
    return claimsTable;
  }
  
  // Função que pode retornar uma descrição para o claim, caso necessário
  function getClaimDescription(claim: string): string {
    const descriptions: { [key: string]: string } = {
      'name': 'Nome completo do usuário',
      'email': 'Endereço de e-mail do usuário',
      'sub': 'Identificador único do usuário',
      'role': 'Função ou permissão atribuída ao usuário',
      // Adicione outras descrições conforme necessário
    };
  
    return descriptions[claim] || 'Descrição não disponível';
  }
  