import { Component } from '@angular/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent {
   isChecked = false;
}
