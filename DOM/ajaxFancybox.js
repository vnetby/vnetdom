import { dom } from "./DOM";
let preloader, after, ajaxUrl;

export const ajaxFancybox = (sets = {}) => {
  preloader = sets.preloader;
  after = sets.after;
  ajaxUrl = sets.ajaxUrl;

  let container = sets.container;

  dom.onClick('[data-ajax-fancybox]', e => {
    e.preventDefault();
    let btn = e.currentTarget;
    let targetId = getTargetId(btn);
    if (!targetId) return;

    let target = dom.findFirst(targetId);
    if (target) {
      openTarget(btn, target);
    } else {
      loadTarget(targetId).then(res => {

        openTarget(btn, res);
      });
    }
  }, container);
}




const getTargetId = btn => {
  if (btn.href) return btn.getAttribute('href');
  if (btn.dataset.target) return btn.dataset.target;
  return false;
}



const openTarget = (btn, target) => {
  let sets = {};
  sets.touch = btn.dataset.touch === 'false' ? false : true;
  $.fancybox.open(target, sets);
}




const loadTarget = targetId => {
  return new Promise((resolve, reject) => {
    dom.ajax({
      url: ajaxUrl,
      data: { id: targetId },
      preloader: dom.body,
      minTimeResponse: 300,
      preloaderHTML: preloader
    })
      .then(res => {
        let div = dom.create('div');
        div.innerHTML = res;
        let modal = dom.findFirst('.modal', div);
        document.body.appendChild(modal);
        after && after(modal);
        resolve(modal);
      });
  });
}