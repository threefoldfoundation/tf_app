import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NodeStatus, NodeStatusStats, StatisticValue } from '../../interfaces/node-status.interfaces';
import { ApiRequestStatus } from '../../interfaces/rpc.interfaces';

export interface LineChart {
  data: LinearChartData;
  options: LineChartOptions;
}

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
  @Input() nodeStatus: NodeStatus;
  @Input() status: ApiRequestStatus;
  charts: LineChart[] = [];

  constructor(private translate: TranslateService,
              private datePipe: DatePipe,
              private decimalPipe: DecimalPipe) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.nodeStatus && changes.nodeStatus.currentValue && (<NodeStatusStats>this.nodeStatus).cpu) {
      const status: NodeStatusStats = changes.nodeStatus.currentValue;
      this.charts = this.getCharts(status).filter(c => c.data.labels.length > 0);
    }
  }

  getCharts(status: NodeStatusStats) {
    const options: LineChartOptions | any = {
      responsive: true,
      elements: { line: { tension: 0 } },
      maintainAspectRatio: false,
      legend: { display: false },
      scales: { xAxes: [ { type: 'time', time: { unit: 'hour', displayFormats: { hour: 'HH:mm' }, tooltipFormat: 'HH:mm' } } ] },
    };
    const cpuUtilisation: LineChart = {
      data: {
        labels: [],
        datasets: [ { label: this.translate.instant('cpu_usage'), data: [], fillColor: Colors.blue, strokeColor: Colors.blue } ],
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
    const networkIncoming: LineChart = {
      data: {
        labels: [], datasets: [
          { label: this.translate.instant('incoming_traffic'), data: [], fillColor: Colors.green, strokeColor: Colors.green },
        ],
      },
      options: {
        ...options,
        scales: { ...options.scales, yAxes: [ { scaleLabel: { display: true, labelString: 'MB' } } ] },
        tooltips: {
          callbacks: {
            label: (item: any) => `${this.decimalPipe.transform(item.yLabel)} MB`,
          },
        },
      },
    };
    const networkOutgoing: LineChart = {
      data: {
        labels: [], datasets: [
          { label: this.translate.instant('outgoing_traffic'), data: [], fillColor: Colors.red, strokeColor: Colors.red },
        ],
      },
      options: networkIncoming.options,
    };
    const chartMap = new Map<LineChart, StatisticValue[]>();
    chartMap.set(cpuUtilisation, status.cpu.utilisation);
    chartMap.set(networkIncoming, status.network.incoming);
    chartMap.set(networkOutgoing, status.network.outgoing);
    chartMap.forEach((stats, chart) => {
      for (const s of stats) {
        chart.data.labels.push(<any>new Date(s.start * 1000));
        chart.data.datasets[ 0 ].data.push(s.total);
      }
    });
    return [ cpuUtilisation, networkIncoming, networkOutgoing ];
  }

  getIcon() {
    return this.nodeStatus.status === 'running' ? 'checkmark' : 'close';
  }

  getIconColor() {
    return this.nodeStatus.status === 'running' ? 'primary' : 'danger';
  }

  getUptime() {
    return this.translate.instant('online_since_x', { bootTime: this.datePipe.transform((<NodeStatusStats>this.nodeStatus).bootTime! * 1000, 'medium') });
  }
}
