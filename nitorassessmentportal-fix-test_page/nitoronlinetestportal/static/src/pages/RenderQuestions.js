import React, { useState } from 'react'
import { Typography } from 'antd'
import "../styles/render-questions.css"

const RenderQuestions = ({ text }) => {
  const [rows, setRows] = useState(2)
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography.Paragraph
        className="custom-paragraph" // Add this class
        ellipsis={{
          rows,
          expandable: 'collapsible',
          expanded,
          onExpand: (_, info) => setExpanded(info.expanded),
        }}
      >
        {text}
      </Typography.Paragraph>
    </div>
  )
}

export default RenderQuestions
