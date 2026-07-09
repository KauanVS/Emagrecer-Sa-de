import { Chapter } from '../types';
import { pretextChapters } from './pretext';
import { part1Chapters } from './part1';
import { part2Chapters } from './part2';
import { part3Chapters } from './part3';
import { part4Chapters } from './part4';
import { part567Chapters } from './part567';

export const ALL_CHAPTERS: Chapter[] = [
  ...pretextChapters,
  ...part1Chapters,
  ...part2Chapters,
  ...part3Chapters,
  ...part4Chapters,
  ...part567Chapters
];

export const PARTS_SUMMARY = [
  { name: 'Páginas Pré-Texto', range: 'Pág. 1-6', chaptersCount: pretextChapters.length, id: 'pretext' },
  { name: 'PARTE 1 — FUNDAMENTOS DO EMAGRECIMENTO', range: 'Pág. 7-16', chaptersCount: part1Chapters.length, id: 'part1' },
  { name: 'PARTE 2 — MENTALIDADE E EMOCIONAL', range: 'Pág. 17-24', chaptersCount: part2Chapters.length, id: 'part2' },
  { name: 'PARTE 3 — ALIMENTAÇÃO PARA EMAGRECER COM SAÚDE', range: 'Pág. 25-44', chaptersCount: part3Chapters.length, id: 'part3' },
  { name: 'PARTE 4 — TREINOS PARA EMAGRECER', range: 'Pág. 45-59', chaptersCount: part4Chapters.length, id: 'part4' },
  { name: 'PARTE 5 — ACOMPANHAMENTO E RESULTS.', range: 'Pág. 60-66', chaptersCount: 7, id: 'part5' },
  { name: 'PARTE 6 — MANUTENÇÃO DO PESO', range: 'Pág. 67-71', chaptersCount: 5, id: 'part6' },
  { name: 'PARTE 7 — TRANSFORMAÇÃO FINAL', range: 'Pág. 72-75', chaptersCount: 4, id: 'part7' },
  { name: '📘 FINAL DO LIVRO', range: 'Pág. 76-77', chaptersCount: 2, id: 'final' },
  { name: '🙏 AGRADECIMENTOS', range: 'Pág. 78-79', chaptersCount: 2, id: 'agradecimentos' }
];
