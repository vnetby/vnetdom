(function () {
  if (typeof window.CustomEvent === "function") return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();


class DOM {

  constructor() {
    this.document = document;
    this.body = this.document.body;
    this.window = window;
    this.scrollBarWidth = this.getScrollbarWidth();

    this.debug = true;

    this.__initBodyClick();
    this.__initBodyChange();
  }




  /**
   * 
   * @param {*} el 
   * @param {*} container
   * @return always array
   */

  getDomArray(el, container) {
    container = this.getContainer(container);
    if (this.isDom(el)) return [el];
    if (this.isDomArray(el)) return el;
    if (this.isSelector(el)) {
      let res = this.findAll(el, container);
      return res ? res : [];
    }
    return [];
  }



  /**
   * 
   * @param {*} selector 
   * @param {*} container 
   * @return dom element or false;
   */

  findFirst(selector, container) {
    if (!selector || typeof selector !== 'string') return false;
    container = this.getContainer(container);

    return this.__run(() => {
      let obj = container.querySelector(selector);
      return obj;
    });

  }



  /**
   * 
   * @param {*} selector 
   * @param {*} container 
   * @return array of dom elements or false
   */

  findAll(selector, container) {
    if (!selector || typeof selector !== 'string') return false;
    container = this.getContainer(container);

    return this.__run(() => {
      let items = container.querySelectorAll(selector);
      if (items && items.length) {
        let res = [];
        let total = items.length;
        for (let i = 0; i < total; i++) {
          res.push(items[i]);
        }
        return res;
      }
      return false;
    });

  }








  /**
   * 
   * @param {*} container
   * return element or body
   */

  getContainer(container) {
    if (!container) return this.body;
    return this.__run(() => {
      if (this.isDom(container)) return container;
      container = this.findFirst(container);
      return container ? container : this.body;
    });
  }




  /**
   * 
   * @param {*} str 
   * @param {object} variables
   * @return document fragment or false
   */

  strToDom(str, variables) {
    if (!str) return false;
    return this.__run(() => {
      if (typeof variables === 'object') {
        Object.keys(variables).forEach(varName => str = str.replace(new RegExp(`\{\{${varName}\}\}`, 'gs'), variables[varName]));
      }
      let div = this.create('div');
      div.innerHTML = str;
      let fragment = this.document.createDocumentFragment();
      let childs = div.childNodes;
      let total = childs.length;
      for (let i = 0; i < total; i++) {
        let node = childs[i];
        fragment.appendChild(node.cloneNode(true));
      }
      return fragment;
    });
  }




  /**
   * 
   * @param {*} el
   * - find all script tags
   * - if has src attribute it will append to head
   * - else wil be exec in eval 
   */

  execInlineScripts(el) {
    return this.__run(() => {

      this.getDomArray(el).forEach(item => {

        let scripts = this.findAll('script', item);
        if (!scripts) return;

        scripts.forEach(script => {
          if (script.hasAttribute('src')) {
            this.document.head.appendChild(this.create('script', { src: script.getAttribute('src') }));
          } else {
            eval(script.innerHTML);
          }
        });

      });

    });
  }




  /**
   * 
   * @param {string} tag 
   * @param {string || object} attrs
   * - if attrs is string value wil be used like class
   * @return dom element or false
   */

  create(tag, attrs) {
    return this.__run(() => {
      let item = this.document.createElement(tag);
      if (!attrs) return item;
      if (typeof attrs === 'string') {
        item.setAttribute('class', attrs);
        return item;
      }
      if (typeof attrs === 'object') {
        for (let key in attrs) {
          let attrName = this.__getAttrName(key);
          item.setAttribute(attrName, attrs[key]);
        }
        return item;
      }
      return item;
    });
  }




  getScrollbarWidth() {
    return this.window.innerWidth - this.document.documentElement.clientWidth;
  }





  next(el) {
    return this.__run(() => {
      el = this.getElement(el);
      let next = el.nextSibling;
      while (next && !this.isDom(next)) {
        next = next.nextSibling;
      }
      return this.isDom(next) ? next : false;
    });
  }




  prev(el) {
    return this.__run(() => {
      el = this.getElement(el);
      let prev = el.previousSibling;
      while (prev && !this.isDom(prev)) {
        prev = prev.previousSibling;
      }
      return this.isDom(prev) ? prev : false;
    });
  }





  getElement(el, container) {
    if (!el) return false;
    return this.__run(() => {
      container = this.getContainer(container);
      if (this.isDom(el)) return el;
      el = this.findFirst(el);
      return el ? el : false;
    });
  }




  css(el, style = {}, container) {
    return this.__run(() => {
      this.getDomArray(el, container).forEach(item => {
        let css = '';
        for (let key in style) {
          css += css ? ' ' : '';
          css += `${this.__fromCamelCase(key)}: ${style[key]};`;
        }
        css = css.trim();
        item.setAttribute('style', css);
      });
    });
  }



  addCss(el, style, container) {
    return this.__run(() => {
      this.getDomArray(el, container).forEach(item => {
        let css = item.getAttribute('style');
        css = css ? css : '';
        for (let key in style) {
          let prop = this.__fromCamelCase(key);
          css = css.replace(new RegExp(`[\s]*${prop}[^;]*[;]*`, 'g'), '');
          css += css ? '' : ' ';
          css += `${prop}: ${style[key]};`;
        }
        css = css.trim();
        item.setAttribute('style', css);
      });
    });
  }




  hasCss(el, prop) {
    el = this.getElement(el);
    if (!el) return false;
    return this.__run(() => !!el.style[this.__fromCamelCase(prop)]);
  }




  getCss(el, prop) {
    el = this.getElement(el);
    if (!el) return false;
    return this.__run(() => {
      let res = el.style[this.__fromCamelCase(prop)];
      return res ? res : false;
    });
  }




  getStyle(el, prop) {
    el = this.getElement(el);
    if (!el) return false;
    return this.__run(() => {
      let style = this.window.getComputedStyle(el);
      let res = style[prop];
      return res ? res : false;
    });
  }




  setAttr(el, attrs = {}, container) {
    return this.__run(() => {
      this.getDomArray(el, container).forEach(item => {
        for (let key in attrs) {
          let attrName = this.__getAttrName(key);
          item.setAttribute(attrName, attrs[key]);
        }
      });
    });
  }




  dispatch(el, e, sets = {}) {
    let realSets = {
      bubbles: true, cancelable: true, detail: undefined, ...sets
    };
    let ev = new CustomEvent(e, realSets);
    this.getDomArray(el).forEach(item => {
      item.dispatchEvent(ev);
    });
  }




  jsonStringify(obj) {
    let res = this.__run(() => JSON.stringify(obj));
    if (!res) {
      console.log(obj);
      return false;
    }
    return res;
  }




  jsonParse(str) {
    let res = this.__run(() => JSON.parse(str));
    if (!res) {
      console.log(str);
      return false;
    }
    return res;
  }




  ajax({ url, data, preloader, timeout, minTimeResponse, preloaderHTML }) {

    timeout = timeout ? timeout : 0;
    minTimeResponse = minTimeResponse ? minTimeResponse : 0;

    let type = data ? "post" : "get";

    let requestData = this.__getRequestData(data);

    if (preloader) {
      this.addPreloader(preloader, preloaderHTML);
    }

    return new Promise((resolve, reject) => {

      setTimeout(() => {
        let countTime = 0;

        let interval = setInterval(() => {
          countTime++;
        }, 1);

        let http = new XMLHttpRequest();

        http.open(type, url);
        http.send(requestData);


        http.onreadystatechange = () => {

          if (http.readyState === 4 && http.status === 200) {
            if (countTime < minTimeResponse) {
              let lastTime = minTimeResponse - countTime;
              setTimeout(() => {
                clearInterval(interval);
                if (preloader) {
                  this.removePreloader(preloader);
                }
                resolve(http.responseText);
              }, lastTime);

            } else {
              clearInterval(interval);
              if (preloader) {
                this.removePreloader(preloader);
              }
              resolve(http.responseText);
            }
          }

        };
      }, timeout);


    });
  }















  addPreloader(container, preloaderHTML) {
    if (!preloaderHTML) return;
    container = this.getContainer(container);

    let childs = this.childNodes(container);
    let existPreloader = false;

    if (childs) {
      existPreloader = childs.some(item => item.classList.contains('ajax-preloader'));
    }

    if (!existPreloader) {
      existPreloader = preloaderHTML;
      container.appendChild(preloaderHTML);
    }

    dom.addClass(preloaderHTML, 'visible');
  }





  childNodes(container) {
    let childs = container.childNodes;
    let res = [];
    for (let i = 0; i < childs.length; i++) {
      if (!childs[i] || !childs[i].tagName) continue;
      res.push(childs[i]);
    }
    return res.length ? res : false;
  }




  removePreloader(container) {
    container = this.getContainer(container);
    let preloader = dom.findFirst('.ajax-preloader', container);
    if (!preloader) return;
    this.removeClass(preloader, 'visible');
  }




  createRequestDataString(data) {
    if (!data) return null;
    let str = "";
    Object.keys(data).forEach((key, i) => {
      let val = data[key];
      if (!i) {
        str += `${key}=${val}`;
      } else {
        str += `&${key}=${val}`;
      }
    });
    return str;
  }




  addClass(el, className, container) {
    if (!className) return false;
    return this.__run(() => {
      className = className.split(' ').map(name => name.trim());
      this.getDomArray(el, container).forEach(item => {
        className.forEach(newClass => {
          if (item.classList.contains(newClass)) return;
          item.classList.add(newClass);
        });
      });
    });
  }




  removeClass(el, className, container) {
    if (!className) return false;
    return this.__run(() => {
      className = className.split(' ').map(name => name.trim());
      this.getDomArray(el, container).forEach(item => {
        className.forEach(newClass => {
          if (!item.classList.contains(newClass)) return;
          item.classList.remove(newClass);
        });
      });
    });
  }




  getEventPath(e) {
    if (e.path && e.path.length) return e.path;
    let res = [];

    let item = e.target;
    res.push(item);

    while (item = item.parentNode) {
      if (typeof item !== 'object' || !item.tagName) continue;
      res.push(item);
      if (item.tagName === 'BODY') break;
    }
    return res;
  }




  toggleClass(el, className) {
    if (!className) return false;
    return this.__run(() => {
      className = className.split(' ').map(name => name.trim());
      this.getDomArray(el).forEach(item => {
        className.forEach(newClass => {
          if (!item.classList.contains(newClass)) {
            item.classList.add(newClass);
          } else {
            item.classList.remove(newClass);
          }
        });
      });
    });
  }



  isInViewport(el, margin = 200) {
    el = this.getElement(el);
    if (!el) return false;
    margin = this.__getSizeValue(margin);
    return this.__run(() => {
      let scroll = this.window.pageYOffset;
      let elTop = el.getBoundingClientRect().top;
      let elHeight = el.offsetHeight;
      let windowHeight = this.window.innerHeight;

      let top = elTop + scroll - margin - windowHeight;

      let bottom = elTop + scroll + elHeight + margin;

      return scroll >= top && scroll <= bottom;
    });

  }


  on(event, selector, fn, where) {
    this.getDomArray(selector, where).forEach(item => {
      item.addEventListener(event, fn);
    });
  }

  onClick(selector, fn, where) {
    this.getDomArray(selector, where).forEach(item => {
      item.addEventListener('click', fn);
    });
  }

  onChange(selector, fn, where) {
    this.getDomArray(selector, where).forEach(item => {
      item.addEventListener('change', fn);
    });
  }

  onMouseenter(selector, fn, where) {
    this.getDomArray(selector, where).forEach(item => {
      item.addEventListener('mouseenter', fn);
    });
  }

  onWindowScroll(fn) {
    let timer;
    this.window.addEventListener('scroll', e => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(e);
      }, 5);
    });
  }

  onWindowResize(fn) {
    let timer;
    this.window.addEventListener('resize', e => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(e);
      }, 5);
    })
  }



  each(selector, fn, where) {
    this.getDomArray(selector, where).forEach(item => {
      fn(item);
    });
  }








  //============================================
  //              CONDITIONALS
  //============================================
  isDom(el) {
    return el && typeof el === 'object' && el.tagName;
  }
  isDomArray(elsArr) {
    return typeof elsArr === 'object' && elsArr.length && elsArr.every(el => this.isDom(el));
  }
  isSelector(el) {
    return el && typeof el === 'string';
  }
  isYOverflow(el) {
    return el.scrollHeight > el.offsetHeight;
  }




  //============================================
  //             PRIVATE FUNCTIONS
  //============================================

  __run(fn) {
    let res = false;
    try {
      res = fn();
    } catch (err) {
      this.__throwError(err);
      return false;
    }
    return res;
  }


  __getRequestData(data) {
    if (!data) return false;
    let requestData = false;
    if (typeof data === "object") {
      if (data instanceof FormData) {
        requestData = data;
      } else {
        requestData = new FormData();
        for (let key in data) {
          requestData.append(key, data[key]);
        }
      }
    }
    return requestData;
  }


  __getSizeValue(val) {
    if (!val) return 0;

    if (val.toString().includes('vh')) {
      val = parseFloat(val.replace(/[^\d\-\+\.]+/g, ""));
      val = val * this.window.innerHeight / 100;
      return val;
    }

    if (val.toString().includes('vw')) {
      val = parseFloat(val.replace(/[^\d\.]+/g, ""));
      val = val * this.window.innerWidth / 100;
      return val;
    }

    return parseFloat(val);
  }

  __getAttrName(attr) {
    if (!attr) return false;
    if (attr === 'className') return 'class';
    return this.__fromCamelCase(attr);
  }


  __fromCamelCase(str) {
    if (!str) return false;
    return str.replace(/\.?([A-Z])/g, (x, y) => "-" + y.toLowerCase()).replace(/^-/, "");
  }


  __throwError(e) {
    this.debug && console.error(e);
  }


  __initBodyClick() {
    this.body.addEventListener('click', this.__parseBodyClick.bind(this));
  }


  __initBodyChange() {
    this.body.addEventListener('change', this.__parseBodyChange.bind(this));
  }


  __parseBodyClick(e) {
    let path = this.getEventPath(e);

    if (!path || !path.length) return;

    path.forEach(target => {
      if (!target || !target.tagName) return;

      if (target.hasAttribute && target.hasAttribute('data-prevent-default')) {
        e.preventDefault();
      }

      if (target.hasAttribute && target.hasAttribute('data-click-event')) {
        this.dispatch(target, target.dataset.clickEvent);
      }

      if (target.hasAttribute && target.hasAttribute('data-toggle-class')) {
        this.toggleClass(target, target.dataset.toggleClass);
      }

      if (target.classList && target.classList.contains('material-btn')) {
        this.__materialBtn(e, target);
      }

    });
  }


  __parseBodyChange(e) {
    let path = this.getEventPath(e);

    if (!path || !path.length) return;

    path.forEach(target => {
      if (!target || !target.tagName) return;

      if (target.hasAttribute('data-prevent-default')) {
        e.preventDefault();
      }

      if (target.hasAttribute('data-change-event')) {
        this.dispatch(target, target.dataset.changeEvent);
      }

    });
  }


  __materialBtn(e, target) {
    let inkEl = this.findFirst('.ink', target);
    if (inkEl) {
      this.removeClass(inkEl, 'animate');
    } else {
      inkEl = this.create('span', 'ink');
      let size = Math.max(target.offsetWidth, target.offsetHeight);
      this.css(inkEl, { width: `${size}px`, height: `${size}px` });
      target.appendChild(inkEl);
    }
    this.addCss(inkEl, { left: `${e.offsetX - inkEl.offsetWidth / 2}px`, top: `${e.offsetY - inkEl.offsetHeight / 2}px`, opacity: 1 });
    this.addClass(inkEl, 'animate');
    inkEl.addEventListener('animationend', e => {
      if (!inkEl.parentNode) return;
      inkEl.parentNode.removeChild(inkEl);
    });
  }

}






const dom = new DOM;
export { dom };
