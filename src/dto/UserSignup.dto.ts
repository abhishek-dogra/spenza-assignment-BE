import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class UserSignupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, {
    message:
      'Password must contain at least one digit, one lowercase and one uppercase letter, and be at least 6 characters long.',
  })
  password: string;
}
