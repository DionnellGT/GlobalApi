import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { ProjectsService } from './proyects.service';

@ApiTags('Project')
@Controller('Project')
export class ProjectsController {
  constructor(private readonly ProjectsService: ProjectsService) {}

  @Post()
  @Auth()
  @ApiResponse({
    status: 201,
    description: 'PROJECT was created',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related.' })
  create(@Body() createProjectDto: CreateProjectDto, @GetUser() user: User) {
    return this.ProjectsService.create(createProjectDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    // console.log(paginationDto)
    return this.ProjectsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.ProjectsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: User,
  ) {
    return this.ProjectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ProjectsService.remove(id);
  }
}

