import { Unit, Lesson, Question, MathRow } from '../types';

/**
 * Creates 50 vertical arithmetic questions (addition & subtraction) for Soroban / Mental Math.
 * Rules strictly enforced:
 * - Exactly one row is negative (subtraction with '-' sign displayed).
 * - All other rows are positive (NO '+' sign displayed, blank prefix).
 * - The negative number is strictly smaller than the row directly above it.
 * - Result is always positive.
 */
function createVerticalLessonQuestions(
  unitId: string,
  lessonId: string,
  digits: number,
  rowCount: number,
  stageTitle: string
): Question[] {
  const questions: Question[] = [];
  const minVal = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const maxVal = Math.pow(10, digits) - 1;

  for (let i = 0; i < 50; i++) {
    const rows: MathRow[] = [];
    // Select which row (from index 1 to rowCount - 1) will be negative
    const negativeRowIndex = Math.floor(Math.random() * (rowCount - 1)) + 1;

    let cumulativeSum = 0;

    for (let r = 0; r < rowCount; r++) {
      if (r === negativeRowIndex) {
        // Negative row: MUST be strictly smaller than the row directly above it (rows[r - 1])
        const prevValue = rows[r - 1].value;
        const maxSub = Math.max(1, prevValue - 1);
        const subVal = Math.floor(Math.random() * maxSub) + 1;

        rows.push({
          value: subVal,
          isNegative: true,
        });
        cumulativeSum -= subVal;
      } else {
        // Positive row (no '+' displayed, only the number)
        let val = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        rows.push({
          value: val,
          isNegative: false,
        });
        cumulativeSum += val;
      }
    }

    questions.push({
      id: `${lessonId}-q${i + 1}`,
      lessonId,
      type: 'mental_math',
      prompt: `Calculate the sum mentally:`,
      subtitle: `${stageTitle} • Q${i + 1}/50`,
      explanation: `Add the column numbers mentally. Row with '-' indicates subtraction. Total: ${cumulativeSum}`,
      mathRows: rows,
      correctAnswerNumber: cumulativeSum,
      points: 10,
    });
  }

  return questions;
}

/**
 * Creates 50 multiplication or division questions.
 */
function createOperationLessonQuestions(
  unitId: string,
  lessonId: string,
  operation: 'mul' | 'div',
  digitsA: number,
  digitsB: number,
  stageTitle: string
): Question[] {
  const questions: Question[] = [];

  for (let i = 0; i < 50; i++) {
    const minA = Math.pow(10, digitsA - 1);
    const maxA = Math.pow(10, digitsA) - 1;
    const minB = Math.pow(10, digitsB - 1);
    const maxB = Math.pow(10, digitsB) - 1;

    let numA = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
    let numB = Math.floor(Math.random() * (maxB - minB + 1)) + minB;

    let prompt = '';
    let correctAnswer = 0;
    let explanation = '';

    if (operation === 'mul') {
      correctAnswer = numA * numB;
      prompt = `${numA} × ${numB} = ?`;
      explanation = `${numA} multiplied by ${numB} equals ${correctAnswer}`;
    } else {
      // Division with clean whole numbers
      const product = numA * numB;
      prompt = `${product} ÷ ${numB} = ?`;
      correctAnswer = numA;
      explanation = `${product} divided by ${numB} equals ${numA}`;
    }

    questions.push({
      id: `${lessonId}-q${i + 1}`,
      lessonId,
      type: 'mental_math',
      prompt,
      subtitle: `${stageTitle} • Q${i + 1}/50`,
      explanation,
      mathOperation: operation,
      operandA: numA,
      operandB: numB,
      correctAnswerNumber: correctAnswer,
      points: 10,
    });
  }

  return questions;
}

// ================= SIMPLE EQUATIONS (المعادلات البسيطة - بدون مكملات) =================
interface SimpleRodState {
  upper: number; // 0 or 1
  lower: number; // 0, 1, 2, 3, 4
}

function getRodValue(rod: SimpleRodState): number {
  return rod.upper * 5 + rod.lower;
}

function canAddDirect(rod: SimpleRodState, digit: number): boolean {
  if (digit < 0 || digit > 9) return false;
  const u = digit >= 5 ? 1 : 0;
  const l = digit % 5;
  return rod.upper + u <= 1 && rod.lower + l <= 4;
}

function applyAddDirect(rod: SimpleRodState, digit: number): SimpleRodState {
  const u = digit >= 5 ? 1 : 0;
  const l = digit % 5;
  return { upper: rod.upper + u, lower: rod.lower + l };
}

function canSubDirect(rod: SimpleRodState, digit: number): boolean {
  if (digit <= 0 || digit > 9) return false;
  const u = digit >= 5 ? 1 : 0;
  const l = digit % 5;
  return rod.upper >= u && rod.lower >= l;
}

function applySubDirect(rod: SimpleRodState, digit: number): SimpleRodState {
  const u = digit >= 5 ? 1 : 0;
  const l = digit % 5;
  return { upper: rod.upper - u, lower: rod.lower - l };
}

/**
 * Creates 50 mental math questions for Simple Equations (المعادلات البسيطة):
 * - Direct Soroban operations with NO 5-complements and NO 10-complements (no carrying or borrowing).
 * - Mixed addition and subtraction.
 * - Negative rows display '-' in red, positive rows display with no '+' prefix.
 * - Intermediate running total and final total are strictly > 0.
 * - Supports 1 digit (4, 5, 6 rows) and 2 digits (3, 4 rows).
 */
