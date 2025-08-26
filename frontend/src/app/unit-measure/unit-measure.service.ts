import {Injectable, signal} from '@angular/core';
import {GetAllUnitMeasurements, SaveAllUnitMeasures} from '../../../wailsjs/go/app/App';
import {unit} from '../../../wailsjs/go/models';
import UnitMeasure = unit.UnitMeasure;

@Injectable()
export class UnitMeasureService {
  async getAll(): Promise<UnitMeasure[]> {
    return await GetAllUnitMeasurements();
  }

  async saveAll(request: UnitMeasure[]) {
    return await SaveAllUnitMeasures(request);
  }
}
