import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { App } from './app';
import { routes } from './app.routes';
import { RositaComponent } from './rosita/rosita.component';

// Importar componentes standalone
import { HeaderComponent } from './rosita/components/header/header.component';
import { NavigationComponent } from './rosita/components/navigation/navigation.component';
import { LoadingIndicatorComponent } from './rosita/components/loading-indicator/loading-indicator.component';
import { DashboardComponent } from './rosita/components/dashboard/dashboard.component';
import { ChatsListComponent } from './rosita/components/chats-list/chats-list.component';
import { ChatModalComponent } from './rosita/components/chat-modal/chat-modal.component';
import { FaqModalComponent } from './rosita/components/faq-modal/faq-modal.component';
import { GruposModalComponent } from './rosita/components/grupos-modal/grupos-modal.component';
import { InscripcionesModalComponent } from './rosita/components/inscripciones-modal/inscripciones-modal.component';
import { IntencionesModalComponent } from './rosita/components/intenciones-modal/intenciones-modal.component';
import { PushNotificationsModalComponent } from './rosita/components/push-notifications-modal/push-notifications-modal.component';
import { EventosModalComponent } from './rosita/components/eventos-modal/eventos-modal.component';

// Importar facades
import { ChatsFacade } from './rosita/facades/chats.facade';
import { DashboardFacade } from './rosita/facades/dashboard.facade';
import { InscripcionesFacade } from './rosita/facades/inscripciones.facade';
import { GruposFacade } from './rosita/facades/grupos.facade';
import { FaqFacade } from './rosita/facades/faq.facade';
import { IntencionesFacade } from './rosita/facades/intenciones.facade';
import { NotificacionesFacade } from './rosita/facades/notificaciones.facade';
import { EventosFacade } from './rosita/facades/eventos.facade';

// Importar servicios
import { ChatService } from './services/chat.service';
import { InscripcionService } from './services/inscripcion.service';
import { GoogleDriveService } from './services/google-drive.service';
import { EventoService } from './services/evento.service';
import { FaqBotpressService } from './services/faq-botpress.service';
import { OneSignalService } from './services/onesignal.service';

@NgModule({
  declarations: [
    App,
    RositaComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    // Importar componentes standalone aqui
    HeaderComponent,
    NavigationComponent,
    LoadingIndicatorComponent,
    DashboardComponent,
    ChatsListComponent,
    ChatModalComponent,
    FaqModalComponent,
    GruposModalComponent,
    InscripcionesModalComponent,
    IntencionesModalComponent,
    PushNotificationsModalComponent,
    EventosModalComponent
  ],
  providers: [
    // Facades
    ChatsFacade,
    DashboardFacade,
    InscripcionesFacade,
    GruposFacade,
    FaqFacade,
    IntencionesFacade,
    NotificacionesFacade,
    EventosFacade,
    // Servicios
    ChatService,
    InscripcionService,
    GoogleDriveService,
    EventoService,
    FaqBotpressService,
    OneSignalService
  ],
  bootstrap: [App]
})
export class AppModule { }