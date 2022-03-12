const strToList = (string) => {
  const list = [];
  for (let i = 0; i < string.length; i++) {
    list.push(Number(string[i]));
  }
  return list;
};

const listToStr = (list) => {
  let string = "";
  for (let i = 0; i < list.length; i++) {
    string += list[i];
  }
  return string;
};

const verifyIfIsNumber = (string) => {
  for (let i = 0; i < string.length; i++) {
    if (Number(string[i]) === NaN) {
      return false;
    }
  }
  return true;
};

const validationCalc = (isFirstCalculation, cpf) => {
  let count = 10;
  let nonVerifiedCPF = cpf;

  if (!isFirstCalculation) {
    count = 11;
  }

  let sum = 0;

  while (count >= 2) {
    for (let i = 0; i < cpf.length; i++) {
      let number = cpf[i];

      sum += number * count;
      count--;
    }
  }

  if (sum % 11 < 2) {
    nonVerifiedCPF.push(0);
  } else {
    nonVerifiedCPF.push(11 - (sum % 11));
  }

  if (isFirstCalculation) {
    let validatedCPF = validationCalc(false, nonVerifiedCPF);

    return listToStr(validatedCPF).replace(
      /(\d{ 3 })(\d{ 3 })(\d{ 3 })(\d{ 2 })/,
      "$1.$2.$3-$4"
    );
  } else {
    return nonVerifiedCPF;
  }
};

const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11) {
    return false;
  }

  if (!verifyIfIsNumber(cpf)) {
    return false;
  }

  const validatedCPF = validationCalc(true, strToList(cpf.substring(0, 9)));

  return true ? validatedCPF === cpf : false;
};

module.exports = validateCPF;
