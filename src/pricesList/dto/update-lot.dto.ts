import { PartialType } from '@nestjs/swagger';
import { LotDto } from './lot.dto';

export class UpdateLotDto extends PartialType(LotDto) {}
