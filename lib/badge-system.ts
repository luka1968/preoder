// Enhanced Badge System with responsive design and theme compatibility
export interface BadgeConfig {
  text: string
  color: string
  backgroundColor: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  size: 'small' | 'medium' | 'large'
  style: 'rounded' | 'square' | 'pill'
  animation: 'none' | 'pulse' | 'bounce' | 'fade'
  zIndex: number
  customCSS?: string
}

export interface BadgeThemeConfig {
  containerSelectors: string[]
  imageSelectors: string[]
  fallbackContainer: string
  cssOverrides: { [key: string]: string }
  responsiveBreakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
}

// Default theme configurations for popular Shopify themes
export const THEME_CONFIGS: { [themeName: string]: BadgeThemeConfig } = {
  'dawn': {
    containerSelectors: ['.product__media', '.product-media'],
    imageSelectors: ['.product__media img', '.product-media img'],
    fallbackContainer: '.product',
    cssOverrides: {
      'position': 'absolute',
      'z-index': '10'
    },
    responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 }
  },
  'debut': {
    containerSelectors: ['.product-single__photos', '.product-photos'],
    imageSelectors: ['.product-single__photo img', '.product-photo img'],
    fallbackContainer: '.product-single',
    cssOverrides: {
      'position': 'absolute',
      'z-index': '10'
    },
    responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 }
  },
  'brooklyn': {
    containerSelectors: ['.product__photos', '.product-photos'],
    imageSelectors: ['.product__photo img', '.product-photo img'],
    fallbackContainer: '.product',
    cssOverrides: {
      'position': 'absolute',
      'z-index': '10'
    },
    responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 }
  },
  'impulse': {
    containerSelectors: ['.product-image-main', '.product-images'],
    imageSelectors: ['.product-image-main img', '.product-images img'],
    fallbackContainer: '.product-single',
    cssOverrides: {
      'position': 'absolute',
      'z-index': '10'
    },
    responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 }
  },
  'default': {
    containerSelectors: [
      '.product-single__photos',
      '.product__photos',
      '.product-photos',
      '.product-images',
      '.product-image-main',
      '.product__media',
      '.product-media',
      '.product-gallery',
      '.product__gallery'
    ],
    imageSelectors: [
      '.product-single__photo img',
      '.product__photo img',
      '.product-photo img',
      '.product-image img',
      '.product__media img',
      '.product-media img',
      '.product-gallery img',
      '.product__gallery img'
    ],
    fallbackContainer: '.product, .product-single, .product-details',
    cssOverrides: {},
    responsiveBreakpoints: { mobile: 768, tablet: 1024, desktop: 1200 }
  }
}

export class EnhancedBadgeSystem {
  private badgeElement: HTMLElement | null = null
  private config: BadgeConfig
  private themeConfig: BadgeThemeConfig
  private container: HTMLElement | null = null

  constructor(config: BadgeConfig, themeName: string = 'default') {
    this.config = config
    this.themeConfig = THEME_CONFIGS[themeName] || THEME_CONFIGS['default']
  }

  // Create and insert badge
  create(): HTMLElement | null {
    try {
      // Find suitable container
      this.container = this.findContainer()
      if (!this.container) {
        console.warn('Could not find suitable container for badge')
        return null
      }

      // Create badge element
      this.badgeElement = this.createBadgeElement()
      
      // Apply positioning and styling
      this.applyStyles()
      
      // Make container relative if needed
      this.prepareContainer()
      
      // Insert badge
      this.container.appendChild(this.badgeElement)
      
      // Add responsive behavior
      this.addResponsiveBehavior()
      
      // Add animation if specified
      this.addAnimation()

      return this.badgeElement
    } catch (error) {
      console.error('Error creating badge:', error)
      return null
    }
  }

  // Find the best container for the badge
  private findContainer(): HTMLElement | null {
    // Try theme-specific selectors first
    for (const selector of this.themeConfig.containerSelectors) {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        return element
      }
    }

    // Try fallback container
    const fallback = document.querySelector(this.themeConfig.fallbackContainer) as HTMLElement
    if (fallback) {
      return fallback
    }

    // Last resort: find any product-related container
    const genericSelectors = [
      '.product',
      '.product-single',
      '.product-details',
      '.product-info',
      '[data-product]'
    ]

