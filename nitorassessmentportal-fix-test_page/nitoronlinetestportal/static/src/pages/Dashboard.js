import React, { useEffect, useState } from 'react'
import { useFetch } from '../Utils/Hooks/useFetchAPI'
import PropTypes from 'prop-types'
import { Layout, Row, Col, Card, Typography } from 'antd'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const { Title } = Typography

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

const Dashboard = (props) => {
  // trigger on component mount
  const [fetchUrl, setFetchUrl] = useState('dashboard/')
  const { isLoading, serverError, apiData, fetchData } = useFetch(fetchUrl)
  useEffect(() => {
    props.setSelectedKey('dashboard')
  }, [])
  const dataMCQs = [
    { name: 'Easy', value: apiData ? apiData.data.easy_mcq_questions : 0 },
    { name: 'Medium', value: apiData ? apiData.data.medium_mcq_questions : 0 },
    { name: 'Hard', value: apiData ? apiData.data.hard_mcq_questions : 0 },
  ]

  const dataProgram = [
    { name: 'Easy', value: apiData ? apiData.data.easy_program_questions : 0 },
    { name: 'Medium', value: apiData ? apiData.data.medium_program_questions : 0 },
    { name: 'Hard', value: apiData ? apiData.data.hard_program_questions : 0 },
  ]
  return (
    <Layout.Content
      style={{  padding: '1rem', textAlign: 'center' }}
    >
      <Row justify={'center'}>
        <Col span={7} style={{ margin: 16 }}>
          <Card title="Total Allocated Test" bordered={false}>
            <Title>{apiData ? apiData.data.total_test : 0}</Title>
          </Card>
        </Col>
        <Col span={7} style={{ margin: 16 }}>
          <Card title="Total Questions" bordered={false}>
            <Title>{apiData ? apiData.data.total_questions : 0}</Title>
          </Card>
        </Col>
        <Col span={7} style={{ margin: 16 }}>
          <Card title="Attempt Till Date" bordered={false}>
            <Title>{apiData ? apiData.data.total_attempted_test : 0}</Title>
          </Card>
        </Col>
      </Row>

      <Row justify={'center'}>
        <Col span={22} style={{ margin: 16 }}>
          <Card title="Breakdown by Question type" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <Row justify="center">
                <Col span={12} style={{ textAlign: 'center' }}>
                  MCQs
                </Col>
              </Row>
              <Row justify="center">
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
                      const radius = 25 + innerRadius + (outerRadius - innerRadius)
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
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
                </PieChart>
              </Row>

              {/* <Row justify="center" style={{ marginTop: 32 }}>
                <Col span={12} style={{ textAlign: 'center' }}>
                  Programs
                </Col>
              </Row>
              <Row justify="center">
                <PieChart
                  width={700}
                  height={300}
                  onMouseEnter={() => {
                    console.log('mouse enter')
                  }}
                >
                  <Pie
                    data={dataProgram}
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
                      const radius = 25 + innerRadius + (outerRadius - innerRadius)
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
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
              </Row> */}
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
