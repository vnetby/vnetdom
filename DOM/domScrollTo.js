import dom from "./DOM";

const LINK_CLASS = 'dom-scroll-to';
const LINK_ATTR = 'scroll-to';
const SPEED_ATTR = 'scroll-speed';
const SCROLL_SPEED = 500;




export const domScrollTo = wrap => {
  let container = dom.getContainer(wrap);
  if (!container) return;

  let links = dom.findAll(`.${LINK_CLASS}`, container);
  if (!links || !links.length) return;

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      initScrollTo(link);
    })
  });
}




const initScrollTo = link => {
  let id = link.getAttribute('href');
  id = id ? id : dom.getDomAttr(link, LINK_ATTR);
  if (!id) return;
  let speed = dom.getDomAttr(link, SPEED_ATTR) || SCROLL_SPEED;
  dom.scrollTo(id, {
    speed: speed
  });
}



