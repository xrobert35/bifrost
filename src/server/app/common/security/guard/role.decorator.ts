import { SetMetadata } from '@nestjs/common';
import { Role } from '../model/role.enum';

export const Roles = (...roles: Array<Role>) => SetMetadata('roles', roles);
