
export class DockerContainer  {
  name: string;
  proxified: boolean;

  imageName: string;
  imageRepo?: string;
  tooltip?: any;


  tag: string;
  stack?: string;

  // Real docker properties
  Command: string;
  Created: number;
  Id: string;
  Image: string;
  ImageDigestId: string;
  ImageID: string;
  Names: Array<string>;
  Labels: any;
  Name: string;
  State: string;
  Status: string;
  Config: any;
  Mounts: Array<{ Type: string, Source: string, Destination: string }>;
  Ports: Array<{ PrivatePort: string, PublicPort: string }>;
}
