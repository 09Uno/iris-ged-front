export class FormatUtils {
    /**
     * Formata uma entrada no formato 'XX.XXXXXX/XXXX-XX'.
     * @param input A string de entrada a ser formatada.
     * @returns A string formatada, ou uma string vazia se a entrada for inválida.
     */
    static formatarProcesso(input: string): string {
        // Remove caracteres não numéricos
        const numeros = input.replace(/\D/g, '');

        // Limita a entrada a no máximo 14 dígitos
        const maxLength = 14; // 2 + 6 + 4 + 2
        const sanitized = numeros.slice(0, maxLength); // Restringe a quantidade de números

        // Aplica a formatação desejada com base na quantidade de números
        if (sanitized.length <= 2) {
            return sanitized; // Retorna apenas os dois primeiros dígitos
        } else if (sanitized.length <= 8) {
            return `${sanitized.slice(0, 2)}.${sanitized.slice(2)}`; // Adiciona o ponto após os dois primeiros dígitos
        } else if (sanitized.length <= 12) {
            return `${sanitized.slice(0, 2)}.${sanitized.slice(2, 8)}/${sanitized.slice(8)}`; // Adiciona a barra após os seis dígitos
        } else {
            return `${sanitized.slice(0, 2)}.${sanitized.slice(2, 8)}/${sanitized.slice(8, 12)}-${sanitized.slice(12, 14)}`; // Formato final
        }
    }

    /**
     * Valida a entrada para garantir que só números são permitidos.
     * @param input A string de entrada a ser validada.
     * @returns Verdadeiro se a entrada é válida, falso caso contrário.
     */
    static isEntradaValida(input: string): boolean {
        const numeros = input.replace(/\D/g, '');
        return numeros.length <= 14; // Verifica se a entrada tem 14 ou menos dígitos
    }
}
