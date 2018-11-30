import Router from 'routes';
import EventEmitter from 'events';
import elementReady from 'element-is-ready';

import router from './router';

const emitter = new EventEmitter();


function fireRouteEvent(match) {
    let name = match.name;
    // TODO: don't add name to params (could conflict with 'name' parameter)
    let params = {
        name: match.name,
        ...match.params
    };
    let index;
    
    emitter.emit('route:' + match.name, params);
    
    do {
        emitter.emit('route:' + name + '.*', params);
        
        index = name.lastIndexOf('.');
        name = name.substring(0, index);
    } while (index >= 0);
}

function fireAppEvent(match) {
    let name = match.name;
    let app = name.substring(0, name.indexOf('.')) || name;
    
    emitter.emit('application:' + app, { name: app });
}

function addRouteListener(name, handler) {
    let names = Array.isArray(name) ? name : name.split(/\s*,\s*/);
    
    names.forEach(function (name) {
        if (name.startsWith('course.')) {
            name = 'courses.' + name.substring(7);
            
            console.warn(`DEPRECATED: Use "addRouteListener('${name}', handler)" instead`);
        }
        
        emitter.on('route:' + name, handler);
    });
}

//DEPRECATED: use `addRouteListener()`
function addAppListener(name, handler) {
    let names = Array.isArray(name) ? name : name.split(/\s*,\s*/);
    
    names.forEach(function (name) {
        console.warn(`DEPRECATED: Use "addRouteListener('${name}.*', handler)" instead`);
        
        emitter.on('application:' + name, handler);
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
    let services = {
        addRouteListener,
        addAppListener,
        addReadyListener
    };
    
    try {
        switch (typeof plugin) {
        case 'function':
            plugin(services, options);
            break;
        case 'object':
            plugin.init(services, options);
            break;
        }
    } catch (ex) {
        console.error(ex.message);
    }
}

function run() {
    let path = window.location.pathname + window.location.search;
    let match = router.match(path);
    
    if (match === undefined) return false;
    
    if (window !== window.top) return;
    
    fireRouteEvent(match);
    fireAppEvent(match); 
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
