import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {

  transform(value: string): { [key: string]: string } {
  
    const baseStyle = {
      borderRadius: '5px', 
      paddingTop: '5px', 
      paddingBottom: '5px', 
      width: '100px', 
      display: 'inline-block', 
      textAlign: 'center'
    }

    const status = (typeof value === 'string' ? value.toLowerCase() : '');

    switch (status) {
      case 'disabled':
      case 'processing':
        return { 
          ...baseStyle,
          color: '#585050', 
          backgroundColor: 'rgb(253 249 87)', 
         };
         case 'pending':
          return { 
            ...baseStyle,
            color: 'black',
            backgroundColor: 'white',
            border: '1px solid black'
          };
        
      case 'active':
      case 'approve':
      case 'completed':
        return {
          ...baseStyle,
          color: 'white', 
          backgroundColor: 'rgb(5 211 93)', 
          };
      case 'inactive':
      case 'cancelled':
      case 'disapprove':
      case 'rejected':
        return { 
          ...baseStyle,
          color: 'white', 
          backgroundColor: '#ea3a30', 
          };

      default:
        return {
          ...baseStyle,
           color: 'white', 
           backgroundColor: 'black'
        }; // default color if status is not matched
    }
  }

}
