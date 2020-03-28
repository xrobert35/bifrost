import { DockerContainer } from './container.int';

/**
 * Representation of a docker stack
 * #used by front only
 */
export class DockerStack {
  name?: string;
  started: boolean;
  containers: DockerContainer[];
}
