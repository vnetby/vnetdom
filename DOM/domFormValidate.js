import { dom } from "./DOM";

// if true will not validate form
let DEBUG = false;

let messages, addInputError, removeInputError, afterValidate;


export const domFormValidate = (sets = {}) => {
  let container = sets.container;

  messages = sets.messages || {};
  addInputError = sets.addInputError;
  removeInputError = sets.removeInputError;
  afterValidate = sets.afterValidate;
  DEBUG = sets.DEBUG;

  let forms = dom.findAll('.validate-form', container);
  if (!forms || !forms.length) return;

  forms.forEach(form => initValidate(form));
}



const initValidate = form => {
  initRemoveError(form);

  dom.onClick('[type=submit]', e => {
    if (DEBUG) return;
    e.preventDefault();

    validate(form)
      .then(isValid => {
        if (isValid) dom.dispatch(form, 'submit');
      });

  }, form);
}




const initRemoveError = form => {
  if (typeof $ !== 'undefined') {
    $(form).on('change', e => {
      let input = e.target;
      removeInputError(input);
    });
    $('input[data-phone]').on('change', function () {
      removeInputError(this);
    });
  } else {
    form.addEventListener('change', e => {
      let input = e.target;
      removeInputError(input);
    });
  }
}





const validate = form => {
  return new Promise((resolve, reject) => {
    let inputs = dom.findAll('input, textarea, select', form);
    if (!inputs || !inputs.length) return;

    let errors = 0;

    inputs.forEach(input => {
      if (input.classList.contains('disabled')) return;

      let res = validateInput(input);
      if (!res) errors++;
    });

    let isValid = errors > 0 ? false : true;

    if (afterValidate) {
      afterValidate(form, isValid).then(isValid => resolve(isValid));
    } else {
      resolve(isValid);
    }

  });
}




export const validateInput = input => {
  if (hasInputError(input)) return false;

  let res = true;

  if (res && input.hasAttribute('data-required')) {
    res = validateRequired(input);
  }

  if (res && input.type === 'email') {
    res = validateEmail(input);
  }

  if (res && input.dataset.phone) {
    res = validatePhone(input);
  }

  if (res && input.dataset.compare) {
    res = validateCompare(input);
  }

  if (res && input.dataset.maxSize) {
    res = validateMaxFileSize(input);
  }

  if (res && input.dataset.minLength) {
    res = validateMinLength(input);
  }

  // if (res) removeInputError(input);
  return res;
}


const validateMinLength = input => {
  if (!input.value) return true;
  let min = parseInt(input.dataset.minLength);
  if (!min) return true;
  if (input.value.length < min) {
    addInputError(input, messages.minLength.replace(/\$1/, min));
    return false;
  }
  return true;
}





const validateMaxFileSize = input => {
  if (!input.files && !input.files[0]) return true;
  let file = input.files[0];
  if (!file) return true;
  let size = file.size / 1000000;
  let max = parseFloat(input.dataset.maxSize);
  if (size > max) {
    addInputError(input, messages.maxFileSize.replace(/\$1/, max));
    return false;
  }
  return true;
}



const validateRequired = input => {

  if (input.type === 'checkbox' || input.type === 'radio') {
    return validateRequiredCheckbox(input);
  }

  if (!input.value) {
    addInputError(input, messages.required);
    return false;
  }
  return true;
}




const validateRequiredCheckbox = input => {
  let name = input.name;
  if (!name) return;
  let allInputs = dom.findAll(`input[name=${name}]`);
  if (!allInputs || !allInputs.length) return true;

  let errCont = input.dataset.appendError;
  if (errCont) {
    errCont = dom.findFirst(errCont);
  }

  let isValid = allInputs.some(input => input.checked);

  if (isValid) {
    if (errCont) {
      errCont.innerHTML = '';
      dom.removeClass(errCont, 'has-error');
    }
    return true;
  }

  if (!errCont) return false;

  dom.addClass(errCont, 'has-error');
  errCont.innerHTML = messages.checkboxRequired;
}



const validateCompare = input => {
  let compareInput = dom.findFirst(input.dataset.compare);
  if (!compareInput) return;
  let curVal = input.value;
  let compareVal = compareInput.value;

  if (curVal !== compareVal) {
    addInputError(input, messages.invlidCompare);
    addInputError(compareInput, messages.invlidCompare);
    return false;
  }

  return true;
}




const validateEmail = input => {
  if (!input.value) return true;
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let res = re.test(String(input.value).toLowerCase());
  if (!res) {
    addInputError(input, messages.invalidEmail);
    return false;
  }
  return true;
}




const validatePhone = input => {
  if (!input.value) return true;
  return true;
}




const hasInputError = input => {
  return input.classList.contains('has-error');
}
