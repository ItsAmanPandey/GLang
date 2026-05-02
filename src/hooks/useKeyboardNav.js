import { useEffect } from "react";

export function useKeyboardNav({ onNumber, onEnter, onSpace, onEscape }) {
  useEffect(() => {
    function handleKeyDown(e) {
      const isTyping = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";

      if (isTyping) {
        if (e.key === "Escape" && onEscape) {
          onEscape();
          e.target.blur();
        }
        if (e.key === "Enter" && onEnter) {
          e.preventDefault();
          onEnter();
        }
        return;
      }

      if (e.key >= "1" && e.key <= "9" && onNumber) {
        onNumber(parseInt(e.key, 10));
      } else if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      } else if (e.key === " " && onSpace) {
        e.preventDefault();
        onSpace();
      } else if (e.key === "Escape" && onEscape) {
        onEscape();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNumber, onEnter, onSpace, onEscape]);
}
