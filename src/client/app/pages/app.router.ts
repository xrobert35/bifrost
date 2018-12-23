import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { ServerPage } from '../pages/server/server.page';
import { UnivCommonModule } from '../common/univ-common.module';
import { HeaderComponent } from '../pages/header/header.component';
import { MenuComponent } from '../pages/menu/menu.component';
import { AppPage } from '../pages/app.page.';
import { ServerResolver } from './server/server.resolver';
import { ContainersResolver } from './server/containers.resolver';

const appRouter: Routes = [
  {
    path: 'app', component: AppPage,
    children: [
      { path: 'server', component: ServerPage, resolve : { server : ServerResolver, containers : ContainersResolver} },
      { path: '', redirectTo: 'server', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppPage,
    ServerPage,
    HeaderComponent,
    MenuComponent,
  ],
  imports: [
    RouterModule.forRoot(appRouter, {
      preloadingStrategy: PreloadAllModules,
      initialNavigation: true
    }),
    UnivCommonModule
  ],
  providers: [
    ServerResolver, ContainersResolver
  ],
  exports: [
    RouterModule,
    HeaderComponent,
  ],
})
export class AppRoutingModule { }
