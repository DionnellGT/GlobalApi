import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PROJECTsService } from './../PROJECTs/PROJECTs.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';


@Injectable()
export class SeedService {

  constructor(
    private readonly PROJECTsService: PROJECTsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ) {}


  async runSeed() {

    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.insertNewPROJECTs( adminUser );

    return 'SEED EXECUTED';
  }

  private async deleteTables() {

    await this.PROJECTsService.deleteAllPROJECTs();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers() {

    const seedUsers = initialData.users;
    
    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) )
    });

    const dbUsers = await this.userRepository.save( seedUsers )

    return dbUsers[0];
  }


  private async insertNewPROJECTs( user: User ) {
    await this.PROJECTsService.deleteAllPROJECTs();

    const PROJECTs = initialData.PROJECTs;

    const insertPromises = [];

    PROJECTs.forEach( PROJECT => {
      insertPromises.push( this.PROJECTsService.create( PROJECT, user ) );
    });

    await Promise.all( insertPromises );


    return true;
  }


}

