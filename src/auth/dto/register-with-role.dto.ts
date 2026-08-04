import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterWithRoleDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    // Solo se usa si el usuario no existe todavía (para crearlo). Si el
    // email ya existe, se ignora y se conserva el fullName original.
    @IsString()
    @MinLength(1)
    fullName: string;

}
