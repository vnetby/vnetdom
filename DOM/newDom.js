class newDOM {

  constructor() {
    this.document = document;
    this.body = this.document.body;
    this.window = window;

    this.isDev = true;

    let data = {
      name: 'vadzim',
      sirname: 'kananovich'
    }

    let str = `
    <div class="vadzim">
      <ul>
        <li>{{name}}</li>
        <li>other value</li>
      </ul>
    </div>
    <div class="second container">
      second {{name}} {{sirname}}
    </div>
    some text node
    my name is vadzim
    i am cool
    <script>
      console.log('vadzim');
    </script>
    `;

    let res = this.strToDom(str, data);

    console.log(res);

    this.execInlineScripts('.container');
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






  //============================================
  //              CONDITIONALS
  //============================================
  isDom(el) {
    return typeof el === 'object' && el.tagName;
  }
  isDomArray(elsArr) {
    return typeof elsArr === 'array' && elsArr.every(el => this.isDom(el));
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
    return attr.replace(/\.?([A-Z])/g, (x, y) => "-" + y.toLowerCase()).replace(/^-/, "");
  }

  __throwError(e) {
    this.isDev && console.error(e);
  }














}



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

const dom = new newDOM;
export default dom;
