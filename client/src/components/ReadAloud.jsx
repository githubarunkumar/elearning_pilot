import { useLearner } from '../LearnerContext.jsx';

// Uses the browser's built-in Web Speech API (free, no external service) to read
// narration text aloud where the OS/browser supports the selected language.
// This is a best-effort convenience, not a substitute for the produced voiceover
// audio referenced in the narration scripts (see Section F of that document) -
// English and Hindi voices are broadly available; Marathi voice support varies
// by device/browser, so the button silently hides if the browser has no matching voice.
export default function ReadAloud({ text }) {
  const { content } = useLearner();
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (!supported || !text) return null;

  const speak = () => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = content.speechLang;
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  return (
    <button type="button" className="readaloud-btn" onClick={speak}>
      🔊 {content.ui.readAloud}
    </button>
  );
}
