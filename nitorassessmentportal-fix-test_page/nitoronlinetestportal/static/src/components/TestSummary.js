import React from 'react'
import { Modal, Table } from 'antd'

import { CloseCircleOutlined, CheckCircleTwoTone } from '@ant-design/icons'
import { useFetch } from '../Utils/Hooks/useFetchAPI'

const TestSummary = ({ testRecord, isSummaryModalOpen, closeSummaryModal }) => {
  const { isLoading, apiData } = useFetch(`test_summary/${testRecord.id}`)

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra)
  }

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Correct Answers',
      dataIndex: 'correct_answers',
      key: 'correct_answers',
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      render: (_, record) => (
        <>
          {record.completed == true ? (
            <CheckCircleTwoTone color="red" />
          ) : (
            <CloseCircleOutlined />
          )}
        </>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
    },
  ]

  return (
    <Modal
      title={testRecord.name}
      open={isSummaryModalOpen}
      onCancel={closeSummaryModal}
      width={900}
    >
      <>
        <Table
          columns={columns}
          dataSource={apiData ? apiData.data : []}
          loading={isLoading}
          onChange={onChange}
          pagination={{ pageSize: 6 }}
        />
        <br></br>
      </>
    </Modal>
  )
}

export default TestSummary
