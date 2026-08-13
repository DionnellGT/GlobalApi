import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entities';
import {
    LandingBanner,
    LandingSobreMi,
    LandingProyecto,
    LandingTestimonio,
    LandingMisDatos,
} from '../../landing-asesores/entities';


@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('text', { nullable: true })
    phone: string;

    @Column('text', { nullable: true })
    address: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(
        () => Project,
        ( project ) => project.user
    )
    project: Project[];

    // Relaciones del landing del asesor (role: 'landing-asesor')
    @OneToOne(
        () => LandingBanner,
        ( banner ) => banner.user
    )
    landingBanner: LandingBanner;

    @OneToOne(
        () => LandingSobreMi,
        ( sobreMi ) => sobreMi.user
    )
    landingSobreMi: LandingSobreMi;

    @OneToOne(
        () => LandingMisDatos,
        ( misDatos ) => misDatos.user
    )
    landingMisDatos: LandingMisDatos;

    @OneToMany(
        () => LandingProyecto,
        ( proyecto ) => proyecto.user
    )
    landingProyectos: LandingProyecto[];

    @OneToMany(
        () => LandingTestimonio,
        ( testimonio ) => testimonio.user
    )
    landingTestimonios: LandingTestimonio[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }

}
