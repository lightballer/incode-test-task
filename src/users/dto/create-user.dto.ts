import { IsBoolean, IsEmail, IsNumber, IsOptional, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;
    
    @IsNumber()
    @IsOptional()
    bossId?: number;

    @IsBoolean()
    @IsOptional()
    isAdmin?: boolean;
    
    @IsBoolean()
    @IsOptional()
    isBoss?: boolean;  
}
