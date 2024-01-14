import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommonService } from "./common.service";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private commonService:CommonService
  ) {}

  getHello(): string {
    return 'Hello Webhook here!';
  }

  async findUserFromEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async checkPassword(hashedPassword: string, attempt: string) {
    return await bcrypt.compare(attempt, hashedPassword);
  }

  async createUser(email: string, name: string, password: string) {
    const hashedPassword = await this.hashPassword(password);
    const user = new UserEntity(name, email, hashedPassword);
    return this.userRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async getAccessToken(userId) {
    const jwtPayload = {
      userId: userId,
    };
    return await this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('TOKEN_EXPIRY'),
    });
  }

  async generateAccessTokenForUser(user: UserEntity) {
    return await this.getAccessToken(user.id);
  }

  async findUserFromId(id: string) {
    return await this.userRepository.findOne({ where: { id: id } });
  }

  generateUserAuthKey(userId: string) {
    const authKeySecret = this.configService.get<string>('AUTH_KEY_SECRET');
    const epochTime = new Date().getTime();
    const authKeyString = `${epochTime}_${userId}`;
    return this.commonService.encrypt(authKeyString, authKeySecret);
  }
}
