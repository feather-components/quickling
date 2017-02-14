;(function(factory){
if(typeof module === 'object' && typeof module.exports == 'object'){
    module.exports = factory(
        require('router'),
        require('static/pagelet')
    );
}else{
    window.Quickling = factory(window.Router, window.Pagelet);
}
})(function(Router, Pagelet){

function $(selector, context){
    if(typeof selector == 'string'){
        if(!context){
            return document.querySelectorAll(selector) || [];
        }else{
            var remove = false;

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

function createElement(){
    var element = document.createElement('div');
    attr(element, 'class', 'quickling-container');
    return element;
}

function attr(element, name, value){
    console.log(element);
    if(typeof value === 'undefined'){
        return element.getAttribute(name);
    }

    element.setAttribute(name, value);
}

function now(){
    return (new Date).getTime();
}

function show(element){
    element.style.display = 'block';
}

function hide(element){
    element.style.display = 'none';
}

function Quickling(selector, container){
    var self = this;

    self.selector = selector;
    self.container = $(container)[0];
    self.expires = 0;
    self.isForce = false;
    self.router = new Router();
    self.initEvent();
    self.listen();
}

Quickling.prototype = {
    listen: function(container){
        var self = this;
        var elements = $(self.selector, container);

        Router.each(elements, function(element){
            element.$listener = function(e){
                self.load(attr(element, 'href') || attr(element, 'data-url'), attr(element, 'data-cache') != 'true');
                e.preventDefault ? e.preventDefault() : (window.event.returnValue = false);
            };

            Router.on(element, 'click', element.$listener);
        });
    },

    clear: function(container){
        var self = this;
        var elements = $(self.selector, container);

        Router.each(elements, function(element){
            Router.off(element, 'click', element.$listener);
        });

        container.innerHTML = '';
    },

    initEvent: function(){
        var self = this;

        self.router.listen('^!?$', function(){
            self.clear(self.container, true);
            self.trigger('empty');
        });

        self.router.listen('^!([\\s\\S]+)', function(hash){
            self._loadByUrl(hash);
        });
    },

    load: function(url, force){
        if(force){
            this.isForce = true;
        }

        this.router.go('!' + url);
    },

    _loadByUrl: function(hash){
        var url = hash.substr(1);
        var self = this;
        var elements = $('.quickling-container', self.container);

        Router.each(elements, hide);
        self.loader && self.loader.abort();

        var element;

        for(var i = 0; i < elements.length; i++){
            if(attr(elements[i], 'data-url') == url){
                element = elements[i];
                break;
            }
        }

        self.trigger('send:before', hash);

        if(!element || self.isForce 
            || !self.expires
            || attr(element, 'data-time') < (now() - self.expires)
        ){
            self.isForce = false;
            self.loader = Pagelet.load(url, function(data, status){
                self.loader = null;

                if(!element){
                    element = createElement();
                    attr(element, 'data-url', url);
                }else{
                    self.clear(element);
                }

                self.container.appendChild(element);
                Pagelet.append(element, data);
                show(element);
                attr(element, 'data-time', now());
                self.trigger('send:back', data, status);
                setTimeout(function(){
                    self.listen(element);
                }, 100);
            });
        }else{
            show(element);
            self.trigger('cache:back');
        }        
    },

    start: function(){
        this.router.start();
        return this;
    },

    stop: function(){
        this.router.stop();
        return this;
    },

    on: function(){
        this.router.on.apply(this.router, arguments);
        return this;
    },

    trigger: function(){
        this.router.trigger.apply(this.router, arguments);
        return this;
    },

    cache: function(time){
        this.expires = time;
        return this;
    }
};

var instance;

return function(className, container){
    if(instance){
        return instance;
    }

    return instance = new Quickling(className, container);
};

});