    for (const selector of genericSelectors) {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        return element
      }
    }

    return null
  }

  // Create the badge HTML element
  private createBadgeElement(): HTMLElement {
    const badge = document.createElement('div')
    badge.className = 'preorder-badge enhanced-badge'
    badge.textContent = this.config.text
    
    // Add data attributes for styling
    badge.setAttribute('data-position', this.config.position)
    badge.setAttribute('data-size', this.config.size)
    badge.setAttribute('data-style', this.config.style)
    badge.setAttribute('data-animation', this.config.animation)

    return badge
  }

  // Apply styles to the badge
  private applyStyles(): void {
    if (!this.badgeElement) return

    const styles: { [key: string]: string } = {
      'position': 'absolute',
      'z-index': this.config.zIndex.toString(),
      'background-color': this.config.backgroundColor,
      'color': this.config.color,
      'font-weight': 'bold',
      'text-align': 'center',
      'line-height': '1',
      'white-space': 'nowrap',
      'user-select': 'none',
      'pointer-events': 'none',
      'font-family': 'inherit',
      'box-sizing': 'border-box',
      ...this.getPositionStyles(),
      ...this.getSizeStyles(),
      ...this.getStyleStyles(),
      ...this.themeConfig.cssOverrides
    }

    // Apply custom CSS if provided
    if (this.config.customCSS) {
      const customStyles = this.parseCustomCSS(this.config.customCSS)
      Object.assign(styles, customStyles)
    }

    // Apply all styles
    Object.entries(styles).forEach(([property, value]) => {
      this.badgeElement!.style.setProperty(property, value, 'important')
    })
  }

  // Get position-specific styles
  private getPositionStyles(): { [key: string]: string } {
    const offset = '8px'
    
    switch (this.config.position) {
      case 'top-left':
        return { 'top': offset, 'left': offset }
      case 'top-right':
        return { 'top': offset, 'right': offset }
      case 'bottom-left':
        return { 'bottom': offset, 'left': offset }
      case 'bottom-right':
        return { 'bottom': offset, 'right': offset }
      case 'center':
        return { 
          'top': '50%', 
          'left': '50%', 
          'transform': 'translate(-50%, -50%)' 
        }
      default:
        return { 'top': offset, 'right': offset }
    }
  }

  // Get size-specific styles
  private getSizeStyles(): { [key: string]: string } {
    switch (this.config.size) {
      case 'small':
        return {
          'padding': '4px 8px',
          'font-size': '10px',
          'min-width': '40px'
        }
      case 'large':
        return {
          'padding': '12px 16px',
          'font-size': '16px',
          'min-width': '80px'
        }
      case 'medium':
      default:
        return {
          'padding': '8px 12px',
          'font-size': '12px',
          'min-width': '60px'
        }
    }
  }

  // Get style-specific styles
  private getStyleStyles(): { [key: string]: string } {
    switch (this.config.style) {
      case 'square':
        return { 'border-radius': '0' }
      case 'pill':
        return { 'border-radius': '50px' }
      case 'rounded':
      default:
        return { 'border-radius': '4px' }
    }
  }

  // Parse custom CSS string
  private parseCustomCSS(cssString: string): { [key: string]: string } {
    const styles: { [key: string]: string } = {}
    const declarations = cssString.split(';')
    
    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim())
      if (property && value) {
        styles[property] = value
      }
    })
    
    return styles
  }

  // Prepare container for badge positioning
  private prepareContainer(): void {
    if (!this.container) return

    const computedStyle = window.getComputedStyle(this.container)
    if (computedStyle.position === 'static') {
      this.container.style.position = 'relative'
    }
  }

  // Add responsive behavior
  private addResponsiveBehavior(): void {
    if (!this.badgeElement) return

    const updateResponsiveStyles = () => {
      const width = window.innerWidth
      const { mobile, tablet } = this.themeConfig.responsiveBreakpoints

      if (width <= mobile) {
        // Mobile styles
        this.badgeElement!.style.setProperty('font-size', '10px', 'important')
        this.badgeElement!.style.setProperty('padding', '4px 6px', 'important')
      } else if (width <= tablet) {
        // Tablet styles
        this.badgeElement!.style.setProperty('font-size', '11px', 'important')
        this.badgeElement!.style.setProperty('padding', '6px 8px', 'important')
      } else {
        // Desktop styles - use original size
        const originalStyles = this.getSizeStyles()
        this.badgeElement!.style.setProperty('font-size', originalStyles['font-size'], 'important')
        this.badgeElement!.style.setProperty('padding', originalStyles['padding'], 'important')
      }
    }

    // Initial update
    updateResponsiveStyles()

    // Listen for resize events
    window.addEventListener('resize', updateResponsiveStyles)
  }

  // Add animation effects
  private addAnimation(): void {
    if (!this.badgeElement || this.config.animation === 'none') return

    const animationStyles: { [key: string]: string } = {}

    switch (this.config.animation) {
      case 'pulse':
        animationStyles['animation'] = 'preorder-pulse 2s infinite'
        break
      case 'bounce':
        animationStyles['animation'] = 'preorder-bounce 1s infinite'
        break
      case 'fade':
        animationStyles['animation'] = 'preorder-fade 3s infinite'
        break
    }

    Object.entries(animationStyles).forEach(([property, value]) => {
      this.badgeElement!.style.setProperty(property, value, 'important')
    })

    // Add CSS animations if not already present
    this.addAnimationCSS()
  }

  // Add CSS animations to document
  private addAnimationCSS(): void {
    const existingStyle = document.getElementById('preorder-badge-animations')
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = 'preorder-badge-animations'
    style.textContent = `
      @keyframes preorder-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      @keyframes preorder-bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-5px); }
        60% { transform: translateY(-3px); }
      }
      
      @keyframes preorder-fade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `
    
    document.head.appendChild(style)
  }

  // Update badge text
  updateText(newText: string): void {
    if (this.badgeElement) {
      this.badgeElement.textContent = newText
      this.config.text = newText
    }
  }

  // Update badge color
  updateColor(color: string, backgroundColor: string): void {
    if (this.badgeElement) {
      this.badgeElement.style.setProperty('color', color, 'important')
      this.badgeElement.style.setProperty('background-color', backgroundColor, 'important')
      this.config.color = color
      this.config.backgroundColor = backgroundColor
    }
  }

  // Remove badge
  remove(): void {
    if (this.badgeElement && this.badgeElement.parentNode) {
      this.badgeElement.parentNode.removeChild(this.badgeElement)
      this.badgeElement = null
    }
  }

  // Check if badge is visible
  isVisible(): boolean {
    return this.badgeElement !== null && document.contains(this.badgeElement)
  }
}

