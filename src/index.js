import elementReady from 'element-is-ready';

import services from './services';
import router from './router';
import i18n from './i18n';


services.add('addRouteListener', () => router.addListener.bind(router));
services.add('getRouteUrl', () => router.getUrl.bind(router));
services.add('addAppListener', () => addAppListener);
services.add('addReadyListener', () => addReadyListener);
services.add('i18n', () => i18n.createInstance());


//DEPRECATED: use `addRouteListener()`
function addAppListener(name, handler) {
    let names = Array.isArray(name) ? name : name.split(/\s*,\s*/);
    
    names.forEach(function (name) {
        console.warn(`DEPRECATED: Use "addRouteListener('${name}.*', handler)" instead`);
        
        router.addListener(name + '.*', handler);
    });
}

function addReadyListener(selector, handler) {
    elementReady(selector).then(handler, function (event) {
        console.log(event.message);
    }).catch(function (ex) {
        throw ex;
    });
}

function addPlugin(plugin, options) {
    let sm = services.createLazyManager();
    
    try {
        switch (typeof plugin) {
        case 'function':
            plugin(sm, options);
            break;
        case 'object':
            plugin.init(sm, options);
            break;
        }
    } catch (ex) {
        console.error(ex.message);
    }
}

function run() {
    let path = window.location.pathname + window.location.search;
    
    if (window !== window.top) return;
    
    router.handlePath(path);
}

// DEPRECATED: use `run()`
function handle(path) {
    console.warn('DEPRECATED: Use "run()" instead');
    
    run();
}


export default {
    addPlugin,
    run,
    handle
}
