import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { NGXS_PLUGINS, NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { TodoState } from './state/todo.state';
import { logoutPlugin } from './state/plugins/logout.plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom([
      NgxsModule.forRoot([TodoState], {
        developmentMode: true,
      }),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ]),
    {
      provide: NGXS_PLUGINS,
      useValue: logoutPlugin,
      multi: true
    }
  ]
};
