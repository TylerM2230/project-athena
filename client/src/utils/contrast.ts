/**
 * Utility functions for calculating color contrast ratios and WCAG compliance
 */

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1 specification
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  // Convert to linear RGB
  const srgb = [r / 255, g / 255, b / 255];
  const linearRgb = srgb.map(channel =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  );

  // Calculate luminance
  return 0.2126 * linearRgb[0] + 0.7152 * linearRgb[1] + 0.0722 * linearRgb[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG compliance levels
 */
export enum WcagLevel {
  FAIL = 'fail',
  AA = 'aa',
  AAA = 'aaa'
}

/**
 * Check WCAG compliance for text on background
 */
export function checkWcagCompliance(
  textColor: string,
  backgroundColor: string,
  isLargeText: boolean = false
): WcagLevel {
  const ratio = getContrastRatio(textColor, backgroundColor);

  if (isLargeText) {
    // Large text (18pt+ or 14pt+ bold)
    if (ratio >= 4.5) return WcagLevel.AAA;
    if (ratio >= 3) return WcagLevel.AA;
  } else {
    // Normal text
    if (ratio >= 7) return WcagLevel.AAA;
    if (ratio >= 4.5) return WcagLevel.AA;
  }

  return WcagLevel.FAIL;
}

/**
 * Get a readable description of contrast ratio
 */
export function getContrastDescription(ratio: number): string {
  if (ratio >= 7) return 'Excellent (AAA)';
  if (ratio >= 4.5) return 'Good (AA)';
  if (ratio >= 3) return 'Poor (Large text only)';
  return 'Fail (Not accessible)';
}

/**
 * Check if a color is considered light or dark
 */
export function isLightColor(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.5;
}

/**
 * Generate an accessible text color for a given background
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const isLight = isLightColor(backgroundColor);
  return isLight ? '#000000' : '#ffffff';
}

/**
 * Validate theme colors for accessibility
 */
export interface ThemeContrastReport {
  textOnBg: { ratio: number; level: WcagLevel };
  textOnBgAlt: { ratio: number; level: WcagLevel };
  textDimOnBg: { ratio: number; level: WcagLevel };
  accentOnBg: { ratio: number; level: WcagLevel };
  overall: WcagLevel;
  issues: string[];
}

export function validateThemeContrast(colors: {
  bg: string;
  bgAlt: string;
  text: string;
  textDim: string;
  accent: string;
  border: string;
}): ThemeContrastReport {
  const textOnBg = getContrastRatio(colors.text, colors.bg);
  const textOnBgAlt = getContrastRatio(colors.text, colors.bgAlt);
  const textDimOnBg = getContrastRatio(colors.textDim, colors.bg);
  const accentOnBg = getContrastRatio(colors.accent, colors.bg);

  const textOnBgLevel = checkWcagCompliance(colors.text, colors.bg);
  const textOnBgAltLevel = checkWcagCompliance(colors.text, colors.bgAlt);
  const textDimOnBgLevel = checkWcagCompliance(colors.textDim, colors.bg);
  const accentOnBgLevel = checkWcagCompliance(colors.accent, colors.bg);

  const issues: string[] = [];

  if (textOnBgLevel === WcagLevel.FAIL) {
    issues.push('Main text on background fails WCAG standards');
  }
  if (textOnBgAltLevel === WcagLevel.FAIL) {
    issues.push('Text on alternate background fails WCAG standards');
  }
  if (textDimOnBgLevel === WcagLevel.FAIL) {
    issues.push('Dim text on background fails WCAG standards');
  }
  if (accentOnBgLevel === WcagLevel.FAIL) {
    issues.push('Accent color on background fails WCAG standards');
  }

  // Determine overall level
  const levels = [textOnBgLevel, textOnBgAltLevel, textDimOnBgLevel, accentOnBgLevel];
  const hasFailures = levels.includes(WcagLevel.FAIL);
  const allAAA = levels.every(level => level === WcagLevel.AAA);

  let overall: WcagLevel;
  if (hasFailures) {
    overall = WcagLevel.FAIL;
  } else if (allAAA) {
    overall = WcagLevel.AAA;
  } else {
    overall = WcagLevel.AA;
  }

  return {
    textOnBg: { ratio: textOnBg, level: textOnBgLevel },
    textOnBgAlt: { ratio: textOnBgAlt, level: textOnBgAltLevel },
    textDimOnBg: { ratio: textDimOnBg, level: textDimOnBgLevel },
    accentOnBg: { ratio: accentOnBg, level: accentOnBgLevel },
    overall,
    issues
  };
}