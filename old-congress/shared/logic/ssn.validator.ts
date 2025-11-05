export const validateSSN = (id: string, allowOld = false): boolean => {
  if (!id) {
    return true;
  }

  if (allowOld) {
    id = id.padStart(9, '0')
  }
  
  if (id.length != 9) {
    return false;
  }

  let validator = 0, incNum;

  for (var i = 0; i < 9; i++) {
    incNum = Number(id.charAt(i));
    incNum *= (i % 2) + 1;
    if (incNum > 9) {
      incNum -= 9;
    }
    validator += incNum;
  }

  if (validator % 10 == 0) {
    return true;
  } else {
    return false;
  }
}