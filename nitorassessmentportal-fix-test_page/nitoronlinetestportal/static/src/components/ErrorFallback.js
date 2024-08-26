import React from 'react'
import { Row, Col, Typography, Button } from 'antd'
import wrong from '../assets/went_wrong.png'
const { Title, Text } = Typography

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Col
        style={{
          textAlign: 'center',
          padding: '60px', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          backgroundColor: '#ffffff', 
        }}
      >
        <img
          src={wrong}
          alt="Something went wrong"
          style={{
            marginBottom: '16px',
            width: '100px',
            height: '100px',
            // border: '2px solid #ccc', 
            // borderRadius: '50%', 
            padding: '8px', 
            // backgroundColor: '#f0f0f0', 
          }}
        />
        <Title level={3}>Something went wrong</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          This may be because of a technical error that we’re working to get fixed.
          Try reloading this page.
        </Text>
        <Button
          type="primary"
          style={{ backgroundColor: '#0078D4' }}
          onClick={() => window.location.reload()}
        >
          Reload page
        </Button>
      </Col>
    </Row>
  )
}

export default ErrorFallback
