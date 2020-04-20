import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import { WinLogger } from '../logger/winlogger';
import { Config } from '@config/config';
import { Injectable, HttpStatus } from '@nestjs/common';
import { FunctionalException } from '../exception/functional.exception';
import { Account } from './model/account.entity';
import shortUid = require('short-uuid');
import urlJoin = require('url-join');
import AsyncNedb from 'nedb-async';

@Injectable()
export class AuthenticationService {

  private db = new AsyncNedb<Account>({
    filename: urlJoin(Config.get().SERVER_DATA, 'accounts.db'),
    autoload: true,
  });

  private logger: WinLogger = WinLogger.get('authentification-service');

  public async authenticate(email: string, password: string): Promise<string> {
    const account = await this.db.asyncFindOne({ email: email });

    let jwtToken: string;
    if (account) {
      const loginDate = new Date();
      account.lastLoginAttempt = loginDate;
      if (bcrypt.compareSync(password, account.password)) {
        jwtToken = jwt.sign(
          {
            email: account.email,
            givenName: account.name,
            roles: account.roles,
          },
          Config.get().AUTH_JWT_KEY,
          { expiresIn: 3600 },
        );

        this.logger.debug(`Token generated for user ${email}`);

        account.lastLoginSuccessful = loginDate;
      }
      await this.db.asyncUpdate({ uid: account.uid }, account);
    }
    return jwtToken;
  }

  public async create(account: Account): Promise<Account> {
    const existingAccount = await this.db.asyncFindOne({
      email: account.email,
    });
    if (existingAccount) {
      throw new FunctionalException(
        'already_exist',
        `An account with the same email already exist :  ${account.email}`,
        HttpStatus.CONFLICT,
      );
    }
    account.uid = shortUid.generate();
    account.password = bcrypt.hashSync(account.password, 10);
    account.createdOn = new Date();
    return await this.db.asyncInsert(account);
  }
}
