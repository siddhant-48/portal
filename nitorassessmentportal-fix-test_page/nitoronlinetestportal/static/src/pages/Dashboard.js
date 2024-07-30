import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Layout, Row, Col, Card, Typography } from 'antd'
import { PieChart, Pie, Text, Sector, Cell, ResponsiveContainer, Legend } from 'recharts'
import ComingSoon from '../assets/dashboard_coming_soon.jpg'
import { Image } from 'antd'

const { Title } = Typography


// adding dummy data for display purpose on Dashboard
const dataMCQs = [
  { name: 'Easy', value: 10 },
  { name: 'Medium', value: 3 },
  { name: 'Hard', value: 5 },
]

const dataProgram = [
  { name: 'Easy', value: 2 },
  { name: 'Medium', value: 5 },
  { name: 'Hard', value: 1 },
]
const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

const Dashboard = (props) => {
  // trigger on component mount
  useEffect(() => {
    props.setSelectedKey('dashboard')
  }, [])

  return (
    <Layout.Content
      style={{ height: '100vh', padding: '1rem', textAlign: 'center' }}
    >
      <Row justify={'center'}>
        <Col span={7} style={{ margin: 16 }}>
          <Card title=" Active / Total Test" bordered={false}>
            <Title>3/5</Title>
          </Card>
        </Col>
        <Col span={7} style={{ margin: 16 }}>
          <Card title="Total Questions" bordered={false}>
            <Title>26</Title>
          </Card>
        </Col>
        <Col span={7} style={{ margin: 16 }}>
          <Card title="Attempt till date" bordered={false}>
            <Title>20</Title>
          </Card>
        </Col>
      </Row>

      <Row justify={'center'}>
        <Col span={22} style={{ margin: 16 }}>
          <Card title=" Breakdown by Question type" bordered={false}>
            <ResponsiveContainer width="100%" height={250}>
              <Row>
                <Col span={12}>MCQs</Col>
                <Col span={12}>Programs</Col>
              </Row>
              <Row></Row>
              <PieChart
                width={700}
                height={300}
                onMouseEnter={() => {
                  console.log('mouse enter')
                }}
              >
                {/* <Legend verticalAlign="top" height={36}/> */}
                <Pie
                  data={dataMCQs}
                  cx={320}
                  cy={120}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    console.log('handling label?')
                    const RADIAN = Math.PI / 180
                    // eslint-disable-next-line
                    const radius = 25 + innerRadius + (outerRadius - innerRadius)
                    // eslint-disable-next-line
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    // eslint-disable-next-line
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#8884d8"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {dataMCQs[index].name} ({value})
                      </text>
                    )
                  }}
                  labelLine
                >
                  {dataMCQs.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Pie
                  data={dataProgram}
                  cx={980}
                  cy={120}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    console.log('handling label?')
                    const RADIAN = Math.PI / 180
                    // eslint-disable-next-line
                    const radius = 25 + innerRadius + (outerRadius - innerRadius)
                    // eslint-disable-next-line
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    // eslint-disable-next-line
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#8884d8"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {dataProgram[index].name} ({value})
                      </text>
                    )
                  }}
                  labelLine
                >
                  {dataProgram.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* <WebCam/> */}
      {/* <Image
        src={ComingSoon}
        alt="Coming Soon"
        width="100%"
        height={400}
        preview={false}
      /> */}
    </Layout.Content>
  )
}

Dashboard.propTypes = {
  setSelectedKey: PropTypes.func,
}

Dashboard.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key)
  },
}

export default Dashboard