function createSimpleEquationLessonQuestions(
  unitId: string,
  lessonId: string,
  digits: 1 | 2,
  rowCount: number,
  stageTitle: string
): Question[] {
  const questions: Question[] = [];

  for (let q = 0; q < 50; q++) {
    let rows: MathRow[] = [];
    let cumulativeSum = 0;
    let attempts = 0;

    while (attempts < 100) {
      attempts++;
      rows = [];
      cumulativeSum = 0;

      if (digits === 1) {
        // 1-digit simple equation
        let rod: SimpleRodState = { upper: 0, lower: 0 };
        const targetSubs = rowCount <= 5 ? (Math.random() < 0.6 ? 1 : 2) : (Math.random() < 0.5 ? 2 : 3);

        const availableIndices = Array.from({ length: rowCount - 1 }, (_, i) => i + 1);
        for (let i = availableIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }
        const subIndices = new Set(availableIndices.slice(0, targetSubs));

        const startingCandidates = [2, 3, 4, 5, 6, 7, 8];
        const startVal = startingCandidates[Math.floor(Math.random() * startingCandidates.length)];
        rod = applyAddDirect(rod, startVal);
        cumulativeSum = startVal;
        rows.push({ value: startVal, isNegative: false });

        let stepSuccess = true;

        for (let r = 1; r < rowCount; r++) {
          const wantsSub = subIndices.has(r);
          const currentVal = getRodValue(rod);

          if (wantsSub) {
            const validSubs: number[] = [];
            for (let d = 1; d <= 9; d++) {
              if (canSubDirect(rod, d) && currentVal - d > 0) {
                validSubs.push(d);
              }
            }
            if (validSubs.length > 0) {
              const subVal = validSubs[Math.floor(Math.random() * validSubs.length)];
              rod = applySubDirect(rod, subVal);
              cumulativeSum -= subVal;
              rows.push({ value: subVal, isNegative: true });
            } else {
              const validAdds: number[] = [];
              for (let d = 1; d <= 9; d++) {
                if (canAddDirect(rod, d)) {
                  validAdds.push(d);
                }
              }
              if (validAdds.length === 0) {
                stepSuccess = false;
                break;
              }
              const addVal = validAdds[Math.floor(Math.random() * validAdds.length)];
              rod = applyAddDirect(rod, addVal);
              cumulativeSum += addVal;
              rows.push({ value: addVal, isNegative: false });
            }
          } else {
            const validAdds: number[] = [];
            for (let d = 1; d <= 9; d++) {
              if (canAddDirect(rod, d)) {
                validAdds.push(d);
              }
            }
            if (validAdds.length > 0) {
              const addVal = validAdds[Math.floor(Math.random() * validAdds.length)];
              rod = applyAddDirect(rod, addVal);
              cumulativeSum += addVal;
              rows.push({ value: addVal, isNegative: false });
            } else {
              const validSubs: number[] = [];
              for (let d = 1; d <= 9; d++) {
                if (canSubDirect(rod, d) && currentVal - d > 0) {
                  validSubs.push(d);
                }
              }
              if (validSubs.length === 0) {
                stepSuccess = false;
                break;
              }
              const subVal = validSubs[Math.floor(Math.random() * validSubs.length)];
              rod = applySubDirect(rod, subVal);
              cumulativeSum -= subVal;
              rows.push({ value: subVal, isNegative: true });
            }
          }
        }

        const hasSub = rows.some((rw) => rw.isNegative);
        if (stepSuccess && rows.length === rowCount && hasSub && cumulativeSum > 0) {
          break;
        }
      } else {
        // 2-digit simple equation
        let tensRod: SimpleRodState = { upper: 0, lower: 0 };
        let unitsRod: SimpleRodState = { upper: 0, lower: 0 };

        const targetSubs = rowCount === 3 ? 1 : (Math.random() < 0.6 ? 1 : 2);
        const availableIndices = Array.from({ length: rowCount - 1 }, (_, i) => i + 1);
        for (let i = availableIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }
        const subIndices = new Set(availableIndices.slice(0, targetSubs));

        const tStartCandidates = [2, 3, 4, 5, 6, 7];
        const uStartCandidates = [1, 2, 3, 4, 5, 6, 7, 8];
        const tStart = tStartCandidates[Math.floor(Math.random() * tStartCandidates.length)];
        const uStart = uStartCandidates[Math.floor(Math.random() * uStartCandidates.length)];
        tensRod = applyAddDirect(tensRod, tStart);
        unitsRod = applyAddDirect(unitsRod, uStart);
        const startVal = tStart * 10 + uStart;
        cumulativeSum = startVal;
        rows.push({ value: startVal, isNegative: false });

        let stepSuccess = true;

        for (let r = 1; r < rowCount; r++) {
          const wantsSub = subIndices.has(r);
          const currentTotal = getRodValue(tensRod) * 10 + getRodValue(unitsRod);

          if (wantsSub) {
            const validSubs: number[] = [];
            for (let V = 10; V <= 99; V++) {
              const t = Math.floor(V / 10);
              const u = V % 10;
              if (canSubDirect(tensRod, t) && canSubDirect(unitsRod, u) && currentTotal - V > 0) {
                validSubs.push(V);
              }
            }
            if (validSubs.length > 0) {
              const subVal = validSubs[Math.floor(Math.random() * validSubs.length)];
              const t = Math.floor(subVal / 10);
              const u = subVal % 10;
              tensRod = applySubDirect(tensRod, t);
              unitsRod = applySubDirect(unitsRod, u);
              cumulativeSum -= subVal;
              rows.push({ value: subVal, isNegative: true });
            } else {
              const validAdds: number[] = [];
              for (let V = 10; V <= 99; V++) {
                const t = Math.floor(V / 10);
                const u = V % 10;
                if (canAddDirect(tensRod, t) && canAddDirect(unitsRod, u)) {
                  validAdds.push(V);
                }
              }
              if (validAdds.length === 0) {
                stepSuccess = false;
                break;
              }
              const addVal = validAdds[Math.floor(Math.random() * validAdds.length)];
              const t = Math.floor(addVal / 10);
              const u = addVal % 10;
              tensRod = applyAddDirect(tensRod, t);
              unitsRod = applyAddDirect(unitsRod, u);
              cumulativeSum += addVal;
              rows.push({ value: addVal, isNegative: false });
            }
          } else {
            const validAdds: number[] = [];
            for (let V = 10; V <= 99; V++) {
              const t = Math.floor(V / 10);
              const u = V % 10;
              if (canAddDirect(tensRod, t) && canAddDirect(unitsRod, u)) {
                validAdds.push(V);
              }
            }
            if (validAdds.length > 0) {
              const addVal = validAdds[Math.floor(Math.random() * validAdds.length)];
              const t = Math.floor(addVal / 10);
              const u = addVal % 10;
              tensRod = applyAddDirect(tensRod, t);
              unitsRod = applyAddDirect(unitsRod, u);
              cumulativeSum += addVal;
              rows.push({ value: addVal, isNegative: false });
            } else {
              const validSubs: number[] = [];
              for (let V = 10; V <= 99; V++) {
                const t = Math.floor(V / 10);
                const u = V % 10;
                if (canSubDirect(tensRod, t) && canSubDirect(unitsRod, u) && currentTotal - V > 0) {
                  validSubs.push(V);
                }
              }
              if (validSubs.length === 0) {
                stepSuccess = false;
                break;
              }
              const subVal = validSubs[Math.floor(Math.random() * validSubs.length)];
              const t = Math.floor(subVal / 10);
              const u = subVal % 10;
              tensRod = applySubDirect(tensRod, t);
              unitsRod = applySubDirect(unitsRod, u);
              cumulativeSum -= subVal;
              rows.push({ value: subVal, isNegative: true });
            }
          }
        }

        const hasSub = rows.some((rw) => rw.isNegative);
        if (stepSuccess && rows.length === rowCount && hasSub && cumulativeSum > 0) {
          break;
        }
      }
    }

    const stepFormula = rows
      .map((r, idx) => (idx === 0 ? `${r.value}` : r.isNegative ? `- ${r.value}` : `+ ${r.value}`))
      .join(' ');

    questions.push({
      id: `${lessonId}-q${q + 1}`,
      lessonId,
      type: 'mental_math',
      prompt: `Calculate the sum mentally:`,
      subtitle: `${stageTitle} • Q${q + 1}/50`,
      explanation: `Direct simple calculation: ${stepFormula} = ${cumulativeSum}`,
      mathRows: rows,
      correctAnswerNumber: cumulativeSum,
      points: 10,
    });
  }

  return questions;
}

// ================= 5-COMPLEMENTS / SMALL FRIENDS (معادلات الـ 5 - أصدقاء الخمسة) =================
function canAddFiveComp(rod: SimpleRodState, digit: number): boolean {
  if (digit < 1 || digit > 4) return false;
  return rod.upper === 0 && rod.lower >= (5 - digit);
}

function applyAddFiveComp(rod: SimpleRodState, digit: number): SimpleRodState {
  return { upper: 1, lower: rod.lower - (5 - digit) };
}

function canSubFiveComp(rod: SimpleRodState, digit: number): boolean {
  if (digit < 1 || digit > 4) return false;
  return rod.upper === 1 && rod.lower + (5 - digit) <= 4;
}

function applySubFiveComp(rod: SimpleRodState, digit: number): SimpleRodState {
  return { upper: 0, lower: rod.lower + (5 - digit) };
}

function canAddWithFiveComp(rod: SimpleRodState, digit: number): boolean {
  return canAddDirect(rod, digit) || canAddFiveComp(rod, digit);
}

function applyAddWithFiveComp(rod: SimpleRodState, digit: number): { nextRod: SimpleRodState; isFiveComp: boolean } {
  if (canAddFiveComp(rod, digit)) {
    return { nextRod: applyAddFiveComp(rod, digit), isFiveComp: true };
  }
  return { nextRod: applyAddDirect(rod, digit), isFiveComp: false };
}

