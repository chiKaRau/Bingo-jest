import React, { useEffect, useState, useRef } from "react";

import "./styles.css";
import { shuffle } from "./utils/utils";
import { CheckRowColInRange, CheckBingoRowCol } from "./matrix/matrix";

import $ from "jquery";

export default function App() {
  const [result, setResult] = useState([]);
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [table, setTable] = useState([]);
  const [bingoSet, setBingoSet] = useState([]);
  const [tableSize, setTableSize] = useState(5);
  const [bingoSize, setBingoSize] = useState(3);

  const timer = useRef();
  const [delay, setDelay] = useState(1000);

  /*********************
   * componentDidMount *
   *********************/
  useEffect(() => {
    //initialize the board
    _init();

    //start selecting a number
    _start();
  }, [tableSize, isReset]);

  /*********
   * RESET *
   *********/
  const _reset = () => {
    setResult([]);
    setCount(0);
    setIsCounting(false);
    setIsRunning(false);
    setBingoSet([]);
  };

  const _resetTable = (e) => {
    e.preventDefault();

    _reset();
    setTableSize(5);
    setBingoSize(3);
    setDelay(1000);

    setIsReset(true);
  };

  /*********
   * Timer *
   *********/
  useEffect(() => {
    timer.current = setInterval(() => {
      if (!isCounting) {
        return;
      }
      //select a next number
      _update();
      setCount(() => count + 1);
    }, delay);

    if (count > result.length) {
      console.log("Stop");
      clearInterval(timer.current);
    }

    return () => {
      clearInterval(timer.current);
    };
  }, [count, isCounting]);

  /*************
   * TableSize *
   *************/
  const _increaseTableSize = (e) => {
    e.preventDefault();
    _reset();
    let size = tableSize + 1;
    setTableSize(size);
  };

  const _decreaseTableSize = (e) => {
    e.preventDefault();

    if (tableSize <= 2) {
      return;
    }

    _reset();

    let size = tableSize - 1;
    setTableSize(size);
  };

  /*************
   * BingoSize *
   *************/
  const _increaseBingoSize = (e) => {
    e.preventDefault();

    let size = bingoSize + 1;
    setBingoSize(size);
  };

  const _decreaseBingoSize = (e) => {
    e.preventDefault();

    if (bingoSize <= 2) {
      return;
    }

    let size = bingoSize - 1;
    setBingoSize(size);
  };

  /*********
   * Delay *
   *********/
  const _increaseDelay = (e) => {
    e.preventDefault();
    let d = delay + 100;
    setDelay(d);
  };

  const _decreaseDelay = (e) => {
    e.preventDefault();

    if (delay <= 100) {
      return;
    }

    let d = delay - 100;
    setDelay(d);
  };

  /**************
   * Play/Pause *
   **************/
  const _playAndPause = (e) => {
    e.preventDefault();
    let temp = isCounting;
    setIsCounting(!temp);
    let r = isRunning;
    setIsRunning(!r);
  };

  /***************
   * check Bingo *
   ***************/
  const _checkBingo = ({ row, col }) => {
    const lines = [
      {
        name: "left to right",
        curNumberRow: row,
        curNumberCol: col,
        backward: { row: 0, col: -1 },
        forward: { row: 0, col: 1 }
      },
      {
        name: "top left to bottom right",
        curNumberRow: row,
        curNumberCol: col,
        backward: { row: -1, col: -1 },
        forward: { row: 1, col: 1 }
      },
      {
        name: "top to bottom",
        curNumberRow: row,
        curNumberCol: col,
        backward: { row: -1, col: 0 },
        forward: { row: 1, col: 0 }
      },
      {
        name: "top right to bottom left",
        curNumberRow: row,
        curNumberCol: col,
        backward: { row: -1, col: 1 },
        forward: { row: 1, col: -1 }
      }
    ];

    //Get four different direction of arrays based from the current selected number
    //Ex, if the table is 5x5
    //then it will return four different direction of arrays which length is 5
    lines.map(async (e) => {
      //Get one of the line (direction)

      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
      let line = _loopRowCol(e);

      let bingoAry = [];

      //find all possible bingo from that line
      for (let i = 0; i < line.length; i++) {
        let temp = [];

        for (let j = i; j < i + bingoSize; j++) {
          if (line[j]?.selected) {
            temp.push(line[j]);
          }
        }

        if (
          CheckBingoRowCol({
            array: temp,
            bingoNumber: table[row][col].number,
            bingoSize: bingoSize
          })
        ) {
          bingoAry.push(temp);
        }
      }

      //loop through those possible bingo and apply animation
      for (let e of bingoAry) {
        let temp = bingoSet;
        let a = JSON.stringify(temp);
        let b = JSON.stringify(e);
        if (a.indexOf(b) === -1) {
          temp.push({ selectedNumber: table[row][col], bingoAry: e });
          setBingoSet(temp);

          _bingoAnimation(e);
        }
      }

      return;
    });
  };

  const _bingoAnimation = async (bingoAry) => {
    setIsCounting(false);

    for (let ele of bingoAry) {
      $(`#row${ele.row}col${ele.col}`)
        .stop(true, true)
        .fadeOut(500)
        .fadeIn(500)
        .fadeOut(500)
        .fadeIn(500, () => {
          setIsCounting(true);
        });
    }
  };

  const _loopRowCol = ({
    curNumberRow,
    curNumberCol,
    backward = { row: 0, col: 0 },
    forward = { row: 0, col: 0 }
  }) => {
    //backward of current selected number
    let b_array = [];
    let b_row = curNumberRow + backward.row;
    let b_col = curNumberCol + backward.col;

    while (
      CheckRowColInRange({
        row: b_row,
        col: b_col,
        tableSize: tableSize
      })
    ) {
      if (table[b_row][b_col]) {
        b_array.push(table[b_row][b_col]);
      }

      b_row += backward.row;
      b_col += backward.col;
    }

    //current selected number
    let c_array = [table[curNumberRow][curNumberCol]];

    //forward of current selected number
    let f_array = [];
    let f_row = curNumberRow + forward.row;
    let f_col = curNumberCol + forward.col;
    while (
      CheckRowColInRange({
        row: f_row,
        col: f_col,
        tableSize: tableSize
      })
    ) {
      if (table[f_row][f_col]) {
        f_array.push(table[f_row][f_col]);
      }

      f_row += forward.row;
      f_col += forward.col;
    }

    let temp = [];

    //the line is always clockwise
    //Ex, left to right, top left to bottom right, top to bottom, bottom right to left

    //Reorder the array in clockwise
    if (b_array.length === 0) {
      temp = temp.concat(c_array).concat(f_array);
    } else if (f_array.length === 0) {
      temp = temp.concat(b_array).reverse().concat(c_array);
    } else {
      temp = temp.concat(b_array).reverse().concat(c_array).concat(f_array);
    }

    return temp;
  };

  /**********
   * Update *
   **********/
  const _update = () => {
    for (let row = 0; row < table.length; row++) {
      for (let col = 0; col < table[row].length; col++) {
        if (table[row][col].number === result[count]) {
          table[row][col].selected = true;
          _checkBingo({ row: row, col: col });
        }
      }
    }
  };

  /*********
   * Start *
   *********/
  const _start = async () => {
    //generates the tableSize * tableSize number
    let array = [],
      result = [];
    for (let i = 1; i <= tableSize * tableSize; i++) {
      array.push(i);
    }

    //precreate a list (shuffle) so each count + 1 will go through this list
    for (let i = 0; i < tableSize * tableSize; i++) {
      shuffle(array);
      result.push(array[0]);
      array.splice(array.indexOf(array[0]), 1);
    }

    setResult(result);
    //setIsCounting(true);
  };

  /**************
   * Initialize *
   **************/
  const _init = () => {
    //generates the tableSize * TABLESIZE number
    let array = [];
    for (let i = 1; i <= tableSize * tableSize; i++) {
      array.push({ number: i, selected: false });
    }

    //shuffle the array and create an matrix
    shuffle(array);
    let temp = [];
    let row = [];
    let rowIndex = 0;

    for (let i = 0; i < tableSize * tableSize; i++) {
      array[i].row = rowIndex;
      array[i].col = i % tableSize;
      row.push(array[i]);

      if (i % tableSize === 0) {
        temp.push(row);
      }

      if (row.length === tableSize) {
        row = [];
        rowIndex++;
      }
    }
    setIsReset(false);
    setTable(temp);
  };

  /***********
   * Display *
   ***********/
  let displayTable = table.map((row, index = 0) => {
    let temp = [];
    for (let ele of row) {
      temp.push(
        <div
          id={`row${ele.row}col${ele.col}`}
          className="border"
          style={{ width: 100, height: 100 }}
          key={index++}
        >
          <div
            style={{
              background: !ele.selected ? "white" : "black",
              color: !ele.selected ? "black" : "white"
            }}
            className="d-flex h-100 justify-content-center align-items-center"
          >
            <b>{ele.number}</b>
          </div>
        </div>
      );
    }

    return (
      <div className="row" key={index++}>
        <div className="d-flex">{temp}</div>
      </div>
    );
  });

  let displayBingoSet = bingoSet.map((set, index) => {
    let temp = [];

    let i = 0;
    for (let e of set.bingoAry) {
      i++;
      temp.push(
        <span
          key={index + i}
          style={{
            color: e.number === set.selectedNumber.number ? "pink" : "black"
          }}
        >
          [{e.number}]
        </span>
      );
    }

    return (
      <tr key={index++}>
        <th scope="row">{index}</th>
        <td>{set.selectedNumber.number}</td>
        <td>{temp}</td>
      </tr>
    );
  });

  return (
    <div className="container h-100">
      <div className="row justify-content-center m-3">
        <div className="col-12">
          <h1 className="text-center">BINGO!</h1>
        </div>

        {/**TableSize*/}
        <div className="m-3">
          <button
            disabled={isRunning}
            className="btn btn-danger"
            onClick={(e) => _decreaseTableSize(e)}
          >
            -
          </button>
          <span className="m-1">Table Size ({tableSize})</span>
          <button
            disabled={isRunning}
            className="btn btn-primary"
            onClick={(e) => _increaseTableSize(e)}
          >
            +
          </button>
        </div>

        {/**BingoSize*/}
        <div className="m-3">
          <button
            disabled={isRunning}
            className="btn btn-danger"
            onClick={(e) => _decreaseBingoSize(e)}
          >
            -
          </button>
          <span className="m-1">Bingo Size ({bingoSize})</span>
          <button
            disabled={isRunning}
            className="btn btn-primary"
            onClick={(e) => _increaseBingoSize(e)}
          >
            +
          </button>
        </div>

        {/**Delay*/}
        <div className="m-3">
          <button className="btn btn-danger" onClick={(e) => _decreaseDelay(e)}>
            -
          </button>
          <span className="m-1">Delay ({delay / 1000}s)</span>
          <button
            className="btn btn-primary"
            onClick={(e) => _increaseDelay(e)}
          >
            +
          </button>
        </div>

        {/**Play/Stop */}
        <div className="m-3">
          <button
            className="btn btn-secondary"
            onClick={(e) => _playAndPause(e)}
          >
            Play/Stop
          </button>
        </div>

        {/**Play/Stop */}
        <div className="m-3">
          <button
            className="btn btn-info"
            disabled={isRunning}
            onClick={(e) => _resetTable(e)}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="row justify-content-center align-items-center">
        <div style={{ width: "auto", height: "auto" }}>{displayTable}</div>
      </div>

      <div className="border m-3">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Bingo #</th>
              <th scope="col">Set</th>
            </tr>
          </thead>
          <tbody>{displayBingoSet}</tbody>
        </table>
      </div>
    </div>
  );
}
