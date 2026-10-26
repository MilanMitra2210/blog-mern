import { Response } from 'express';

export class ApiResponse {
  static success<T = any>(
    res: Response,
    data: T = null as any,
    detail: string = 'Operation successful',
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      detail,
      data,
    });
  }

  static paginated<T = any>(
    res: Response,
    items: T[],
    total: number,
    page: number | string = 1,
    limit: number | string = 10,
    detail: string = 'Items retrieved successfully',
    statusCode: number = 200
  ): Response {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 10);
    const totalPages = Math.ceil(total / l) || 1;

    return res.status(statusCode).json({
      success: true,
      detail,
      data: {
        items,
        total,
        page: p,
        limit: l,
        totalPages,
      },
    });
  }

  static error(
    res: Response,
    detail: string = 'Internal Server Error',
    statusCode: number = 500,
    errors: any = null
  ): Response {
    return res.status(statusCode).json({
      success: false,
      detail,
      errors: errors || undefined,
      data: null,
    });
  }
}
