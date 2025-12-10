/**
 * TestOptimizer - Automatic Test Optimization
 * 
 * Features:
 * - Identify slow tests and bottlenecks
 * - Suggest optimizations
 * - Parallelize test execution
 * - Resource usage optimization
 * - Test dependency analysis
 */

class TestOptimizer {
  constructor() {
    this.testMetrics = new Map();
    this.optimizations = [];
    this.recommendations = [];
  }

  /**
   * Analyze test for optimization opportunities
   * @param {string} testName - Test identifier
   * @param {Object} metrics - Test metrics from PerformanceMonitor
   */
  analyzeTest(testName, metrics) {
    const analysis = {
      testName,
      duration: metrics.duration,
      startMemory: metrics.startMemory,
      endMemory: metrics.endMemory,
      memoryDelta: metrics.memoryDelta,
      optimizations: [],
      timestamp: new Date().toISOString(),
    };

    // Check for slow tests
    if (metrics.duration > 10000) {
      analysis.optimizations.push({
        type: 'SLOW_TEST',
        recommendation: 'Test takes >10s - consider splitting or optimizing',
        priority: 'HIGH',
      });
    }

    // Check for memory leaks
    if (metrics.memoryDelta > 100) {
      analysis.optimizations.push({
        type: 'MEMORY_LEAK',
        recommendation: 'Test uses >100MB - check for unfreed resources',
        priority: 'HIGH',
      });
    }

    // Check for redundant waits
    if (this.hasRedundantCheckpoints(metrics.checkpoints)) {
      analysis.optimizations.push({
        type: 'REDUNDANT_WAITS',
        recommendation: 'Remove redundant wait statements',
        priority: 'MEDIUM',
      });
    }

    this.testMetrics.set(testName, analysis);
    return analysis;
  }

  /**
   * Check for redundant checkpoints
   */
  hasRedundantCheckpoints(checkpoints) {
    if (!checkpoints || Object.keys(checkpoints).length < 2) return false;

    const durations = Object.values(checkpoints).map((cp) => cp.duration);

    // Check if consecutive waits have similar durations (likely redundant)
    for (let i = 0; i < durations.length - 1; i++) {
      const diff = Math.abs(durations[i] - durations[i + 1]);
      if (diff < 100) {
        // Similar durations suggest redundancy
        return true;
      }
    }

    return false;
  }

  /**
   * Get parallelizable test groups
   * Identifies tests that can run in parallel
   */
  getParallelizableTests(allTests) {
    const groups = [];
    const dependencies = new Map();

    // Build dependency graph (simplified)
    allTests.forEach((test) => {
      // Tests with different test data/fixtures can run in parallel
      if (!test.shared) {
        if (!groups[0]) groups[0] = [];
        groups[0].push(test);
      }
    });

    return groups;
  }

  /**
   * Suggest optimizations
   */
  suggestOptimizations() {
    const suggestions = [];

    for (const [testName, analysis] of this.testMetrics) {
      analysis.optimizations.forEach((opt) => {
        suggestions.push({
          testName,
          ...opt,
        });
      });
    }

    return suggestions.sort(
      (a, b) =>
        (b.priority === 'HIGH' ? 1 : 0) - (a.priority === 'HIGH' ? 1 : 0)
    );
  }

  /**
   * Calculate optimization potential
   */
  getOptimizationPotential() {
    if (this.testMetrics.size === 0) {
      return { message: 'No test metrics available' };
    }

    const slowTests = Array.from(this.testMetrics.values()).filter(
      (t) => t.duration > 10000
    );

    const heavyTests = Array.from(this.testMetrics.values()).filter(
      (t) => parseFloat(t.memoryDelta) > 100
    );

    const totalDuration = Array.from(this.testMetrics.values()).reduce(
      (sum, t) => sum + t.duration,
      0
    );

    // Estimate speedup from parallelization
    const estimatedSpeedup = slowTests.length * 0.3; // 30% speedup from parallelization

    return {
      slowTestCount: slowTests.length,
      heavyTestCount: heavyTests.length,
      currentTotalDuration: totalDuration,
      estimatedDurationWithOptimizations:
        totalDuration * (1 - estimatedSpeedup / 100),
      estimatedSpeedupPercent: (estimatedSpeedup / 100) * 100,
      potential: this.calculatePotential(slowTests.length, heavyTests.length),
    };
  }

  /**
   * Calculate optimization potential level
   */
  calculatePotential(slowCount, heavyCount) {
    const score = slowCount + heavyCount * 0.5;

    if (score >= 5) return 'HIGH - Major optimization opportunities';
    if (score >= 3) return 'MEDIUM - Some optimization opportunities';
    return 'LOW - Test suite is well optimized';
  }

  /**
   * Get bottleneck analysis
   */
  getBottleneckAnalysis() {
    const bottlenecks = [];

    for (const [testName, analysis] of this.testMetrics) {
      if (analysis.duration > 15000) {
        bottlenecks.push({
          testName,
          type: 'EXECUTION_TIME',
          severity: 'CRITICAL',
          value: analysis.duration,
          suggestion: 'Consider breaking into smaller tests or mocking external calls',
        });
      }

      if (parseFloat(analysis.memoryDelta) > 150) {
        bottlenecks.push({
          testName,
          type: 'MEMORY_USAGE',
          severity: 'HIGH',
          value: analysis.memoryDelta,
          suggestion: 'Clean up test data and close resources properly',
        });
      }
    }

    return bottlenecks.sort(
      (a, b) =>
        (b.severity === 'CRITICAL' ? 1 : 0) -
        (a.severity === 'CRITICAL' ? 1 : 0)
    );
  }

  /**
   * Generate optimization report
   */
  generateOptimizationReport() {
    return {
      analyzedTests: this.testMetrics.size,
      suggestions: this.suggestOptimizations(),
      potential: this.getOptimizationPotential(),
      bottlenecks: this.getBottleneckAnalysis(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Print optimization report
   */
  printOptimizationReport() {
    const report = this.generateOptimizationReport();

    console.log('\n=== TEST OPTIMIZATION REPORT ===\n');
    console.log(`Analyzed Tests: ${report.analyzedTests}\n`);

    if (report.potential.message) {
      console.log(report.potential.message);
      return;
    }

    console.log('Optimization Potential:');
    console.log(`  ${report.potential.potential}`);
    console.log(`  Slow Tests: ${report.potential.slowTestCount}`);
    console.log(`  Heavy Tests: ${report.potential.heavyTestCount}`);
    console.log(
      `  Estimated Speedup: ${report.potential.estimatedSpeedupPercent.toFixed(1)}%\n`
    );

    if (report.bottlenecks.length > 0) {
      console.log('Top Bottlenecks:');
      report.bottlenecks.slice(0, 5).forEach((bottleneck, idx) => {
        console.log(`  ${idx + 1}. ${bottleneck.testName}`);
        console.log(`     Type: ${bottleneck.type}`);
        console.log(`     Severity: ${bottleneck.severity}`);
        console.log(`     Suggestion: ${bottleneck.suggestion}`);
      });
      console.log();
    }

    if (report.suggestions.length > 0) {
      console.log('Optimization Suggestions:');
      report.suggestions.slice(0, 5).forEach((suggestion, idx) => {
        console.log(`  ${idx + 1}. ${suggestion.testName}`);
        console.log(`     ${suggestion.recommendation}`);
        console.log(`     Priority: ${suggestion.priority}`);
      });
    }
  }

  /**
   * Clear analysis
   */
  clearAnalysis() {
    this.testMetrics.clear();
    this.optimizations = [];
    this.recommendations = [];
  }
}

module.exports = TestOptimizer;
