// Enhanced timezone handling utilities for preorder scheduling
export interface TimezoneConfig {
  merchantTimezone: string
  customerTimezone: string
  displayTimezone: 'merchant' | 'customer' | 'auto'
}

export interface ScheduleDate {
  date: string
  timezone: string
  displayFormat?: string
}

// Get merchant timezone from shop settings
export async function getMerchantTimezone(shop: string, accessToken: string): Promise<string> {
  try {
    const response = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch shop info: ${response.statusText}`)
    }

    const data = await response.json()
    return data.shop?.iana_timezone || 'UTC'
  } catch (error) {
    console.error('Error fetching merchant timezone:', error)
    return 'UTC'
  }
}

// Get customer timezone from browser
export function getCustomerTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch (error) {
    console.error('Error detecting customer timezone:', error)
    return 'UTC'
  }
}

// Convert date between timezones
export function convertTimezone(
  date: Date | string,
  fromTimezone: string,
  toTimezone: string
): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Create a date in the source timezone
  const sourceDate = new Date(dateObj.toLocaleString('en-US', { timeZone: fromTimezone }))
  
  // Get the offset difference
  const sourceOffset = new Date().getTimezoneOffset() - sourceDate.getTimezoneOffset()
  
  // Convert to target timezone
  const targetDate = new Date(dateObj.getTime() + (sourceOffset * 60000))
  
  return new Date(targetDate.toLocaleString('en-US', { timeZone: toTimezone }))
}

// Format date with timezone information
export function formatDateWithTimezone(
  date: Date | string,
  timezone: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short',
    ...options
  }

  return dateObj.toLocaleDateString(locale, defaultOptions)
}

// Check if date is in the future considering timezone
export function isDateInFuture(
  date: Date | string,
  timezone: string = 'UTC'
): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  // Convert both dates to the same timezone for comparison
  const targetDate = convertTimezone(dateObj, 'UTC', timezone)
  const currentDate = convertTimezone(now, 'UTC', timezone)
  
  return targetDate > currentDate
}

// Check if date is in the past considering timezone
export function isDateInPast(
  date: Date | string,
  timezone: string = 'UTC'
): boolean {
  return !isDateInFuture(date, timezone)
}

// Get time remaining until a date in a specific timezone
export function getTimeRemaining(
  targetDate: Date | string,
  timezone: string = 'UTC'
): {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
} {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const now = new Date()
  
  // Convert to the same timezone
  const targetInTimezone = convertTimezone(target, 'UTC', timezone)
  const nowInTimezone = convertTimezone(now, 'UTC', timezone)
  
  const total = targetInTimezone.getTime() - nowInTimezone.getTime()
  
  if (total <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true
    }
  }
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    expired: false
  }
}

// Validate schedule dates
export function validateScheduleDates(
  startDate?: string,
  endDate?: string,
  deliveryDate?: string,
  timezone: string = 'UTC'
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      errors.push('Start date must be before end date')
    }
  }
  
  if (deliveryDate && startDate) {
    const delivery = new Date(deliveryDate)
    const start = new Date(startDate)
    
    if (delivery < start) {
      errors.push('Delivery date should be after or equal to start date')
    }
  }
  
  // Check if dates are reasonable (not too far in the future)
  const maxFutureYears = 5
  const maxFutureDate = new Date()
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + maxFutureYears)
  
  if (startDate && new Date(startDate) > maxFutureDate) {
    errors.push(`Start date cannot be more than ${maxFutureYears} years in the future`)
  }
  
  if (endDate && new Date(endDate) > maxFutureDate) {
    errors.push(`End date cannot be more than ${maxFutureYears} years in the future`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Create timezone-aware schedule configuration
export function createScheduleConfig(
  startDate?: string,
  endDate?: string,
  deliveryDate?: string,
  merchantTimezone: string = 'UTC',
  deliveryNote?: string
): {
  preorder_start_date?: string
  preorder_end_date?: string
  estimated_delivery_date?: string
  delivery_note?: string
  merchant_timezone: string
  schedule_valid: boolean
  schedule_errors: string[]
} {
  const validation = validateScheduleDates(startDate, endDate, deliveryDate, merchantTimezone)
  
  return {
    preorder_start_date: startDate,
    preorder_end_date: endDate,
    estimated_delivery_date: deliveryDate,
    delivery_note: deliveryNote,
    merchant_timezone: merchantTimezone,
    schedule_valid: validation.valid,
    schedule_errors: validation.errors
  }
}

// Get current status based on schedule and timezone
export function getCurrentScheduleStatus(
  config: {
    preorder_start_date?: string
    preorder_end_date?: string
    preorder_type?: string
    enabled?: boolean
    merchant_timezone?: string
  },
  customerTimezone?: string
): 'coming_soon' | 'preorder' | 'normal' | 'expired' {
  if (!config.enabled) {
    return 'normal'
  }
  
  const timezone = customerTimezone || config.merchant_timezone || 'UTC'
  const now = new Date()
  
  // Convert dates to customer timezone for accurate comparison
  const startDate = config.preorder_start_date ? 
    convertTimezone(new Date(config.preorder_start_date), config.merchant_timezone || 'UTC', timezone) : null
  const endDate = config.preorder_end_date ? 
    convertTimezone(new Date(config.preorder_end_date), config.merchant_timezone || 'UTC', timezone) : null
  
  // Check if we're before the start date
  if (startDate && now < startDate) {
    return 'coming_soon'
  }
  
  // Check if we're after the end date
  if (endDate && now > endDate) {
    return 'expired'
  }
  
  // Check preorder type
  if (config.preorder_type === 'always') {
    return 'preorder'
  }
  
  if (config.preorder_type === 'coming_soon') {
    return startDate && now >= startDate ? 'preorder' : 'coming_soon'
  }
  
  return 'preorder'
}

// Performance-optimized countdown timer
export class OptimizedCountdownTimer {
  private targetDate: Date
  private timezone: string
  private callback: (timeRemaining: ReturnType<typeof getTimeRemaining>) => void
  private interval: NodeJS.Timeout | null = null
  private lastUpdate: number = 0
  private updateFrequency: number = 1000 // 1 second default
  
  constructor(
    targetDate: Date | string,
    timezone: string,
    callback: (timeRemaining: ReturnType<typeof getTimeRemaining>) => void,
    updateFrequency: number = 1000
  ) {
    this.targetDate = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
    this.timezone = timezone
    this.callback = callback
    this.updateFrequency = updateFrequency
  }
  
  start(): void {
    this.update() // Initial update
    
    this.interval = setInterval(() => {
      this.update()
    }, this.updateFrequency)
  }
  
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
  
  private update(): void {
    const now = Date.now()
    
    // Throttle updates to prevent excessive DOM manipulation
    if (now - this.lastUpdate < this.updateFrequency - 50) {
      return
    }
    
    const timeRemaining = getTimeRemaining(this.targetDate, this.timezone)
    
    if (timeRemaining.expired) {
      this.stop()
    }
    
    this.callback(timeRemaining)
    this.lastUpdate = now
  }
  
  // Adjust update frequency based on time remaining
  adjustFrequency(): void {
    const timeRemaining = getTimeRemaining(this.targetDate, this.timezone)
    
    if (timeRemaining.total > 24 * 60 * 60 * 1000) {
      // More than 24 hours: update every minute
      this.updateFrequency = 60000
    } else if (timeRemaining.total > 60 * 60 * 1000) {
      // More than 1 hour: update every 10 seconds
      this.updateFrequency = 10000
    } else {
      // Less than 1 hour: update every second
      this.updateFrequency = 1000
    }
    
    // Restart with new frequency
    if (this.interval) {
      this.stop()
      this.start()
    }
  }
}
