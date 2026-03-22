import { useEffect, useState, useRef, useCallback } from "react";

/**
 * useContestProctoring — client-side proctoring hook for contest pages.
 *
 * Features:
 * 1. Fullscreen enforcement (overlay to re-enter on exit)
 * 2. Tab-switch / minimize detection (warning on return)
 * 3. DevTools detection (debugger timing heuristic → reload)
 * 4. Keyboard shortcut blocking (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 * 5. Right-click context menu disabled
 *
 * @param {string} contestPrefix  "rapidfire" | "cascade" | "dsa"
 * @param {object} options
 * @param {boolean} options.contestEnded  When true, suppress all proctoring
 * @returns {{ showWarning, warningMessage, warningButtonText, warningAction, violationCount, cleanupProctoring }}
 */
export default function useContestProctoring(contestPrefix, { contestEnded = false } = {}) {
    const STORAGE_KEY = `${contestPrefix}_violations`;

    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [warningButtonText, setWarningButtonText] = useState("");
    const warningActionRef = useRef(null);
    const [violationCount, setViolationCount] = useState(() => {
        return parseInt(sessionStorage.getItem(STORAGE_KEY) || "0", 10);
    });

    // Track whether the tab was hidden (for tab-switch detection)
    const wasHiddenRef = useRef(false);
    // Guard: don't show multiple overlays at once
    const isShowingWarningRef = useRef(false);
    // Guard: contest ended — avoid triggering after navigation
    const contestEndedRef = useRef(contestEnded);

    useEffect(() => {
        contestEndedRef.current = contestEnded;
    }, [contestEnded]);

    // --- Helpers ---

    const incrementViolations = useCallback(() => {
        setViolationCount(prev => {
            const next = prev + 1;
            sessionStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, [STORAGE_KEY]);

    const showOverlay = useCallback((message, buttonText, action) => {
        if (isShowingWarningRef.current) return; // one at a time
        if (contestEndedRef.current) return;
        isShowingWarningRef.current = true;
        incrementViolations();
        setWarningMessage(message);
        setWarningButtonText(buttonText);
        warningActionRef.current = action;
        setShowWarning(true);
    }, [incrementViolations]);

    const dismissWarning = useCallback(() => {
        setShowWarning(false);
        isShowingWarningRef.current = false;
        // Execute the stored action after dismissing
        if (warningActionRef.current) {
            warningActionRef.current();
            warningActionRef.current = null;
        }
    }, []);

    // Wrapped warningAction for consumers
    const warningAction = dismissWarning;

    // --- Cleanup (call on contest end) ---

    const cleanupProctoring = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
    }, [STORAGE_KEY]);

    // --- 1. Fullscreen enforcement ---

    useEffect(() => {
        if (contestEnded) return;

        const handleFullscreenChange = () => {
            if (contestEndedRef.current) return;
            if (!document.fullscreenElement) {
                // User exited fullscreen
                showOverlay(
                    "You have exited fullscreen mode. Excessive violations may result in penalties.",
                    "Return to Fullscreen",
                    () => {
                        document.documentElement.requestFullscreen().catch(() => { });
                    }
                );
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        // On mount: if not already fullscreen, show the overlay
        // (handles page reload where requestFullscreen can't be called without gesture)
        if (!document.fullscreenElement) {
            // Small delay to let React render settle
            const timer = setTimeout(() => {
                if (!document.fullscreenElement && !contestEndedRef.current) {
                    showOverlay(
                        "You must be in fullscreen mode during the contest. Click the button below to enter fullscreen.",
                        "Enter Fullscreen",
                        () => {
                            document.documentElement.requestFullscreen().catch(() => { });
                        }
                    );
                }
            }, 500);
            return () => {
                clearTimeout(timer);
                document.removeEventListener("fullscreenchange", handleFullscreenChange);
            };
        }

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [contestEnded, showOverlay]);

    // --- 2. Tab-switch / minimize detection ---

    useEffect(() => {
        if (contestEnded) return;

        const handleVisibilityChange = () => {
            if (contestEndedRef.current) return;

            if (document.visibilityState === "hidden") {
                wasHiddenRef.current = true;
            } else if (document.visibilityState === "visible" && wasHiddenRef.current) {
                wasHiddenRef.current = false;
                // Show warning after a tiny delay to let the existing timer-sync handler run first
                setTimeout(() => {
                    if (contestEndedRef.current) return;
                    showOverlay(
                        "Tab switch or window minimization detected. This activity is logged. Excessive violations may result in penalties.",
                        "I Understand",
                        () => { } // just dismiss
                    );
                }, 300);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [contestEnded, showOverlay]);

    // --- 3. DevTools detection (debugger timing) ---

    useEffect(() => {
        if (contestEnded) return;

        const interval = setInterval(() => {
            if (contestEndedRef.current) return;
            const before = performance.now();
            // eslint-disable-next-line no-debugger
            debugger;
            const after = performance.now();
            if (after - before > 100) {
                // DevTools is likely open
                showOverlay(
                    "Developer tools detected! This is a serious violation. The page will reload.",
                    "OK",
                    () => {
                        window.location.reload();
                    }
                );
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contestEnded, showOverlay]);

    // --- 4. Keyboard shortcut blocking ---

    useEffect(() => {
        if (contestEnded) return;

        const handleKeyDown = (e) => {
            // F12
            if (e.key === "F12") {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            // Ctrl+U (view source)
            if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        };

        document.addEventListener("keydown", handleKeyDown, true); // capture phase
        return () => document.removeEventListener("keydown", handleKeyDown, true);
    }, [contestEnded]);

    // --- 5. Right-click disabled ---

    useEffect(() => {
        if (contestEnded) return;

        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        document.addEventListener("contextmenu", handleContextMenu);
        return () => document.removeEventListener("contextmenu", handleContextMenu);
    }, [contestEnded]);

    return {
        showWarning,
        warningMessage,
        warningButtonText,
        warningAction,
        violationCount,
        cleanupProctoring,
    };
}
