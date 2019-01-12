import {
  MetricsPanelCtrl,
}
from 'app/plugins/sdk';
import _ from 'lodash';
import './eventdrops/eventdrops.css!';
import * as d3 from './eventdrops/d3.v5.min.js';
import eventDrops from './eventdrops/eventdrops.min';

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

window.global = window;

export class UdsEventdropsCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
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

    this.data = [];
    this.canvasid = ('id' + (Math.random() * 100000)).replace('.', '');
    this.ctx = null;
    this.chart = null;
    this.eventDrops = null;
    this.ready = false;

    this.updateChart();
  }

  onDataError() {
    //console.log('Data error');
    this.series = [];
    this.render();
  }

  updateChart() {
  }

  onRender() {
    let config = {d3};
    config['range'] = {start: this.dashboard.time.from.toDate(), end: this.dashboard.time.to.toDate()};
    //config['bound'] = {format: d3.timeFormat('%d %B \'%y %H:%M:%S')};
    //config['zoom'] = {onZoomStart: null,onZoom: null,onZoomEnd: null,minimumScale: 0,maximumScale: Infinity};
    config['metaballs'] = {blurDeviation: 1000, colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10'};
    config['line'] = {color: (_, index) => d3.schemeCategory10[index], height: 40};
    config['label'] = {padding: 5,text: d => `${d.name}`,width: 10}; //config['label'] = {padding: 5,text: d => `${d.name} (${d.data.length})`,width: 100};
    config['drop'] = {color: d => d.color || 'blue', radius: d => d.radius || 2, date: d => new Date(d.date)};
    //config['drop'] = {color: d => d.color || 'blue', radius: d => d.radius || 2, date: d => new Date(d.date), onClick: event => {}, onMouseOver: event => {console.log('smu', event)}, onMouseOut: event => {}};
    this.eventDrops = eventDrops( config );
    this.chart = d3.select("#" + this.canvasid);

    if (this.data && this.eventDrops) {
        console.log('draw',this.data);
        let global = window;
        this.chart.data([this.data]).call(this.eventDrops);
        //console.log(new Date('2018-12-03 23:35:00'));
        //this.chart.data([[{name:'Smu', color:'yellow', data:[{date:'2018-12-03 23:55:00'}]}]]).call(this.eventDrops);
    }

    //this.chart.render();
  }

  decodeNonHistoricalData(fulldata) {
    this.updateChart();
  }

  //***************************************************
  // Data received
  //***************************************************
  onDataReceived(dataList) {
    let new_datagroups = {};
    for (let set = 0; set < dataList.length; set++) {
        let laneIdx = dataList[set].columns.findIndex(item=>item.text == "lane");
        let labelIdx = dataList[set].columns.findIndex(item=>item.text == "label");
        let pointIdx = dataList[set].columns.findIndex(item=>item.text == "point");
        let colorIdx = dataList[set].columns.findIndex(item=>item.text == "color");
        let radiusIdx = dataList[set].columns.findIndex(item=>item.text == "radius");

        dataList[set].rows.forEach(row => {
            let lane = row[laneIdx];
            let entry = {
                'date' : new Date(row[pointIdx]),
                'label' : row[labelIdx],
                'color' : (colorIdx>-1) ? row[colorIdx] : 'blue',
                'radius' : (radiusIdx>-1) ? row[radiusIdx] : 1
            };
            let laneArray = new_datagroups[lane] || [];
            laneArray.push(entry);
            new_datagroups[lane] = laneArray;
        });
    }
    this.data = [];
    Object.entries(new_datagroups).forEach(entry => {
        this.data.push({name:entry[0], data:entry[1], color: "blue"});
    });

    this.updateChart();
    this.render();
  }

  onInitEditMode() {
    //console.log('onInitEditMode');
    this.addEditorTab('Options', 'public/plugins/uds-eventdrops-panel/editor.html', 2);
  }

  onPanelTeardown() {
    //console.log('onPanelTeardown');
    this.$timeout.cancel(this.nextTickPromise);
  }

}

UdsEventdropsCtrl.templateUrl = 'module.html';