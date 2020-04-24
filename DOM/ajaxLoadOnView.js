import { dom } from "./DOM";
let preloader, after;

export const ajaxLoadOnView = (sets = {}) => {
  let container = sets.container;
  preloader = sets.preloader;
  after = sets.after;

  let items = dom.findAll('.js-ajax-content', container);
  if (!items || !items.length) return;

  items.forEach(item => init(item));
}



const init = item => {
  maybeLoad(item);
  dom.onWindowScroll(e => {
    maybeLoad(item);
  });
}




const maybeLoad = item => {
  if (item.classList.contains('in-load') || item.classList.contains('loaded') || !dom.isInViewport(item, parseFloat(item.dataset.margin) || 0)) return;
  loadContent(item);
}


const loadContent = item => {
  dom.addClass(item, 'in-load');
  dom.ajax({ url: item.dataset.url, preloader: item, preloaderHTML: preloader, minTimeResponse: 500 })
    .then(res => {
      dom.addClass(item, 'loaded');
      dom.removeClass(item, 'in-load');
      item.innerHTML = res;
      after && after(item);
    });
}