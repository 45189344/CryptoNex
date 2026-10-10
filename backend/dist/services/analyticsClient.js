"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsClient = exports.AnalyticsClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class AnalyticsClient {
    serviceUrl = config_1.config.analyticsServiceUrl;
    isHealthy = false;
    constructor() {
        this.checkHealth();
    }
    async checkHealth() {
        try {
            const res = await axios_1.default.get(`${this.serviceUrl}/health`, { timeout: 1500 });
            this.isHealthy = res.data && res.data.status === 'ok';
        }
        catch {
            this.isHealthy = false;
        }
        return this.isHealthy;
    }
    async scoreAttribution(payload) {
        try {
            const res = await axios_1.default.post(`${this.serviceUrl}/analytics/score-attribution`, payload, { timeout: 3000 });
            return res.data;
        }
        catch {
            return null;
        }
    }
    async calculateGraphMetrics(payload) {
        try {
            const res = await axios_1.default.post(`${this.serviceUrl}/analytics/graph-metrics`, payload, { timeout: 3000 });
            return res.data;
        }
        catch {
            return null;
        }
    }
}
exports.AnalyticsClient = AnalyticsClient;
exports.analyticsClient = new AnalyticsClient();
