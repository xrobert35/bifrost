import { ServerError } from './serverError.int';
import { ServerLocation } from './serverLocation.int';

export class Server {
  port: number;
  serverName: string;
  locations: Array<ServerLocation>;
  error: ServerError;
}
