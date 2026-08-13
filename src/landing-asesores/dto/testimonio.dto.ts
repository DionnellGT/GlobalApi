import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTestimonioDto {
  @ApiProperty({ description: 'Nombre de la persona que da el testimonio' })
  @IsString()
  @MinLength(1)
  nombreTestimonio: string;

  @ApiProperty({ description: 'Descripción / texto del testimonio', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class UpdateTestimonioDto extends PartialType(CreateTestimonioDto) {}
