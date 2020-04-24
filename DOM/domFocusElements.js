import { dom } from "./DOM";


export const domFocusElements = (sets = {}) => {
  let container = sets.container;

  let items = dom.findAll('.js-focus', container);

  if (!items || !items.length) return;

  items.forEach(item => init(item));
}



const init = item => {
  item.addEventListener('mousedown', e => addFocus(item));
  item.addEventListener('touchstart', e => addFocus(item));

  item.addEventListener('mouseleave', e => removeFocus(item));
  item.addEventListener('mouseup', e => removeFocus(item));
  item.addEventListener('touchend', e => removeFocus(item));
}



const addFocus = item => {
  dom.addClass(item, 'has-focus');
}


const removeFocus = item => {
  dom.removeClass(item, 'has-focus');
}