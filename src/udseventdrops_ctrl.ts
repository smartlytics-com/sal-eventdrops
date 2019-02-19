import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import _ from 'lodash';
import eventDrops from './eventdrops/eventdrops.min.js';
import * as d3 from './eventdrops/d3.v5.min.js';

const panelDefaults = {
  bgColor: null,

  labels: {
    title: null,
    subtitle: null,
    x_legend: null,
    y_legend: null
  },

  fields: {
    x_label: null,
    y_label: null,
    name_label: null,
  }

};

window['global'] = window;

export class UdsEventdropsCtrl extends MetricsPanelCtrl {

  static templateUrl = 'module.html';

  data = [];
  canvasid = ('id' + (Math.random() * 100000)).replace('.', '');
  ctx = null;
  chart = null;
  eventDrops = null;
  ready = false;
  series = [];
  nextTickPromise = null;
  tooltip = null;

  /** @ngInject */
  constructor($scope, $injector, private $rootScope) {

    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.$rootScope = $rootScope;

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));

    if (document.getElementsByClassName('event-drops-tooltip').length) {
      this.tooltip = d3.select('.event-drops-tooltip');
    } else {
      this.tooltip = d3.select('body').append('div').classed('event-drops-tooltip', true).style('opacity', 0).style('pointer-events', 'auto');
    }
    this.updateChart();
  }

  onDataError() {
    //console.log('Data error');
    this.series = [];
    this.render();
  }

  updateChart() { }

  onRender() {

    const config = {
      d3,
      range: {
        start: this.dashboard.time.from.toDate(),
        end: this.dashboard.time.to.toDate()
      },
      // bound: { format: d3.timeFormat('%d %B \'%y %H:%M:%S') },
      // metaballs: {
      //   blurDeviation: 1000,
      //   colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10'
      // },
      // line: {
      //   color: (_, index) => d3.schemeCategory10[index],
      //   height: 40
      // },
      // label: {
      //   padding: 5,
      //   text: d => `${d.name}`,
      //   width: 100
      // },
      drop: {
        // color: d => d.color || 'blue',
        radius: d => d.radius || 5,
        date: d => new Date(d.date),
        onMouseOver: d => {
          this.tooltip.transition().duration(200).style('opacity', 1).style('pointer-events', 'auto');
          this.tooltip.html(`
            <div class="event-drops-tooltip-content">
              <strong class="event-drops-tooltip-title">${d.date}</strong>
            </div>
          `)
          .style('left', `${d3.event.pageX - 20}px`)
          .style('top',  `${d3.event.pageY + 20}px`);
        },
        onMouseOut: () => {
          this.tooltip.transition().duration(500).style('opacity', 0).style('pointer-events', 'none');
        }
      },
      zoom: { onZoomEnd: () => { } }
    };

    this.eventDrops = eventDrops(config);
    this.chart = d3.select("#" + this.canvasid);

    if (this.data && this.eventDrops) {
      this.chart.data([this.data]).call(this.eventDrops);
    }
  }

  decodeNonHistoricalData(fulldata) {
    this.updateChart();
  }

  //***************************************************
  // Data received
  //***************************************************
  onDataReceived(dataList) {
    // let new_datagroups = {};
    // for (let set = 0; set < dataList.length; set++) {
    //     let laneIdx = dataList[set].columns.findIndex(item=>item.text == "lane");
    //     let labelIdx = dataList[set].columns.findIndex(item=>item.text == "label");
    //     let pointIdx = dataList[set].columns.findIndex(item=>item.text == "point");
    //     let colorIdx = dataList[set].columns.findIndex(item=>item.text == "color");
    //     let radiusIdx = dataList[set].columns.findIndex(item=>item.text == "radius");

    //     dataList[set].rows.forEach(row => {
    //         let lane = row[laneIdx];
    //         let entry = {
    //             'date' : new Date(row[pointIdx]),
    //             'label' : row[labelIdx],
    //             'color' : (colorIdx>-1) ? row[colorIdx] : 'blue',
    //             'radius' : (radiusIdx>-1) ? row[radiusIdx] : 1
    //         };
    //         let laneArray = new_datagroups[lane] || [];
    //         laneArray.push(entry);
    //         new_datagroups[lane] = laneArray;
    //     });
    // }
    // this.data = [];
    // _.entries(new_datagroups).forEach(entry => {
    //     this.data.push({name:entry[0], data:entry[1], color: "blue"});
    // });
    this.generateStaticData();
    this.updateChart();
    this.render();
  }

  onInitEditMode() {
    //console.log('onInitEditMode');
    this.addEditorTab('Options', 'public/plugins/sal-eventdrops/editor.html', 2);
  }

  onPanelTeardown() {
    //console.log('onPanelTeardown');
    this.$timeout.cancel(this.nextTickPromise);
  }

  generateStaticData() {

    const rString = () => Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);

    const rData = () => {
      const dates = [];
      for (let i = 0; i < 70; i++) {
        const day  = Math.floor(Math.random() * 2 );
        const hour = Math.floor(Math.random() * 23);
        const min  = Math.floor(Math.random() * 59);
        const sec  = Math.floor(Math.random() * 59);
        dates.push({ date: `2018/12/${3 + day} ${hour}:${min}:${sec}`});
      }
      return dates;
    }

    this.data = [];

    for (let i = 0; i < 5; i++) {
      this.data.push({ name: rString(), data: rData() });
    }
  }

}
