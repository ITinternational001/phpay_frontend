import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filter-nav',
  templateUrl: './filter-nav.component.html',
  styleUrls: ['./filter-nav.component.scss']
})
export class FilterNavComponent implements OnInit {
  constructor(private router: Router) { }



  
  navigate(event:any): void{
    const selectedValue =event.target.value;
    if (selectedValue){
      this.router.navigate([selectedValue]);
    }
  }
  ngOnInit(): void {
  }
}
