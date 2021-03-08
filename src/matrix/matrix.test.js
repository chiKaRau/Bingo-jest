import { CheckRowColInRange, CheckBingoRowCol } from "./matrix";

test("Checking Row and Column if they are in range", () => {
  const tableSize = 3,
    row = 1,
    col = 1;
  expect(CheckRowColInRange({ row: row, col: col, tableSize: tableSize })).toBe(
    true
  );
});

test("Checking Row and Column if they have the bingo Number", () => {
  const bingoSize = 3,
    array = [{ number: 1 }, { number: 2 }, { number: 3 }],
    bingoNumber = 2;
  expect(
    CheckBingoRowCol({
      array: array,
      bingoNumber: bingoNumber,
      bingoSize: bingoSize
    })
  ).toBe(true);
});
