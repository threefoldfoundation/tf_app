import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import { AppendedField, DatasourceField, ServiceError } from '../../interfaces/trulioo.interfaces';


@Component({
  moduleId: module.id,
  selector: 'tff-trulioo-data-fields',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'trulioo-data-fields.component.html'
})

export class TruliooDataFieldsComponent {
  @Input() appendedFields: AppendedField[];
  @Input() datasourceFields: DatasourceField[];
  @Input() errors: ServiceError[];

  fieldName(name: string) {
    return _.upperFirst(_.startCase(name).toLowerCase());
  }

  trackByFieldName(index: number, item: AppendedField | DatasourceField) {
    return item.FieldName;
  }

  trackByMessage(index: number, item: ServiceError) {
    return item.Message;
  }
}
