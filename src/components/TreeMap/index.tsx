import { FC, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { formatCurrency } from '@lib/utils/numberUtil'
import { TreemapHierarchyType, TopicDepth } from '../../types/treemap'
import { getColorByMainTopic } from './colors'
import { policyAreaDescriptions } from '@data/policyAreas'

export type TreeMapView = 'treemap' | 'bars'

export interface TreeMapType {
  width?: number
  height?: number
  hierarchy: TreemapHierarchyType
  /** 'treemap' (default) or 'bars'; switching morphs every cell into its bar */
  view?: TreeMapView
  /** Path of node ids to open, e.g. "C/3151"; changes zoom without animation */
  node?: string | null
  onChangeLevel?: (level: {
    topicLabel?: string
    topicDepth?: TopicDepth
    /** Path of node ids of the opened level ("" for the root) */
    nodePath?: string
  }) => void
}

export interface TreemapItem {
  x0: number
  x1: number
  y0: number
  y1: number
  value: number
  depth: number
  height: number
  data: TreemapHierarchyType
  parent: TreemapItem
  children: TreemapItem[]
}

type TreeMapNode = d3.HierarchyRectangularNode<TreemapHierarchyType>
type NodeGroup = d3.Selection<SVGGElement, unknown, HTMLElement, TreemapItem>

const format = d3.format(',d')

const BREADCRUMBS_HEIGHT = 56

// Cells with children get a "›" marker (see global.css for hover styles)
const CHEVRON_INSET = 7
const CHEVRON_MIN_WIDTH = 56
const CHEVRON_MIN_HEIGHT = 30

// Bar view geometry
const BAR_LABEL_WIDTH = 300
const BAR_VALUE_WIDTH = 150
const BAR_MIN_ROW_HEIGHT = 40
const BAR_MAX_ROW_HEIGHT = 46
const BAR_MAX_THICKNESS = 36
// Approximate glyph width for truncating labels to the label column
const AVG_CHAR_WIDTH_EM = 0.55
const VIEW_TRANSITION_MS = 700
/** Duration of the zoom in/out animation */
export const ZOOM_TRANSITION_MS = 750

const hasChildren = (d: TreeMapNode): boolean =>
  Boolean(d.children && d.children.length > 0)

/** Breadcrumb text of the root row: "Haushalt → Bereich → Produkt" */
const pathName = (d: TreeMapNode): string =>
  d
    .ancestors()
    .reverse()
    .map((a) => a.data.name)
    .join(' → ')

/** Ids from the root down to the node, e.g. "C/3151" ("" for the root) */
const nodePath = (d: TreeMapNode): string =>
  d
    .ancestors()
    .reverse()
    .slice(1)
    .map((a) => a.data.id || '')
    .join('/')

/** Follows a path of ids; stops at the deepest node that can be opened */
const findNode = (
  root: TreeMapNode,
  path: string | null | undefined
): TreeMapNode => {
  let current = root
  for (const id of (path || '').split('/').filter(Boolean)) {
    const next = (current.children || []).find((c) => c.data.id === id)
    if (!next || !hasChildren(next)) break
    current = next
  }
  return current
}

const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text

interface Layout {
  view: TreeMapView
  width: number
  height: number
  fontSize: number
  x: d3.ScaleLinear<number, number, never>
  y: d3.ScaleLinear<number, number, never>
}

interface Geometry {
  x: number
  y: number
  w: number
  h: number
}

/** Row layout for the bar view: siblings sorted by value, one row each. */
function barGeometry(
  d: TreeMapNode,
  root: TreeMapNode,
  layout: Layout
): Geometry {
  const siblings = root.children || []
  const index = Math.max(0, siblings.indexOf(d))
  const rowHeight = Math.max(
    BAR_MIN_ROW_HEIGHT,
    Math.min(BAR_MAX_ROW_HEIGHT, layout.height / Math.max(1, siblings.length))
  )
  const thickness = Math.min(BAR_MAX_THICKNESS, rowHeight - 4)
  const max = siblings[0]?.value || 1
  const trackWidth = Math.max(
    40,
    layout.width - BAR_LABEL_WIDTH - BAR_VALUE_WIDTH
  )
  return {
    x: BAR_LABEL_WIDTH,
    y: index * rowHeight + (rowHeight - thickness) / 2,
    w: Math.max(2, (trackWidth * (d.value || 0)) / max),
    h: thickness,
  }
}

function geometry(d: TreeMapNode, root: TreeMapNode, layout: Layout): Geometry {
  if (d === root) {
    return {
      x: 0,
      y: -BREADCRUMBS_HEIGHT,
      w: layout.width,
      h: BREADCRUMBS_HEIGHT,
    }
  }
  if (layout.view === 'bars') return barGeometry(d, root, layout)
  return {
    x: layout.x(d.x0),
    y: layout.y(d.y0),
    w: layout.x(d.x1) - layout.x(d.x0),
    h: layout.y(d.y1) - layout.y(d.y0),
  }
}

/** Total drawing height needed for the current view (bars may exceed the box). */
function contentHeight(root: TreeMapNode, layout: Layout): number {
  if (layout.view !== 'bars') return layout.height
  const n = (root.children || []).length
  return Math.max(layout.height, n * BAR_MIN_ROW_HEIGHT)
}

/**
 * Applies the geometry of the current view to every node. Works on a
 * selection and on a transition, which is what animates zooming and the
 * treemap ↔ bars morph.
 */
function position(group: NodeGroup, root: TreeMapNode, layout: Layout): void {
  const geo = (d: TreeMapNode): Geometry => geometry(d, root, layout)
  const isBars = layout.view === 'bars'
  const nodes = group.selectAll<d3.BaseType, TreeMapNode>('g')

  nodes.attr('transform', (d) => {
    const g = geo(d)
    return `translate(${g.x},${g.y})`
  })

  nodes
    .select('rect')
    .attr('width', (d) => geo(d).w)
    .attr('height', (d) => geo(d).h)
    .attr('rx', (d) => (d !== root && isBars ? 4 : 0))

  // Name: inside the cell (treemap) or left of the bar (bars)
  nodes
    .select('text.treemap-label')
    .attr('x', (d) => (d !== root && isBars ? -BAR_LABEL_WIDTH + 4 : 5))
    .attr('y', (d) =>
      d !== root && isBars ? geo(d).h / 2 + 5 : 1.2 * layout.fontSize
    )

  // Amount: second line inside the cell (treemap) or at the bar tip (bars)
  nodes
    .select('text.treemap-value')
    .attr('x', (d) => (d !== root && isBars ? geo(d).w + 8 : 5))
    .attr('y', (d) =>
      d !== root && isBars ? geo(d).h / 2 + 5 : 2.7 * layout.fontSize
    )

  // Drill-down marker: top-right corner, hidden in tiny cells and in bar view
  nodes
    .select('text.treemap-chevron')
    .attr('x', (d) => geo(d).w - CHEVRON_INSET)
    .attr('opacity', (d) =>
      !isBars && geo(d).w >= CHEVRON_MIN_WIDTH && geo(d).h >= CHEVRON_MIN_HEIGHT
        ? 1
        : 0
    )
}

/** Text content that differs between the views (set before the transition). */
function applyTexts(
  group: NodeGroup,
  root: TreeMapNode,
  view: TreeMapView,
  fontSize: number
): void {
  const maxChars = Math.floor(
    (BAR_LABEL_WIDTH - 24) / (AVG_CHAR_WIDTH_EM * fontSize)
  )
  group
    .selectAll<d3.BaseType, TreeMapNode>('g')
    .select('text.treemap-label')
    .text((d) => {
      if (d === root) return pathName(d)
      if (view !== 'bars') return d.data.name
      const name = truncate(
        d.data.name,
        hasChildren(d) ? maxChars - 2 : maxChars
      )
      return hasChildren(d) ? `${name} ›` : name
    })
}

export const TreeMap: FC<TreeMapType> = ({
  width = 800,
  height = 800,
  hierarchy,
  view = 'treemap',
  node = null,
  onChangeLevel = () => undefined,
}) => {
  const x = d3.scaleLinear().rangeRound([0, width])
  const y = d3.scaleLinear().rangeRound([0, height])
  const viewRef = useRef<TreeMapView>(view)
  const setViewRef = useRef<((next: TreeMapView) => void) | null>(null)
  const goToRef = useRef<((path: string | null) => void) | null>(null)
  const nodeRef = useRef<string | null>(node)
  // Always call the latest handler (the effect below runs only on data changes)
  const onChangeLevelRef = useRef(onChangeLevel)
  onChangeLevelRef.current = onChangeLevel
  viewRef.current = view
  nodeRef.current = node

  useEffect(() => {
    const svg = d3.select('svg#expenditures-treemap')
    const svgNode = svg.node() as SVGSVGElement | null
    const fontSize =
      (svgNode && parseFloat(getComputedStyle(svgNode).fontSize)) || 16
    const layout: Layout = {
      view: viewRef.current,
      width,
      height,
      fontSize,
      x,
      y,
    }
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function tile(
      node: TreeMapNode,
      x0: number,
      y0: number,
      x1: number,
      y1: number
    ): void {
      d3.treemapBinary(node, 0, 0, width, height)
      for (const child of node.children || []) {
        child.x0 = x0 + (child.x0 / width) * (x1 - x0)
        child.x1 = x0 + (child.x1 / width) * (x1 - x0)
        child.y0 = y0 + (child.y0 / height) * (y1 - y0)
        child.y1 = y0 + (child.y1 / height) * (y1 - y0)
      }
    }

    const treemap = (
      data: TreemapHierarchyType
    ): d3.HierarchyRectangularNode<TreemapHierarchyType> =>
      d3.treemap<TreemapHierarchyType>().tile(tile)(
        d3
          .hierarchy<TreemapHierarchyType>(data)
          // Only leaves carry amounts; inner nodes (blocks, products) also have
          // a precomputed value in the JSON, which must not be added again.
          .sum((d) => (d.children && d.children.length > 0 ? 0 : d.value || 0))
          .sort((a, b) => (b.value || 0) - (a.value || 0))
      )

    /** Grow the SVG for long bar lists; the container scrolls. */
    function fitSvg(root: TreeMapNode): void {
      const h = contentHeight(root, layout)
      svg
        .attr('height', h + BREADCRUMBS_HEIGHT)
        .attr(
          'viewBox',
          `0, -${BREADCRUMBS_HEIGHT}, ${width}, ${h + BREADCRUMBS_HEIGHT}`
        )
    }

    const rootNode = treemap(hierarchy)
    // Open the level from the URL directly (no animation)
    let currentRoot = findNode(rootNode, nodeRef.current)
    x.domain([currentRoot.x0, currentRoot.x1])
    y.domain([currentRoot.y0, currentRoot.y1])
    let group = svg.append('g').call(render, currentRoot)
    fitSvg(currentRoot)
    if (currentRoot !== rootNode) {
      onChangeLevelRef.current({
        topicDepth: currentRoot.depth as TopicDepth,
        topicLabel: currentRoot.data.name,
        nodePath: nodePath(currentRoot),
      })
    }

    // Jump to a level given by its id path (URL changes, e.g. history navigation)
    goToRef.current = (path: string | null) => {
      const target = findNode(rootNode, path)
      if (target === currentRoot) return
      svg.interrupt().selectAll('g').interrupt().remove()
      currentRoot = target
      x.domain([target.x0, target.x1])
      y.domain([target.y0, target.y1])
      group = svg.append('g').call(render, target)
      fitSvg(target)
      onChangeLevelRef.current({
        topicDepth: target.depth as TopicDepth,
        topicLabel: target === rootNode ? undefined : target.data.name,
        nodePath: nodePath(target),
      })
    }

    function render(group: NodeGroup, root: TreeMapNode): void {
      const node = group
        .selectAll<d3.BaseType, TreemapHierarchyType>('g')
        .data((root.children || []).concat(root))
        .join('g')

      node
        .attr('id', (d) => `level-${d.depth}-${d.data.id || ''}`)
        .classed('treemap-drillable', (d) => d !== root && hasChildren(d))
        .filter((d) => Boolean(d === root ? d.parent : d.children))
        .attr('cursor', 'pointer')
        .on('click', (_, d) => {
          d === root ? zoomout(root) : zoomin(d)

          const target = d === root ? (d.parent as TreeMapNode) : d

          onChangeLevelRef.current({
            topicDepth: target.depth as TopicDepth,
            topicLabel: target.data.name,
            nodePath: nodePath(target),
          })
        })

      node
        .append('title')
        .text(
          (d) =>
            `${d.data.name}\n${'Betrag: € '}${format(d.value || 0)}\n\n${
              policyAreaDescriptions[
                d.data.id as keyof typeof policyAreaDescriptions
              ] || ''
            }${
              d !== root && hasChildren(d)
                ? '\nKlicken, um die nächste Ebene zu öffnen'
                : ''
            }`
        )

      // Rectangles (fill & stroke)
      node
        .append('rect')
        .attr('fill', (d) => {
          if (d === root) return '#fff'

          // Use color from data if available (policy blocks have colors)
          const topLevelAncestor = d
            .ancestors()
            .find((ancestor) => ancestor.depth === 1)
          if (topLevelAncestor?.data.color) {
            return topLevelAncestor.data.color
          }

          // Fallback to legacy color lookup
          const mainTopic = d.parent
            ? d.ancestors().find((ancestor) => ancestor.depth === 1)?.data
                .name || ''
            : d.data.name
          return getColorByMainTopic(mainTopic)
        })
        .attr('stroke', '#fff')

      // Name (breadcrumb path for the root row)
      node
        .append('text')
        .attr('class', 'treemap-label')
        .attr('font-weight', (d) => (d === root ? 'bold' : null))
        .text((d) => (d === root ? pathName(d) : d.data.name))

      // Amount
      node
        .append('text')
        .attr('class', 'treemap-value')
        .attr('fill-opacity', 0.7)
        .text((d) => `€ ${formatCurrency(d.value || 0)}`)

      // "›" marker on cells that can be zoomed into
      node
        .filter((d) => d !== root && hasChildren(d))
        .append('text')
        .attr('class', 'treemap-chevron')
        .attr('aria-hidden', 'true')
        .attr('text-anchor', 'end')
        .attr('y', '1.15em')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .attr('fill-opacity', 0.85)
        .attr('pointer-events', 'none')
        .text('›')

      applyTexts(group, root, layout.view, fontSize)
      group.call(position, root, layout)
    }

    // Treemap ↔ bars: every cell morphs into its bar (and back)
    setViewRef.current = (next: TreeMapView) => {
      if (next === layout.view) return
      layout.view = next
      applyTexts(group, currentRoot, next, fontSize)
      fitSvg(currentRoot)
      group
        .transition()
        .duration(reducedMotion ? 0 : VIEW_TRANSITION_MS)
        .ease(d3.easeCubicInOut)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .call(position, currentRoot, layout)
    }

    // When zooming in, draw the new nodes on top, and fade them in.
    function zoomin(d: TreeMapNode): void {
      const groupToRemove = group.attr('pointer-events', 'none')
      const groupToAdd = (group = svg.append('g').call(render, d))
      currentRoot = d
      fitSvg(d)

      x.domain([d.x0, d.x1])
      y.domain([d.y0, d.y1])

      svg
        .transition()
        .duration(reducedMotion ? 0 : ZOOM_TRANSITION_MS)
        .call((t) =>
          groupToRemove
            .transition(t)
            .remove()
            // In bar view the old rows fade out instead of sliding away
            .attr('opacity', layout.view === 'bars' ? 0 : 1)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .call(position, d.parent, layout)
        )
        .call((t) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          groupToAdd
            .transition(t)
            .attrTween('opacity', () => d3.interpolate(0, 1))
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .call(position, d, layout)
        )
    }

    // When zooming out, draw the old nodes on top, and fade them out.
    function zoomout(d: TreeMapNode): void {
      const groupToRemove = group.attr('pointer-events', 'none')
      const parent = d.parent as TreeMapNode
      const groupToAdd = (group = svg.insert('g', '*').call(render, parent))
      currentRoot = parent
      fitSvg(parent)

      x.domain([parent.x0 || 0, parent.x1 || 0])
      y.domain([parent.y0 || 0, parent.y1 || 0])

      svg
        .transition()
        .duration(reducedMotion ? 0 : ZOOM_TRANSITION_MS)
        .call((t) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          groupToRemove
            .transition(t)
            .remove()
            .attrTween('opacity', () => d3.interpolate(1, 0))
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .call(position, d, layout)
        )
        .call((t) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          groupToAdd.transition(t).call(position, parent, layout)
        )
    }

    return function cleanup() {
      setViewRef.current = null
      goToRef.current = null
      d3.select('#expenditures-treemap').selectAll('g').remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hierarchy, width, height])

  // View changes morph in place instead of rebuilding (keeps the zoom level)
  useEffect(() => {
    setViewRef.current?.(view)
  }, [view])

  useEffect(() => {
    goToRef.current?.(node)
  }, [node])

  return (
    <svg
      id="expenditures-treemap"
      width={width}
      height={height + BREADCRUMBS_HEIGHT}
      viewBox={`0, -${BREADCRUMBS_HEIGHT}, ${width}, ${
        height + BREADCRUMBS_HEIGHT
      }`}
    ></svg>
  )
}
