import { TreemapHierarchyType, TopicDepth } from '../../types/treemap'
// import { TopicType } from 'pages/visualisierung'
import { FC } from 'react'
import { TreeMap, TreeMapView } from '.'

interface TreeMapWithDataPropType {
  hierarchy: TreemapHierarchyType
  width: number
  height: number
  view?: TreeMapView
  onChangeLevel?: (level: {
    topicLabel?: string
    topicDepth?: TopicDepth
  }) => void
}

export const TreeMapWithData: FC<TreeMapWithDataPropType> = ({
  hierarchy,
  width,
  height,
  view = 'treemap',
  onChangeLevel = () => undefined,
}) => {
  return (
    <TreeMap
      width={width}
      height={height}
      hierarchy={hierarchy}
      view={view}
      onChangeLevel={(level) => onChangeLevel(level)}
    />
  )
}
