const { detect } = require('detect-browser');
const browser = detect();
import { isMobile, isTablet, deviceDetect } from 'mobile-device-detect';

import "./css/addBrowserClass.less";

let doc;


const BROWSER_CLASSES = {
  ie: 'browser-ie',
  chrome: 'browser-chrome',
  firefox: 'browser-firefox',
  edge: 'browser-edge'
}

const ORIENTATION_CLASSES = {
  'jshelper-orientation-potrait': 'orientation-potrait',
  'jshelper-orientation-landscape': 'orientation-landscape'
}

const TOUCH_CLASSES = {
  'jshelper-touch': 'touch',
  'jshelper-notouch': 'notouch'
}



export const addBrowserClass = () => {
  doc = document;
  initDeviceDetect();
  initHelpers();
  window.browserDetect = browser.name;
  let className = BROWSER_CLASSES[browser.name] ? BROWSER_CLASSES[browser.name] : BROWSER_CLASSES['chrome'];
  document.body.classList.add(className);
}





const initDeviceDetect = () => {

  let className = 'device-desktop';

  if (isMobile) {
    className = 'device-mobile';
  }

  if (isTablet) {
    className = 'device-tablet';
  }
  let currClass = doc.body.getAttribute('class') || '';
  doc.body.setAttribute('class', currClass.replace(/device-desktop|device-mobile|device-tablet/, ''));
  doc.body.classList.add(className);

}


const initHelpers = () => {
  createHelper({ helperClass: 'orientation', names: ORIENTATION_CLASSES });
  setTouchDevice();
}



const setTouchDevice = () => {
  if ('ontouchstart' in doc.documentElement) {
    if (doc.body.classList.contains('notouch')) {
      doc.body.classList.remove('notouch');
    }
    if (!doc.body.classList.contains('touch')) {
      doc.body.classList.add('touch');
    }
  } else {
    if (!doc.body.classList.contains('notouch')) {
      doc.body.classList.add('notouch');
    }
    if (doc.body.classList.contains('touch')) {
      doc.body.classList.remove('touch');
    }
  }
}



const createHelper = ({ helperClass, names }) => {
  let target = document.createElement('span');
  target.className = `js-helper js-helper-${helperClass}`;
  observeHelper({ target, names });
  document.body.appendChild(target);
}



const observeHelper = ({ target, names }) => {
  target.addEventListener('animationstart', e => {
    setBodyClass({ names, e });
  });
}



const setBodyClass = ({ names, e }) => {
  let animationName = e.animationName;
  let className = names[animationName];
  Object.values(names).forEach(item => {
    if (document.body.classList.contains(item)) document.body.classList.remove(item);
  });
  if (!document.body.classList.contains(className)) document.body.classList.add(className);
}

