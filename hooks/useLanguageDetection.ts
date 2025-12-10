import { useState, useEffect } from 'react';

// Common Kriol words/particles for simple heuristic detection
const KRIOL_MARKERS = ['i', 'ku', 'na', 'di', 'pa', 'nha', 'bu', 'ami', 'fasi', 'bai', 'tene', 'ka'];

export function useLanguageDetection(text: string) {
  const [detectedLang, setDetectedLang] = useState<string>('detect');
  const [confidence, setConfidence] = useState<number>(0);

  useEffect(() => {
    if (!text || text.length < 3) {
      setDetectedLang('detect');
      setConfidence(0);
      return;
    }

    const words = text.toLowerCase().split(/\s+/);
    let kriolScore = 0;

    words.forEach(word => {
      if (KRIOL_MARKERS.includes(word)) kriolScore++;
      // Check for common endings or patterns if needed
    });

    const calculatedConfidence = kriolScore / words.length;

    if (calculatedConfidence > 0.2) { // 20% match on particles
      setDetectedLang('kriol');
      setConfidence(calculatedConfidence);
    } else {
      setDetectedLang('pt'); // Default fallback to PT if ambiguous
      setConfidence(0);
    }

  }, [text]);

  return { detectedLang, confidence };
}