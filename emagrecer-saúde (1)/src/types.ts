/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Chapter {
  id: string;
  part: string;
  title: string;
  subtitle?: string;
  content: string; // Markdown supported
  pageNumber: number;
}

export interface ProgressLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  waist: number; // cm
  mood: 'excellent' | 'good' | 'neutral' | 'struggling';
  notes: string;
}

export interface CaloricCalculation {
  gender: 'male' | 'female';
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'healthy_loss' | 'maintenance' | 'moderate_loss';
}

export interface WorkoutTimer {
  exerciseName: string;
  duration: number; // seconds
  type: 'work' | 'rest';
}
