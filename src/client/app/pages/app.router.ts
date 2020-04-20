import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { DockerPage } from '../pages/docker/docker.page';
import { BifrostCommonModule } from '../common/univ-common.module';
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
import { SidePanelComponent } from './side/side-panel.component';
import { StackDisplayComponent } from './docker/stack/stack-display.component';
import { DockerLogsPage } from './docker/logs/docker-logs.page';
import { ContainerResolver } from '../common/resolver/container.resolver';
import { ProxyLogsPage } from './proxy/logs/proxy-logs.page';
import { LoginPage } from './login/login.page';

const appRouter: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'app', component: AppPage,
    children: [
      { path: 'docker', component: DockerPage },
      { path: 'docker/logs/:containerId', component: DockerLogsPage, resolve: { container: ContainerResolver } },
      { path: 'proxy', component: ProxyPage, resolve: { server: ServerResolver } },
      { path: 'proxy/logs/:type', component: ProxyLogsPage },
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
    LoginPage,
    DockerPage,
    StackDisplayComponent,
    ComposePage,
    ProxyPage,
    WebUploadPage,
    TaskHelperPage,
    SshPage,
    SidePanelComponent,
    FolderContentDialog,
    DockerLogsPage,
    ProxyLogsPage
  ],
  imports: [
    RouterModule.forRoot(appRouter, {
      preloadingStrategy: PreloadAllModules,
      initialNavigation: true
    }),
    BifrostCommonModule
  ],
  providers: [
    ServerResolver, ContainersResolver, ComposesResolver, FoldersResolver
  ],
  entryComponents: [FolderContentDialog],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
