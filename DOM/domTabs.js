import { dom } from "./";

const CONTAINER_CLASS = 'dom-tabs';
const LINK_CLASS = 'tab-link';

const ACTIVE_LINK_CLASS = 'active';
const ACTIVE_TAB_CLASS = 'active';

const ANIMATION_DURATION = 200;

import "./css/domTabs.less";


export const domTabs = container => {
  let wrappers = dom.findAll(`.${CONTAINER_CLASS}`, container);
  if (!wrappers || !wrappers.length) return;
  wrappers.forEach(wrap => {
    init({ wrap });
  })
}




const init = ({ wrap }) => {
  let links = dom.findAll(`.${LINK_CLASS}`, wrap);
  if (!links || !links.length) return;
  let tabs = {};
  let sets = {};

  sets.current = findCurrentTab({ links }) || links[0].getAttribute('href');

  links.forEach(link => {
    let id = link.getAttribute('href');
    let tab = dom.findFirst(id, wrap);
    if (!tab) return;
    tabs[id] = tab;
  });


  setTabsAnimationDuration({ tabs });

  dom.onClick(links, e => {
    e.preventDefault();

    let newTabId = e.currentTarget.getAttribute('href');
    if (newTabId === sets.current) return;
    let slider = false;

    if (window.domSlider) {
      slider = e.currentTarget.dataset.slider;
      if (slider) {
        slider = window.domSlider.getSliderById(slider);
      }
    }


    changeTab({ tabs, links, newTabId: newTabId, sets, slider });
    changeActiveLink({ tabs, links, newLink: e.currentTarget, sets });
  });
}





const changeTab = ({ tabs, links, newTabId, sets, slider }) => {
  clearTimeout(sets.hideTabTimer);
  clearTimeout(sets.showTabTimer);

  dom.removeClass(Object.values(tabs), `fadeOut fadeIn animated`);
  dom.removeClass(Object.keys(tabs).filter(key => key !== sets.current).map(key => tabs[key]), `${ACTIVE_TAB_CLASS}`);
  let currentTab = tabs[sets.current];
  let newTab = tabs[newTabId];

  sets.current = newTabId;

  if (sets.current && tabs[sets.current]) {

    dom.addClass(currentTab, 'fadeOut animated');

    sets.hideTabTimer = setTimeout(() => {

      dom.removeClass(currentTab, `${ACTIVE_TAB_CLASS} fadeOut animated`);
      if (!newTab) return;
      dom.addClass(newTab, `${ACTIVE_TAB_CLASS} fadeIn aniamted`);
      slider && slider.update();
      sets.showTabTimer = setTimeout(() => {
        dom.removeClass(newTab, 'fadeIn animated');

      }, ANIMATION_DURATION);

    }, ANIMATION_DURATION);

  }

}




const changeActiveLink = ({ tabs, links, newLink, sets }) => {
  dom.removeClass(links, ACTIVE_LINK_CLASS);
  dom.addClass(newLink, ACTIVE_LINK_CLASS);
}




const findCurrentTab = ({ links }) => {
  for (let i = 0; i < links.length; i++) {
    if (links[i].classList.contains(ACTIVE_LINK_CLASS)) return links[i].getAttribute('href');
  }
  return false;
}



const setTabsAnimationDuration = ({ tabs }) => {
  dom.addCss(Object.values(tabs), { 'animation-duration': `${ANIMATION_DURATION / 1000}s` });
}