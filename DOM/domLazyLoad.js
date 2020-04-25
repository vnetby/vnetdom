import { dom } from "./DOM";
import "./css/domLazyLoad.less";


export const domLazyLoad = (sets = {}) => {
  let container = sets.container;

  let images = dom.findAll('[data-lazy]', container);

  if (!images || !images.length) return;

  dom.onWindowScroll(e => {
    checkImages(images);
  });

}



const checkImages = images => {
  let total = images.length;
  for (let i = 0; i < total; i++) {
    let img = images[i];
    if (!img || img.classList.contains('inited') || !dom.isInViewport(img, img.dataset.margin)) continue;
    loadImage(img);
  }
}




const loadImage = div => {
  dom.addClass(div, 'inited');

  let src = div.getAttribute('data-lazy');
  let alt = div.getAttribute('data-alt');
  let title = div.getAttribute('data-title');
  let className = div.getAttribute('class');

  let attrs = {};

  if (alt) attrs.alt = alt;
  if (title) attrs.title = title;
  if (className) attrs.className = className;

  let img = dom.create('img', attrs);

  img.addEventListener('load', e => {
    div.parentNode.replaceChild(img, div);
    setTimeout(() => {
      dom.addClass(img, 'loaded');
    }, 15);
  });
  img.src = src;
}