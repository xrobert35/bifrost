import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CredentialDto } from './dto/credential.dto';
import { Account } from './model/account.entity';
import { Request } from 'express';
import { Public } from '../security/guard/public.decorator';
import { Roles } from './guard/role.decorator';
import { Role } from './model/role.enum';

@Controller('auth')
@UsePipes(ValidationPipe)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  public async authenticate(@Body() account: CredentialDto): Promise<any> {
    const token = await this.authenticationService.authenticate(
      account.email,
      account.password,
    );
    if (token) {
      return {
        token : `Bearer ${token}`,
      };
    } else {
      throw new ForbiddenException('Bad credential');
    }
  }

  @Post('account')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  public async create(@Body() account: Account): Promise<Account> {
    const newAccount = await this.authenticationService.create(account);
    delete newAccount.password;
    return newAccount;
  }

  @Get('me')
  public me(@Req() request: Request): Account {
    return (request as any).user;
  }
}
