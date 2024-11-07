export class FileUtils {
  /**
   * Extrai a extensão do arquivo a partir do nome do arquivo, incluindo o ponto.
   * @param file O objeto File do qual extrair a extensão.
   * @returns A extensão do arquivo como string (incluindo o ponto), ou uma string vazia se não houver extensão.
   */
  static pegarExtArquivo(file: File): string {
    // Obtém o nome do arquivo
    const fileName = file.name;
    // Divide o nome do arquivo em partes usando '.' e obtém a última parte, incluindo o ponto
    const parts = fileName.split('.');
    
    // Verifica se há partes suficientes para formar uma extensão
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }
}
