/**
 * Shapes of the generated files in public/data/{year}/
 * (see scripts/generate-static-json.js)
 */
import { TreemapHierarchyType } from './treemap'

/** One row of public/data/{year}/list.json */
export interface BudgetListItem {
  id: string
  title: string
  amount: number
  /** Policy area name, e.g. "Soziales & Jugend" */
  group: string
  /** Policy area key A-K */
  groupId: string
  /** Responsible Amt, e.g. "50 - Sozialamt" */
  district: string
  productCode: string
  costType: string
}

/** public/data/{year}/treemap.json */
export type BudgetTreemap = TreemapHierarchyType
