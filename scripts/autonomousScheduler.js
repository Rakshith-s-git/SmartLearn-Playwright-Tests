/**
 * AutonomousTestScheduler - Schedule and manage autonomous test execution
 * 
 * Features:
 * - Cron job scheduling
 * - Test run orchestration
 * - Report generation and publishing
 * - Slack notifications
 * - Test result tracking
 */

const cron = require('node-cron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutonomousTestScheduler {
  constructor(config = {}) {
    this.config = {
      testCommand: 'npm test',
      reportsDir: 'test-reports',
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      emailRecipients: process.env.EMAIL_RECIPIENTS?.split(',') || [],
      ...config,
    };

    this.jobs = new Map();
    this.executionHistory = [];
  }

  /**
   * Schedule tests to run at specific cron expression
   * @param {string} jobName - Job identifier
   * @param {string} cronExpression - Cron expression (e.g., '0 * * * *' for hourly)
   * @param {string} testType - Type of tests to run ('all', 'ui', 'api', 'mobile')
   */
  scheduleTests(jobName, cronExpression, testType = 'all') {
    try {
      // Validate cron expression
      const job = cron.schedule(cronExpression, async () => {
        console.log(
          `\n🚀 [${jobName}] Test execution started at ${new Date().toISOString()}`
        );
        await this.executeTests(testType, jobName);
      });

      this.jobs.set(jobName, {
        job,
        cronExpression,
        testType,
        createdAt: new Date().toISOString(),
      });

      console.log(`✓ Job scheduled: ${jobName}`);
      console.log(`  Cron: ${cronExpression}`);
      console.log(`  Test Type: ${testType}`);

      return job;
    } catch (error) {
      console.error(`✗ Failed to schedule job "${jobName}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute tests based on type
   * @param {string} testType - 'all', 'ui', 'api', 'mobile'
   * @param {string} jobName - Job identifier
   */
  async executeTests(testType = 'all', jobName = 'manual') {
    const startTime = Date.now();
    let command = this.config.testCommand;

    // Build test command based on type
    switch (testType) {
      case 'ui':
        command += ' -- tests/ui/';
        break;
      case 'api':
        command += ' -- tests/api/';
        break;
      case 'mobile':
        command += ' -- tests/mobile/';
        break;
      default:
        // Run all tests
    }

    try {
      console.log(`📋 Running: ${command}`);

      const result = await this.runCommand(command);
      const duration = Date.now() - startTime;

      const execution = {
        jobName,
        testType,
        status: result.success ? 'PASSED' : 'FAILED',
        duration,
        timestamp: new Date().toISOString(),
        output: result.stdout,
        error: result.stderr,
      };

      this.executionHistory.push(execution);

      // Generate report
      await this.generateReport(execution);

      // Send notifications
      if (result.success) {
        await this.notifySuccess(execution);
      } else {
        await this.notifyFailure(execution);
      }

      console.log(
        `✓ Test execution completed: ${execution.status} (${(duration / 1000).toFixed(2)}s)`
      );

      return execution;
    } catch (error) {
      console.error(`✗ Test execution failed: ${error.message}`);

      const execution = {
        jobName,
        testType,
        status: 'ERROR',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error.message,
      };

      this.executionHistory.push(execution);
      await this.notifyError(execution);

      throw error;
    }
  }

  /**
   * Run shell command and return result
   */
  async runCommand(command) {
    return new Promise((resolve) => {
      const process = spawn(command, {
        shell: true,
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
        process.stdout?.write(data);
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
        process.stderr?.write(data);
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          code,
          stdout,
          stderr,
        });
      });
    });
  }

  /**
   * Generate execution report
   */
  async generateReport(execution) {
    const reportPath = path.join(
      this.config.reportsDir,
      `execution-${execution.timestamp.split('T')[0]}.json`
    );

    // Ensure directory exists
    if (!fs.existsSync(this.config.reportsDir)) {
      fs.mkdirSync(this.config.reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(execution, null, 2));
    console.log(`📊 Report saved: ${reportPath}`);
  }

  /**
   * Send Slack notification on success
   */
  async notifySuccess(execution) {
    if (!this.config.slackWebhook) return;

    const payload = {
      text: `✅ Tests Passed: ${execution.jobName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Test Execution Successful',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Job:* ${execution.jobName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Type:* ${execution.testType}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:* ${(execution.duration / 1000).toFixed(2)}s`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:* ${execution.timestamp}`,
            },
          ],
        },
      ],
    };

    await this.sendSlackNotification(payload);
  }

  /**
   * Send Slack notification on failure
   */
  async notifyFailure(execution) {
    if (!this.config.slackWebhook) return;

    const payload = {
      text: `❌ Tests Failed: ${execution.jobName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '❌ Test Execution Failed',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Job:* ${execution.jobName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Type:* ${execution.testType}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:* ${(execution.duration / 1000).toFixed(2)}s`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:* ${execution.timestamp}`,
            },
          ],
        },
      ],
    };

    await this.sendSlackNotification(payload);
  }

  /**
   * Send Slack notification on error
   */
  async notifyError(execution) {
    if (!this.config.slackWebhook) return;

    const payload = {
      text: `⚠️ Test Execution Error: ${execution.jobName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ Test Execution Error',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error:* ${execution.error}`,
          },
        },
      ],
    };

    await this.sendSlackNotification(payload);
  }

  /**
   * Send notification to Slack
   */
  async sendSlackNotification(payload) {
    try {
      const fetch = (await import('node-fetch')).default;
      
      await fetch(this.config.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('✓ Slack notification sent');
    } catch (error) {
      console.warn(`⚠ Failed to send Slack notification: ${error.message}`);
    }
  }

  /**
   * Get scheduled jobs
   */
  getScheduledJobs() {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      ...job,
    }));
  }

  /**
   * Stop a scheduled job
   */
  stopJob(jobName) {
    const job = this.jobs.get(jobName);

    if (!job) {
      console.warn(`Job not found: ${jobName}`);
      return false;
    }

    job.job.stop();
    this.jobs.delete(jobName);

    console.log(`✓ Job stopped: ${jobName}`);
    return true;
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs() {
    for (const [jobName, jobData] of this.jobs) {
      jobData.job.stop();
    }

    const count = this.jobs.size;
    this.jobs.clear();

    console.log(`✓ All ${count} job(s) stopped`);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 10) {
    return this.executionHistory.slice(-limit).reverse();
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    const stats = {
      totalExecutions: this.executionHistory.length,
      passed: 0,
      failed: 0,
      errors: 0,
      totalDuration: 0,
      averageDuration: 0,
    };

    this.executionHistory.forEach((exec) => {
      if (exec.status === 'PASSED') stats.passed++;
      else if (exec.status === 'FAILED') stats.failed++;
      else if (exec.status === 'ERROR') stats.errors++;

      stats.totalDuration += exec.duration;
    });

    stats.averageDuration =
      stats.totalExecutions > 0
        ? Math.round(stats.totalDuration / stats.totalExecutions)
        : 0;

    return stats;
  }

  /**
   * Print execution report
   */
  printExecutionReport() {
    const stats = this.getExecutionStats();

    console.log('\n=== AUTONOMOUS TEST SCHEDULER REPORT ===\n');
    console.log('Execution Statistics:');
    console.log(`  Total Executions: ${stats.totalExecutions}`);
    console.log(`  Passed: ${stats.passed}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log(`  Average Duration: ${stats.averageDuration}ms\n`);

    console.log('Scheduled Jobs:');
    this.getScheduledJobs().forEach((job) => {
      console.log(`  - ${job.name}`);
      console.log(`    Cron: ${job.cronExpression}`);
      console.log(`    Type: ${job.testType}`);
    });
  }
}

module.exports = AutonomousTestScheduler;
