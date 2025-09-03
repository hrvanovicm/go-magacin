import {Injectable} from '@angular/core';
import {report} from '../../../wailsjs/go/models';
import Report = report.Report;
import {
  GetAllCompanies,
  GetAllReportPublishLocations, GetAllReports,
  GetAllUserNames,
  GetReportArticles, SaveReport
} from '../../../wailsjs/go/app/WailsApp';
import ReportArticle = report.ReportArticle;


export enum ReportType {
  RECEIPT = 'RECEIPT',
  SHIPMENT = 'SHIPMENT',
}

export const ReportTypeValues = Object.values(ReportType);

export interface ReportParams {
  search?: string;
  types?: ReportType[];
  sortBy?: string;
  sortDirection?: string;
}

@Injectable()
export class ReportService {
  async getAll(params: Partial<ReportParams>): Promise<any[]> {
    let reports = await GetAllReports();

    if(params.search != undefined) {
      const search = params.search.trim().toLowerCase();

      reports = reports.filter(report => {
        return report.code?.toLowerCase().includes(search) ||
          report.shipment.receiptCompany.name?.toLowerCase().includes(search) ||
          report.receipt.supplierCompany.name?.toLowerCase().includes(search) ||
          report.receipt.supplierReportCode?.toLowerCase().includes(search);
      })
    }

    if(params.types != undefined) {
      reports = reports.filter(report => {
        return params.types!.some(type =>
          (type === ReportType.RECEIPT && report.type === ReportType.RECEIPT) ||
          (type === ReportType.SHIPMENT && report.type === ReportType.SHIPMENT)
        );
      })
    }

    if (params.sortBy != undefined) {
      let sortDirection = params.sortDirection ?? 'asc';
      let sortField = params.sortBy ?? 'name';

      reports = reports.sort((a, b) => {
        let compareValue: number;

        switch (sortField) {
          case 'name':
            compareValue = a.code?.localeCompare(b.code ?? "") ?? 0;
            break;
          case 'signedOnDate':
            compareValue = (a.signedAt ?? '').localeCompare(b.signedAt ?? '');
            break;
          case 'type':
            compareValue = a.type.localeCompare(b.type);
            break;
          default:
            compareValue = 0;
        }

        return sortDirection === 'asc' ? compareValue : -compareValue;
      })
    }

    return reports;
  }

  async getAllCompanies() {
    return await GetAllCompanies();
  }

  async getAllUsers() {
    return await GetAllUserNames();
  }

  async getAllLocations() {
    return await GetAllReportPublishLocations();
  }

  async getArticles(id: number) {
    return await GetReportArticles(id);
  }

  async save(request: Report, articles: ReportArticle[]) {
    await SaveReport(request, articles);
  }
}
