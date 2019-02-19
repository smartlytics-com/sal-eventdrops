import { UdsEventdropsCtrl } from './udseventdrops_ctrl';
import { loadPluginCss } from "grafana/app/plugins/sdk";

loadPluginCss({
    dark: "plugins/sal-eventdrops/css/event-drops.css",
    light: "plugins/sal-eventdrops/css/event-drops.css",
});

export {
    UdsEventdropsCtrl as PanelCtrl
};