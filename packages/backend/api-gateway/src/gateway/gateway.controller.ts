import {
  Controller,
  All,
  Req,
  Res,
  Param,
  Get,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(private readonly gatewayService: GatewayService) {}

  @Get('health')
  @ApiExcludeEndpoint()
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'List all registered microservices' })
  @ApiBearerAuth('access-token')
  async listServices() {
    const services = this.gatewayService.getServices();
    const healthChecks = await Promise.all(
      services.map((s) => this.gatewayService.checkServiceHealth(s)),
    );
    return {
      total: services.length,
      services: healthChecks,
    };
  }

  @All('auth/:path(*)')
  @ApiOperation({ summary: 'Route to Auth Service' })
  @ApiParam({ name: 'path', required: true, description: 'Auth service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('auth', req, res);
  }

  @All('rh/:path(*)')
  @ApiOperation({ summary: 'Route to RH Service' })
  @ApiParam({ name: 'path', required: true, description: 'RH service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyRh(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('rh', req, res);
  }

  @All('financial/:path(*)')
  @ApiOperation({ summary: 'Route to Financial Service' })
  @ApiParam({ name: 'path', required: true, description: 'Financial service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyFinancial(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('financial', req, res);
  }

  @All('pdv/:path(*)')
  @ApiOperation({ summary: 'Route to PDV Service' })
  @ApiParam({ name: 'path', required: true, description: 'PDV service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyPdv(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('pdv', req, res);
  }

  @All('inventory/:path(*)')
  @ApiOperation({ summary: 'Route to Inventory Service' })
  @ApiParam({ name: 'path', required: true, description: 'Inventory service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyInventory(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('inventory', req, res);
  }

  @All('crm/:path(*)')
  @ApiOperation({ summary: 'Route to CRM Service' })
  @ApiParam({ name: 'path', required: true, description: 'CRM service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyCrm(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('crm', req, res);
  }

  @All('marketing/:path(*)')
  @ApiOperation({ summary: 'Route to Marketing Service' })
  @ApiParam({ name: 'path', required: true, description: 'Marketing service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyMarketing(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('marketing', req, res);
  }

  @All('security/:path(*)')
  @ApiOperation({ summary: 'Route to Security Service' })
  @ApiParam({ name: 'path', required: true, description: 'Security service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxySecurity(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('security', req, res);
  }

  @All('monitoring/:path(*)')
  @ApiOperation({ summary: 'Route to Monitoring Service' })
  @ApiParam({ name: 'path', required: true, description: 'Monitoring service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyMonitoring(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('monitoring', req, res);
  }

  @All('cftv/:path(*)')
  @ApiOperation({ summary: 'Route to CFTV Service' })
  @ApiParam({ name: 'path', required: true, description: 'CFTV service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyCftv(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('cftv', req, res);
  }

  @All('distribution/:path(*)')
  @ApiOperation({ summary: 'Route to Distribution Service' })
  @ApiParam({ name: 'path', required: true, description: 'Distribution service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyDistribution(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('distribution', req, res);
  }

  @All('bi/:path(*)')
  @ApiOperation({ summary: 'Route to BI Service' })
  @ApiParam({ name: 'path', required: true, description: 'BI service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyBi(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('bi', req, res);
  }

  @All('ai/:path(*)')
  @ApiOperation({ summary: 'Route to AI Service' })
  @ApiParam({ name: 'path', required: true, description: 'AI service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyAi(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('ai', req, res);
  }

  @All('notification/:path(*)')
  @ApiOperation({ summary: 'Route to Notification Service' })
  @ApiParam({ name: 'path', required: true, description: 'Notification service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyNotification(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('notification', req, res);
  }

  @All('realtime/:path(*)')
  @ApiOperation({ summary: 'Route to Realtime WebSocket Service' })
  @ApiParam({ name: 'path', required: true, description: 'Realtime service endpoint path' })
  @ApiBearerAuth('access-token')
  async proxyRealtime(@Req() req: Request, @Res() res: Response) {
    return this.proxyToService('realtime', req, res);
  }

  private async proxyToService(prefix: string, req: Request, res: Response) {
    const path = req.params.path || '';
    const startTime = Date.now();
    const apiKey = (req as any).apiKey;

    try {
      const result = await this.gatewayService.proxyRequest(
        prefix,
        `/${path}`,
        req.method,
        req.body,
        req.query,
        req.headers as Record<string, string>,
      );

      if (result.headers) {
        for (const [key, values] of Object.entries(result.headers)) {
          if (key.toLowerCase() !== 'transfer-encoding') {
            res.setHeader(key, values as string);
          }
        }
      }

      res.status(result.status).json(result.data);

      if (apiKey) {
        this.logger.log(
          `[${prefix.toUpperCase()}] API Key "${apiKey.name}" ${req.method} /${path} -> ${result.status} (${Date.now() - startTime}ms)`,
        );
      } else {
        this.logger.log(
          `[${prefix.toUpperCase()}] ${req.method} /${path} -> ${result.status} (${Date.now() - startTime}ms)`,
        );
      }
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.message || error.message || 'Internal server error';

      if (apiKey) {
        this.logger.error(
          `[${prefix.toUpperCase()}] API Key "${apiKey.name}" ${req.method} /${path} -> ${status} (${Date.now() - startTime}ms)`,
        );
      } else {
        this.logger.error(
          `[${prefix.toUpperCase()}] ${req.method} /${path} -> ${status} (${Date.now() - startTime}ms)`,
        );
      }

      res.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  }
}
