import {DOM} from './DOM.js';
import "./css/DomFixedNav.less";


export class DomFixedNav extends DOM {


  constructor( sets ) {
    super();
    this.nav = this.findFirst(sets.nav || '.dom-fixed-nav');
    if ( !this.nav ) return;

    this.offsetHide   = this.getOffsetHide( sets.offsetHide );
    this.offsetScroll = sets.offsetScroll || this.nav.getBoundingClientRect().top + window.pageYOffset;
    this.hiddenClass  = sets.hiddenClass || 'nav-is-hidden';
    this.scrollClass  = sets.scrollClass || 'nav-in-scroll';
    this.visible      = true;
    this.scroll       = false;

    this.initStopOnOfcanvasOpen();
    this.setCurrentState();
    this.init ();
  }




  getOffsetHide(set) {
    if ( !set ) return 150;
    if ( set.includes && set.includes('vh') ) {
      let size = parseInt ( set );
      return size * window.innerHeight / 100;
    }
    return set;
  }




  init () {
    window.addEventListener('scroll', this.setScrollOnScroll.bind(this) );
    window.addEventListener('scroll', this.hideNavOnScroll.bind(this) );
  }





  initStopOnOfcanvasOpen () {
    document.body.addEventListener('stop_hide_menu', () => {
      this.stop = true;
    });
    document.body.addEventListener('start_hide_menu', () => {
      this.stop = false;
    });
  }


  setScrollOnScroll () {

    if ( this.scrollEventSet ) {
      clearTimeout( this.scrollEventSet );
    }

    this.scrollEventSet = setTimeout( ( ) => {
      if ( window.pageYOffset > this.offsetScroll && !this.scroll ) this.setScrollMenu();
      if ( window.pageYOffset <= this.offsetScroll && this.scroll ) this.unsetScrollMenu ();
    }, 20);

  }




  hideNavOnScroll () {
    if ( this.scrollEventHide ) {
      clearTimeout( this.scrollEventHide );
    }

    this.scrollEventHide = setTimeout( () => {
      if ( this.stop ) return;

      if ( window.pageYOffset <= this.offsetHide && !this.visible ) {
        this.showMenu();
      }

      let st = window.pageYOffset || document.documentElement.scrollTop;
      if( window.pageYOffset > this.offsetHide ) {
        if ( st > this.lastScrollTop ) {
          if ( this.visible ) {
            let $btn = $('.open-contacts-dropdown');
            if ( $btn.hasClass('active') ) return;
            this.hideMenu();
          }
        } else {
          if ( !this.visible ) {
            this.showMenu();
          }
        }
      }
      this.lastScrollTop = st <= 0 ? 0 : st;
    }, 20);

  }





  setCurrentState() {
    if ( window.scarollY > this.offsetHide ) {
      this.hideMenu();
    }
    if ( window.pageYOffset > this.offsetScroll ) {
      this.setScrollMenu();
    }
  }


  hideMenu() {
    this.visible = false;
    this.addClass(this.nav, this.hiddenClass);
  }




  showMenu () {
    this.visible = true;
    this.removeClass( this.nav, this.hiddenClass );
  }


  setScrollMenu () {
    this.scroll = true;
    this.addClass(this.nav, this.scrollClass);
  }

  unsetScrollMenu () {
    this.scroll = false;
    this.removeClass(this.nav, this.scrollClass);
  }

}
