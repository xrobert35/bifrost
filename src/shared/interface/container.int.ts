
export class DockerContainer  {
  name: string;
  proxified: boolean;
  proxyPath: string;
  proxyPass: string;

  imageName: string;
  tag: string;
  // Real docker properties
  Command: string;
  Created: number;
  Id: string;
  Image: string;
  ImageID: string;
  Names: Array<string>;
  Name: string;
  State: string;
  Status: string;
  Config: any;
  Mounts: Array<{ Type: string, Source: string, Destination: string }>;
  Ports: Array<{ PrivatePort: string, PublicPort: string }>;
}