function canSubWithFiveComp(rod: SimpleRodState, digit: number): boolean {
  return canSubDirect(rod, digit) || canSubFiveComp(rod, digit);
}

function applySubWithFiveComp(rod: SimpleRodState, digit: number): { nextRod: SimpleRodState; isFiveComp: boolean } {
  if (canSubFiveComp(rod, digit)) {
    return { nextRod: applySubFiveComp(rod, digit), isFiveComp: true };
  }
  return { nextRod: applySubDirect(rod, digit), isFiveComp: false };
}

/**
 * Creates 50 mental math questions for 5-Complements / Small Friends (معادلات الـ 5 - أصدقاء الخمسة):
 * - Formula: +4 = +5 - 1, +3 = +5 - 2, +2 = +5 - 3, +1 = +5 - 4
 *            -4 = -5 + 1, -3 = -5 + 2, -2 = -5 + 3, -1 = -5 + 4
 * - Guarantees 5-complements are used in every question.
 * - Supports 1 digit (4, 5, 6 rows) and 2 digits (4, 5, 6 rows).
 */
function createFiveComplementsLessonQuestions(
  unitId: string,
  lessonId: string,
  digits: 1 | 2,
  rowCount: number,
  stageTitle: string
): Question[] {
  const questions: Question[] = [];

  for (let q = 0; q < 50; q++) {
    let rows: MathRow[] = [];
    let cumulativeSum = 0;
    let attempts = 0;

    while (attempts < 100) {
      attempts++;
      rows = [];
      cumulativeSum = 0;
      let usedFiveComp = false;

      if (digits === 1) {
        let rod: SimpleRodState = { upper: 0, lower: 0 };
        const targetSubs = rowCount <= 5 ? (Math.random() < 0.6 ? 1 : 2) : (Math.random() < 0.5 ? 2 : 3);

        const availableIndices = Array.from({ length: rowCount - 1 }, (_, i) => i + 1);
        for (let i = availableIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }
        const subIndices = new Set(availableIndices.slice(0, targetSubs));

        const startingCandidates = [1, 2, 3, 4, 5, 6, 7, 8];
        const startVal = startingCandidates[Math.floor(Math.random() * startingCandidates.length)];
        rod = applyAddDirect(rod, startVal);
        cumulativeSum = startVal;
        rows.push({ value: startVal, isNegative: false });

        let stepSuccess = true;

        for (let r = 1; r < rowCount; r++) {
          const wantsSub = subIndices.has(r);
          const currentVal = getRodValue(rod);

          if (wantsSub) {
            const validSubs: { val: number; is5: boolean }[] = [];
            for (let d = 1; d <= 9; d++) {
              if (currentVal - d > 0) {
                if (canSubFiveComp(rod, d)) {
                  validSubs.push({ val: d, is5: true });
                } else if (canSubDirect(rod, d)) {
                  validSubs.push({ val: d, is5: false });
                }
              }
            }
            if (validSubs.length > 0) {
              const fiveComps = validSubs.filter((s) => s.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validSubs[Math.floor(Math.random() * validSubs.length)];

              if (chosen.is5) {
                rod = applySubFiveComp(rod, chosen.val);
                usedFiveComp = true;
              } else {
                rod = applySubDirect(rod, chosen.val);
              }
              cumulativeSum -= chosen.val;
              rows.push({ value: chosen.val, isNegative: true });
            } else {
              const validAdds: { val: number; is5: boolean }[] = [];
              for (let d = 1; d <= 9; d++) {
                if (canAddFiveComp(rod, d)) {
                  validAdds.push({ val: d, is5: true });
                } else if (canAddDirect(rod, d)) {
                  validAdds.push({ val: d, is5: false });
                }
              }
              if (validAdds.length === 0) {
                stepSuccess = false;
                break;
              }
              const fiveComps = validAdds.filter((a) => a.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validAdds[Math.floor(Math.random() * validAdds.length)];

              if (chosen.is5) {
                rod = applyAddFiveComp(rod, chosen.val);
                usedFiveComp = true;
              } else {
                rod = applyAddDirect(rod, chosen.val);
              }
              cumulativeSum += chosen.val;
              rows.push({ value: chosen.val, isNegative: false });
            }
          } else {
            const validAdds: { val: number; is5: boolean }[] = [];
            for (let d = 1; d <= 9; d++) {
              if (canAddFiveComp(rod, d)) {
                validAdds.push({ val: d, is5: true });
              } else if (canAddDirect(rod, d)) {
                validAdds.push({ val: d, is5: false });
              }
            }
            if (validAdds.length > 0) {
              const fiveComps = validAdds.filter((a) => a.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validAdds[Math.floor(Math.random() * validAdds.length)];

              if (chosen.is5) {
                rod = applyAddFiveComp(rod, chosen.val);
                usedFiveComp = true;
              } else {
                rod = applyAddDirect(rod, chosen.val);
              }
              cumulativeSum += chosen.val;
              rows.push({ value: chosen.val, isNegative: false });
            } else {
              const validSubs: { val: number; is5: boolean }[] = [];
              for (let d = 1; d <= 9; d++) {
                if (currentVal - d > 0) {
                  if (canSubFiveComp(rod, d)) {
                    validSubs.push({ val: d, is5: true });
                  } else if (canSubDirect(rod, d)) {
                    validSubs.push({ val: d, is5: false });
                  }
                }
              }
              if (validSubs.length === 0) {
                stepSuccess = false;
                break;
              }
              const fiveComps = validSubs.filter((s) => s.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validSubs[Math.floor(Math.random() * validSubs.length)];

              if (chosen.is5) {
                rod = applySubFiveComp(rod, chosen.val);
                usedFiveComp = true;
              } else {
                rod = applySubDirect(rod, chosen.val);
              }
              cumulativeSum -= chosen.val;
              rows.push({ value: chosen.val, isNegative: true });
            }
          }
        }

        const hasSub = rows.some((rw) => rw.isNegative);
        if (stepSuccess && rows.length === rowCount && hasSub && usedFiveComp && cumulativeSum > 0) {
          break;
        }
      } else {
        // 2-digit 5-complements
        let tensRod: SimpleRodState = { upper: 0, lower: 0 };
        let unitsRod: SimpleRodState = { upper: 0, lower: 0 };

        const targetSubs = rowCount <= 5 ? (Math.random() < 0.6 ? 1 : 2) : (Math.random() < 0.5 ? 2 : 3);
        const availableIndices = Array.from({ length: rowCount - 1 }, (_, i) => i + 1);
        for (let i = availableIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }
        const subIndices = new Set(availableIndices.slice(0, targetSubs));

        const tStartCandidates = [1, 2, 3, 4, 5, 6, 7];
        const uStartCandidates = [1, 2, 3, 4, 5, 6, 7, 8];
        const tStart = tStartCandidates[Math.floor(Math.random() * tStartCandidates.length)];
        const uStart = uStartCandidates[Math.floor(Math.random() * uStartCandidates.length)];
        tensRod = applyAddDirect(tensRod, tStart);
        unitsRod = applyAddDirect(unitsRod, uStart);
        const startVal = tStart * 10 + uStart;
        cumulativeSum = startVal;
        rows.push({ value: startVal, isNegative: false });

        let stepSuccess = true;

        for (let r = 1; r < rowCount; r++) {
          const wantsSub = subIndices.has(r);
          const currentTotal = getRodValue(tensRod) * 10 + getRodValue(unitsRod);

          if (wantsSub) {
            const validSubs: { val: number; is5: boolean }[] = [];
            for (let V = 10; V <= 99; V++) {
              const t = Math.floor(V / 10);
              const u = V % 10;
              if (canSubWithFiveComp(tensRod, t) && canSubWithFiveComp(unitsRod, u) && currentTotal - V > 0) {
                const is5 = canSubFiveComp(tensRod, t) || canSubFiveComp(unitsRod, u);
                validSubs.push({ val: V, is5 });
              }
            }
            if (validSubs.length > 0) {
              const fiveComps = validSubs.filter((s) => s.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validSubs[Math.floor(Math.random() * validSubs.length)];

              const t = Math.floor(chosen.val / 10);
              const u = chosen.val % 10;
              const resT = applySubWithFiveComp(tensRod, t);
              const resU = applySubWithFiveComp(unitsRod, u);
              tensRod = resT.nextRod;
              unitsRod = resU.nextRod;
              if (chosen.is5) usedFiveComp = true;
              cumulativeSum -= chosen.val;
              rows.push({ value: chosen.val, isNegative: true });
            } else {
              const validAdds: { val: number; is5: boolean }[] = [];
              for (let V = 10; V <= 99; V++) {
                const t = Math.floor(V / 10);
                const u = V % 10;
                if (canAddWithFiveComp(tensRod, t) && canAddWithFiveComp(unitsRod, u)) {
                  const is5 = canAddFiveComp(tensRod, t) || canAddFiveComp(unitsRod, u);
                  validAdds.push({ val: V, is5 });
                }
              }
              if (validAdds.length === 0) {
                stepSuccess = false;
                break;
              }
              const fiveComps = validAdds.filter((a) => a.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validAdds[Math.floor(Math.random() * validAdds.length)];

              const t = Math.floor(chosen.val / 10);
              const u = chosen.val % 10;
              const resT = applyAddWithFiveComp(tensRod, t);
              const resU = applyAddWithFiveComp(unitsRod, u);
              tensRod = resT.nextRod;
              unitsRod = resU.nextRod;
              if (chosen.is5) usedFiveComp = true;
              cumulativeSum += chosen.val;
              rows.push({ value: chosen.val, isNegative: false });
            }
          } else {
            const validAdds: { val: number; is5: boolean }[] = [];
            for (let V = 10; V <= 99; V++) {
              const t = Math.floor(V / 10);
              const u = V % 10;
              if (canAddWithFiveComp(tensRod, t) && canAddWithFiveComp(unitsRod, u)) {
                const is5 = canAddFiveComp(tensRod, t) || canAddFiveComp(unitsRod, u);
                validAdds.push({ val: V, is5 });
              }
            }
            if (validAdds.length > 0) {
              const fiveComps = validAdds.filter((a) => a.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validAdds[Math.floor(Math.random() * validAdds.length)];

              const t = Math.floor(chosen.val / 10);
              const u = chosen.val % 10;
              const resT = applyAddWithFiveComp(tensRod, t);
              const resU = applyAddWithFiveComp(unitsRod, u);
              tensRod = resT.nextRod;
              unitsRod = resU.nextRod;
              if (chosen.is5) usedFiveComp = true;
              cumulativeSum += chosen.val;
              rows.push({ value: chosen.val, isNegative: false });
            } else {
              const validSubs: { val: number; is5: boolean }[] = [];
              for (let V = 10; V <= 99; V++) {
                const t = Math.floor(V / 10);
                const u = V % 10;
                if (canSubWithFiveComp(tensRod, t) && canSubWithFiveComp(unitsRod, u) && currentTotal - V > 0) {
                  const is5 = canSubFiveComp(tensRod, t) || canSubFiveComp(unitsRod, u);
                  validSubs.push({ val: V, is5 });
                }
              }
              if (validSubs.length === 0) {
                stepSuccess = false;
                break;
              }
              const fiveComps = validSubs.filter((s) => s.is5);
              const chosen = (!usedFiveComp && fiveComps.length > 0)
                ? fiveComps[Math.floor(Math.random() * fiveComps.length)]
                : validSubs[Math.floor(Math.random() * validSubs.length)];

              const t = Math.floor(chosen.val / 10);
              const u = chosen.val % 10;
              const resT = applySubWithFiveComp(tensRod, t);
              const resU = applySubWithFiveComp(unitsRod, u);
              tensRod = resT.nextRod;
              unitsRod = resU.nextRod;
              if (chosen.is5) usedFiveComp = true;
              cumulativeSum -= chosen.val;
              rows.push({ value: chosen.val, isNegative: true });
            }
          }
        }

        const hasSub = rows.some((rw) => rw.isNegative);
        if (stepSuccess && rows.length === rowCount && hasSub && usedFiveComp && cumulativeSum > 0) {
          break;
        }
      }
    }

    const stepFormula = rows
      .map((r, idx) => (idx === 0 ? `${r.value}` : r.isNegative ? `- ${r.value}` : `+ ${r.value}`))
      .join(' ');

    questions.push({
      id: `${lessonId}-q${q + 1}`,
      lessonId,
      type: 'mental_math',
      prompt: `Calculate the sum mentally:`,
      subtitle: `${stageTitle} • Q${q + 1}/50`,
      explanation: `5-complements calculation: ${stepFormula} = ${cumulativeSum}`,
      mathRows: rows,
      correctAnswerNumber: cumulativeSum,
      points: 10,
    });
  }

  return questions;
}

export const MENTAL_MATH_UNITS: Unit[] = [
  // ================= UNIT 1: Simple Equations Foundations (1 & 2 Digits) =================
  {
    id: 'unit-simple',
    number: 1,
    title: 'Unit 1: Simple Operations & Equations (1 & 2 Digits)',
    titleAr: 'المستوى الأول: التأسيس - معادلات بسيطة (1 و 2 ديجيت)',
    description: 'Master direct addition and subtraction with simple equations across 1 and 2 digits.',
    descriptionAr: 'تدريبات الجمع والطرح البسيط (المباشر) من 4 إلى 6 أرقام برقم واحد، و3 إلى 4 أرقام برقمين.',
    colorScheme: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      bgGradient: 'from-cyan-50 to-emerald-50',
      bannerBg: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600',
      nodeBg: 'bg-teal-500',
      nodeBorder: 'border-teal-600',
      nodeShadow: 'shadow-[0_8px_0_#0f766e]',
    },
    guidebook: {
      summary: 'Welcome to the Foundation Level! In Simple Equations (المعادلات البسيطة), addition and subtraction are performed directly on the Soroban beads without any borrowing or carrying.',
      keyPoints: [
        'Each lesson contains 50 rapid mental math questions.',
        'Simple Equations use direct bead movements (الجمع والطرح المباشر البسيط).',
        'Subtraction rows display the "-" minus sign in red. Addition rows show no plus sign.',
        'Lessons 1 to 3 train 1-digit columns with 4, 5, and 6 numbers.',
        'Lessons 4 and 5 advance to 2-digit columns with 3 and 4 numbers.',
      ],
      tips: [
        'Focus on moving only the required beads directly up or down.',
        'Keep your pace steady and use the Enter key to submit answers quickly.',
      ],
    },
    milestoneReward: {
      title: 'Golden Soroban Beginner Trophy',
      coins: 100,
      gems: 15,
      badgeId: 'trophy_foundation_master',
    },
    lessons: [
      {
        id: 'us-l1',
        unitId: 'unit-simple',
        title: '1 Digit • 4 Rows (Simple)',
        description: '4 single-digit numbers with direct simple addition and subtraction. 50 questions test.',
        type: 'practice',
        order: 1,
        xpReward: 25,
        coinsReward: 15,
        estimatedMinutes: 5,
        questions: createSimpleEquationLessonQuestions('unit-simple', 'us-l1', 1, 4, '1 Digit • 4 Rows Simple'),
      },
      {
        id: 'us-l2',
        unitId: 'unit-simple',
        title: '1 Digit • 5 Rows (Simple)',
        description: '5 single-digit numbers with direct simple addition and subtraction. 50 questions test.',
        type: 'quiz',
        order: 2,
        xpReward: 30,
        coinsReward: 20,
        estimatedMinutes: 6,
        questions: createSimpleEquationLessonQuestions('unit-simple', 'us-l2', 1, 5, '1 Digit • 5 Rows Simple'),
      },
      {
        id: 'us-l3',
        unitId: 'unit-simple',
        title: '1 Digit • 6 Rows (Simple)',
        description: '6 single-digit numbers with direct simple addition and subtraction. 50 questions test.',
        type: 'review',
        order: 3,
        xpReward: 35,
        coinsReward: 25,
        estimatedMinutes: 7,
        questions: createSimpleEquationLessonQuestions('unit-simple', 'us-l3', 1, 6, '1 Digit • 6 Rows Simple'),
      },
      {
        id: 'us-l4',
        unitId: 'unit-simple',
        title: '2 Digits • 3 Rows (Simple)',
        description: '3 two-digit numbers with direct simple addition and subtraction. 50 questions test.',
        type: 'checkpoint',
        order: 4,
        xpReward: 40,
        coinsReward: 30,
        estimatedMinutes: 8,
        questions: createSimpleEquationLessonQuestions('unit-simple', 'us-l4', 2, 3, '2 Digits • 3 Rows Simple'),
      },
      {
        id: 'us-l5',
        unitId: 'unit-simple',
        title: '2 Digits • 4 Rows (Simple)',
        description: '4 two-digit numbers with direct simple addition and subtraction. 50 questions test.',
        type: 'checkpoint',
        order: 5,
        xpReward: 50,
        coinsReward: 35,
        estimatedMinutes: 9,
        questions: createSimpleEquationLessonQuestions('unit-simple', 'us-l5', 2, 4, '2 Digits • 4 Rows Simple'),
      },
      {
        id: 'us-l6',
        unitId: 'unit-simple',
        title: '2 Digits • 5 Rows (Simple)',
        description: '5 two-digit numbers with direct simple addition and subtraction. 50 questions test.',
        type: 'final_challenge',
        order: 6,
        xpReward: 60,
        coinsReward: 40,
        estimatedMinutes: 10,
        questions: createSimpleEquationLessonQuestions('unit-simple', 'us-l6', 2, 5, '2 Digits • 5 Rows Simple'),
      },
    ],
  },

  // ================= UNIT 2: 5-Complements & Small Friends (معادلات الـ 5 - أصدقاء الخمسة) =================
  {
    id: 'unit-five-comp',
    number: 2,
    title: 'Unit 2: 5-Complements & Small Friends',
    description: 'Master addition and subtraction using 5-complements (+5 / -5 formulas) for 1 and 2 digits.',
    descriptionAr: 'إتقان الجمع والطرح باستخدام معادلات أصدقاء الـ 5 للأعمدة المكونة من رقم ورقمين.',
    colorScheme: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      bgGradient: 'from-purple-50 to-indigo-50',
      bannerBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700',
      nodeBg: 'bg-purple-500',
      nodeBorder: 'border-purple-600',
      nodeShadow: 'shadow-[0_8px_0_#6d28d9]',
    },
    guidebook: {
      summary: 'In Unit 2, you master the 5-complements (أصدقاء الـ 5)! When direct lower beads are insufficient, use formulas: +4 = +5 - 1, +3 = +5 - 2, +2 = +5 - 3, +1 = +5 - 4 and their subtractions.',
      keyPoints: [
        'Each exam contains 50 rapid mental math questions.',
        'Addition 5-Complements: +4 = +5 - 1 | +3 = +5 - 2 | +2 = +5 - 3 | +1 = +5 - 4.',
        'Subtraction 5-Complements: -4 = -5 + 1 | -3 = -5 + 2 | -2 = -5 + 3 | -1 = -5 + 4.',
        'Lessons 1 to 3 train 1-digit columns with 4, 5, and 6 numbers.',
        'Lessons 4 to 6 train 2-digit columns with 4, 5, and 6 numbers.',
      ],
      tips: [
        'Visualize bringing the top 5-bead down when adding, and pushing it up when subtracting.',
        'Use the Enter key on your keyboard to instantly submit each result.',
      ],
    },
    milestoneReward: {
      title: 'Amethyst 5-Friends Soroban Trophy',
      coins: 130,
      gems: 20,
      badgeId: 'trophy_5comp_master',
    },
    lessons: [
      {
        id: 'u5c-l1',
        unitId: 'unit-five-comp',
        title: '1 Digit • 4 Rows (5-Complements)',
        description: '4 single-digit numbers using 5-complement formulas (+5 / -5). 50 questions test.',
        type: 'practice',
        order: 1,
        xpReward: 35,
        coinsReward: 20,
        estimatedMinutes: 6,
        questions: createFiveComplementsLessonQuestions('unit-five-comp', 'u5c-l1', 1, 4, '1 Digit • 4 Rows (5-Comp)'),
      },
      {
        id: 'u5c-l2',
        unitId: 'unit-five-comp',
        title: '1 Digit • 5 Rows (5-Complements)',
        description: '5 single-digit numbers using 5-complement formulas (+5 / -5). 50 questions test.',
        type: 'quiz',
        order: 2,
        xpReward: 40,
        coinsReward: 25,
        estimatedMinutes: 7,
        questions: createFiveComplementsLessonQuestions('unit-five-comp', 'u5c-l2', 1, 5, '1 Digit • 5 Rows (5-Comp)'),
      },
      {
        id: 'u5c-l3',
        unitId: 'unit-five-comp',
        title: '1 Digit • 6 Rows (5-Complements)',
        description: '6 single-digit numbers using 5-complement formulas (+5 / -5). 50 questions test.',
        type: 'review',
        order: 3,
        xpReward: 45,
        coinsReward: 30,
        estimatedMinutes: 8,
        questions: createFiveComplementsLessonQuestions('unit-five-comp', 'u5c-l3', 1, 6, '1 Digit • 6 Rows (5-Comp)'),
      },
      {
        id: 'u5c-l4',
        unitId: 'unit-five-comp',
        title: '2 Digits • 4 Rows (5-Complements)',
        description: '4 two-digit numbers using 5-complement formulas (+5 / -5). 50 questions test.',
        type: 'checkpoint',
        order: 4,
        xpReward: 50,
        coinsReward: 35,
        estimatedMinutes: 9,
        questions: createFiveComplementsLessonQuestions('unit-five-comp', 'u5c-l4', 2, 4, '2 Digits • 4 Rows (5-Comp)'),
      },
      {
        id: 'u5c-l5',
        unitId: 'unit-five-comp',
        title: '2 Digits • 5 Rows (5-Complements)',
        description: '5 two-digit numbers using 5-complement formulas (+5 / -5). 50 questions test.',
        type: 'review',
        order: 5,
        xpReward: 55,
        coinsReward: 40,
        estimatedMinutes: 10,
        questions: createFiveComplementsLessonQuestions('unit-five-comp', 'u5c-l5', 2, 5, '2 Digits • 5 Rows (5-Comp)'),
      },
      {
        id: 'u5c-l6',
        unitId: 'unit-five-comp',
        title: '2 Digits • 6 Rows (5-Complements)',
        description: '6 two-digit numbers using 5-complement formulas (+5 / -5). 50 questions test.',
        type: 'final_challenge',
        order: 6,
        xpReward: 65,
        coinsReward: 45,
        estimatedMinutes: 11,
        questions: createFiveComplementsLessonQuestions('unit-five-comp', 'u5c-l6', 2, 6, '2 Digits • 6 Rows (5-Comp)'),
      },
    ],
  },

  // ================= UNIT 3: 1-Digit Mental Calculations (3 to 7 Numbers) =================
  {
    id: 'unit-1',
    number: 3,
    title: 'Unit 3: Single-Digit Columns (3 to 7 Rows)',
    titleAr: 'المستوى الثالث: عمود رقم واحد (من 3 إلى 7 أرقام)',
    description: 'Master fast single-digit column arithmetic with 1 subtraction row.',
    descriptionAr: 'حسابات ديجيت واحد عمودياً مع طرح رقم واحد أصغر من السابق.',
    colorScheme: {
      primary: '#10b981',
      secondary: '#059669',
      bgGradient: 'from-emerald-50 to-teal-50',
      bannerBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      nodeBg: 'bg-emerald-500',
      nodeBorder: 'border-emerald-600',
      nodeShadow: 'shadow-[0_8px_0_#059669]',
    },
    guidebook: {
      summary: 'Calculate vertically from top to bottom. Positive numbers have no sign; only the minus row shows "-".',
      keyPoints: [
        'Each test has 50 rapid mental math questions.',
        'Only the subtraction row displays "-". Positive rows show no "+" symbol.',
        'The subtracted number is always strictly smaller than the number directly above it.',
        'If you lose all 5 hearts, you will exit and must refill or practice to continue.',
      ],
      tips: [
        'Visualize beads moving on your Soroban abacus.',
        'Use the Enter key on your keyboard for fast instant submission.',
      ],
    },
    milestoneReward: {
      title: 'Emerald Panda Abacus Trophy',
      coins: 100,
      gems: 15,
      badgeId: 'trophy_1digit_master',
    },
    lessons: [
      {
        id: 'u1-l1',
        unitId: 'unit-1',
        title: '3 Rows (1 Digit)',
        description: '3 single-digit numbers with 1 subtraction row. 50 questions test.',
        type: 'practice',
        order: 1,
        xpReward: 30,
        coinsReward: 15,
        estimatedMinutes: 6,
        questions: createVerticalLessonQuestions('unit-1', 'u1-l1', 1, 3, '1 Digit • 3 Rows'),
      },
      {
        id: 'u1-l2',
        unitId: 'unit-1',
        title: '4 Rows (1 Digit)',
        description: '4 single-digit numbers with 1 subtraction row. 50 questions test.',
        type: 'quiz',
        order: 2,
        xpReward: 35,
        coinsReward: 20,
        estimatedMinutes: 7,
        questions: createVerticalLessonQuestions('unit-1', 'u1-l2', 1, 4, '1 Digit • 4 Rows'),
      },
      {
        id: 'u1-l3',
        unitId: 'unit-1',
        title: '5 Rows (1 Digit)',
        description: '5 single-digit numbers with 1 subtraction row. 50 questions test.',
        type: 'review',
        order: 3,
        xpReward: 40,
        coinsReward: 25,
        estimatedMinutes: 8,
        questions: createVerticalLessonQuestions('unit-1', 'u1-l3', 1, 5, '1 Digit • 5 Rows'),
      },
      {
        id: 'u1-l4',
        unitId: 'unit-1',
        title: '6 Rows (1 Digit)',
        description: '6 single-digit numbers with 1 subtraction row. 50 questions test.',
        type: 'checkpoint',
        order: 4,
        xpReward: 45,
        coinsReward: 30,
        estimatedMinutes: 9,
        questions: createVerticalLessonQuestions('unit-1', 'u1-l4', 1, 6, '1 Digit • 6 Rows'),
      },
      {
        id: 'u1-l5',
        unitId: 'unit-1',
        title: '7 Rows (1 Digit)',
        description: 'Full 7-row single-digit championship. 50 questions test.',
        type: 'final_challenge',
        order: 5,
        xpReward: 60,
        coinsReward: 40,
        estimatedMinutes: 10,
        questions: createVerticalLessonQuestions('unit-1', 'u1-l5', 1, 7, '1 Digit • 7 Rows'),
      },
    ],
  },

  // ================= UNIT 4: 2-Digit Mental Calculations (3 to 7 Numbers) =================
  {
    id: 'unit-2',
    number: 4,
    title: 'Unit 4: Two-Digit Columns (3 to 7 Rows)',
    titleAr: 'المستوى الرابع: عمود رقمين (من 3 إلى 7 أرقام)',
    description: 'Advance to 2-digit mental addition and subtraction columns up to 7 rows.',
    descriptionAr: 'حسابات رقمين (2 ديجيت) عمودياً حتى 7 أرقام.',
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      bgGradient: 'from-blue-50 to-indigo-50',
      bannerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      nodeBg: 'bg-blue-500',
      nodeBorder: 'border-blue-600',
      nodeShadow: 'shadow-[0_8px_0_#1d4ed8]',
    },
    guidebook: {
      summary: 'Compute tens first, then units. Keep track of mental carries and borrows.',
      keyPoints: [
        '50 rapid questions in every lesson.',
        '2-digit numbers: 10 through 99.',
        'One subtraction row with "-" smaller than the row directly above it.',
        'Full distraction-free input box.',
      ],
      tips: [
        'Group tens together mentally to speed up summation.',
      ],
    },
    milestoneReward: {
      title: 'Sapphire Panda Abacus Trophy',
      coins: 120,
      gems: 20,
      badgeId: 'trophy_2digit_master',
    },
    lessons: [
      {
        id: 'u2-l1',
        unitId: 'unit-2',
        title: '3 Rows (2 Digits)',
        description: '3 numbers of 2 digits with 1 subtraction row. 50 questions test.',
        type: 'practice',
        order: 1,
        xpReward: 35,
        coinsReward: 20,
        estimatedMinutes: 7,
        questions: createVerticalLessonQuestions('unit-2', 'u2-l1', 2, 3, '2 Digits • 3 Rows'),
      },
      {
        id: 'u2-l2',
        unitId: 'unit-2',
        title: '4 Rows (2 Digits)',
        description: '4 numbers of 2 digits with 1 subtraction row. 50 questions test.',
        type: 'quiz',
        order: 2,
        xpReward: 40,
        coinsReward: 25,
        estimatedMinutes: 8,
        questions: createVerticalLessonQuestions('unit-2', 'u2-l2', 2, 4, '2 Digits • 4 Rows'),
      },
      {
        id: 'u2-l3',
        unitId: 'unit-2',
        title: '5 Rows (2 Digits)',
        description: '5 numbers of 2 digits with 1 subtraction row. 50 questions test.',
        type: 'review',
        order: 3,
        xpReward: 45,
        coinsReward: 30,
        estimatedMinutes: 9,
        questions: createVerticalLessonQuestions('unit-2', 'u2-l3', 2, 5, '2 Digits • 5 Rows'),
      },
      {
        id: 'u2-l4',
        unitId: 'unit-2',
        title: '6 Rows (2 Digits)',
        description: '6 numbers of 2 digits with 1 subtraction row. 50 questions test.',
        type: 'checkpoint',
        order: 4,
        xpReward: 50,
        coinsReward: 35,
        estimatedMinutes: 10,
        questions: createVerticalLessonQuestions('unit-2', 'u2-l4', 2, 6, '2 Digits • 6 Rows'),
      },
      {
        id: 'u2-l5',
        unitId: 'unit-2',
        title: '7 Rows (2 Digits)',
        description: '7 numbers of 2 digits with 1 subtraction row. 50 questions test.',
        type: 'final_challenge',
        order: 5,
        xpReward: 70,
        coinsReward: 50,
        estimatedMinutes: 12,
        questions: createVerticalLessonQuestions('unit-2', 'u2-l5', 2, 7, '2 Digits • 7 Rows'),
      },
    ],
  },

  // ================= UNIT 5: Multiplication & Division Foundations =================
  {
    id: 'unit-3',
    number: 5,
    title: 'Unit 5: Basic Multiplication & Division',
    titleAr: 'المستوى الخامس: الضرب والقسمة الأساسية',
    description: 'Two digits × 1 digit, and two digits ÷ 1 digit.',
    descriptionAr: 'رقمين ضرب رقم ورقمين على رقم.',
    colorScheme: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      bgGradient: 'from-purple-50 to-indigo-50',
      bannerBg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      nodeBg: 'bg-purple-500',
      nodeBorder: 'border-purple-600',
      nodeShadow: 'shadow-[0_8px_0_#6d28d9]',
    },
    guidebook: {
      summary: 'Break 2-digit numbers into tens and ones for quick mental product.',
      keyPoints: [
        '50 questions in each test.',
        '2 Digits × 1 Digit: (e.g., 47 × 6 = 240 + 42 = 282).',
        '2 Digits ÷ 1 Digit: exact integer divisions.',
      ],
      tips: ['Multiply tens first, then add the units product.'],
    },
    milestoneReward: {
      title: 'Amethyst Panda Multiplication Crest',
      coins: 130,
      gems: 20,
      badgeId: 'trophy_mul_div_1',
    },
    lessons: [
      {
        id: 'u3-l1',
        unitId: 'unit-3',
        title: '2 Digits × 1 Digit (Part 1)',
        description: '50 rapid multiplication questions (2 digits × 1 digit).',
        type: 'practice',
        order: 1,
        xpReward: 40,
        coinsReward: 25,
        estimatedMinutes: 7,
        questions: createOperationLessonQuestions('unit-3', 'u3-l1', 'mul', 2, 1, '2 Digits × 1 Digit'),
      },
      {
        id: 'u3-l2',
        unitId: 'unit-3',
        title: '2 Digits ÷ 1 Digit (Part 1)',
        description: '50 rapid mental division questions.',
        type: 'quiz',
        order: 2,
        xpReward: 40,
        coinsReward: 25,
        estimatedMinutes: 7,
        questions: createOperationLessonQuestions('unit-3', 'u3-l2', 'div', 2, 1, '2 Digits ÷ 1 Digit'),
      },
      {
        id: 'u3-l3',
        unitId: 'unit-3',
        title: '2 Digits × 1 Digit (Speed Sprint)',
        description: 'High-speed sprint of 50 multiplication problems.',
        type: 'review',
        order: 3,
        xpReward: 50,
        coinsReward: 30,
        estimatedMinutes: 8,
        questions: createOperationLessonQuestions('unit-3', 'u3-l3', 'mul', 2, 1, 'Speed Sprint: 2 Digits × 1'),
      },
      {
        id: 'u3-l4',
        unitId: 'unit-3',
        title: '2 Digits ÷ 1 Digit (Precision)',
        description: '50 division problems with high accuracy.',
        type: 'checkpoint',
        order: 4,
        xpReward: 50,
        coinsReward: 30,
        estimatedMinutes: 8,
        questions: createOperationLessonQuestions('unit-3', 'u3-l4', 'div', 2, 1, 'Precision: 2 Digits ÷ 1'),
      },
      {
        id: 'u3-l5',
        unitId: 'unit-3',
        title: 'Mixed Times & Divide Arena',
        description: '50 combined multiplication and division questions.',
        type: 'final_challenge',
        order: 5,
        xpReward: 70,
        coinsReward: 45,
        estimatedMinutes: 10,
        questions: createOperationLessonQuestions('unit-3', 'u3-l5', 'mul', 2, 1, 'Challenge: 2 Digits × 1'),
      },
    ],
  },

  // ================= UNIT 6: 3 Digits × 1 Digit, 3 Digits ÷ 2 Digits & 3 Digits Column =================
  {
    id: 'unit-4',
    number: 6,
    title: 'Unit 6: Three-Digit Mastery & Division',
    titleAr: 'المستوى السادس: إتقان 3 أرقام والقسمة',
    description: '3 digits × 1 digit, 3 digits ÷ 2 digits, and 3-digit columns up to 7 rows.',
    descriptionAr: '3 في 1 و 3 على 2 و 3 ديجيت حتى 7 أرقام.',
    colorScheme: {
      primary: '#f59e0b',
      secondary: '#d97706',
      bgGradient: 'from-amber-50 to-yellow-50',
      bannerBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      nodeBg: 'bg-amber-500',
      nodeBorder: 'border-amber-600',
      nodeShadow: 'shadow-[0_8px_0_#b45309]',
    },
    guidebook: {
      summary: 'Master 3-digit calculations. In columns, remember the negative row is strictly smaller than the row above it.',
      keyPoints: [
        '50 questions per lesson.',
        '3 Digits × 1 Digit: (e.g., 234 × 4 = 936).',
        '3 Digits ÷ 2 Digits: exact mental quotients.',
        '3-digit columns with 1 subtraction row up to 7 rows.',
      ],
      tips: ['Decompose 3-digit numbers into hundreds, tens, and units.'],
    },
    milestoneReward: {
      title: 'Golden Panda Abacus Trophy',
      coins: 150,
      gems: 25,
      badgeId: 'trophy_3digit_master',
    },
    lessons: [
      {
        id: 'u4-l1',
        unitId: 'unit-4',
        title: '3 Digits × 1 Digit',
        description: '50 multiplication problems of 3 digits by 1 digit.',
        type: 'practice',
        order: 1,
        xpReward: 45,
        coinsReward: 25,
        estimatedMinutes: 8,
        questions: createOperationLessonQuestions('unit-4', 'u4-l1', 'mul', 3, 1, '3 Digits × 1 Digit'),
      },
      {
        id: 'u4-l2',
        unitId: 'unit-4',
        title: '3 Digits ÷ 2 Digits',
        description: '50 division problems of 3 digits divided by 2 digits.',
        type: 'quiz',
        order: 2,
        xpReward: 45,
        coinsReward: 25,
        estimatedMinutes: 8,
        questions: createOperationLessonQuestions('unit-4', 'u4-l2', 'div', 3, 2, '3 Digits ÷ 2 Digits'),
      },
      {
        id: 'u4-l3',
        unitId: 'unit-4',
        title: '3 Rows (3 Digits)',
        description: '3 numbers of 3 digits with 1 subtraction row. 50 questions test.',
        type: 'review',
        order: 3,
        xpReward: 50,
        coinsReward: 30,
        estimatedMinutes: 9,
        questions: createVerticalLessonQuestions('unit-4', 'u4-l3', 3, 3, '3 Digits • 3 Rows'),
      },
      {
        id: 'u4-l4',
        unitId: 'unit-4',
        title: '5 Rows (3 Digits)',
        description: '5 numbers of 3 digits with 1 subtraction row. 50 questions test.',
        type: 'checkpoint',
        order: 4,
        xpReward: 60,
        coinsReward: 35,
        estimatedMinutes: 10,
        questions: createVerticalLessonQuestions('unit-4', 'u4-l4', 3, 5, '3 Digits • 5 Rows'),
      },
      {
        id: 'u4-l5',
        unitId: 'unit-4',
        title: '7 Rows (3 Digits)',
        description: '7 numbers of 3 digits with 1 subtraction row. 50 questions test.',
        type: 'final_challenge',
        order: 5,
        xpReward: 80,
        coinsReward: 50,
        estimatedMinutes: 12,
        questions: createVerticalLessonQuestions('unit-4', 'u4-l5', 3, 7, '3 Digits • 7 Rows'),
      },
    ],
  },

  // ================= UNIT 7: Advanced Multiplication (2x2, 4x2, 2x3) =================
  {
    id: 'unit-5',
    number: 7,
    title: 'Unit 7: Advanced Cross Multiplication',
    titleAr: 'المستوى السابع: الضرب المتقدم (رقمين في رقمين، وأربعة في رقمين)',
    description: '2 digits × 2 digits, 4 digits × 2 digits, and 2 digits × 3 digits.',
    descriptionAr: 'رقمين في رقمين، وأربعة أرقام في رقمين، ورقمين في ثلاثة أرقام.',
    colorScheme: {
      primary: '#ec4899',
      secondary: '#db2777',
      bgGradient: 'from-pink-50 to-rose-50',
      bannerBg: 'bg-gradient-to-r from-pink-500 to-rose-600',
      nodeBg: 'bg-pink-500',
      nodeBorder: 'border-pink-600',
      nodeShadow: 'shadow-[0_8px_0_#be185d]',
    },
    guidebook: {
      summary: 'Cross-multiplication techniques for multi-digit calculations.',
      keyPoints: [
        '50 questions in every exam.',
        '2 Digits × 2 Digits: (e.g., 23 × 15 = 345).',
        '4 Digits × 2 Digits: (e.g., 1250 × 12 = 15000).',
        '2 Digits × 3 Digits: (e.g., 45 × 120 = 5400).',
      ],
      tips: ['Use the criss-cross Vedic / Soroban multiplication technique.'],
    },
    milestoneReward: {
      title: 'Ruby Panda Grandmaster Trophy',
      coins: 180,
      gems: 30,
      badgeId: 'trophy_adv_mul_master',
    },
    lessons: [
      {
        id: 'u5-l1',
        unitId: 'unit-5',
        title: '2 Digits × 2 Digits (Intro)',
        description: '50 questions of 2 digits multiplied by 2 digits.',
        type: 'practice',
        order: 1,
        xpReward: 50,
        coinsReward: 30,
        estimatedMinutes: 8,
        questions: createOperationLessonQuestions('unit-5', 'u5-l1', 'mul', 2, 2, '2 Digits × 2 Digits'),
      },
      {
        id: 'u5-l2',
        unitId: 'unit-5',
        title: '4 Digits × 2 Digits',
        description: '50 questions of 4 digits multiplied by 2 digits.',
        type: 'quiz',
        order: 2,
        xpReward: 60,
        coinsReward: 35,
        estimatedMinutes: 9,
        questions: createOperationLessonQuestions('unit-5', 'u5-l2', 'mul', 4, 2, '4 Digits × 2 Digits'),
      },
      {
        id: 'u5-l3',
        unitId: 'unit-5',
        title: '2 Digits × 3 Digits',
        description: '50 questions of 2 digits multiplied by 3 digits.',
        type: 'review',
        order: 3,
        xpReward: 60,
        coinsReward: 35,
        estimatedMinutes: 9,
        questions: createOperationLessonQuestions('unit-5', 'u5-l3', 'mul', 2, 3, '2 Digits × 3 Digits'),
      },
      {
        id: 'u5-l4',
        unitId: 'unit-5',
        title: '2 Digits × 2 Digits (Speed)',
        description: '50 rapid-fire 2x2 multiplication questions.',
        type: 'checkpoint',
        order: 4,
        xpReward: 65,
        coinsReward: 40,
        estimatedMinutes: 9,
        questions: createOperationLessonQuestions('unit-5', 'u5-l4', 'mul', 2, 2, 'Speed: 2x2 Multiplication'),
      },
      {
        id: 'u5-l5',
        unitId: 'unit-5',
        title: 'Grand Multiplication Marathon',
        description: '50 challenge questions covering all advanced multiplication types.',
        type: 'final_challenge',
        order: 5,
        xpReward: 90,
        coinsReward: 60,
        estimatedMinutes: 12,
        questions: createOperationLessonQuestions('unit-5', 'u5-l5', 'mul', 4, 2, 'Grand Multiplication Marathon'),
      },
    ],
  },

  // ================= UNIT 8: 4-Digit Columns (3 to 7 Numbers) Grand Championship =================
  {
    id: 'unit-6',
    number: 8,
    title: 'Unit 8: Four-Digit Columns (3 to 7 Rows) Grand Championship',
    titleAr: 'المستوى الثامن: عمود 4 أرقام - بطولة الأبطال',
    description: 'Master 4-digit mental columns from 3 up to 7 rows with 1 subtraction row.',
    descriptionAr: 'حسابات 4 أرقام عمودياً حتى 7 أرقام وطرح رقم أصغر من السابق.',
    colorScheme: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      bgGradient: 'from-indigo-50 to-violet-50',
      bannerBg: 'bg-gradient-to-r from-indigo-600 to-violet-700',
      nodeBg: 'bg-indigo-600',
      nodeBorder: 'border-indigo-700',
      nodeShadow: 'shadow-[0_8px_0_#4338ca]',
    },
    guidebook: {
      summary: 'The pinnacle of Soroban mental arithmetic: 4-digit vertical columns (thousands).',
      keyPoints: [
        '50 questions in every exam.',
        'Thousands, hundreds, tens, and units computed in mental streams.',
        'Exactly one subtraction row with "-" smaller than the row directly above it.',
        'No other subject—pure mental math mastery.',
      ],
      tips: ['Break columns into thousands/hundreds and tens/units sub-totals.'],
    },
    milestoneReward: {
      title: 'Diamond Panda World Champion Cup',
      coins: 250,
      gems: 50,
      badgeId: 'trophy_4digit_grand_master',
    },
    lessons: [
      {
        id: 'u6-l1',
        unitId: 'unit-6',
        title: '3 Rows (4 Digits)',
        description: '3 numbers of 4 digits with 1 subtraction row. 50 questions test.',
        type: 'practice',
        order: 1,
        xpReward: 60,
        coinsReward: 35,
        estimatedMinutes: 9,
        questions: createVerticalLessonQuestions('unit-6', 'u6-l1', 4, 3, '4 Digits • 3 Rows'),
      },
      {
        id: 'u6-l2',
        unitId: 'unit-6',
        title: '4 Rows (4 Digits)',
        description: '4 numbers of 4 digits with 1 subtraction row. 50 questions test.',
        type: 'quiz',
        order: 2,
        xpReward: 65,
        coinsReward: 40,
        estimatedMinutes: 10,
        questions: createVerticalLessonQuestions('unit-6', 'u6-l2', 4, 4, '4 Digits • 4 Rows'),
      },
      {
        id: 'u6-l3',
        unitId: 'unit-6',
        title: '5 Rows (4 Digits)',
        description: '5 numbers of 4 digits with 1 subtraction row. 50 questions test.',
        type: 'review',
        order: 3,
        xpReward: 70,
        coinsReward: 45,
        estimatedMinutes: 11,
        questions: createVerticalLessonQuestions('unit-6', 'u6-l3', 4, 5, '4 Digits • 5 Rows'),
      },
      {
        id: 'u6-l4',
        unitId: 'unit-6',
        title: '6 Rows (4 Digits)',
        description: '6 numbers of 4 digits with 1 subtraction row. 50 questions test.',
        type: 'checkpoint',
        order: 4,
        xpReward: 80,
        coinsReward: 50,
        estimatedMinutes: 12,
        questions: createVerticalLessonQuestions('unit-6', 'u6-l4', 4, 6, '4 Digits • 6 Rows'),
      },
      {
        id: 'u6-l5',
        unitId: 'unit-6',
        title: '7 Rows (4 Digits) Grand Cup',
        description: '7 numbers of 4 digits with 1 subtraction row. 50 questions ultimate exam.',
        type: 'final_challenge',
        order: 5,
        xpReward: 120,
        coinsReward: 80,
        estimatedMinutes: 15,
        questions: createVerticalLessonQuestions('unit-6', 'u6-l5', 4, 7, 'Grand Cup • 4 Digits • 7 Rows'),
      },
    ],
  },
];
