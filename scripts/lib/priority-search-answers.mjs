import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ANSWER_BLOCKS_PATH = resolve(process.cwd(), 'content', 'gsc-priority-answer-blocks.json');
let answerBlocksBySlug;

function normalizeSlug(slug = '') {
  return decodeURIComponent(String(slug))
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function readAnswerBlocksBySlug() {
  if (answerBlocksBySlug) return answerBlocksBySlug;
  if (!existsSync(ANSWER_BLOCKS_PATH)) {
    answerBlocksBySlug = new Map();
    return answerBlocksBySlug;
  }

  const rows = JSON.parse(readFileSync(ANSWER_BLOCKS_PATH, 'utf8'));
  answerBlocksBySlug = new Map(
    rows
      .filter((row) => row?.slug && row?.answer)
      .map((row) => [normalizeSlug(row.slug), String(row.answer).trim()]),
  );
  return answerBlocksBySlug;
}

export function prioritySearchAnswerForPost(post = {}) {
  const fallback = String(post.description || '');
  const override = readAnswerBlocksBySlug().get(normalizeSlug(post.slug || ''));
  return override || fallback;
}
