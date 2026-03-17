export interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  audience: Audience;
  status: 'draft' | 'running' | 'completed' | 'stopped';
  startDate?: Date;
  endDate?: Date;
}

export interface Variant {
  id: string;
  name: string;
  weight: number; // Percentage of traffic (0-100)
  component?: React.ComponentType;
  styles?: Record<string, any>;
}

export interface Audience {
  percentage: number; // 0-100
  conditions?: AudienceCondition[];
}

export interface AudienceCondition {
  type: 'device' | 'browser' | 'location' | 'custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export class ABTestingService {
  private static instance: ABTestingService;
  private experiments: Map<string, Experiment> = new Map();
  private userVariants: Map<string, string> = new Map();

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  registerExperiment(experiment: Experiment) {
    this.experiments.set(experiment.id, experiment);
  }

  getVariant(experimentId: string, userId?: string): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check audience targeting
    if (!this.isInAudience(experiment.audience)) {
      return null;
    }

    // Get or assign variant for user
    const userKey = userId || this.getAnonymousUserId();
    let assignedVariant = this.userVariants.get(`${experimentId}:${userKey}`);

    if (!assignedVariant) {
      assignedVariant = this.assignVariant(experiment.variants);
      this.userVariants.set(`${experimentId}:${userKey}`, assignedVariant);
    }

    return experiment.variants.find(v => v.id === assignedVariant) || null;
  }

  private assignVariant(variants: Variant[]): string {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return variants[0]?.id || '';
  }

  private isInAudience(audience: Audience): boolean {
    // Check percentage
    if (Math.random() * 100 > audience.percentage) {
      return false;
    }

    // Check conditions
    if (audience.conditions) {
      return audience.conditions.every(condition =>
        this.evaluateCondition(condition)
      );
    }

    return true;
  }

  private evaluateCondition(condition: AudienceCondition): boolean {
    const { type, operator, value } = condition;

    let actualValue: any;

    switch (type) {
      case 'device':
        actualValue = this.isMobileDevice() ? 'mobile' : 'desktop';
        break;
      case 'browser':
        actualValue = this.getBrowserName();
        break;
      case 'location':
        // Would need geolocation API
        actualValue = 'unknown';
        break;
      default:
        actualValue = null;
    }

    switch (operator) {
      case 'equals':
        return actualValue === value;
      case 'contains':
        return String(actualValue).includes(String(value));
      case 'greater_than':
        return Number(actualValue) > Number(value);
      case 'less_than':
        return Number(actualValue) < Number(value);
      default:
        return false;
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
  }

  private getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'unknown';
  }

  private getAnonymousUserId(): string {
    if (typeof localStorage === 'undefined') return 'anonymous';

    let userId = localStorage.getItem('ab_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_user_id', userId);
    }
    return userId;
  }

  trackConversion(experimentId: string, variantId: string, event: string, metadata?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        event_category: 'experiment',
        event_label: `${experimentId}:${variantId}:${event}`,
        custom_parameter: JSON.stringify(metadata)
      });
    }

    // Send to analytics API
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          variantId,
          event,
          metadata,
          timestamp: Date.now()
        })
      }).catch(err => console.warn('Failed to track A/B test conversion:', err));
    }
  }

  getExperimentStats(experimentId: string) {
    // This would typically fetch from your analytics backend
    return {
      experimentId,
      totalParticipants: 0,
      variantStats: {}
    };
  }
}

export const abTesting = ABTestingService.getInstance();