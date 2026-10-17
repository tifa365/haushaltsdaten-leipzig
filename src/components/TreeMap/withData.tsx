import { TreemapHierarchyType, TopicDepth } from '../../types/treemap'
// import { TopicType } from 'pages/visualisierung'
import { FC } from 'react'
import { TreeMap, TreeMapView } from '.'

interface TreeMapWithDataPropType {
  hierarchy: TreemapHierarchyType
  width: number
  height: number
  view?: TreeMapView
  node?: string | null
  onChangeLevel?: (level: {
    topicLabel?: string
    topicDepth?: TopicDepth
    nodePath?: string
  }) => void
}

export const TreeMapWithData: FC<TreeMapWithDataPropType> = ({
  hierarchy,
  width,
  height,
  view = 'treemap',
  node = null,
  onChangeLevel = () => undefined,
}) => {
  return (
    <TreeMap
      width={width}
      height={height}
      hierarchy={hierarchy}
      view={view}
      node={node}
      onChangeLevel={(level) => onChangeLevel(level)}
    />
  )
}
