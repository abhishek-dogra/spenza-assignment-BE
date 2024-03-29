import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserLoginDto } from '../dto/UserLogin.dto';
import { UserSignupDto } from '../dto/UserSignup.dto';
import { TokenGuard } from '../guards/token.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: UserLoginDto) {
    const user = await this.userService.findUserFromEmail(loginRequest.email);
    if (user == null) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const isValidPassword: boolean = await this.userService.checkPassword(
      user.password,
      loginRequest.password,
    );
    if (isValidPassword == false) {
      throw new HttpException(
        { message: `Passwords don't match.` },
        HttpStatus.NOT_FOUND,
      );
    }
    const accessToken = await this.userService.generateAccessTokenForUser(user);
    return { accessToken: accessToken, name: user.name, email: user.email };
  }

  @Post('signup')
  async signup(@Body() signupRequest: UserSignupDto) {
    let user = await this.userService.findUserFromEmail(signupRequest.email);
    if (user != null) {
      throw new HttpException(
        { message: 'User with the same email address already exists.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    user = await this.userService.createUser(
      signupRequest.email,
      signupRequest.name,
      signupRequest.password,
    );
    return { name: user.name, email: user.email };
  }

  @UseGuards(TokenGuard)
  @Get('auth-key')
  async getAuthKey(@Headers('user-id') userId: string) {
    const user = await this.userService.findUserFromId(userId);
    if (user == null) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const authKey = this.userService.generateUserAuthKey(userId);
    return { authKey: authKey };
  }
}
