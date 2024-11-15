import React, { useState, useEffect } from 'react';
import { csvString } from './pokemon_data';

const totalPokemon = 1025;

type Step = 'fully' | 'just' | 'seen' | 'barely' | 'unknown';

const App: React.FC = () => {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [memorizedPokemon, setMemorizedPokemon] = useState<
    { no: number; step: Step }[]
  >([]);
  const [filteredPokemon, setFilteredPokemon] = useState<number[]>([]);
  const [numberInput, setNumberInput] = useState<string>('');
  const [fromNumber, setFromNumber] = useState<number | null>(null);
  const [toNumber, setToNumber] = useState<number | null>(null);
  const [hintNumbers, setHintNumbers] = useState<number[]>([]);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [pokemonData, setPokemonData] = useState<any[]>([]);
  const [nextType, setNextType] = useState<string>('right');

  // フィルタ適用
  const applyFilter = () => {
    let numberList: number[] = [];
    let rangeList: number[] = [];

    if (numberInput) {
      numberList = numberInput
        .split(',')
        .map((num) => parseInt(num.trim(), 10))
        .filter((num) => num >= 1 && num <= totalPokemon);
    }

    if (fromNumber !== null && toNumber !== null) {
      for (let i = fromNumber; i <= toNumber; i++) {
        rangeList.push(i);
      }
    }

    if (numberList.length > 0 && rangeList.length > 0) {
      setFilteredPokemon(numberList.filter((num) => rangeList.includes(num)));
    } else if (numberList.length > 0) {
      setFilteredPokemon(numberList);
    } else if (rangeList.length > 0) {
      setFilteredPokemon(rangeList);
    } else {
      setFilteredPokemon(Array.from({ length: totalPokemon }, (_, i) => i + 1));
    }

    localStorage.setItem('numberInput', numberInput);
    localStorage.setItem('fromNumber', fromNumber?.toString() ?? '');
    localStorage.setItem('toNumber', toNumber?.toString() ?? '');
  };

  useEffect(() => {
    const resultStoredMemorizedPokemon =
      localStorage.getItem('memorizedPokemon');
    const resultStoredNumberInput = localStorage.getItem('numberInput');
    const resultStoredFromNumber = localStorage.getItem('fromNumber');
    const resultStoredToNumber = localStorage.getItem('toNumber');
    const resultStoredNextType = localStorage.getItem('nextType');

    setNumberInput(resultStoredNumberInput ?? '');
    setFromNumber(
      resultStoredFromNumber ? parseInt(resultStoredFromNumber) : null
    );
    setToNumber(resultStoredToNumber ? parseInt(resultStoredToNumber) : null);

    if (resultStoredMemorizedPokemon && memorizedPokemon.length === 0) {
      console.log(
        'resultStoredMemorizedPokemon',
        resultStoredMemorizedPokemon,
        memorizedPokemon,
        JSON.parse(resultStoredMemorizedPokemon)
      );
      setMemorizedPokemon(JSON.parse(resultStoredMemorizedPokemon));
    }
    applyFilter(); // 初期表示時にフィルタを適用

    const headers = csvString.split(','); // ヘッダー行を取得

    const data = [];
    for (let i = 0; i < 1025; i++) {
      data.push({
        No: parseInt(headers[i * 3]),
        name: headers[i * 3 + 1],
        gogen: headers[i * 3 + 2],
      });
    }
    setPokemonData(data);

    setNextType(resultStoredNextType ?? 'right');
  }, []);

  useEffect(() => {
    if (filteredPokemon.length > 0) {
      pickRandomPokemon();
    }
  }, [filteredPokemon]);

  useEffect(() => {
    if (filteredPokemon.length > 0) {
      pickRandomPokemon();
    }
  }, [filteredPokemon]);

  useEffect(() => {
    localStorage.setItem('memorizedPokemon', JSON.stringify(memorizedPokemon));
  }, [memorizedPokemon]);

  const pickRandomPokemon = () => {
    setAnswerRevealed(false);
    const weightedPokemon = filteredPokemon.flatMap((num) => {
      const pokemon = memorizedPokemon.find((p) => p.no === num);
      if (!pokemon || pokemon.step === 'unknown') return Array(5).fill(num);
      if (pokemon.step === 'barely') return Array(3).fill(num);
      if (pokemon.step === 'seen') return Array(2).fill(num);
      if (pokemon.step === 'just') return [num];
      return [];
    });
    if (weightedPokemon.length === 0 && memorizedPokemon.length > 0) {
      alert('全てのポケモンを覚えました！');
      return;
    }
    const randomPokemon =
      weightedPokemon[Math.floor(Math.random() * weightedPokemon.length)];
    setCurrentNumber(randomPokemon);
    setHintNumbers([
      randomPokemon - 1,
      randomPokemon + 1,
      randomPokemon - 20,
      randomPokemon + 20,
    ]);
  };

  const memorizePokemon = (step: Step) => {
    console.log('memorizePokemon', currentNumber);
    if (currentNumber !== null) {
      console.log('memorizedPokemon', memorizedPokemon);
      if (memorizedPokemon.find((pokemon) => pokemon.no === currentNumber)) {
        console.log(
          'memorizedPokemon.find((pokemon) => pokemon.no === currentNumber)',
          memorizedPokemon.find((pokemon) => pokemon.no === currentNumber)
        );
        setMemorizedPokemon(
          memorizedPokemon.map((pokemon) =>
            pokemon.no === currentNumber ? { ...pokemon, step: step } : pokemon
          )
        );
      } else {
        console.log(
          'memorizedPokemon.find((pokemon) => pokemon.no === currentNumber)',
          memorizedPokemon.find((pokemon) => pokemon.no === currentNumber)
        );
        setMemorizedPokemon([...memorizedPokemon, { no: currentNumber, step }]);
      }
      pickRandomPokemon();
    }
  };

  const resetMemorizedPokemon = () => {
    setMemorizedPokemon([]);
    alert('覚えたポケモンをリセットしました');
    pickRandomPokemon();
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mt-[50px]">ポケモンNo埋めゲーム</h1>

      <div id="filter-options" className="my-4">
        <div className="mb-4">
          <button
            onClick={resetMemorizedPokemon}
            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md mb-[50px]"
          >
            覚えたポケモンをリセット
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="nextType">次の方向:</label>
          <select
            id="nextType"
            value={nextType}
            onChange={(e) => {
              setNextType(e.target.value);
              pickRandomPokemon();
              localStorage.setItem('nextType', e.target.value);
            }}
            className="ml-2 border p-1 border-gray-300 rounded-md"
          >
            <option value="right">右の答え</option>
            <option value="left">左の答え</option>
            <option value="top">上の答え</option>
            <option value="bottom">下の答え</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="numberInput">カンマ区切りで数字を指定:</label>
          <input
            type="text"
            id="numberInput"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="例: 1,2,3,10"
            className="ml-2 border p-1 border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fromNumber">NoのFrom:</label>
          <input
            type="number"
            id="fromNumber"
            value={fromNumber ?? ''}
            onChange={(e) => setFromNumber(Number(e.target.value))}
            min="1"
            max="1025"
            className="ml-2 border p-1 border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="toNumber">NoのTo:</label>
          <input
            type="number"
            id="toNumber"
            value={toNumber ?? ''}
            onChange={(e) => setToNumber(Number(e.target.value))}
            min="1"
            max="1025"
            className="ml-2 border p-1 border-gray-300 rounded-md"
          />
        </div>

        <button
          onClick={applyFilter}
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md mb-[50px]"
        >
          絞り込んでランダムに表示
        </button>
      </div>

      <div id="currentNumberDisplay" className="my-4 text-xl font-bold">
        現在のポケモン番号: {currentNumber}
      </div>

      {/* ポケモン番号のヒント表示 */}
      <div className="w-full flex justify-center">
        <div className="w-[380px]">
          {nextType === 'bottom' && (
            <div className="flex justify-center gap-[30px]">
              <PokemonBox
                hintNumber={hintNumbers[2]}
                name={
                  pokemonData.find(
                    (pokemon) => pokemon['No'] === hintNumbers[2]
                  )?.['name']
                }
                isHidden={false}
              />
            </div>
          )}
          <div className="flex justify-center gap-[30px]">
            {nextType === 'right' && (
              <PokemonBox
                hintNumber={hintNumbers[0]}
                name={
                  pokemonData.find(
                    (pokemon) => pokemon['No'] === hintNumbers[0]
                  )?.['name']
                }
                isHidden={false}
              />
            )}
            <PokemonBox
              hintNumber={currentNumber!}
              name={
                pokemonData.find(
                  (pokemon) => pokemon['No'] === currentNumber
                )?.['name']
              }
              isHidden={!answerRevealed}
            />
            {nextType === 'left' && (
              <PokemonBox
                hintNumber={hintNumbers[1]}
                name={
                  pokemonData.find(
                    (pokemon) => pokemon['No'] === hintNumbers[1]
                  )?.['name']
                }
                isHidden={false}
              />
            )}
          </div>
          {nextType === 'top' && (
            <div className="flex justify-center gap-[30px]">
              <PokemonBox
                hintNumber={hintNumbers[3]}
                name={
                  pokemonData.find(
                    (pokemon) => pokemon['No'] === hintNumbers[3]
                  )?.['name']
                }
                isHidden={false}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center mt-[30px]">
        <div className="flex items-center justify-between gap-[23px]">
          {[
            {
              text: '◎',
              step: 'fully',
            },
            {
              text: '◯',
              step: 'just',
            },
            {
              text: '△',
              step: 'seen',
            },
            {
              text: '◻︎',
              step: 'barely',
            },
            {
              text: '×',
              step: 'unknown',
            },
          ].map((item) => {
            return (
              <div className="w-[50px]">
                <button
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={() => memorizePokemon(item.step as Step)}
                >
                  {item.text}
                </button>
                <div className="mt-2">
                  <span
                    className={(() => {
                      const memorized = memorizedPokemon.find(
                        (pokemon) => pokemon.no === currentNumber
                      );
                      if (memorized) {
                        return memorized?.step === item.step
                          ? 'text-red-500'
                          : '';
                      }
                      return item.step === 'unknown' ? 'text-red-500' : '';
                    })()}
                  >
                    {memorizedPokemon.filter(
                      (pokemon) => pokemon.step === item.step
                    ).length +
                      (item.step === 'unknown'
                        ? 1025 - memorizedPokemon.length
                        : 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-[100px] mt-[40px] mb-[100px]">
        <button
          className="cursor-pointer text-blue-500 px-4 py-2 rounded-md"
          onClick={() => setAnswerRevealed(true)}
        >
          {'答えをみる'}
        </button>
      </div>
    </div>
  );
};

export default App;

const PokemonBox = ({
  hintNumber,
  name,
  isHidden,
}: {
  hintNumber: number;
  name: string;
  isHidden?: boolean;
}) => {
  return (
    <div className="w-[150px] h-[150px] justify-center items-center flex flex-col">
      <div className="h-[30px]">{hintNumber}</div>
      <div className="h-[92px] flex justify-center items-center">
        {!isHidden && hintNumber ? (
          <img
            className="h-[92px] w-[92px]"
            src={`https://all-pokemon-ierukana.com/img/pokemon/${String(
              hintNumber
            ).padStart(3, '0')}.png`}
          />
        ) : (
          <span className="text-gray-500">???</span>
        )}
      </div>
      <div className="h-[30px]">{!isHidden && hintNumber ? name : ''}</div>
    </div>
  );
};
