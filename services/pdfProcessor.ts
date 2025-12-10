// Uses pdf.js from CDN defined in index.html
declare const pdfjsLib: any;

export interface ExtractedVocabulary {
  word: string;
  translation: string;
  context?: string;
}

export const processPdfDictionary = async (file: File): Promise<ExtractedVocabulary[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return parseDictionaryText(fullText);
};

// Heuristic to extract word-translation pairs from unstructured text
const parseDictionaryText = (text: string): ExtractedVocabulary[] => {
  const lines = text.split('\n');
  const vocabulary: ExtractedVocabulary[] = [];

  // Simple heuristic: Looking for "Word - Translation" or "Word: Translation" patterns
  // This is a basic parser and would need to be robust for real dictionaries
  const regex = /^([a-zA-Z\s]+)\s*[-–:]\s*(.+)$/;

  for (const line of lines) {
    const match = line.trim().match(regex);
    if (match) {
      const word = match[1].trim();
      const translation = match[2].trim();
      
      // Basic filtering to remove noise
      if (word.length > 1 && translation.length > 1 && word.split(' ').length < 4) {
        vocabulary.push({
          word,
          translation
        });
      }
    }
  }

  return vocabulary;
};