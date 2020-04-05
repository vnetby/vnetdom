import {DOM} from './DOM';



export class DomCountOnScroll extends DOM {



  constructor ( sets = {}, container ) {
    super();

    this.container = this.getContainer ( container );

    if  (!this.container ) return;

    if ( !this.getElements() ) return;

    this.inteval    = parseInt( sets.interval ) || 100;
    this.margin     = parseInt( sets.margin ) || -100;
    this.max        = parseInt( sets.max );
    this.step       = parseInt( sets.step ) || 1;
    this.calcAuto   = sets.calcAuto;
    this.transition = sets.transition || 3000;

    this.disabled  = [];
    this.intervals = [];

    this.setElements();

    this.init();

  }



  getElements () {
    this.items = this.findAll('.dom-count-on-scroll', this.container);
    if ( !this.items || !this.items.length ) return;

    return true;
  }





  setElements () {
    this.items.forEach ( (item, i) => {
      this.setItem( item, i );
    });
  }




  init () {
    window.addEventListener('scroll', e => {

      if ( this.scrollTimer ) {
        clearTimeout( this.scrollTimer );
      }

      this.scrollTimer = setTimeout( () => {
        this.items.forEach ( (item, i) => {
          this.setItem ( item, i );
        });
      }, 20);

    });

  }





  setItem  ( item, i ) {
    if ( this.disabled.includes( i ) ) return;
    let margin = parseInt( item.dataset.margin ) || this.margin;
    let offset = window.pageYOffset + window.innerHeight - margin;
    let top = item.getBoundingClientRect().y || item.getBoundingClientRect().top;
    if ( offset >= top + window.pageYOffset ) {
      this.initNumbers ( item, i );
      this.disabled.push( i );
    }
  }



  initNumbers ( item, i ) {
    let max      = parseInt ( item.dataset.max ) || this.max;
    if ( !max ) return;

    let interval;
    let step;

    if ( !this.calcAuto ) {
      interval = parseInt( item.dataset.interval ) || this.interval;
      step     = parseInt ( item.dataset.step ) || this.step;
    } else {
      interval = this.calcInterval( max );
      step     = this.calcStep ( max );
    }

    this.intervals[i] = setInterval( () => {
      let curr = parseInt ( item.textContent );

      if ( curr === max ) {
        clearInterval ( this.intervals[i] );
        return;
      }

      let newVal     = curr + step < max ? curr + step : max;
      item.innerHTML = newVal;

    }, interval );

  }





  calcInterval ( max ) {
    return 50;
  }

  calcStep ( max ) {
    let iterations = Math.ceil( this.transition / 50 );
    let step = Math.ceil(max / iterations);
    return step;
  }

}
