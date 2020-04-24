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

    this.isDev = true;

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
    try {
      let obj = container.querySelector(selector);
      return obj;
    } catch (e) {
      this.__throwError(e);
      return false;
    }
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
    try {
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
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }



  /**
   * 
   * @param {*} container
   * return element or body
   */

  getContainer(container) {
    if (!container) return this.body;
    if (this.isDom(container)) return container;
    try {
      container = this.findFirst(container);
    } catch (e) {
      this.__throwError(e);
    }
    return container ? container : this.body;
  }




  /**
   * 
   * @param {*} str 
   * @param {object} variables
   * @return document fragment or false
   */

  strToDom(str, variables) {
    if (!str) return false;
    try {
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
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  /**
   * 
   * @param {*} el
   * - find all script tags
   * - if has src attribute it will append to head
   * - else wil be exec in eval 
   */

  execInlineScripts(el) {
    try {
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
    } catch (e) {
      this.__throwError(e);
    }
  }




  /**
   * 
   * @param {string} tag 
   * @param {string || object} attrs
   * - if attrs is string value wil be used like class
   * @return dom element or false
   */

  create(tag, attrs) {
    try {
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
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }





  next(el) {
    try {
      el = this.getElement(el);
      let next = el.nextSibling;
      while (next && !this.isDom(next)) {
        next = next.nextSibling;
      }
      return this.isDom(next) ? next : false;
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  prev(el) {
    try {
      el = this.getElement(el);
      let prev = el.previousSibling;
      while (prev && !this.isDom(prev)) {
        prev = prev.previousSibling;
      }
      return this.isDom(prev) ? prev : false;
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }





  getElement(el, container) {
    if (!el) return false;
    try {
      container = this.getContainer(container);
      if (this.isDom(el)) return el;
      el = this.findFirst(el);
      return el ? el : false;
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  css(el, style = {}) {
    try {
      this.getDomArray(el).forEach(item => {
        let css = '';
        for (let key in style) {
          css += css ? ' ' : '';
          css += `${this.__fromCamelCase(key)}: ${style[key]};`;
        }
        css = css.trim();
        item.setAttribute('style', css);
      });
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }



  addCss(el, style) {
    try {
      this.getDomArray(el).forEach(item => {
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
    } catch (e) {
      this.__throwError(e);
    }
  }




  hasCss(el, prop) {
    el = this.getElement(el);
    if (!el) return false;
    try {
      return !!el.style[this.__fromCamelCase(prop)];
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  getCss(el, prop) {
    el = this.getElement(el);
    if (!el) return false;
    try {
      let res = el.style[this.__fromCamelCase(prop)];
      return res ? res : false;
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  getStyle(el, prop) {
    el = this.getElement(el);
    if (!el) return false;
    try {
      let style = this.window.getComputedStyle(el);
      let res = style[prop];
      return res ? res : false;
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  setAttr(el, attrs = {}) {
    try {
      this.getDomArray(el).forEach(item => {
        for (let key in attrs) {
          let attrName = this.__getAttrName(key);
          item.setAttribute(attrName, attrs[key]);
        }
      });
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  dispatch(el, e, sets = {}) {
    let realSets = {
      bubbles: true, cancelable: true, detail: undefined, ...sets
    };
    let ev = new CustomEvent(e, realSets);
    el.dispatchEvent(ev);
  }




  ajax({ url, data, preloader, timeout, minTimeResponse, preloaderHTML }) {
    timeout = timeout ? timeout : 0;
    minTimeResponse = minTimeResponse ? minTimeResponse : 0;

    let type = data ? "post" : "get";

    let requestData;

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

    let existPreloader = this.findFirst('.ajax-preloader', container);

    if (!existPreloader) {
      existPreloader = preloaderHTML;
      container.appendChild(preloaderHTML);
    }

    dom.addClass(preloaderHTML, 'visible');
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




  addClass(el, className) {
    if (!className) return false;
    try {
      className = className.split(' ').map(name => name.trim());
      this.getDomArray(el).forEach(item => {
        className.forEach(newClass => {
          if (item.classList.contains(newClass)) return;
          item.classList.add(newClass);
        });
      });
    } catch (e) {
      this.__throwError(e);
      return false;
    }
  }




  removeClass(el, className) {
    if (!className) return false;
    try {
      className = className.split(' ').map(name => name.trim());
      this.getDomArray(el).forEach(item => {
        className.forEach(newClass => {
          if (!item.classList.contains(newClass)) return;
          item.classList.remove(newClass);
        });
      });
    } catch (e) {
      this.__throwError(e);
    }
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
    try {
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
    } catch (e) {
      this.__throwError(e);
    }
  }



  isInViewport(el, margin = 200) {
    el = this.getElement(el);
    if (!el) return false;
    try {
      let scroll = this.window.pageYOffset;
      let elTop = el.getBoundingClientRect().top;
      let elHeight = el.offsetHeight;
      let windowHeight = this.window.innerHeight;

      let top = elTop + scroll - margin - windowHeight;

      let bottom = elTop + scroll + elHeight + margin;

      return scroll >= top && scroll <= bottom;

    } catch (e) {
      this.__throwError(e);
      return false;
    }

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




  //============================================
  //             PRIVATE FUNCTIONS
  //============================================

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
    this.isDev && console.error(e);
  }

  __initBodyClick() {
    this.body.addEventListener('click', this.__parseBodyClick.bind(this));
  }

  __initBodyChange() {
    this.body.addEventListener('change', this.__parseBodyChange.bind(this));
  }

  __parseBodyClick(e) {
    let target;
    let path = this.getEventPath(e);

    if (target = this.__eventPathHasAttribute(path, 'data-prevent-default')) {
      e.preventDefault();
    }

    if (target = this.__eventPathHasAttribute(path, 'data-click-event')) {
      this.dispatch(target, target.dataset.clickEvent);
    }

    if (target = this.__eventPathHasAttribute(path, 'data-toggle-class')) {
      this.toggleClass(target, target.dataset.toggleClass);
    }

    if (target = this.__eventPathHasClass(path, 'material-btn')) {
      this.__materialBtn(e, target);
    }
  }

  __parseBodyChange(e) {
    let target;
    let path = this.getEventPath(e);

    if (target = this.__eventPathHasAttribute(path, 'data-prevent-default')) {
      e.preventDefault();
    }

    if (target = this.__eventPathHasAttribute(path, 'data-change-event')) {
      this.dispatch(target, target.dataset.changeEvent);
    }
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
    this.addCss(inkEl, { left: `${e.offsetX - inkEl.offsetWidth / 2}px`, top: `${e.offsetY - inkEl.offsetHeight / 2}px` });
    this.addClass(inkEl, 'animate');
  }

  __eventPathHasAttribute(path, attr) {
    let total = path.length;
    if (!total) return false;

    for (let i = 0; i < total; i++) {
      let item = path[i];
      if (!item || !item.tagName) continue;
      if (item.hasAttribute(attr)) return item;
    }
    return false;
  }

  __eventPathHasClass(path, className) {
    let total = path.length;
    if (!total) return false;

    for (let i = 0; i < total; i++) {
      let item = path[i];
      if (!item || !item.tagName) continue;
      if (item.classList.contains(className)) return item;
    }
    return false;
  }

}






const dom = new DOM;
export { dom };
