const metrics = {
  requests_total: 0,
  requests_error: 0,
};

export function recordRequest(success: boolean) {
  metrics.requests_total++;
  if (!success) metrics.requests_error++;
}

export function getMetrics() {
  return metrics;
}
