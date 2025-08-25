import {Injectable, signal} from '@angular/core';
import { unit} from '../../../wailsjs/go/models';
import {GetAllUnitMeasurements} from '../../../wailsjs/go/app/App';
import UnitMeasure = unit.UnitMeasure;

@Injectable()
export class UnitMeasureService {
  private _unitMeasures = signal<UnitMeasure[]>([]);

  async load() {
    let unitMeasures = await GetAllUnitMeasurements();
    this._unitMeasures.set(unitMeasures);
  }

  async getAll(): Promise<UnitMeasure[]> {
    return await GetAllUnitMeasurements();
  }

  async delete(request: UnitMeasure) {
    throw new Error('Method not implemented.');
  }

  async save(request: UnitMeasure) {
    throw new Error('Method not implemented.');
  }
}
