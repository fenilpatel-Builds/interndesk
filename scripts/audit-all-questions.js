const fs = require('fs');
const path = require('path');

function audit() {
  console.log('=== AUDITING ASSESSMENTS & QUESTION BANK ===');
  
  // 1. assessments.json
  const asmPath = path.join(process.cwd(), 'src/lib/data/assessments.json');
  const asms = JSON.parse(fs.readFileSync(asmPath, 'utf8'));
  console.log(`Loaded ${asms.length} assessments from assessments.json`);
  
  let issues = 0;
  asms.forEach((asm) => {
    console.log(`Exam: ${asm.id} - ${asm.title} (${asm.questions ? asm.questions.length : 0} questions)`);
    if (!asm.questions || asm.questions.length === 0) {
      console.warn(`[!] Assessment ${asm.id} has no questions!`);
      issues++;
      return;
    }
    asm.questions.forEach((q, idx) => {
      const qPrefix = `[${asm.id} Q${idx + 1} (${q.type})]`;
      if (!q.question || !q.question.trim()) {
        console.error(`${qPrefix} Missing question prompt!`);
        issues++;
      }
      if (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          console.error(`${qPrefix} Invalid options array!`, q.options);
          issues++;
        }
        if (!q.correct_answer) {
          console.error(`${qPrefix} Missing correct_answer!`);
          issues++;
        } else if (!q.options.includes(q.correct_answer)) {
          console.error(`${qPrefix} correct_answer "${q.correct_answer}" not in options!`, q.options);
          issues++;
        }
      } else if (q.type === 'MULTIPLE_CHOICE') {
        const ca = q.correct_answers || q.correct_answer;
        if (!ca || (Array.isArray(ca) && ca.length === 0)) {
          console.error(`${qPrefix} Missing multiple choice answers!`);
          issues++;
        } else if (Array.isArray(ca)) {
          ca.forEach(ans => {
            if (!q.options.includes(ans)) {
              console.error(`${qPrefix} Option "${ans}" not found in options!`);
              issues++;
            }
          });
        }
      } else if (q.type === 'MATCHING') {
        if (!q.matching_pairs || !Array.isArray(q.matching_pairs) || q.matching_pairs.length < 2) {
          console.error(`${qPrefix} Invalid matching_pairs!`, q.matching_pairs);
          issues++;
        }
      }
    });
  });

  // 2. question-bank.json
  const qbPath = path.join(process.cwd(), 'src/lib/data/question-bank.json');
  const qb = JSON.parse(fs.readFileSync(qbPath, 'utf8'));
  console.log(`\nLoaded ${qb.length} questions from question-bank.json`);
  
  qb.forEach((q, idx) => {
    const qPrefix = `[QB Q${idx + 1} (${q.type})] ${q.id}`;
    if (!q.question || !q.question.trim()) {
      console.error(`${qPrefix} Missing question prompt!`);
      issues++;
    }
    if (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE') {
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        console.error(`${qPrefix} Invalid options array!`, q.options);
        issues++;
      }
      if (!q.correct_answer) {
        console.error(`${qPrefix} Missing correct_answer!`);
        issues++;
      } else if (!q.options.includes(q.correct_answer)) {
        console.error(`${qPrefix} correct_answer "${q.correct_answer}" not in options!`, q.options);
        issues++;
      }
    } else if (q.type === 'MULTIPLE_CHOICE') {
      const ca = q.correct_answers || q.correct_answer;
      if (!ca || (Array.isArray(ca) && ca.length === 0)) {
        console.error(`${qPrefix} Missing multiple choice answers!`);
        issues++;
      } else if (Array.isArray(ca)) {
        ca.forEach(ans => {
          if (!q.options.includes(ans)) {
            console.error(`${qPrefix} Option "${ans}" not found in options!`);
            issues++;
          }
        });
      }
    } else if (q.type === 'MATCHING') {
      if (!q.matching_pairs || !Array.isArray(q.matching_pairs) || q.matching_pairs.length < 2) {
        console.error(`${qPrefix} Invalid matching_pairs!`, q.matching_pairs);
        issues++;
      }
    }
  });

  console.log(`\nAUDIT FINISHED: Total Issues Found = ${issues}`);
}

audit();
