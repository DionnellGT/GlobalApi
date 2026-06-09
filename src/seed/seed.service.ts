import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsService } from '../projects/proyects.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor(
    private readonly projectsService: ProjectsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertUsers();
    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    await this.projectsService.deleteAllProjects();

    await this.userRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }
}