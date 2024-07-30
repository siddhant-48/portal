import React, { useState } from 'react'
import { Flex, Typography } from 'antd'

const RenderQuestions = ({ text }) => {
  const [rows, setRows] = useState(2)
  const [expanded, setExpanded] = useState(false)

  return (
    <Flex gap={16} vertical>
      <Typography.Paragraph
        ellipsis={{
          rows,
          expandable: 'collapsible',
          expanded,
          onExpand: (_, info) => setExpanded(info.expanded),
        }}
        // copyable
      >
        {text}
      </Typography.Paragraph>
    </Flex>
  )
}

export default RenderQuestions
