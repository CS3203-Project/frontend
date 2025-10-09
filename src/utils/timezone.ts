/**
 * International Timezone Utilities
 * 
 * This module provides robust timezone handling for international applications.
 * Specifically optimized for Sri Lanka (Asia/Colombo, UTC+5:30) but works globally.
 * 
 * Key Features:
 * - Automatic timezone detection
 * - Sri Lanka timezone support
 * - International-ready formatting
 * - Fallback error handling
 * - Debug logging capabilities
 */

export interface TimezoneConfig {
  /** Force a specific timezone (e.g., 'Asia/Colombo' for Sri Lanka) */
  forceTimezone?: string;
  /** Enable debug logging for timezone operations */
  debug?: boolean;
  /** Use 12-hour format instead of 24-hour */
  use12Hour?: boolean;
  /** Locale for formatting (default: 'en-US') */
  locale?: string;
}

/**
 * Get the user's current timezone or a forced timezone
 */
export function getTargetTimezone(config?: TimezoneConfig): string {
  if (config?.forceTimezone) {
    return config.forceTimezone;
  }
  
  // Auto-detect user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // For Sri Lankan users, ensure we're using the correct timezone
  // This handles cases where the system might detect a different timezone
  if (userTimezone === 'Asia/Colombo' || userTimezone.includes('Colombo')) {
    return 'Asia/Colombo';
  }
  
  return userTimezone;
}

/**
 * Format a timestamp for display in the correct timezone
 */
export function formatMessageTime(
  dateString: string, 
  config: TimezoneConfig = {}
): string {
  try {
    const date = new Date(dateString);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('[Timezone] Invalid date string:', dateString);
      return 'Invalid Time';
    }

    const targetTimezone = getTargetTimezone(config);
    const locale = config.locale || 'en-US';
    
    // Format time with proper timezone
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: targetTimezone,
      hour12: config.use12Hour || false
    });

    const formattedTime = formatter.format(date);
    
    // Debug logging
    if (config.debug) {
      console.log(`🕐 [Timezone] Time Conversion:
        Input: ${dateString}
        Parsed UTC: ${date.toISOString()}
        Target TZ: ${targetTimezone}
        Formatted: ${formattedTime}
        UTC Time: ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}
        Local System: ${date.toLocaleTimeString()}
      `);
    }

    return formattedTime;
  } catch (error) {
    console.error('[Timezone] Error formatting time:', error);
    
    // Fallback formatting
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: config.use12Hour || false
      });
    } catch (fallbackError) {
      console.error('[Timezone] Fallback formatting failed:', fallbackError);
      return 'Time Error';
    }
  }
}

/**
 * Format a date for display in the correct timezone
 */
export function formatMessageDate(
  dateString: string, 
  config: TimezoneConfig = {}
): string {
  try {
    const date = new Date(dateString);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('[Timezone] Invalid date string:', dateString);
      return 'Invalid Date';
    }

    const targetTimezone = getTargetTimezone(config);
    const locale = config.locale || 'en-US';
    
    // Get today and yesterday in the target timezone
    const now = new Date();
    const today = formatDateForComparison(now, targetTimezone);
    
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = formatDateForComparison(yesterdayDate, targetTimezone);
    
    // Format message date in target timezone
    const messageDate = formatDateForComparison(date, targetTimezone);
    
    // Debug logging
    if (config.debug) {
      console.log(`📅 [Timezone] Date Conversion:
        Input: ${dateString}
        Parsed UTC: ${date.toISOString()}
        Target TZ: ${targetTimezone}
        Today: ${today}
        Yesterday: ${yesterday}
        Message: ${messageDate}
      `);
    }

    // Return appropriate label
    if (messageDate === today) {
      return 'Today';
    } else if (messageDate === yesterday) {
      return 'Yesterday';
    } else {
      // Format full date
      return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: targetTimezone
      }).format(date);
    }
  } catch (error) {
    console.error('[Timezone] Error formatting date:', error);
    
    // Fallback formatting
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    } catch (fallbackError) {
      console.error('[Timezone] Fallback date formatting failed:', fallbackError);
      return 'Date Error';
    }
  }
}

/**
 * Helper function to format dates for comparison (YYYY-MM-DD format)
 */
function formatDateForComparison(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * Get timezone information for debugging
 */
export function getTimezoneInfo(): {
  userTimezone: string;
  isSriLanka: boolean;
  offset: string;
  currentTime: string;
} {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isSriLanka = userTimezone === 'Asia/Colombo' || userTimezone.includes('Colombo');
  
  const now = new Date();
  const offset = now.toTimeString().match(/GMT[+-]\d{4}/)?.[0] || 'Unknown';
  const currentTime = now.toLocaleString('en-US', { timeZone: userTimezone });
  
  return {
    userTimezone,
    isSriLanka,
    offset,
    currentTime
  };
}

/**
 * Validate that the timezone system is working correctly
 */
export function validateTimezoneSetup(): {
  isValid: boolean;
  timezone: string;
  issues: string[];
} {
  const issues: string[] = [];
  let isValid = true;
  
  try {
    const timezone = getTargetTimezone();
    
    // Test basic date parsing
    const testDate = '2025-10-06T10:30:00.000Z';
    const formatted = formatMessageTime(testDate, { debug: false });
    
    if (formatted === 'Invalid Time' || formatted === 'Time Error') {
      issues.push('Time formatting failed');
      isValid = false;
    }
    
    // Test timezone detection
    if (!timezone || timezone === 'undefined') {
      issues.push('Timezone detection failed');
      isValid = false;
    }
    
    // Check for Sri Lanka specifically
    if (timezone === 'Asia/Colombo') {
      console.log('✅ [Timezone] Sri Lanka timezone detected correctly');
    }
    
    return { isValid, timezone, issues };
  } catch (error) {
    issues.push(`System error: ${error}`);
    return { isValid: false, timezone: 'Unknown', issues };
  }
}

// Export commonly used configurations
export const TimezoneConfigs = {
  // For Sri Lankan users - force Asia/Colombo timezone
  sriLanka: {
    forceTimezone: 'Asia/Colombo',
    debug: false,
    use12Hour: false,
    locale: 'en-US'
  } as TimezoneConfig,
  
  // For debugging timezone issues
  debug: {
    debug: true,
    use12Hour: false,
    locale: 'en-US'
  } as TimezoneConfig,
  
  // For 12-hour format
  twelveHour: {
    debug: false,
    use12Hour: true,
    locale: 'en-US'
  } as TimezoneConfig,
  
  // Auto-detect user timezone (default)
  auto: {
    debug: false,
    use12Hour: false,
    locale: 'en-US'
  } as TimezoneConfig
};