import { dom } from "./DOM";





export const domUnderRow = (sets = {}) => {
  let container = sets.container;

  let items = dom.findAll('.js-bottom-arrow', container);
  if (!items || !items.length) return;

  if (sets.onWindowLoad) {
    dom.window.addEventListener('load', e => {
      items.forEach(item => init(item));
    });
  } else {
    items.forEach(item => init(item));
  }

}






const init = wrap => {
  let arrow = getArrow(wrap);
  let items = dom.findAll('.bottom-arrow-item', wrap);

  setArrowPosition(wrap, getActiveLink(items), arrow);

  let onHover = wrap.classList.contains('on-hover');

  items.forEach(item => {
    item.addEventListener(onHover ? 'mouseenter' : 'click', e => setArrowPosition(wrap, item, arrow));
  });
  onHover && wrap.addEventListener('mouseleave', e => setArrowPosition(wrap, getActiveLink(items), arrow));
}



const getArrow = wrap => {
  let arrow = dom.findFirst('.bottom-arrow', wrap);
  if (!arrow) {
    arrow = dom.create('span', 'bottom-arrow');
    wrap.appendChild(arrow);
  }
  return arrow;
}





const setArrowPosition = (wrap, item, arrow) => {
  if (!item) {
    dom.addCss(arrow, { width: '0px', left: `${arrow.getBoundingClientRect().left - wrap.getBoundingClientRect().left + arrow.offsetWidth / 2}px`, opacity: 0 });
    return;
  }
  let left = item.getBoundingClientRect().left - wrap.getBoundingClientRect().left;
  let width = item.offsetWidth;
  dom.css(arrow, { left: `${left}px`, width: `${width}px` });
}




const getActiveLink = items => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].classList.contains('active')) return items[i];
  }
  return false;
}