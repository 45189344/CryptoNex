import axios from 'axios';
import { config } from '../config';

export class AnalyticsClient {
  private serviceUrl = config.analyticsServiceUrl;
  public isHealthy = false;

  constructor() {
    this.checkHealth();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.serviceUrl}/health`, { timeout: 1500 });
      this.isHealthy = res.data && res.data.status === 'ok';
    } catch {
      this.isHealthy = false;
    }
    return this.isHealthy;
  }

  async scoreAttribution(payload: any): Promise<any | null> {
    try {
      const res = await axios.post(`${this.serviceUrl}/analytics/score-attribution`, payload, { timeout: 3000 });
      return res.data;
    } catch {
      return null;
    }
  }

  async calculateGraphMetrics(payload: any): Promise<any | null> {
    try {
      const res = await axios.post(`${this.serviceUrl}/analytics/graph-metrics`, payload, { timeout: 3000 });
      return res.data;
    } catch {
      return null;
    }
  }
}

export const analyticsClient = new AnalyticsClient();
