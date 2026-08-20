const logger = require('../../utils/logger');

// Local storage for performance metrics
const latencyStore = [];

/**
 * Record transaction latency metrics
 */
function recordLatency(metricName, durationMs) {
  const logObj = {
    metric: metricName,
    latencyMs: durationMs,
    timestamp: new Date().toISOString()
  };
  
  latencyStore.push(logObj);
  
  // Cap memory size of metrics store to prevent memory leaks (keep latest 500 records)
  if (latencyStore.length > 500) {
    latencyStore.shift();
  }

  logger.info(`[Telemetry Metrics] Metric: "${metricName}" took ${durationMs}ms`);
}

/**
 * Fetch compiled metrics averages
 */
function getMetricsSummary() {
  const summary = {};
  
  // Group by metric name
  latencyStore.forEach((record) => {
    if (!summary[record.metric]) {
      summary[record.metric] = { totalMs: 0, count: 0 };
    }
    summary[record.metric].totalMs += record.latencyMs;
    summary[record.metric].count += 1;
  });

  const finalAverages = {};
  for (const [metric, data] of Object.entries(summary)) {
    finalAverages[metric] = {
      avgLatencyMs: Math.round(data.totalMs / data.count),
      totalRequestsCount: data.count
    };
  }

  return {
    recordedMetricsCount: latencyStore.length,
    averages: finalAverages
  };
}

module.exports = {
  recordLatency,
  getMetricsSummary
};
