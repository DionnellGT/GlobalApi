import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMisDatosDto {
  @ApiProperty({ description: 'Nombre del asesor' })
  @IsString()
  @MinLength(1)
  nombre: string;

  @ApiProperty({ description: 'Apellido del asesor', required: false })
  @IsString()
  @IsOptional()
  apellido?: string;

  @ApiProperty({ description: 'Correo de contacto del landing', required: false })
  @IsEmail()
  @IsOptional()
  correo?: string;

  @ApiProperty({ description: 'Teléfono de contacto', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ description: 'Link de Facebook', required: false })
  @IsString()
  @IsOptional()
  facebook?: string;

  @ApiProperty({ description: 'Link de Instagram', required: false })
  @IsString()
  @IsOptional()
  instagram?: string;
}

export class UpdateMisDatosDto extends PartialType(CreateMisDatosDto) {}