// Utility function to detect current theme
export function detectShopifyTheme(): string {
  // Check for theme-specific classes or attributes
  const themeIndicators = {
    'dawn': ['.shopify-section', '.color-scheme'],
    'debut': ['.site-header', '.product-single'],
    'brooklyn': ['.site-nav', '.product__photos'],
    'impulse': ['.header-wrapper', '.product-image-main']
  }

  for (const [theme, selectors] of Object.entries(themeIndicators)) {
    if (selectors.every(selector => document.querySelector(selector))) {
      return theme
    }
  }

  // Check meta tags
  const themeNameMeta = document.querySelector('meta[name="theme-name"]')
  if (themeNameMeta) {
    const themeName = themeNameMeta.getAttribute('content')?.toLowerCase()
    if (themeName && THEME_CONFIGS[themeName]) {
      return themeName
    }
  }

  return 'default'
}

// Factory function to create badges with default configurations
export function createPreorderBadge(
  text: string,
  type: 'preorder' | 'coming_soon' | 'out_of_stock' = 'preorder'
): EnhancedBadgeSystem {
  const configs = {
    'preorder': {
      text,
      color: '#ffffff',
      backgroundColor: '#ff6b35',
      position: 'top-right' as const,
      size: 'medium' as const,
      style: 'rounded' as const,
      animation: 'none' as const,
      zIndex: 1000
    },
    'coming_soon': {
      text,
      color: '#ffffff',
      backgroundColor: '#6c757d',
      position: 'top-right' as const,
      size: 'medium' as const,
      style: 'rounded' as const,
      animation: 'pulse' as const,
      zIndex: 1000
    },
    'out_of_stock': {
      text,
      color: '#ffffff',
      backgroundColor: '#dc3545',
      position: 'top-right' as const,
      size: 'medium' as const,
      style: 'rounded' as const,
      animation: 'none' as const,
      zIndex: 1000
    }
  }

  const theme = detectShopifyTheme()
  return new EnhancedBadgeSystem(configs[type], theme)
}
