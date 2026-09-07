import { Body, Controller, Post } from '@nestjs/common';
import { AuthCredentials } from './auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}
  @Post('signup')
  async signUp(@Body() authCredentials: AuthCredentials): Promise<void> {
    return await this.authService.createUser(authCredentials);
  }
}
