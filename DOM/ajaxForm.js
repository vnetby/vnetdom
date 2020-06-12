import { dom } from "./DOM";

let preloader, createAlertModal, addInputError, parseResponse;

export const ajaxForm = (sets = {}) => {

  preloader = sets.preloader;
  createAlertModal = sets.createAlertModal;
  addInputError = sets.addInputError;
  parseResponse = sets.parseResponse;

  dom.body.addEventListener('submit', e => {
    let form = e.target;
    if (form.classList.contains('ajax-form')) {
      e.preventDefault();
      init(form);
    }
  });
}



const init = form => {
  let data = new FormData(form);
  let url = form.getAttribute('action');
  dom.ajax({ url, data, preloader: form, preloaderHTML: preloader, minTimeResponse: 300 })
    .then(res => parseFormResponse(res, form));
}



const parseFormResponse = (res, form) => {
  if (parseResponse) {
    parseResponse(res, form);
    return;
  }

  res = dom.jsonParse(res);
  if (!res) return false;

  if (res.redirect) {
    window.location.href = res.redirect;
  }

  if (res.alert && createAlertModal && $) {
    let modal = createAlertModal(res.alert);
    $.fancybox.open(modal, { touch: false });
  }

  if (res.clearInputs) {
    clearInputs(form);
  }

  if (res.inputError) {
    addResponseInputsErrors(res.inputError, form);
  }
}





const addResponseInputsErrors = (response, form) => {
  for (let name in response) {
    let inputs = dom.findAll(`[name=${name}]`, form);
    if (!inputs || !inputs.length) continue;

    inputs.forEach(input => addInputError(input, response[name]));
  }
}




const clearInputs = form => {
  let inputs = dom.findAll('input, textarea, select', form);
  if (!inputs || !inputs.length) return;

  inputs.forEach(input => {
    input.value = '';
  });
}