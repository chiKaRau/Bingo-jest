const CheckRowColInRange = ({ row, col, tableSize }) => {
  if (row >= 0 && row <= tableSize - 1 && col >= 0 && col <= tableSize - 1) {
    return true;
  }
  return false;
};

const CheckBingoRowCol = ({ array, bingoNumber, bingoSize }) => {
  if (
    array.some((e) => e.number === bingoNumber) &&
    array.length >= bingoSize
  ) {
    return true;
  }

  return false;
};

module.exports = { CheckRowColInRange, CheckBingoRowCol };
