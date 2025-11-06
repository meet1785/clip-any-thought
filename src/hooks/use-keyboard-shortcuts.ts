import { useEffect, useCallback } from "react";

export type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
};

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Cmd/Ctrl+Enter in input fields
      const isCmdEnter =
        (event.metaKey || event.ctrlKey) && event.key === "Enter";

      if (isInputField && !isCmdEnter) return;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        // For shortcuts that require Cmd/Ctrl, check either
        const cmdCtrlMatches =
          shortcut.ctrlKey || shortcut.metaKey
            ? event.ctrlKey || event.metaKey
            : !event.ctrlKey && !event.metaKey;

        if (
          keyMatches &&
          (shortcut.ctrlKey || shortcut.metaKey ? cmdCtrlMatches : ctrlMatches && metaMatches) &&
          shiftMatches &&
          altMatches
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

// Helper to format keyboard shortcut for display
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    // Show Cmd on Mac, Ctrl on Windows/Linux
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    parts.push(isMac ? "⌘" : "Ctrl");
  }

  if (shortcut.shiftKey) {
    parts.push("Shift");
  }

  if (shortcut.altKey) {
    parts.push("Alt");
  }

  // Format the key nicely
  let key = shortcut.key;
  if (key === "ArrowUp") key = "↑";
  else if (key === "ArrowDown") key = "↓";
  else if (key === "ArrowLeft") key = "←";
  else if (key === "ArrowRight") key = "→";
  else if (key === "Enter") key = "↵";
  else if (key === "Escape") key = "Esc";
  else key = key.toUpperCase();

  parts.push(key);

  return parts.join(" + ");
};
