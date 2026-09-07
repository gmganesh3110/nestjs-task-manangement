import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentials } from './auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createUser(authCredentials: AuthCredentials): Promise<void> {
    const { username, password } = authCredentials;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      username,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentials: AuthCredentials): Promise<string> {
    const { username, password } = authCredentials;
    const where: FindOptionsWhere<User>[] = [];
    where.push({ username });
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      throw new NotFoundException('user does not exist with this email');
    }
    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return 'success';
    }
    throw new UnauthorizedException('Password incorrect');
  }
}
