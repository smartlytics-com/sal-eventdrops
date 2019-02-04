'use strict';

System.register(['app/plugins/sdk', 'lodash', './eventdrops/eventdrops.css!', './eventdrops/d3.v5.min.js', './eventdrops/eventdrops.min'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, d3, eventDrops, _createClass, panelDefaults, UdsEventdropsCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_eventdropsEventdropsCss) {}, function (_eventdropsD3V5MinJs) {
      d3 = _eventdropsD3V5MinJs;
    }, function (_eventdropsEventdropsMin) {
      eventDrops = _eventdropsEventdropsMin.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
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
          name_label: null
        }

      };


      window.global = window;

      _export('UdsEventdropsCtrl', UdsEventdropsCtrl = function (_MetricsPanelCtrl) {
        _inherits(UdsEventdropsCtrl, _MetricsPanelCtrl);

        function UdsEventdropsCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, UdsEventdropsCtrl);

          var _this = _possibleConstructorReturn(this, (UdsEventdropsCtrl.__proto__ || Object.getPrototypeOf(UdsEventdropsCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.$rootScope = $rootScope;

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));

          _this.data = [];
          _this.canvasid = ('id' + Math.random() * 100000).replace('.', '');
          _this.ctx = null;
          _this.chart = null;
          _this.eventDrops = null;
          _this.ready = false;

          _this.updateChart();
          return _this;
        }

        _createClass(UdsEventdropsCtrl, [{
          key: 'onDataError',
          value: function onDataError() {
            //console.log('Data error');
            this.series = [];
            this.render();
          }
        }, {
          key: 'updateChart',
          value: function updateChart() {}
        }, {
          key: 'onRender',
          value: function onRender() {
            var config = { d3: d3 };
            config['range'] = { start: this.dashboard.time.from.toDate(), end: this.dashboard.time.to.toDate() };
            //config['bound'] = {format: d3.timeFormat('%d %B \'%y %H:%M:%S')};
            //config['zoom'] = {onZoomStart: null,onZoom: null,onZoomEnd: null,minimumScale: 0,maximumScale: Infinity};
            config['metaballs'] = { blurDeviation: 1000, colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10' };
            config['line'] = { color: function color(_, index) {
                return d3.schemeCategory10[index];
              }, height: 40 };
            config['label'] = { padding: 5, text: function text(d) {
                return '' + d.name;
              }, width: 10 }; //config['label'] = {padding: 5,text: d => `${d.name} (${d.data.length})`,width: 100};
            config['drop'] = { color: function color(d) {
                return d.color || 'blue';
              }, radius: function radius(d) {
                return d.radius || 2;
              }, date: function date(d) {
                return new Date(d.date);
              } };
            //config['drop'] = {color: d => d.color || 'blue', radius: d => d.radius || 2, date: d => new Date(d.date), onClick: event => {}, onMouseOver: event => {console.log('smu', event)}, onMouseOut: event => {}};
            this.eventDrops = eventDrops(config);
            this.chart = d3.select("#" + this.canvasid);

            if (this.data && this.eventDrops) {
              console.log('draw', this.data);
              var global = window;
              this.chart.data([this.data]).call(this.eventDrops);
              //console.log(new Date('2018-12-03 23:35:00'));
              //this.chart.data([[{name:'Smu', color:'yellow', data:[{date:'2018-12-03 23:55:00'}]}]]).call(this.eventDrops);
            }

            //this.chart.render();
          }
        }, {
          key: 'decodeNonHistoricalData',
          value: function decodeNonHistoricalData(fulldata) {
            this.updateChart();
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var _this2 = this;

            var new_datagroups = {};

            var _loop = function _loop(set) {
              var laneIdx = dataList[set].columns.findIndex(function (item) {
                return item.text == "lane";
              });
              var labelIdx = dataList[set].columns.findIndex(function (item) {
                return item.text == "label";
              });
              var pointIdx = dataList[set].columns.findIndex(function (item) {
                return item.text == "point";
              });
              var colorIdx = dataList[set].columns.findIndex(function (item) {
                return item.text == "color";
              });
              var radiusIdx = dataList[set].columns.findIndex(function (item) {
                return item.text == "radius";
              });

              dataList[set].rows.forEach(function (row) {
                var lane = row[laneIdx];
                var entry = {
                  'date': new Date(row[pointIdx]),
                  'label': row[labelIdx],
                  'color': colorIdx > -1 ? row[colorIdx] : 'blue',
                  'radius': radiusIdx > -1 ? row[radiusIdx] : 1
                };
                var laneArray = new_datagroups[lane] || [];
                laneArray.push(entry);
                new_datagroups[lane] = laneArray;
              });
            };

            for (var set = 0; set < dataList.length; set++) {
              _loop(set);
            }
            this.data = [];
            Object.entries(new_datagroups).forEach(function (entry) {
              _this2.data.push({ name: entry[0], data: entry[1], color: "blue" });
            });

            this.updateChart();
            this.render();
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            //console.log('onInitEditMode');
            this.addEditorTab('Options', 'public/plugins/uds-eventdrops-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            //console.log('onPanelTeardown');
            this.$timeout.cancel(this.nextTickPromise);
          }
        }]);

        return UdsEventdropsCtrl;
      }(MetricsPanelCtrl));

      _export('UdsEventdropsCtrl', UdsEventdropsCtrl);

      UdsEventdropsCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=udseventdrops_ctrl.js.map
