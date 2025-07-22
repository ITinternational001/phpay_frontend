import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from './user-list.component';
import { UserListRoutingModule } from './user-list-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { UserListFormComponent } from './user-list-form/user-list-form.component';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ClientPasswordResetComponent } from './client-password-reset/client-password-reset.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    UserListComponent,
    UserListFormComponent,
    ClientPasswordResetComponent,
  ],
  imports: [
    CommonModule,
    UserListRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MaterialUIModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    HttpClient
  ]
})
export class UserListModule { }
