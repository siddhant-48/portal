import React, { useState, useEffect } from 'react'
import {
  Input,
  Layout,
  Button,
  message,
  Space,
  Table,
  Modal,
  Form,
  DatePicker,
  Select,
  Collapse,
  Tooltip,
} from 'antd'
import { useFetch, triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import ClipboardCopy from '../components/ClipboardCopy'
import { baseURL, TestLinkTable } from '../Utils/constants'
import openLinkSvg from '../components/OpenLink'
import Icon from '@ant-design/icons'
import PropTypes from 'prop-types'
import MultiTagInput from '../components/MultiTagInput'
import { useLocation } from 'react-router-dom'
import moment from 'moment'
import '../style.css'

const { Panel } = Collapse

const OpenLinkIcon = (props) => <Icon component={openLinkSvg} {...props} />

/* 
  This components represent all the generated test link in table formate
  Also, we can create new test link with the help of this component
*/
const GenerateLink = (props) => {
  let filter_test_data = []
  let filter_test_link_data = []
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(
    location?.state?.isModalOpen == undefined ? false : location?.state?.isModalOpen,
  )
  const [testRecord, setTestRecord] = useState(
    location?.state?.testRecord == undefined ? {} : location?.state?.testRecord,
  )
  const [form] = Form.useForm()
  var formattedDate = testRecord?.end_date
    ? moment(testRecord.end_date).format('YYYY-MM-DD')
    : null
  const [endDate, setEndDate] = useState(formattedDate)
  const [testList, setTestList] = useState()
  const [rowRecord, setRowRecord] = useState(false)
  const [record, setRecord] = useState(null)
  const [tags, setTags] = useState([])
  const [showGenerateTestError, setShowGenerateTestError] = useState(null)

  const { isLoading, serverError, apiData, fetchData } = useFetch('get_test_link')

  // Trigger on component mount for setting the header tab
  useEffect(() => {
    props.setSelectedKey('generate-link')
    getTestList()
  }, [])

  // Get all the test details to show in select options
  const getTestList = () => {
    triggerFetchData('get_test_list/', {}, 'GET')
      .then((data) => {
        setTestList(data.data)
      })
      .catch((reason) => message.error(reason))
  }

  if (testList) {
    testList.map((data, index) => {
      if (!filter_test_data.some((item) => data.name === item.value)) {
        filter_test_data.push({ label: data.name, value: data.id })
      }
    })
  }

  // Function to filter the generated test link table
  const filterTestLink = () => {
    if (apiData) {
      apiData.data?.map((data, index) => {
        if (!filter_test_link_data.some((item) => data.name === item.name)) {
          filter_test_link_data.push({ value: data.name, text: data.name })
        }
      })
    }
    return filter_test_link_data
  }

  // Function to go on screen test page
  const goToScreeningTest = (record, history) => {
    window.open(`/#/screening/user-details/${record.test}/${record.key}`, '_blank')
  }

  // Tables column
  const list_columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: filterTestLink(),
      onFilter: (value, record) => record.name.indexOf(value) === 0,
      filterSearch: true,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend'],
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
    },

    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
    },

    {
      title: 'Test',
      dataIndex: 'test',
      key: 'test',
      render: (text, record) => (
        <>
          <a
            onClick={() => {
              showDetailModal(record)
            }}
          >
            {record.test_details.name}
          </a>
        </>
      ),
    },
    {
      title: 'Email Count',
      dataIndex: 'email_count',
      key: 'email_count',
    },

    {
      title: 'Average Result',
      dataIndex: 'avg_result',
      key: 'avg_result',
    },
    {
      title: 'Action',
      render: (_, record) => (
        <>
          <Space>
            <Tooltip placement="top" title="Copy Link">
              <label className="container">
                <input checked="checked" type="checkbox" readOnly />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  class="size-6"
                  viewBox="0 0 16 16"
                  onClick={() =>
                    handleCopyText(
                      `${baseURL}#/screening/user-details/${record.test}/${record.key}`,
                    )
                  }
                >
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                </svg>
              </label>
            </Tooltip>

            {/* open link */}
            <Tooltip placement="top" title="Open Link">
              <label className="container">
                <input checked="checked" type="checkbox" readOnly />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  class="size-6"
                  viewBox="0 0 16 16"
                  onClick={() => goToScreeningTest(record)}
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                  />
                </svg>
              </label>
              {/* </button> */}
            </Tooltip>
          </Space>
        </>
      ),
    },
  ]
  const handleCopyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('Link copied to clipboard')
      })
      .catch((err) => {
        message.error('Failed to copy the link')
      })
  }
  const onTableChange = (pagination, filters, sorter, extra) => {
    console.log('value:', pagination, filters, sorter, extra)
  }

  const handleOk = (values) => {
    setRowRecord(null)
  }

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    setEndDate(dateString)
  }

  // Function to show details view
  const showDetailModal = (record) => {
    setRecord(record)
    setRowRecord(true)
  }

  // Function to open form
  const showGeneratedTestLinkModal = () => {
    setIsModalOpen(true)
  }

  // Function to close form
  const closeGeneratedTestLinkModal = () => {
    setIsModalOpen(false)
    setRowRecord(null)
  }

  // Function to submit the Generate Test Link Form
  const submitGeneratedLinkForm = async (values) => {
    // fetch the testname
    const selectedTest = filter_test_data.find((test) => test.value === values.test)
    const testName = selectedTest ? selectedTest.label : ''

    values.name = testName + '_' + values.name
    let end_date = endDate + ' 00:00:00'
    values.end_date = end_date
    values.email_list = tags.toString()

    // api call
    triggerFetchData('generate_test_link/', values)
      .then((data) => {
        message.success('Test Link Generated')
        setIsModalOpen(false)
        fetchData()
      })
      .catch((reason) => {
        setShowGenerateTestError(reason.message)
        message.error(reason.message)
      })
  }

  // Function to handle the Form failed
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <>
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
          <Button type="primary" onClick={showGeneratedTestLinkModal}>
            Generate Test
          </Button>
        </div>
        <Table
          className="table-generate"
          columns={list_columns}
          dataSource={apiData ? apiData.data : []}
          onChange={onTableChange}
        />
        <Modal
          title="Generate Test Link"
          open={isModalOpen}
          onOk={form.submit}
          onCancel={closeGeneratedTestLinkModal}
        >
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{
              ...(testRecord && {
                test: testRecord.id,
                end_date: testRecord?.end_date ? moment(testRecord.end_date) : null,
              }),
            }}
            onFinish={submitGeneratedLinkForm} // Ensure this line is correct
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {TestLinkTable.map((item, index) => (
              <Form.Item
                key={`form-item-${index}`}
                label={item.title}
                name={item.dataIndex}
                rules={[
                  {
                    required: item.dataIndex !== 'email_list',
                    message: `Please input your ${item.title}`,
                  },
                ]}
              >
                {item.dataIndex === 'end_date' ? (
                  <DatePicker style={{ width: '100%' }} onChange={onDateChange} />
                ) : item.dataIndex === 'test' ? (
                  <Select
                    showSearch
                    placeholder="Select a test"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={filter_test_data}
                  />
                ) : item.dataIndex === 'email_list' ? (
                  <MultiTagInput setTags={setTags} tags={tags} />
                ) : (
                  <Input addonBefore={testRecord?.test ? testRecord.test : null} />
                )}
              </Form.Item>
            ))}
          </Form>

          {showGenerateTestError && (
            <p style={{ color: 'red' }}>{showGenerateTestError}!</p>
          )}
        </Modal>
      </Layout.Content>

      {rowRecord && (
        <>
          <Modal
            title={record.test_details.name}
            open={rowRecord}
            onOk={handleOk}
            onCancel={closeGeneratedTestLinkModal}
          >
            {record.test_details?.question_details?.map((item, index) => (
              <Collapse key={`collapse-index-${index}`} defaultActiveKey={['1']}>
                <Panel header={item.language}>
                  {
                    <ul>
                      <li> MCQ Count: {item.mcq_count}</li>
                      <li>Easy MCQ Count: {item.easy_mcq_count}</li>
                      <li>Medium MCQ Count: {item.medium_mcq_count}</li>
                      <li>Hard MCQ Count: {item.hard_mcq_count}</li>
                      <li> Easy Program: {item.easy_program_count}</li>
                      <li>Medium Count: {item.medium_program_count}</li>
                      <li> Hard Program: {item.hard_program_count}</li>
                    </ul>
                  }
                </Panel>
              </Collapse>
            ))}
          </Modal>
        </>
      )}
    </>
  )
}

GenerateLink.propTypes = {
  setSelectedKey: PropTypes.func,
}

GenerateLink.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key)
  },
}

export default GenerateLink
