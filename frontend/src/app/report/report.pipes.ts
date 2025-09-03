import {Pipe, PipeTransform} from '@angular/core';
import {ReportType} from './report.service';

@Pipe({name: 'reportTypeName'})
export class ReporTypeNamePipe implements PipeTransform {
  transform(value: string): any {
    switch (value) {
      case ReportType.RECEIPT:
        return 'Prijemnica';
      case ReportType.SHIPMENT:
        return 'Otpremnica';
      default:
        throw new Error('Unknown category');
    }
  }
}
