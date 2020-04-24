import { dom } from "./DOM";

let after;


export const domAddFromTemplate = (sets = {}) => {
  after = sets.after;
  let container = sets.container;

  let items = dom.findAll('.js-add-from-template', container);
  if (!items) return;

  items.forEach(item => {
    let template = dom.findFirst('.template', item);
    if (!template) return;
    dom.onClick('.add-link', e => {
      e.preventDefault();
      addTemplate(item, template);
    }, item);
  })
}




const addTemplate = (item, template) => {
  let content = template.innerHTML;
  content = content.replace(/<\!--/g, "");
  content = content.replace(/-->/g, "");
  let clone = dom.create('div', 'template-cloned');
  clone.innerHTML = content;
  item.parentNode.insertBefore(clone, item);
  initDeleteTemplate(clone);
  after && after(clone);
}





const initDeleteTemplate = item => {
  dom.onClick('.delete-template', e => {
    e.preventDefault();
    item.parentNode.removeChild(item);
  }, item);
}