import { useState, useEffect, useCallback } from "react";

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSupported(true);
      
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer German voices, especially natural sounding ones if available on OS
        const germanVoices = voices.filter((v) => v.lang.startsWith("de"));
        if (germanVoices.length > 0) {
          // Attempt to find a premium/natural voice, otherwise fallback to first German voice
          const premiumVoice = germanVoices.find((v) => v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("premium"));
          setVoice(premiumVoice || germanVoices[0]);
        }
      };

      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text) => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = "de-DE";
    utterance.rate = 0.9; // Slightly slower for language learners
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported, voice]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return { speak, stop, isSpeaking, supported };
}
