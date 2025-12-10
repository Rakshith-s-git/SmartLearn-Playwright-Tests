/**
 * Autonomous Framework Configuration
 * 
 * Centralized configuration for all autonomous testing features
 * Includes scheduling, monitoring, reporting, and data management settings
 */

module.exports = {
  // ==================== SCHEDULING ====================
  scheduling: {
    // Cron-based test schedules
    enabled: true,
    jobs: [
      {
        name: 'hourly-smoke-tests',
        cronExpression: '0 * * * *', // Every hour
        testType: 'ui',
        notifyOnFailure: true,
      },
      {
        name: 'daily-full-tests',
        cronExpression: '0 0 * * *', // Daily at midnight
        testType: 'all',
        notifyOnFailure: true,
      },
      {
        name: 'api-tests',
        cronExpression: '0 */6 * * *', // Every 6 hours
        testType: 'api',
        notifyOnFailure: true,
      },
      {
        name: 'mobile-tests',
        cronExpression: '0 2 * * *', // Daily at 2 AM
        testType: 'mobile',
        notifyOnFailure: true,
      },
    ],
  },

  // ==================== PERFORMANCE MONITORING ====================
  performance: {
    enabled: true,
    monitoring: {
      enabled: true,
      trackMemory: true,
      trackExecutionTime: true,
    },
    thresholds: {
      maxTestDuration: 30000, // 30 seconds
      maxMemoryUsage: 500, // MB
      maxResponseTime: 5000, // 5 seconds
    },
    optimization: {
      enabled: true,
      analyzeBottlenecks: true,
      suggestOptimizations: true,
    },
  },

  // ==================== REPORTING ====================
  reporting: {
    enabled: true,
    dashboard: {
      enabled: true,
      autoGenerate: true,
      outputDir: 'test-reports',
      retentionDays: 30,
    },
    errorAnalysis: {
      enabled: true,
      classifyErrors: true,
      generateRecommendations: true,
    },
    formats: {
      html: true,
      json: true,
      junit: false,
    },
  },

  // ==================== DATA MANAGEMENT ====================
  data: {
    enabled: true,
    factory: {
      enabled: true,
      useFaker: true,
      generateDynamicData: true,
    },
    cleanup: {
      enabled: true,
      autoCleanupAfterTest: true,
      cleanupStrategies: {
        users: 'delete',
        products: 'archive',
        orders: 'delete',
      },
    },
  },

  // ==================== SELF-HEALING ====================
  selfHealing: {
    enabled: true,
    selectorManagement: {
      enabled: true,
      cacheSucessfulSelectors: true,
      generateFallbacks: true,
    },
    retryStrategy: {
      enabled: true,
      maxRetries: 3,
      initialDelay: 500,
      backoffMultiplier: 2,
      retryableErrors: [
        'timeout',
        'Timeout',
        'Navigation',
        'ERR_NAME_NOT_RESOLVED',
        'net::ERR',
      ],
    },
    smartWaiting: {
      enabled: true,
      waitForVisibility: true,
      waitForStability: true,
      waitForNetworkIdle: true,
    },
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    enabled: true,
    slack: {
      enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notifyOnError: true,
      notifyOnSlowTests: true,
    },
    email: {
      enabled: process.env.EMAIL_RECIPIENTS ? true : false,
      recipients: process.env.EMAIL_RECIPIENTS?.split(',') || [],
      notifyOnFailure: true,
    },
    console: {
      enabled: true,
      verbose: false,
    },
  },

  // ==================== ADVANCED SETTINGS ====================
  advanced: {
    enableDetailedLogging: process.env.DEBUG ? true : false,
    generateCoverageReports: false,
    enableVideoRecording: false,
    enableScreenshots: true,
    parallelExecution: {
      enabled: true,
      maxWorkers: 4,
    },
    testTimeout: {
      ui: 30000,
      api: 15000,
      mobile: 40000,
    },
  },

  // ==================== ENVIRONMENT ====================
  environment: {
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
    apiBaseUrl: process.env.API_BASE_URL || 'https://www.saucedemo.com',
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  },
};
