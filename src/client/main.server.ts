import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
if (environment.production) {
   enableProdMode();
}
export {RootServerModule} from './app/root.server.module';
