import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from '../campaigns/campaigns.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas generales para el dashboard' })
  getMetrics() {
    return this.campaignsService.getDashboardMetrics();
  }
}
