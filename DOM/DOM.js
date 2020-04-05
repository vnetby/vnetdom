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
    this.body = document.body;
    this.scrollBarWidth = this.getScrollBarWidth();
  }





  hasDomAttr(item, attr) {
    let fullAttr = 'data-dom-' + attr;
    return item.hasAttribute(fullAttr);
  }

  getDomAttr(item, attr) {
    let fullAttr = 'data-dom-' + attr;
    return item.getAttribute(fullAttr);
  }

  setDomAttr(item, attr, value) {
    let fullAttr = 'data-dom-' + attr;
    item.setAttribute(fullAttr, value);
    return item;
  }




  removeCss(item, styles) {
    this.getDomCollection(item).forEach(item => {
      let attr = item.getAttribute("style");
      if (!attr) return false;
      styles.forEach(style => {
        let regex = new RegExp(`${style}[^;]+;`, "g");
        attr = attr.replace(regex, "");
      });
      item.setAttribute("style", attr);
    });
  }





  addCss(item, styles) {
    this.getDomCollection(item).forEach(item => {
      let attr = item.getAttribute("style");
      attr = attr ? attr : "";
      Object.keys(styles).forEach(key => {
        let val = styles[key];
        if (attr.includes(key)) {
          let regex = new RegExp(`${key}[^;]+;`);
          attr = attr.replace(regex, `${key}: ${val};`);
        } else {
          attr += `;${key}: ${val};`;
        }
      });
      attr = attr.replace(/[;]+/g, ";");
      item.setAttribute("style", attr);
    });
  }



  scrollTo(id, margin = 0) {
    if (!id) return;
    let item = this.__getEl(id);
    if (!item) return;
    let currentScroll = window.pageYOffset;
    let endScroll = item.getBoundingClientRect().y + window.pageYOffset - margin;

    let step = (endScroll - currentScroll) / 15;
    this.animateScroll({ currentScroll, endScroll, step });
  }

  animateScroll(sets) {
    window.requestAnimationFrame(() => {
      if ((sets.currentScroll < sets.endScroll && sets.step > 0) || (sets.currentScroll > sets.endScroll && sets.step < 0)) {
        sets.currentScroll += sets.step;
        window.scrollTo(0, sets.currentScroll);
        this.animateScroll(sets);
      }
    });
  }






  bodyOverflowAuto() {
    this.removeCss(this.body, ['overflow', 'padding-right']);
    let paddingItems = this.findAll(".padding-on-body-hide");
    if (!paddingItems || !paddingItems.length) return;
    this.__removePaddingItems(paddingItems);
  }





  bodyOverflowHidden() {
    this.css(this.body, {
      overflow: "hidden",
      "padding-right": this.scrollBarWidth + "px"
    });

    let paddingItems = this.findAll(".padding-on-body-hide");
    if (!paddingItems || !paddingItems.length) return;
    this.__addItemsPadding(paddingItems);
  }





  __removePaddingItems(items) {
    items.forEach(item => {
      let padding = item.dataset.originPadding;
      padding = padding ? padding : 0;
      padding = padding + "px";
      dom.css(item, { "padding-right": padding });
      dom.removeClass(item, 'dom-padding-scroll');
    });
  }





  __addItemsPadding(items) {
    items.forEach(item => {
      let padding = parseFloat(window.getComputedStyle(item).paddingRight);
      if (!item.getAttribute("data-origin-padding"))
        item.setAttribute("data-origin-padding", padding);
      let hiddenPadding = item.dataset.hiddenPadding;
      if (!hiddenPadding) {
        hiddenPadding = padding + dom.scrollBarWidth;
        item.setAttribute("data-hidden-padding", hiddenPadding);
      }
      dom.css(item, { "padding-right": hiddenPadding + "px" });
      dom.addClass(item, 'dom-padding-scroll');
    });
  }




  removeClass(el, className) {
    this.getDomCollection(el).forEach(el => {
      let allClassNames = this.getClassName(className);
      allClassNames.forEach(name => {
        if (el.classList.contains(name)) el.classList.remove(name);
      });
    });
  }




  addClass(el, className) {
    this.getDomCollection(el).forEach(el => {
      let allClassNames = this.getClassName(className);
      let res = [];
      if (this.isDomEl(el)) {
        res.push(el);
      }
      if (this.isDomCollection(el)) {
        res = el;
      }
      res.forEach(item => {
        allClassNames.forEach(name => {
          if (!name) return;
          if (!item.classList.contains(name)) item.classList.add(name);
        });
      });
    });
  }




  isDomCollection(el) {
    if (typeof el !== 'object') return false;
    if (Array.isArray(el) && !el.length) return false;
    if (el.tagName) return false;
    if (typeof el[0] === 'object' && el[0].tagName) return true;
    return false;
  }



  getClassName(className) {
    let arr = [];
    let ex = className.split(" ");
    ex.forEach(item => {
      arr.push(item.trim());
    });
    return arr;
  }






  switchClass(el, className) {
    this.getDomCollection(el).forEach(el => {
      if (el.classList.contains(className)) {
        el.classList.remove(className);
      } else {
        el.classList.add(className);
      }
    });
  }





  create(el, className = "") {
    let div = document.createElement(el);
    div.className = className;
    return div;
  }






  childs(el) {
    let res = [];
    this.getDomCollection(el).forEach(el => {
      let childs = el.childNodes;
      this.forEach(childs, item => {
        if (item.tagName) res.push(item);
      });
    });
    return res.length ? res : false;
  }


  isDomEl(el) {
    if (typeof el === 'object' && el.tagName) return true;
    return false;
  }




  slideDown(el) {
    if (!el.classList.contains('dom-slide-up')) return;
    this.addCss(el, { position: 'fixed', height: 'auto', width: el.offsetWidth + 'px' });
    setTimeout(() => {
      let height = this.getHeight(el);
      this.addCss(el, { height: '0px' });
      this.removeCss(el, ['position', 'width']);

      let transition = this.__getSetSlideTransition(el);

      this.addCss(el, { opacity: 1, height: `${height}px` });
      setTimeout(() => {
        this.removeClass(el, 'dom-slide-up');
        setTimeout(() => {
          this.removeCss(el, ['height']);
        }, 100);
      }, transition);
    }, 20);

  }



  slideUp(el) {
    if (el.classList.contains('dom-slide-up')) return;
    let transition = this.__getSetSlideTransition(el);

    let height = this.getHeight(el);
    this.addCss(el, { height: `${height}px` });

    setTimeout(() => {
      this.addCss(el, { 'opacity': 0, height: '0px', overflow: 'hidden' });
      setTimeout(() => {
        this.addClass(el, 'dom-slide-up');
      }, transition);
    }, 20);

  }




  toggleSlide(el) {
    if (!el.classList.contains('dom-slide-up')) {
      this.slideUp(el);
      return 'slideUp';
    } else {
      this.slideDown(el);
      return 'slideDown';
    }
  }



  __getSetSlideTransition(el) {
    let transitionDuration = this.getStyle(el, 'transitionDuration');
    if (transitionDuration === '0s') {
      this.addCss(el, { 'transition-duration': '.3s' });
    }
    return parseFloat(transitionDuration);
  }




  getStyle(el, style, fn = false) {
    if (typeof style === 'string') {
      return fn ? fn(window.getComputedStyle(el)[style]) : window.getComputedStyle(el)[style];
    }
    let css = window.getComputedStyle(el);
    return style.map(item => fn ? fn(css[item]) : css[item]);
  }




  getHeight(el) {
    let sp = this.getStyle(el, ['paddingTop', 'paddingBottom', 'marginTop', 'marginBottom'], item => parseFloat(item));
    return sp.reduce((total, curr) => total + curr) + el.offsetHeight;
  }




  insertAfter(el, after) {
    after.parentNode.insertBefore(el, after.nextSibling);
    return this;
  }






  remove(el) {
    this.getDomCollection(el).forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }




  append(el, parent) {
    parent.appendChild(el);
  }





  findParent(el, sel) {

  }





  getScrollBarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }





  find(selector, where) {
    let searchIn = this.__getWhere(where);
    let all = searchIn.querySelectorAll(selector);
    if (!all.length) return false;
    if (all.length === 1) return all[0];
    let arr = [];
    for (let i = 0; i < all.length; i++) {
      arr.push(all[i]);
    }
    return arr;
  }




  onClick(selector, fn, where) {
    this.getDomCollection(selector, where).forEach(item => {
      item.addEventListener('click', fn);
    });
  }

  onChange(selector, fn, where) {
    this.getDomCollection(selector, where).forEach(item => {
      item.addEventListener('change', fn);
    });
  }

  onMouseenter(selector, fn, where) {
    this.getDomCollection(selector, where).forEach(item => {
      item.addEventListener('mouseenter', fn);
    });
  }




  findAll(selector, where) {

    let searchIn = [];
    if (this.isDomCollection(where)) {
      searchIn = where.map(item => this.__getWhere(item));
    } else {
      searchIn.push(this.__getWhere(where));
    }
    let res = [];
    searchIn.forEach(wrap => {
      if (!wrap) return;
      let all = wrap.querySelectorAll(selector);
      for (let i = 0; i < all.length; i++) {
        res.push(all[i]);
      }
    });

    // this.extend(res);
    return res;
  }





  findFirst(selector, where) {
    let searchIn = this.__getWhere(where);
    let obj = searchIn.querySelector(selector);
    return obj;
  }





  extend(el) {
    if (typeof el !== 'object') return;

    if (!el.__proto__.findAll) el.__proto__.findAll = selector => this.findAll(selector, el);
    if (!el.__proto__.firstChild) el.__proto__.firstChild = () => this.firstChild(el);

    // el.prototype.findFirst = this.findFirst;
  }






  firstChild(el) {
    let res;
    if (this.isDomCollection(el)) {
      res = [];
      el.forEach(item => res.push(this.__firstChild(item)));
      return res;
    } else {
      return this.__firstChild(el);
    }
  }

  __firstChild(el) {
    let children = el.childNodes;
    let total = children.length;
    for (let i = 0; i < total; i++) {
      if (children[i].tagName) {
        return children[i];
      }
    }
    return null;
  }





  getDomCollection(el, where) {
    let res = [];
    if (!el) return res;
    if (typeof el === 'string') {
      try {
        res = dom.findAll(el, this.__getWhere(where));
      } catch (err) {
        res = [];
      }
      return res;
    }
    if (this.isDomCollection(el)) {
      res = el;
    } else {
      if (this.isDomEl(el)) {
        res.push(el);
      }
    }
    return res;
  }





  css(el, obj = {}) {
    el = this.getDomCollection(el);
    el.forEach(el => {
      let keys = Object.keys(obj);
      let values = Object.values(obj);

      let str = "";

      keys.forEach((key, i) => {
        str += `${key}: ${values[i]}; `;
      });

      el.setAttribute("style", str);
    });
  }







  getContainer(container) {
    let wrap = false;
    if (container) {
      if (typeof container === "object") {
        if (container.tagName) {
          wrap = container;
        }
      }
    }
    if (wrap) return wrap;
    try {
      wrap = this.findFirst(container);
    } catch (e) {
      console.error(e);
    }
    return wrap ? wrap : this.body;
  }





  __getWhere(where) {
    let searchIn;
    if (where) {
      if (typeof where === "string") {
        searchIn = document.querySelector(where);
      } else {
        searchIn = where;
      }
    }
    return searchIn ? searchIn : document;
  }





  on({ e, el, on }) {
    if (Array.isArray(el)) {
      el.forEach(item => {
        item.addEventListener(e, on.bind(item, item));
      });
    } else {
      el.addEventListener(e, on.bind(el, el));
    }
  }




  dispath(el, e, sets) {
    return this.dispatch(el, e, sets);
  }




  dispatch(el, e, sets = {}) {
    let realSets = {
      bubbles: false, cancelable: false, detail: undefined, ...sets
    };
    let ev = new CustomEvent(e, realSets);
    el.dispatchEvent(ev);
    return this;
  }





  addPreloader(container, preloaderHTML = this.preloader) {
    let wrap;
    if (typeof container === 'string') {
      wrap = dom.findFirst(container);
    } else {
      wrap = container;
    }
    if (!wrap) return;
    if (!this.findFirst(".ajax-preloader", wrap)) {
      wrap.appendChild(preloaderHTML);
      setTimeout(() => {
        this.addClass(preloaderHTML, "visible");
      }, 20);
    }
  }





  strToDom(str) {
    if (typeof str !== 'string') return false;
    let div = document.createElement("div");
    div.innerHTML = str;
    let childs = dom.childs(div);
    if (!childs) return false;
    let wrap = document.createDocumentFragment();
    childs.map(item => wrap.appendChild(item));
    return wrap;
  }






  prev(item) {
    let prev = item.previousSibling;
    while (prev && !prev.tagName) {
      prev = prev.previousSibling;
    }
    return prev;
  }





  forEach(...args) {
    let callBack = false;
    let totalArgs = args.length;
    for (let i = 0; i < totalArgs; i++) {
      if (typeof args[i] === "function") {
        callBack = args[i];
        args.splice(i, 1);
        break;
      }
    }
    args.forEach(item => {
      if (Array.isArray(item)) {
        let total = item.length;
        for (let i = 0; i < total; i++) {
          callBack(item[i], i, item);
        }
      } else {
        for (let key in item) {
          callBack(item[key], key, item);
        }
      }
    });
  }





  getDirectionMouse(ev, obj) {
    var w = obj.offsetWidth,
      h = obj.offsetHeight,
      x = ev.pageX - obj.offsetLeft - (w / 2) * (w > h ? h / w : 1),
      y = ev.pageY - obj.offsetTop - (h / 2) * (h > w ? w / h : 1),
      d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
    return d;
  }





  isOverflow(item) {
    item = this.getItem(item);
    if (!item) return;
    let res = { x: false, y: false };
    if (item.scrollHeight > item.offsetHeight) {
      res.y = true;
    }
    if (item.scrollWidth > item.offsetWidth) {
      res.x = true;
    }
    return res;
  }





  getItem(item) {
    if (typeof item === "object") {
      if (item.tagName) {
        return item;
      }
    }
    if (typeof item === "string") {
      return document.querySelector(item);
    }
    return false;
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

  __getEl(el) {
    if (el) {
      if (typeof el === "string") {
        el = document.querySelector(el);
      }
    }
    return el;
  }





  isInViewport(obj, margin = 0) {
    let el = this.__getEl(obj);
    if (!el) return;
    let top =
      el.getBoundingClientRect().top +
      window.pageYOffset -
      margin -
      window.innerHeight;
    let bottom = top + window.innerHeight * 2 + el.offsetHeight + margin * 2;
    if (window.pageYOffset > top && window.pageYOffset <= bottom) {
      return true;
    }
    return false;
  }



}




const dom = new DOM;


export { dom };