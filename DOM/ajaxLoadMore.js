import { dom } from "./DOM";
let preloader, after;

export const ajaxLoadMore = (sets = {}) => {
  let container = sets.container;
  preloader = sets.preloader;
  after = sets.after;

  let items = dom.findAll('.js-load-more', container);
  if (!items || !items.length) return;

  items.forEach(item => init(item));
}




const init = item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    let target = getTarget(item);
    if (!target) return;
    let url = item.dataset.url;
    sendRequest(url, target, item);
  });
}




const sendRequest = (url, target, btn) => {
  let page = btn.dataset.page;
  page = page ? page : 1;
  let data = { page: page };
  btn.dataset.page = page + 1;

  dom.ajax({ url, data, preloader: target, preloaderHTML: preloader, minTimeResponse: 300 })
    .then(res => appendContent(target, res));
}




const appendContent = (target, res) => {
  let div = dom.create('div', 'ajax-loaded');
  div.innerHTML = res;
  target.appendChild(div);
  after && after(div);
}



const getTarget = item => {
  let target = item.dataset.target;
  if (!target) return false;
  target = dom.findFirst(target);
  if (!target) return false;
  return target;
}