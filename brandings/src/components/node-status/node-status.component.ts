import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NodeInfo, NodeStatsData, NodeStatsSeries, NodeStatsType } from '../../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';

export interface LineChart {
  data: LinearChartData;
  options: LineChartOptions;
}

type NodesChartLabelData = [ Date[], number[] ];

enum Colors {
  blue = 'rgb(54, 162, 235)',
  green = 'rgb(75, 192, 192)',
  grey = 'rgb(201, 203, 207)',
  orange = 'rgb(255, 159, 64)',
  purple = 'rgb(153, 102, 255)',
  red = 'rgb(255, 99, 132)',
  yellow = 'rgb(255, 205, 86)',
}

@Component({
  selector: 'node-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'node-status.component.html',
})
export class NodeStatusComponent implements OnChanges {
  @Input() nodes: NodeInfo[];
  @Input() status: ApiRequestStatus;
  charts: { [ key: string ]: LineChart[] } = {};

  constructor(private translate: TranslateService,
              private datePipe: DatePipe,
              private decimalPipe: DecimalPipe) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodes && changes.nodes.currentValue.length) {
      const nodes: NodeInfo[] = changes.nodes.currentValue;
      for (const node of nodes) {
        if (node.stats && !this.charts[ node.id ]) {
          this.charts[ node.id ] = this.getCharts(node.stats);
        }
      }
    }
  }

  getIcon(node: NodeInfo) {
    return node.status === 'running' ? 'checkmark' : 'close';
  }

  getIconColor(node: NodeInfo) {
    return node.status === 'running' ? 'primary' : 'danger';
  }

  private getCharts(datasets: NodeStatsData[]) {
    const charts = [];
    const options: LineChartOptions | any = {
      responsive: true,
      elements: { line: { tension: 0 } },
      maintainAspectRatio: false,
      legend: { display: false },
      scales: { xAxes: [ { type: 'time', time: { unit: 'hour', displayFormats: { hour: 'HH:mm' }, tooltipFormat: 'HH:mm' } } ] },
    };
    const cpuUsageData = datasets.find(set => set.type === NodeStatsType.CPU);
    if (cpuUsageData) {
      const [ labels, data ] = this._getLabelsAndData(cpuUsageData.data[ 0 ]);
      const cpuUtilisation: LineChart = {
        data: {
          labels: labels as any, // types are wrong, date is accepted
          datasets: [
            { label: this.translate.instant('cpu_usage'), data, fillColor: Colors.blue, strokeColor: Colors.blue },
          ],
        },
        options: {
          ...options,
          scales: { ...options.scales, yAxes: [ { scaleLabel: { display: true, labelString: '%' } } ] },
          tooltips: {
            callbacks: {
              label: (item: any) => `${this.decimalPipe.transform(item.yLabel)} %`,
            },
          },
        },
      };
      charts.push(cpuUtilisation);
    }
    const mbOptions = {
      ...options,
      scales: { ...options.scales, yAxes: [ { scaleLabel: { display: true, labelString: 'MB' } } ] },
      tooltips: {
        callbacks: {
          label: (item: any) => `${this.decimalPipe.transform(item.yLabel)} MB`,
        },
      },
    };
    const networkIn = datasets.find(set => set.type === NodeStatsType.NETWORK_IN);
    if (networkIn) {
      const [ labels, data ] = this._getLabelsAndData(networkIn.data[ 0 ]);
      const networkChart: LineChart = {
        data: {
          labels: labels as any,
          datasets: [
            { label: this.translate.instant('incoming_traffic'), data, fillColor: Colors.green, strokeColor: Colors.green },
          ],
        },
        options: mbOptions,
      };
      charts.push(networkChart);
    }
    const networkOut = datasets.find(set => set.type === NodeStatsType.NETWORK_OUT);
    if (networkOut) {
      const [ labels, data ] = this._getLabelsAndData(networkOut.data[ 0 ]);
      const networkChart: LineChart = {
        data: {
          labels: labels as any,
          datasets: [
            { label: this.translate.instant('outgoing_traffic'), data, fillColor: Colors.green, strokeColor: Colors.green },
          ],
        },
        options: mbOptions,
      };
      charts.push(networkChart);
    }
    const memoryData = datasets.find(set => set.type === NodeStatsType.RAM);
    if (memoryData) {
      const [ labels, data ] = this._getLabelsAndData(memoryData.data[ 0 ]);
      const networkChart: LineChart = {
        data: {
          labels: labels as any,
          datasets: [
            { label: this.translate.instant('available_ram'), data, fillColor: Colors.green, strokeColor: Colors.green },
          ],
        },
        options: mbOptions,
      };
      charts.push(networkChart);
    }
    return charts;
  }

  private _getLabelsAndData(data: NodeStatsSeries): NodesChartLabelData {
    return data.values.reduce((acc, current) => {
      acc[ 0 ].push(new Date(current[ 0 ]));
      acc[ 1 ].push(current[ 1 ]);
      return acc;
    }, <NodesChartLabelData>[ [], [] ]);
  }
}
