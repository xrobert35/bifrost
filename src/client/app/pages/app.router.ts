import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { DockerPage } from '../pages/docker/docker.page';
import { UnivCommonModule } from '../common/univ-common.module';
import { HeaderComponent } from '../pages/header/header.component';
import { AppPage } from '../pages/app.page.';
import { ServerResolver } from './proxy/server.resolver';
import { ContainersResolver } from './docker/containers.resolver';
import { ProxyPage } from './proxy/proxy.page';
import { ComposePage } from './compose/compage.page';
import { WebUploadPage } from './web-upload/web-upload.page';
import { TaskHelperPage } from './task-helper/task-helper.page';
import { ComposesResolver } from './compose/compose.resolver';
import { FoldersResolver } from './web-upload/folders.resolver';
import { FolderContentDialog } from './web-upload/folder-content/folder-content.dialog';
import { SshPage } from './ssh/ssh.page';

const appRouter: Routes = [
  {
    path: 'app', component: AppPage,
    children: [
      { path: 'docker', component: DockerPage },
      { path: 'proxy', component: ProxyPage, resolve: { server: ServerResolver } },
      { path: 'compose', component: ComposePage, resolve: { composes: ComposesResolver } },
      { path: 'web-upload', component: WebUploadPage, resolve: { folders: FoldersResolver } },
      { path: 'task-helper', component: TaskHelperPage },
      { path: 'ssh', component: SshPage },
      { path: '', redirectTo: 'docker', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppPage,
    DockerPage,
    ComposePage,
    ProxyPage,
    WebUploadPage,
    TaskHelperPage,
    SshPage,
    HeaderComponent,
    FolderContentDialog
  ],
  imports: [
    RouterModule.forRoot(appRouter, {
      preloadingStrategy: PreloadAllModules,
      initialNavigation: true
    }),
    UnivCommonModule
  ],
  providers: [
    ServerResolver, ContainersResolver, ComposesResolver, FoldersResolver
  ],
  entryComponents: [FolderContentDialog],
  exports: [
    RouterModule,
    HeaderComponent,
  ],
})
export class AppRoutingModule { }
