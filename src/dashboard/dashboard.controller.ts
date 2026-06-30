import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { CampaignsService } from '../campaigns/campaigns.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Auth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas generales para el dashboard' })
  getMetrics(@GetUser() user: User) {
    return this.campaignsService.getDashboardMetrics(user);
  }
}
