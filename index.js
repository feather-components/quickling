var Pagelet = require('static/pagelet.js');

function $(selector, context){
    if(typeof selector == 'string'){
        if(!context){
            return document.querySelectorAll(selector);
        }else{
            var remove = false;

            context = $(context)[0];

            if(!context.id){
                remove = true;
                context.id = '__quickling__';
            }

            var elements = $('#' + context.id + ' ' + selector);
            remove && context.removeAttribute('id');
            return elements;
        }
    }else{
        return selector.nodeType ? [selector] : selector;
    }
}

function each(items, callback){
    for(var i = 0; i < items.length; i++){
        callback(items[i], i);
    }
}

function on(dom, event, callback){
    if(dom.addEventListener){
        dom.addEventListener(event, callback, false);
    }else{
        dom.attachEvent('on' + event, callback);
    }
}

function remove(dom, event, callback){
    if(dom.removeEventListener){
        dom.removeEventListener(event, callback);
    }else{
        dom.detachEvent('on' + event, callback);
    }
}

var instance;

exports.init = function(className, container){
    if(instance){
        throw new Error('Quickling\'s instance must be only one!');
    }

    return new Quickling(className, container);
};

function Quickling(selector, container){
    var self = this;

    self.events = {};
    self.selector = selector;
    self.container = $(container)[0];
    self.initEvent();
    self.listen();
}

Quickling.prototype = {
    listen: function(container){
        var self = this;
        var elements = $(self.selector, container);

        each(elements, function(element){
            element.$listener = function(e){
                self.load(element);
                e.preventDefault ? e.preventDefault() : (window.event.returnValue = false);
            };

            on(element, 'click', element.$listener);
        });
    },

    clear: function(container, removeChild){
        var self = this;
        var elements = $(self.selector, container);

        each(elements, function(element){
            remove(element, 'click', element.$listener);
        });

        removeChild && (container.innerHTML = '');
    },

    initEvent: function(){
        var self = this;

        on(window, 'hashchange', function(e){
            self.load();
        });

        setTimeout(function(){
            self.load();
        }, 0);    
    },

    load: function(item){
        typeof item == 'object' ? this._loadByItem(item) : this._loadByUrl(item);
    },

    _loadByItem: function(item){
        var url = item.getAttribute('href') || item.getAttribute('data-url');
        location.hash = '#!' + url;
    },

    _loadByUrl: function(url){
        var self = this;

        if(!url){
            if(location.hash.indexOf('#!') == -1){
                self.trigger('empty');
                self.clear(self.container, true);
                return ;
            }

            url = location.hash;
        }

        if(url.indexOf('#!') > -1){
            url = url.substring(2);
        }

        self.trigger('send:before', url);

        if(self.loader){
            self.loader.abort();
            self.trigger('send:abort', url);
        }

        self.loader = Pagelet.load(url, function(data, status){
            self.loader = null;
            self.clear(self.container, true);
            Pagelet.append(self.container, data);
            self.trigger('send:back', data, status);
            setTimeout(function(){
                self.listen(self.container);
            }, 100);
        });
    },

    on: function(event, callback){
        var self = this, events = self.events;

        if(!events[event]){
            events[event] = [callback];
        }else{
            events[event].push(callback);
        }

        return self;
    },

    trigger: function(event){
        var self = this, events = self.events[event] || [];
        var args = [].slice.call(arguments, 1);

        each(events, function(event){
            event.apply(self, args);
        });

        return self;
    }
};