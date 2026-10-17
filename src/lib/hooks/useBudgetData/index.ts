import { useEffect, useState } from 'react'
import { dataUrl } from '@lib/utils/basePath'
import { BudgetListItem, BudgetTreemap } from '../../../types/budget'

interface BudgetDataState {
  treemap: BudgetTreemap | null
  list: BudgetListItem[] | null
  isLoading: boolean
  error: string | null
}

const INITIAL_STATE: BudgetDataState = {
  treemap: null,
  list: null,
  isLoading: true,
  error: null,
}

const fetchJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} – ${url}`)
  }
  return (await response.json()) as T
}

/**
 * Loads treemap.json and list.json for a year from the static data folder.
 * Pass `null` while the router query is not ready yet to defer loading.
 */
export const useBudgetData = (
  year: number | null,
  { withList = true }: { withList?: boolean } = {}
): BudgetDataState => {
  const [state, setState] = useState<BudgetDataState>(INITIAL_STATE)

  useEffect(() => {
    if (year === null) return
    let cancelled = false
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const load = async (): Promise<void> => {
      try {
        const [treemap, list] = await Promise.all([
          fetchJSON<BudgetTreemap>(dataUrl(`${year}/treemap.json`)),
          withList
            ? fetchJSON<BudgetListItem[]>(dataUrl(`${year}/list.json`))
            : Promise.resolve(null),
        ])
        if (!cancelled)
          setState({ treemap, list, isLoading: false, error: null })
      } catch (err) {
        if (!cancelled) {
          setState({
            treemap: null,
            list: null,
            isLoading: false,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [year, withList])

  return state
}
