const RESPONSIVE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  LARGE: 'large-screen'
}


export const setWindowResponsive = () => {

  window.isMobile = () => {
    return window.innerWidth < window.responsive.mobile;
  }

  window.isTablet = () => {
    return window.innerWidth >= window.responsive.mobile && window.innerWidth < window.responsive.tablet;
  }

  window.isDesktop = () => {
    return window.innerWidth >= window.responsive.tablet && window.innerWidth < window.responsive.desktop;
  }

  window.isLargeScreen = () => {
    return window.innerWidth >= window.responsive.desktop;
  }

  window.getScreen = () => {
    if (window.isMobile()) {
      return RESPONSIVE.MOBILE;
    }
    if (window.isTablet()) {
      return RESPONSIVE.TABLET;
    }
    if (window.isDesktop()) {
      return RESPONSIVE.DESKTOP;
    }
    if (window.isLargeScreen()) {
      return RESPONSIVE.LARGE;
    }
  }


  window.isXs = () => window.innerWidth < 576;

  window.isSm = () => window.innerWidth < 768;

  window.isMd = () => window.innerWidth < 992;

  window.isLg = () => window.innerWidth < 1024;

  window.isXl = () => window.innerWidth < 1200;

  window.isXxl = () => window.innerWidth < 1660;


  window.getSize = () => {
    if (window.isXs()) return 'xs';
    if (window.isSm()) return 'sm';
    if (window.isMd()) return 'md';
    if (window.isLg()) return 'lg';
    if (window.isXl()) return 'xl';
    if (window.isXxl()) return 'xxl';
  }
}