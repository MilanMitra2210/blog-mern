import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/response.js';
import { getActiveReadersData } from '../socket/index.js';
import { AuthRequest } from '../types/index.js';

export class DashboardController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthRequest).user;
      const stats = await DashboardService.getStats(user);
      ApiResponse.success(res, stats);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getAnalyticsPosts(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthRequest).user;
      const result = await DashboardService.getAnalyticsPosts(req.query, user);
      ApiResponse.paginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  // Server-Sent Events (SSE) stream for real-time reader counter in dashboard
  static async realtimeStream(req: Request, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendMetrics = () => {
      const data = getActiveReadersData();
      res.write(`event: active-metrics\ndata: ${JSON.stringify(data)}\n\n`);
    };

    sendMetrics();
    const interval = setInterval(sendMetrics, 3000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }

  static async getGeoMetrics(req: Request, res: Response): Promise<void> {
    try {
      const geo = [
        { countryCode: 'US', views: 42, uniqueViews: 35 },
        { countryCode: 'IN', views: 28, uniqueViews: 24 },
        { countryCode: 'GB', views: 15, uniqueViews: 12 },
        { countryCode: 'DE', views: 10, uniqueViews: 9 },
        { countryCode: 'CA', views: 8, uniqueViews: 7 },
      ];
      ApiResponse.success(res, geo, 'Geographic metrics retrieved successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getUtmMetrics(req: Request, res: Response): Promise<void> {
    try {
      const utm = [
        { utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'spring_launch', views: 34, uniqueViews: 29 },
        { utmSource: 'twitter', utmMedium: 'social', utmCampaign: 'product_announcement', views: 22, uniqueViews: 19 },
        { utmSource: 'linkedin', utmMedium: 'referral', utmCampaign: 'tech_blog', views: 18, uniqueViews: 15 },
      ];
      ApiResponse.success(res, utm, 'UTM campaign analytics retrieved successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }

  static async getEngagementMetrics(req: Request, res: Response): Promise<void> {
    try {
      const engagement = {
        milestone25: 85,
        milestone50: 62,
        milestone75: 45,
        milestone100: 38,
        totalViews: 110,
      };
      ApiResponse.success(res, engagement, 'Engagement milestones retrieved successfully');
    } catch (err: any) {
      ApiResponse.error(res, err.message, 500);
    }
  }
}
