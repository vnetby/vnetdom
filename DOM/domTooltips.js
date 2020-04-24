import { dom } from "./DOM";

const showClasses = { right: 'right', left: 'left', top: 'top', bottom: 'bottom' };


export const domTooltips = (sets = {}) => {
  let container = sets.container;

  let items = dom.findAll('.tooltip-btn', container);
  if (!items || !items.length) return;

  items.forEach(item => {
    let tooltip = getTooltip(item);
    let position = item.dataset.position || 'right';
    let timers = [];

    let isFocus = item.hasAttribute('data-focus');
    if (isFocus) {
      initFocus(item, tooltip, position, timers);
      item.setAttribute('tabindex', 0);
      return;
    }
    initHover(item, tooltip, position, timers);
  });
}






const initFocus = (item, tooltip, position, timers) => {
  item.addEventListener('focus', e => showTooltip(item, tooltip, position, timers));
  item.addEventListener('blur', e => hideTooltip(item, tooltip, timers));
}




const initHover = (item, tooltip, position, timers) => {
  item.addEventListener('mouseenter', e => showTooltip(item, tooltip, position, timers));
  item.addEventListener('mouseleave', e => hideTooltip(item, tooltip, timers));
}




const showTooltip = (item, tooltip, position, timers) => {
  resetTooltip(tooltip, timers);

  let scroll = dom.window.pageYOffset;

  let top;
  let left;

  dom.addClass(tooltip, `visible`);

  if (position === 'right') {
    top = item.getBoundingClientRect().top + item.offsetHeight / 2 - tooltip.offsetHeight / 2;
    left = item.getBoundingClientRect().left + item.offsetWidth + 10;
    if (left + tooltip.offsetWidth > window.innerWidth - 20) {
      position = 'left';
    }
  }

  if (position === 'left') {
    if (!top) top = item.getBoundingClientRect().top + item.offsetHeight / 2 - tooltip.offsetHeight / 2;
    left = item.getBoundingClientRect().left - 10 - tooltip.offsetWidth;
  }

  top += scroll;

  dom.addClass(tooltip, showClasses[position]);
  dom.css(tooltip, { top: `${top}px`, left: `${left}px` });

  timers.push(setTimeout(() => {
    dom.addClass(tooltip, 'show');
  }, 150));
}




const hideTooltip = (item, tooltip, timers) => {
  dom.removeClass(tooltip, `show`);
  timers.push(setTimeout(() => {
    dom.removeClass(tooltip, `visible ${Object.values(showClasses).join(' ')}`);
  }, 150));
}



const resetTooltip = (tooltip, timers) => {
  timers.forEach(item => clearTimeout(item));
  timers = [];
  dom.removeClass(tooltip, `show visible ${Object.values(showClasses).join(' ')}`);
  tooltip.removeAttribute('style');
}




const getTooltip = item => {
  let tooltip = dom.create('div', 'tooltip');
  let content = item.dataset.tooltip || '';

  tooltip.innerHTML = content;

  dom.body.appendChild(tooltip);

  return tooltip;
}