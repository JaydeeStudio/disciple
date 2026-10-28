/**
 * Haptic feedback utility using Web Vibration API for mobile devices.
 * Gracefully degrades (no-op) on browsers or platforms without vibration support (e.g. desktop, iOS Safari).
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  
  // Check if Web Vibration API is available
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(12); // Subtle tap
        break;
      case 'medium':
        navigator.vibrate(25); // Definite click
        break;
      case 'heavy':
        navigator.vibrate(45); // Prominent feedback
        break;
      case 'success':
        navigator.vibrate([15, 50, 25]); // Distinct success pulse
        break;
      case 'warning':
        navigator.vibrate([30, 40, 30, 40]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Silently ignore if permission or execution fails
  }
}
