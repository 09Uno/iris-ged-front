export class FormatUtils {
    
    static formatProcessIdentifier(input: string): string {
        const numericInput = input.replace(/\D/g, '');

        const maxLength = 14; 
        const sanitizedInput = numericInput.slice(0, maxLength);

        if (sanitizedInput.length <= 2) {
            return sanitizedInput; 
        } else if (sanitizedInput.length <= 8) {
            return `${sanitizedInput.slice(0, 2)}.${sanitizedInput.slice(2)}`; 
        } else if (sanitizedInput.length <= 12) {
            return `${sanitizedInput.slice(0, 2)}.${sanitizedInput.slice(2, 8)}/${sanitizedInput.slice(8)}`; 
        } else {
            return `${sanitizedInput.slice(0, 2)}.${sanitizedInput.slice(2, 8)}/${sanitizedInput.slice(8, 12)}-${sanitizedInput.slice(12, 14)}`; 
        }
    }

    
    static isValidInput(input: string): boolean {
        const numericInput = input.replace(/\D/g, '');
        return numericInput.length <= 14; // Ensures the input has 14 or fewer digits
    }
}
