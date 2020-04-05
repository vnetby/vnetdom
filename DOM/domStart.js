import { setWindowResponsive } from "./domWindowResponsive.js";
import { addBrowserClass } from "./domBrowserDetect.js";

export const domStart = () => {
  addBrowserClass();
  setWindowResponsive();
}