import { NgModule } from '@angular/core';
import { SettingsModule } from 'app/layout/common/settings/settings.module';
import { LayoutComponent } from 'app/layout/layout.component';
import { ClassyLayoutModule } from 'app/layout/layouts/classy/classy.module';
import { EmptyLayoutModule } from 'app/layout/layouts/empty/empty.module';

import { SharedModule } from 'app/shared/shared.module';

const layoutModules = [EmptyLayoutModule, ClassyLayoutModule];

@NgModule({
  declarations: [LayoutComponent],
  imports: [SharedModule, SettingsModule, ...layoutModules],
  exports: [LayoutComponent, ...layoutModules],
})
export class LayoutModule {}
