import { Component, Input, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { INavbarData } from 'src/shared/dataprovider/local/interface/sidenavHelper';

@Component({
  selector: 'app-submenu',
  templateUrl: './submenu.component.html',
  styleUrls: ['./submenu.component.scss'],
  animations:[
    trigger('submenu',[
      state('hidden',style({
        height:'0',
        overflow:'hidden'
      })),
      state('visible', style({
        height: '*'
      })),
      transition('visible <=> hidden', [style({overflow:'hidden'}), animate('{{transitionParams}}')]),
      transition('void => *', animate(0))
      
    ])
  ]
})
export class SubmenuComponent implements OnInit {
  @Input() data:INavbarData = {
    routeLink:'',
    icon:'',
    label:'',
    items:[]
  }
  @Input() collapsed = false;
  @Input() animating: boolean | undefined;
  @Input() expanded: boolean | undefined;
  @Input() multiple: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  handleClick(item:any):void{
    if(!this.multiple){
      if(this.data.items && this.data.items.length > 0){
        for(let modelItem of this.data.items){
          if(item !== modelItem && modelItem.expanded){
            modelItem.expanded = false;
          }
        }
      }
    }
    item.expanded = !item.expanded;
  }
}
