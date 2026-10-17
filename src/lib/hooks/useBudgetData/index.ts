import { useEffect, useState } from 'react'
import { dataUrl } from '@lib/utils/basePath'
import { BudgetListItem, BudgetTreemap } from '../../../types/budget'

interface BudgetDataState {
  treemap: BudgetTreemap | null
  list: BudgetListItem[] | null
  /** true until treemap.json has arrived */
  isLoading: boolean
  /** true until list.json has arrived (always false without list) */
  isListLoading: boolean
  error: string | null
}

const INITIAL_STATE: BudgetDataState = {
  treemap: null,
  list: null,
  isLoading: true,
  isListLoading: true,
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
 * The two files load independently so the treemap can render before the
 * (much larger) list has arrived.
 */
export const useBudgetData = (
  year: number | null,
  { withList = true }: { withList?: boolean } = {}
): BudgetDataState => {
  const [state, setState] = useState<BudgetDataState>(INITIAL_STATE)

  useEffect(() => {
    if (year === null) return
    let cancelled = false
    setState({
      treemap: null,
      list: null,
      isLoading: true,
      isListLoading: withList,
      error: null,
    })

    const fail = (err: unknown): void => {
      if (cancelled) return
      setState({
        treemap: null,
        list: null,
        isLoading: false,
        isListLoading: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }

    fetchJSON<BudgetTreemap>(dataUrl(`${year}/treemap.json`))
      .then((treemap) => {
        if (!cancelled)
          setState((prev) => ({ ...prev, treemap, isLoading: false }))
      })
      .catch(fail)

    if (withList) {
      fetchJSON<BudgetListItem[]>(dataUrl(`${year}/list.json`))
        .then((list) => {
          if (!cancelled)
            setState((prev) => ({ ...prev, list, isListLoading: false }))
        })
        .catch(fail)
    }

    return () => {
      cancelled = true
    }
  }, [year, withList])

  return state
}
