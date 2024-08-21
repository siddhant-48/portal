import React, { useState, useEffect } from 'react'
import {
  Input,
  Layout,
  Space,
  Table,
  Tooltip,
} from 'antd'
import { useFetch } from '../Utils/Hooks/useFetchAPI'

const { Search } = Input;


const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
  },
  {
    title: 'Correct Answers',
    dataIndex: 'correct_answers',
    key: 'correct_answers',
  },
  {
    title: 'Completion Date',
    dataIndex: 'created_at',
    key: 'created_at',
  },
  {
    title: 'Action',
    render: (_, record) => (
      <Space>
        <Tooltip placement="top" title="Open Link">
          <label className="container">
            <input checked="checked" type="checkbox" readOnly />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#3B71CA"
              className="size-6"
              viewBox="0 0 16 16"
              onClick={() => goToTestSummary(record)}
            >
              <path
                fillRule="evenodd"
                d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a.5.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
              />
              <path
                fillRule="evenodd"
                d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
              />
            </svg>
          </label>
        </Tooltip>
      </Space>
    ),
  },
]

const goToTestSummary = (record) => {
  window.open(`/#/use-test-summary/${record.id}`, '_self')
};

const UserSubmissions = (props) => {
  const [fetchUrl, setFetchUrl] = useState('get_submissions/')
  const [searchTxt, setSearchTxt] = useState('')
  const { isLoading, serverError, apiData, fetchData } = useFetch(fetchUrl)
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    props.setSelectedKey('user-submissions');
  }, [props])

  useEffect(() => {
    if (apiData && apiData.data) {
      setFilteredData(apiData.data);
    }
  }, [apiData])

  useEffect(() => {
    if (searchTxt) {
      const lowercasedFilter = searchTxt.toLowerCase();
      const filtered = apiData.data.filter(item =>
        item.name.toLowerCase().includes(lowercasedFilter) ||
        item.email.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredData(filtered)
    } else {
      setFilteredData(apiData ? apiData.data : []);
    }
  }, [searchTxt, apiData])

  useEffect(() => {
    fetchData();
  }, [fetchUrl, fetchData])

  return (
    <Layout.Content
      style={{ height: '100vh', padding: '1rem', textAlign: 'center' }}
    >
      <div
        style={{
          float: 'right',
          marginBottom: '10px',
          marginLeft: '10px',
          marginRight: '10px',
        }}
      >
        <Search
          placeholder="Email or Name"
          onChange={(e) => setSearchTxt(e.target.value)}
        />
      </div>
      <Table
        columns={columns}
        // Show completed test only
        dataSource={filteredData.filter((item) => item.completed === true)}
        loading={isLoading}
        rowKey="id"
      />
    </Layout.Content>
  )
}

export default UserSubmissions
