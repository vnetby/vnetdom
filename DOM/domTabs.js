import { dom } from "./DOM";

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
  let useHash = wrap.dataset.hash === 'true';

  if (!useHash) {
    sets.current = findCurrentTab({ links, useHash }) || links[0].getAttribute('href');
  } else {
    sets.current = getHashCurrentTab({ links });
  }

  links.forEach(link => {
    let id = link.getAttribute('href');
    let tab = dom.findFirst(id, wrap);
    if (!tab) return;
    tabs[id] = tab;
  });

  if (useHash) setHashCurrentTab({ tabs, currentId: sets.current, wrap, sets });

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


    changeTab({ tabs, links, newTabId: newTabId, sets, slider, wrap, useHash });
    changeActiveLink({ tabs, links, newLink: e.currentTarget, sets });
  });
}





const changeTab = ({ tabs, links, newTabId, sets, slider, wrap, useHash }) => {
  clearTimeout(sets.hideTabTimer);
  clearTimeout(sets.showTabTimer);

  dom.removeClass(Object.values(tabs), `fadeOut fadeIn animated`);
  dom.removeClass(Object.keys(tabs).filter(key => key !== sets.current).map(key => tabs[key]), `${ACTIVE_TAB_CLASS}`);
  let currentTab = tabs[sets.current];
  let newTab = tabs[newTabId];

  sets.current = newTabId;

  if (useHash) {
    dom.window.location.hash = newTabId;
  }

  if (sets.current && tabs[sets.current]) {

    dom.dispatch(wrap, 'dom-tab-change', { detail: sets });

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




const findCurrentTab = ({ links, useHash }) => {
  for (let i = 0; i < links.length; i++) {
    if (links[i].classList.contains(ACTIVE_LINK_CLASS)) return links[i].getAttribute('href');
  }
  return false;
}




const getHashCurrentTab = ({ links }) => {
  let id = dom.window.location.hash;
  dom.removeClass(links, 'active');
  if (!id) {
    dom.addClass(links[0], 'active');
    return links[0].getAttribute('href');
  }
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute('href') === id) {
      dom.addClass(links[i], 'active');
      return links[i].getAttribute('href');
    }
  }
  dom.addClass(links[0], 'active');
  return links[0].getAttribute('href');
}



const setHashCurrentTab = ({ tabs, currentId, wrap }) => {
  dom.removeClass(Object.values(tabs), 'active');
  dom.addClass(tabs[currentId], 'active');
  dom.dispatch(wrap, 'dom-tab-change', { detail: sets });
}


const setTabsAnimationDuration = ({ tabs }) => {
  dom.addCss(Object.values(tabs), { 'animation-duration': `${ANIMATION_DURATION / 1000}s` });
}