const ageCalc = (birthDate) => {
  const myBirthDate = new Date(birthDate);

  const today = new Date();

  const age = Math.floor((today - myBirthDate) / (1000 * 60 * 60 * 24 * 365));

  return age;
};

module.exports = ageCalc;
