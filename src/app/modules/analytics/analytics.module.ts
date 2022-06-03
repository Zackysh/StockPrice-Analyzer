import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Route, RouterModule } from '@angular/router';
import { AnalyticsComponent } from './analytics.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatTableModule } from '@angular/material/table';

const analyticsRoutes: Route[] = [
  {
    path: '',
    component: AnalyticsComponent,
  },
];

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    MatFormFieldModule,
    MatIconModule,
    SharedModule,
    MatTableModule,
    RouterModule.forChild(analyticsRoutes),
  ],
})
export class AnalyticsModule {}
