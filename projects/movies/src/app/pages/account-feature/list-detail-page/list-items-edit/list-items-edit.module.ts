import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LetModule } from '@rx-angular/template';
import { ForModule } from '@rx-angular/template/experimental/for';
import { SvgIconModule } from '../../../../ui/component/icons/icon.module';
import { ListItemsEditComponent } from './list-items-edit.component';

const ROUTES = [
  {
    path: '',
    component: ListItemsEditComponent,
  },
];

@NgModule({
  imports: [ForModule, LetModule, RouterModule.forChild(ROUTES), SvgIconModule],
  declarations: [ListItemsEditComponent],
})
export class ListItemsEditComponentModule {}
