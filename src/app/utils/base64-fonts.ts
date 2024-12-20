// export async function loadFontFromJson(filePath: string): Promise<string> {
//   try {
//     const response = await fetch(filePath);
//     if (!response.ok) {
//       throw new Error(`Erro ao carregar o arquivo: ${filePath}`);
//     }

//     const data = await response.json();

//     // Remover a parte do prefixo "data:font/ttf;base64," ou "data:application/octet-stream;base64,"
//     const base64Font = data.font.split(",")[1]; // Divide a string na vírgula e pega a segunda parte, que é o base64
    
//     console.log(+"font: " + base64Font)
//     return base64Font;
//   } catch (error) {
//     console.error(error);
//     return ''; // Retorna uma string vazia em caso de erro
//   }
// }

  
//   // Exportando as constantes como Promises baseadas no método acima
//   export const arialBoldItalicBase64 = loadFontFromJson('/assets/arial-bold-italic.json');
//   export const arialNormalBase64 = loadFontFromJson('/assets/arial-normal.json');
//   export const arialBoldBase64 = loadFontFromJson('/assets/arial-bold.json');
//   export const arialItalicBase64 = loadFontFromJson('/assets/arial-italic.json');
  
  