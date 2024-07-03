import React, { useState, useEffect } from 'react'
import '../styles/buttons.css'
import {
  Divider,
  Layout,
  Button,
  Space,
  Upload,
  Table,
  Collapse,
  Tag,
  Modal,
  message,
  Form,
  Input,
  Tooltip,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useFetch, triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import { readExcel, generateExcelFromJson } from '../Utils/utilFunctions'
import { templateJSONData, optionList, caseList } from '../Utils/constants'
import { EditFilled, DeleteFilled } from '@ant-design/icons'
import PropTypes from 'prop-types'

const { Panel } = Collapse

const Question = (props) => {
  let filter_language_data = []
  let totalRecords = 0

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [lang, setLang] = useState([])

  const [record, setRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [form2] = Form.useForm()
  const [form3] = Form.useForm()
  const [questionDetail, setquestionDetail] = useState(null)
  const [testDetails, setTestDetails] = useState(null)
  const [fetchUrl, setFetchUrl] = useState(
    'questions?language=' + lang + '&page=' + page,
  )
  const [fileName, setFilename] = useState('') //fetching uploaded filename
  // const [filterLanguageData, setFilterLanguageData] = useState([]) //language filter

  const { isLoading, serverError, apiData, fetchData } = useFetch(fetchUrl)
  if (apiData && apiData.data && apiData.data.total_records) {
    totalRecords = apiData.data.total_records
  }

  // trigger on component mount
  useEffect(() => {
    props.setSelectedKey('questions')
  }, [])

  useEffect(() => {
    form.setFieldsValue(record)
  }, [form, record])

  useEffect(() => {
    form2.setFieldsValue(questionDetail)
  }, [form2, questionDetail])

  useEffect(() => {
    form3.setFieldsValue(testDetails)
  }, [form3, testDetails])

  useEffect(() => {
    setFetchUrl(`questions?language=${lang}&page=${page}&page_size=${pageSize}`)
    fetchData()
  }, [lang, page, pageSize])

  const fetchRecordType = (record, type, difficulty, color, tagText) => {
    return (
      record.type == type &&
      record.difficulty == difficulty && <Tag color={color}>{tagText}</Tag>
    )
  }

  //filter questions
  const filter_language = () => {
    const filter_language_data = []
    if (
      apiData &&
      apiData.data &&
      apiData.data.questions_data &&
      apiData.data.questions_data.length > 0
    ) {
      apiData.data.questions_data.forEach((question) => {
        const languages = JSON.parse(question.all_languages)
        languages.forEach((languageObj) => {
          const language = languageObj.language
          if (!filter_language_data.some((item) => item.value === language)) {
            filter_language_data.push({ value: language, text: language })
          }
        })
      })
    }
    return filter_language_data
  }

  const columns = [
    {
      title: 'Language Name',
      dataIndex: 'language',
      key: 'language',
      filters: filter_language(),
      filterSearch: true,
      sorter: (a, b) => a.language.localeCompare(b.language),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Questions',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Question Type',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => (
        <>
          {fetchRecordType(record, 1, 1, 'green', 'Easy MCQ Question')}
          {fetchRecordType(record, 1, 2, 'blue', 'Medium MCQ Question')}
          {fetchRecordType(record, 1, 3, 'red', 'Hard MCQ Question')}
          {fetchRecordType(record, 2, 1, 'green', 'Easy Program')}
          {fetchRecordType(record, 2, 2, 'blue', 'Medium Program')}
          {fetchRecordType(record, 2, 3, 'red', 'Hard Program')}
        </>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Action',
      render: (_, record) => (
        <>
          <Space>
            <Tooltip placement="topLeft" title="Edit Test">
              {/* <EditFilled
                onClick={() => {
                  showEditlModal(record)
                }}
              /> */}
              {/* added button for style */}
              <button
                className="editBtn"
                onClick={() => {
                  showEditlModal(record)
                }}
              >
                <svg height="1em" viewBox="0 0 512 512">
                  <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                </svg>
              </button>
            </Tooltip>
            <Tooltip placement="topLeft" title="Delete Test">
              {/* <DeleteFilled
                onClick={() => {
                  showDeletelModal(record)
                }}
              /> */}
              {/* added button for style */}
              <button
                className="bin-button"
                onClick={() => {
                  showDeletelModal(record)
                }}
              >
                <svg
                  className="bin-top"
                  viewBox="0 0 39 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line y1="5" x2="39" y2="5" stroke="white" strokeWidth="4"></line>
                  <line
                    x1="12"
                    y1="1.5"
                    x2="26.0357"
                    y2="1.5"
                    stroke="white"
                    strokeWidth="3"
                  ></line>
                </svg>
                <svg
                  className="bin-bottom"
                  viewBox="0 0 33 39"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask id="path-1-inside-1_8_19" fill="white">
                    <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                  </mask>
                  <path
                    d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                    fill="white"
                    mask="url(#path-1-inside-1_8_19)"
                  ></path>
                  <path d="M12 6L12 29" stroke="white" strokeWidth="4"></path>
                  <path d="M21 6V29" stroke="white" strokeWidth="4"></path>
                </svg>
              </button>
            </Tooltip>
          </Space>
        </>
      ),
    },
  ]

  const showDeletelModal = (record) => {
    setRecord(record)
    setIsModalOpen(record)
  }

  const showEditlModal = (record) => {
    setRecord(record)
    setIsEditModalOpen(record)
    triggerFetchData(`/question_details/${record.id}/${record.type}/`, [], 'GET')
      .then((response) => {
        if (record.type == 1) {
          setquestionDetail(response.data)
          setTestDetails(null)
        } else {
          setTestDetails(response.data)
          setquestionDetail(null)
        }
      })
      .catch((reason) => message.error(reason))
  }

  const handleOk = () => {
    triggerFetchData('delete_question/', { id: record.id }, 'DELETE')
      .then((data) => {
        message.success(data.message)
        fetchData()
      })
      .catch((reason) => message.error(reason))

    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setIsEditModalOpen(false)
  }

  const onChange = (pagination, filters, sorter, extra) => {
    if (filters.language) {
      setLang(filters.language)
    } else {
      setLang([])
    }
  }

  const downloadExcelTemplate = () => {
    generateExcelFromJson(templateJSONData, 'question_template.xlsx')
  }

  const onFinish = async (values) => {
    var multiple_options = Object.keys(form2.getFieldValue()).length
      ? form2.getFieldValue()
      : questionDetail
    var program_test_cases = Object.keys(form3.getFieldValue()).length
      ? form3.getFieldValue()
      : testDetails

    if (multiple_options) {
      delete multiple_options['question_details']
      values['multiple_options'] = multiple_options
    }
    if (program_test_cases) {
      delete program_test_cases['question_details']
      values['program_test_cases'] = program_test_cases
    }
    values['difficulty'] = record.difficulty
    const new_values = {
      ...values,
      multiple_options: questionDetail ? values['multiple_options'] : null,
      program_test_cases: testDetails ? values['program_test_cases'] : null,
    }
    if (questionDetail) {
      delete new_values['program_test_cases']
      delete new_values['multiple_options']['candidate_answers']
    }
    if (testDetails) {
      delete new_values['multiple_options']
      delete new_values['program_test_cases']['candidate_answers']
    }
    triggerFetchData('add_question/', { id: record.id, values: new_values })
      .then((data) => {
        console.log(data)
        message.success('Question Updated Successfully')
        fetchData()
      })
      .catch((reason) => message.error(reason))

    setIsEditModalOpen(false)
  }

  //asynchronous
  const handleBeforeUpload = async (file) => {
    try {
      message.loading({
        content: `Uploading ${file.name} with questions...`,
        key: 'uploadStatus',
        duration: 0,
      })
      const excelObj = await readExcel(file)
      await triggerFetchData('bulk_questions/', excelObj)
      await fetchData()
      setFilename(file.name)
      message.success({
        content: `File ${file.name} uploaded successfully`,
        key: 'uploadStatus',
      })
    } catch (error) {
      message.error({
        content: `Upload failed: ${error.message}`,
        key: 'uploadStatus',
      })
    }
    return false //default behavior
  }

  return (
    <>
      {/* <Layout.Content style={{ height: '100vh', padding: '1rem' }}> */}
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
          <Button onClick={() => downloadExcelTemplate()}>
            Download Excel Template
          </Button>
        </div>
        <div style={{ float: 'right', marginBottom: '10px' }}>
          {/* <Upload
            type="file"
            accept=".xlsx"
            showUploadList={false}
            beforeUpload={(file) => {
              const excelObj = readExcel(file)
              excelObj.then((data) => {
                triggerFetchData('bulk_questions/', data).then((data) => fetchData())
                setFilename(file.name)
                message.success(`File ${file.name} uploaded successfully`)
              })
              return false
            }}
          >
            <Button icon={<UploadOutlined />}> Bulk Upload (.xlsx)</Button>
          </Upload> */}
          <Upload
            type="file"
            accept=".xlsx"
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <Button icon={<UploadOutlined />}> Bulk Upload (.xlsx)</Button>
          </Upload>
        </div>

        <Table
          bordered
          loading={isLoading}
          columns={columns}
          dataSource={apiData ? apiData.data.questions_data : []}
          onChange={onChange}
          pagination={{
            defaultPageSize: pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30'],
            onChange: (page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            },
          }}
        />
        {/* Delete Modal */}
        <Modal
          title={isModalOpen.name}
          open={isModalOpen}
          onOk={() => handleOk()}
          onCancel={handleCancel}
          okText="Yes"
        >
          <Divider></Divider>
          <p>Are you sure you want to permanently remove this question?</p>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Edit Question"
          open={isEditModalOpen}
          onOk={form.submit}
          onCancel={handleCancel}
          okText="Update"
        >
          <Divider></Divider>
          <Form
            form={form}
            // name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 16,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={record}
            onFinish={onFinish}
            key="main_form"
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {columns.map((item, index) => (
              <Form.Item
                style={item.title == 'Action' ? { display: 'none' } : null}
                key={`form-item-${index}`}
                label={item.title}
                name={item.dataIndex}
                rules={[
                  {
                    required: true,
                    message: `Please input your ${item.title}`,
                  },
                ]}
              >
                {item.title == 'Question Type' ? <Input disabled /> : <Input />}
              </Form.Item>
            ))}
            {questionDetail ? (
              <>
                <Collapse key={`collapse-index}`} defaultActiveKey={['1']}>
                  <Panel header="Question Details" key={`panel-index`}>
                    <Form
                      form={form2}
                      // name="basic"
                      labelCol={{
                        span: 8,
                      }}
                      wrapperCol={{
                        span: 16,
                      }}
                      style={{
                        maxWidth: 600,
                      }}
                      key="panel_form"
                      initialValues={questionDetail}
                      onFinish={onFinish}
                      // onFinishFailed={onFinishFailed}
                      autoComplete="off"
                    >
                      {optionList?.map((item, index) => (
                        <Form.Item
                          style={item.title == 'Action' ? { display: 'none' } : null}
                          key={`form-item-${index}`}
                          label={item.title}
                          name={item.dataIndex}
                          rules={[
                            {
                              required: true,
                              message: `Please input your ${item.title}`,
                            },
                          ]}
                        >
                          {item.title == 'Question Type' ? (
                            <Input disabled />
                          ) : (
                            <Input />
                          )}
                        </Form.Item>
                      ))}
                    </Form>
                  </Panel>
                </Collapse>
              </>
            ) : (
              <Collapse key={`collapse-index}`} defaultActiveKey={['1']}>
                <Panel header="Test Details" key={`panel-index`}>
                  <Form
                    form={form3}
                    // name="basic"
                    labelCol={{
                      span: 8,
                    }}
                    wrapperCol={{
                      span: 16,
                    }}
                    style={{
                      maxWidth: 600,
                    }}
                    key="panel_form"
                    initialValues={testDetails}
                    onFinish={onFinish}
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                  >
                    {caseList?.map((item, index) => (
                      <Form.Item
                        style={item.title == 'Action' ? { display: 'none' } : null}
                        key={`form-item-${index}`}
                        label={item.title}
                        name={item.dataIndex}
                        rules={[
                          {
                            required: true,
                            message: `Please input your ${item.title}`,
                          },
                        ]}
                      >
                        {item.title == 'Question Type' ? (
                          <Input disabled />
                        ) : (
                          <Input />
                        )}
                      </Form.Item>
                    ))}
                  </Form>
                </Panel>
              </Collapse>
            )}
          </Form>
        </Modal>
      </Layout.Content>
    </>
  )
}

Question.propTypes = {
  setSelectedKey: PropTypes.func,
}

Question.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key)
  },
}

export default Question
