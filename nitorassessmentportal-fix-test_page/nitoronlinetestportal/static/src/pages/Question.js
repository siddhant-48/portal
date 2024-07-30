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
  Select,
} from 'antd'

import * as XLSX from 'xlsx'
import RenderQuestions from './RenderQuestions'
const { Option } = Select
import { UploadOutlined } from '@ant-design/icons'
import { useFetch, triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import { readExcel, generateExcelFromJson } from '../Utils/utilFunctions'
import {
  templateJSONData,
  optionList,
  caseList,
  languageOptions,
} from '../Utils/constants'
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
  const [addModal] = Form.useForm()

  const [form2] = Form.useForm()

  const [form3] = Form.useForm()

  const [questionDetail, setquestionDetail] = useState(null)
  const [addQuestionDetail, setAddQuestionDetail] = useState(null)
  const [testDetails, setTestDetails] = useState(null)
  const [fetchUrl, setFetchUrl] = useState(
    'questions?language=' + lang + '&page=' + page,
  )

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const handleAddOpenModal = () => {
    addModal.resetFields()
    setIsAddModalOpen(true)
  }

  const handleAddCancel = () => {
    addModal.resetFields()
    setIsAddModalOpen(false)
  }

  const handleEditCancel = () => {
    setRecord(null)
    form.resetFields()
    form2.resetFields()
    form3.resetFields()
    setIsModalOpen(false)

    setIsEditModalOpen(false)
  }
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

  const renderQuestions = (text) => {
    const words = text.split(' ')
    const isLong = words.length > 20

    if (isLong) {
      const shortText = words.slice(0, 15).join(' ') + '...'
      const fullText = text

      return (
        <Collapse
          className="custom-collapse"
          bordered={false}
          defaultActiveKey={['0']}
        >
          <Panel header={shortText} key="1">
            <p>{fullText}</p>
          </Panel>
        </Collapse>
      )
    }

    return <p>{text}</p>
  }

  const fetchRecordType = (record, type, difficulty, color, tagText) => {
    return (
      record.type === type &&
      record.difficulty === difficulty && <Tag color={color}>{tagText}</Tag>
    )
  }

  const filterQuestions = () => [
    { text: 'Easy MCQ Question', value: 'Easy MCQ Question' },
    { text: 'Medium MCQ Question', value: 'Medium MCQ Question' },
    { text: 'Hard MCQ Question', value: 'Hard MCQ Question' },
    { text: 'Easy Program', value: 'Easy Program' },
    { text: 'Medium Program', value: 'Medium Program' },
    { text: 'Hard Program', value: 'Hard Program' },
  ]

  const mapQuestionType = (type, difficulty) => {
    if (type === 1) {
      if (difficulty === 1) return 'Easy MCQ Question'
      if (difficulty === 2) return 'Medium MCQ Question'
      if (difficulty === 3) return 'Hard MCQ Question'
    } else if (type === 2) {
      if (difficulty === 1) return 'Easy Program'
      if (difficulty === 2) return 'Medium Program'
      if (difficulty === 3) return 'Hard Program'
    }
    return ''
  }

  const columns = [
    {
      title: 'Language Name',
      dataIndex: 'language',
      key: 'language',
      // width: 200,
      filters: filter_language(),
      filterSearch: true,
      sorter: (a, b) => a.language.localeCompare(b.language),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Questions',
      dataIndex: 'name',
      key: 'name',
      width: 550,
      render: (text) => <RenderQuestions text={text} />,
    },
    {
      title: 'Question Type',
      dataIndex: 'type',
      filters: filterQuestions(),
      filterSearch: true,
      key: 'type',
      width: 230,
      onFilter: (value, record) => {
        const typeLabel = mapQuestionType(record.type, record.difficulty)
        return typeLabel === value
      },
      render: (_, record) => {
        const typeLabel = mapQuestionType(record.type, record.difficulty)
        return (
          <>
            {typeLabel && (
              <Tag
                color={
                  typeLabel.includes('Easy')
                    ? 'green'
                    : typeLabel.includes('Medium')
                      ? 'blue'
                      : 'red'
                }
              >
                {typeLabel}
              </Tag>
            )}
          </>
        )
      },
    },
    {
      title: 'Duration (sec)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Action',
      render: (_, record) => (
        <>
          <Space>
            <Tooltip placement="top" title="Edit Question">
              <label className="container">
                <input checked="checked" type="checkbox" readOnly />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  class="size-6"
                  viewBox="0 0 16 16"
                  onClick={() => {
                    showEditlModal(record)
                  }}
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fill-rule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                  />
                </svg>
              </label>

              {/* </button> */}
            </Tooltip>
            <Tooltip placement="top" title="Delete Question">
              <label className="container">
                <input checked="checked" type="checkbox" readOnly />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  class="size-6"
                  viewBox="0 0 16 16"
                  onClick={() => {
                    showDeletelModal(record)
                  }}
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
              </label>
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

  //asynchronous
  const handleBeforeUpload = async (file) => {
    try {
      message.loading({
        content: `Uploading ${file.name} with questions...`,
        key: 'uploadStatus',
        duration: 0,
      })

      const excelObj = await readExcel(file)

      //camel case
      const capitalizeFirstLetter = (str) => {
        if (!str) return str
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      }

      // process each sheet
      const processSheet = (sheet) => {
        return sheet.map((question) => ({
          ...question,
          language: capitalizeFirstLetter(question.language),
        }))
      }

      // all sheets
      const modifiedExcelObj = Object.keys(excelObj).reduce((acc, sheetName) => {
        acc[sheetName] = processSheet(excelObj[sheetName])
        return acc
      }, {})

      // Trigger fetch data and update state
      await triggerFetchData('bulk_questions/', modifiedExcelObj)
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
    return false // default behavior
  }

  const testSectionOption = [
    { id: 1, label: 'Add MCQ', name: 'Add MCQ', value: 1 },
    { id: 2, label: 'Add Program', name: 'Add Program', value: 2 },
  ]
  const difficultOption = [
    { id: 1, label: 'Easy', name: 'Easy', value: 1 },
    { id: 2, label: 'Medium', name: 'Medium', value: 2 },
    { id: 3, label: 'Hard', name: 'Hard', value: 3 },
  ]

  const handleValuesChange = (_, allValues) => {
    if (allValues.type === 1) {
      setAddQuestionDetail(optionList)
    } else if (allValues.type === 2) {
      setAddQuestionDetail(caseList)
    } else {
      setAddQuestionDetail(null)
    }
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
    console.log(record)
    values['difficulty'] = record.difficulty

    //manual date
    const formatDateToISO = (date) => {
      const d = new Date(date)
      return d.toISOString()
    }

    values['created_at'] = formatDateToISO(record.created_at)
    values['updated_at'] = formatDateToISO(new Date())

    const new_values = {
      ...values,
      multiple_options: questionDetail ? values['multiple_options'] : null,
      program_test_cases: testDetails ? values['program_test_cases'] : null,
    }

    // Ensure unwanted fields are not in the nested objects
    if (new_values['multiple_options']) {
      delete new_values['multiple_options']['created_at']
      delete new_values['multiple_options']['updated_at']
    }
    if (new_values['program_test_cases']) {
      delete new_values['program_test_cases']['created_at']
      delete new_values['program_test_cases']['updated_at']
    }

    if (questionDetail) {
      delete new_values['program_test_cases']
      delete new_values['multiple_options']['candidate_answers']
    }

    if (testDetails) {
      delete new_values['multiple_options']
      delete new_values['program_test_cases']['candidate_answers']
    }

    console.log('Payload being sent:', { id: record.id, values: new_values }) // Debugging line

    triggerFetchData('add_question/', { id: record.id, values: new_values })
      .then((data) => {
        message.success('Question Updated Successfully')
        fetchData()
      })
      .catch((reason) => message.error(reason))

    // setIsAddModalOpen(false)
    // handleAddOpenModal()
    handleEditCancel()
  }

  const onAddFinish = async (values) => {
    let multiple_options = Object.keys(form2.getFieldValue()).length
      ? form2.getFieldValue()
      : questionDetail
    let program_test_cases = Object.keys(form3.getFieldValue()).length
      ? form3.getFieldValue()
      : testDetails

    //

    let temp = {
      option1: values.option1,
      option2: values.option2,
      option3: values.option3,
      option4: values.option4,
      correct_value: values.correct_value,
    }

    values['multiple_options'] = temp

    values['difficulty'] = values.difficulty

    // Add the duration field
    values['duration'] = values['duration'] || 0 // Default to 0 if not provided

    // Manual date formatting
    const formatDateToISO = (date) => {
      const d = new Date(date)
      return d.toISOString()
    }

    values['created_at'] =
      record && record.created_at
        ? formatDateToISO(record.created_at)
        : formatDateToISO(new Date())
    values['updated_at'] = formatDateToISO(new Date())

    // values['id'] = 1666

    //
    console.log('values-505', values)
    const new_values = {
      ...values,
      multiple_options: values['multiple_options'],
      program_test_cases: values['program_test_cases'],
    }

    // Ensure unwanted fields are not in the nested objects
    if (new_values['multiple_options']) {
      delete new_values['multiple_options']['created_at']
      delete new_values['multiple_options']['updated_at']
    }
    if (new_values['program_test_cases']) {
      delete new_values['program_test_cases']['created_at']
      delete new_values['program_test_cases']['updated_at']
    }

    if (questionDetail) {
      delete new_values['program_test_cases']
      delete new_values['multiple_options']['candidate_answers']
    }

    if (testDetails) {
      delete new_values['multiple_options']
      delete new_values['program_test_cases']['candidate_answers']
    }

    console.log('Payload being sent:', { id: values.id, values: new_values }) // Debugging line

    try {
      const data = await triggerFetchData('add_question/', {
        id: values.id,
        values: new_values,
      })
      console.log(data)
      message.success('Question Added Successfully')
      fetchData()
    } catch (reason) {
      message.error(reason)
    }

    // setAddQuestionDetail(false)
    handleAddCancel()
  }

  return (
    <>
      {/* <Layout.Content style={{ height: '100vh', padding: '1rem' }}> */}
      <Layout.Content
        style={{ height: '100vh', padding: '1rem', textAlign: 'center' }}
      >
        {/* download excel */}
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

        {/* bulk upload */}
        <div style={{ float: 'right', marginBottom: '10px' }}>
          <Upload
            type="file"
            accept=".xlsx"
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
          >
            <Button icon={<UploadOutlined />}> Bulk Upload (.xlsx)</Button>
          </Upload>
        </div>

        {/* add question */}
        <div
          style={{
            float: 'left',
            marginBottom: '10px',
            marginLeft: '10px',
            marginRight: '10px',
          }}
        >
          <Button type="primary" onClick={handleAddOpenModal}>
            Add Question
          </Button>
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
          // title={isModalOpen.name}
          open={isModalOpen}
          onOk={() => handleOk()}
          onCancel={handleEditCancel}
          okText="Yes"
        >
          {/* <Divider></Divider> */}
          <p>Are you sure you want to permanently remove this question?</p>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Edit Question"
          open={isEditModalOpen}
          onOk={form.submit}
          onCancel={handleEditCancel}
          okText="Update"
        >
          <Divider />
          <Form
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={record}
            onFinish={onFinish}
            key="main_form"
            autoComplete="off"
          >
            {columns.map((item, index) => (
              <Form.Item
                style={item.title === 'Action' ? { display: 'none' } : null}
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
                {item.title === 'Question Type' ? (
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.type !== currentValues.type
                    }
                  >
                    {() => {
                      const type = form.getFieldValue('type')
                      return (
                        <Input
                          disabled
                          value={type === 1 ? 'MCQ' : type === 2 ? 'Program' : ''}
                        />
                      )
                    }}
                  </Form.Item>
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
            {questionDetail ? (
              <Collapse key={`collapse-index`} defaultActiveKey={['1']}>
                <Panel header="Question Details" key={`panel-index`}>
                  <Form
                    form={form2}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    key="panel_form"
                    initialValues={questionDetail}
                    onFinish={onFinish}
                    autoComplete="off"
                  >
                    {optionList?.map((item, index) => (
                      <Form.Item
                        style={item.title === 'Action' ? { display: 'none' } : null}
                        key={`form-item-${index}`}
                        label={item.title}
                        name={item.dataIndex}
                        rules={[
                          {
                            required: !(
                              item.dataIndex === 'option3' ||
                              item.dataIndex === 'option4'
                            ),
                            message: `Please input your ${item.title}`,
                          },
                        ]}
                      >
                        {item.title === 'Question Type' ? (
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                              prevValues.type !== currentValues.type
                            }
                          >
                            {() => {
                              const type = form2.getFieldValue('type')
                              return (
                                <Input
                                  disabled
                                  value={
                                    type === 1 ? 'MCQ' : type === 2 ? 'Program' : ''
                                  }
                                />
                              )
                            }}
                          </Form.Item>
                        ) : (
                          <Input />
                        )}
                      </Form.Item>
                    ))}
                  </Form>
                </Panel>
              </Collapse>
            ) : (
              <Collapse key={`collapse-index`} defaultActiveKey={['1']}>
                <Panel header="Test Details" key={`panel-index`}>
                  <Form
                    form={form3}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    key="panel_form"
                    initialValues={testDetails}
                    onFinish={onFinish}
                    autoComplete="off"
                  >
                    {caseList?.map((item, index) => (
                      <Form.Item
                        style={item.title === 'Action' ? { display: 'none' } : null}
                        key={`form-item-${index}`}
                        label={item.title}
                        name={item.dataIndex}
                        rules={[
                          {
                            required: !(
                              item.dataIndex === 'case3' ||
                              item.dataIndex === 'case4'
                            ),
                            message: `Please input your ${item.title}`,
                          },
                        ]}
                      >
                        {item.title === 'Question Type' ? (
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                              prevValues.type !== currentValues.type
                            }
                          >
                            {() => {
                              const type = form3.getFieldValue('type')
                              return (
                                <Input
                                  disabled
                                  value={
                                    type === 1 ? 'MCQ' : type === 2 ? 'Program' : ''
                                  }
                                />
                              )
                            }}
                          </Form.Item>
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

        {/* add question */}
        <Modal
          title="Add Ques"
          open={isAddModalOpen}
          onOk={addModal.submit} // Ensure form submission is triggered
          onCancel={handleAddCancel}
          okText="Add"
        >
          <Divider />
          <Form
            form={addModal}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            // style={{ maxWidth: 300 }}
            // initialValues={record}
            onFinish={onAddFinish}
            onValuesChange={handleValuesChange}
            key="main_form"
            autoComplete="off"
          >
            <Form.Item
              label="Language"
              name="language"
              rules={[{ required: true, message: 'Please input your Language' }]}
            >
              <Select placeholder="Select Language" style={{ width: '100%' }}>
                {languageOptions.map((option) => (
                  <Option key={option.id} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Question Type"
              name="type"
              rules={[
                { required: true, message: 'Please select your Question Type' },
              ]}
            >
              <Select placeholder="Select Question Type" style={{ width: '100%' }}>
                {testSectionOption.map((option) => (
                  <Option key={option.id} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Question"
              name="name"
              placeholder="Enter the Question"
              rules={[
                { required: true, message: 'Please input your Question Title' },
              ]}
            >
              <Input style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Difficulty"
              name="difficulty"
              rules={[{ required: true, message: 'Please input your Difficulty' }]}
            >
              <Select placeholder="Select Difficulty Type" style={{ width: '100%' }}>
                {difficultOption.map((option) => (
                  <Option key={option.id} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Duration (sec)"
              name="duration"
              rules={[{ required: true, message: 'Please input the Duration' }]}
            >
              <Input
                type="number"
                placeholder="Enter Duration in seconds"
                style={{ width: '100%' }}
              />
            </Form.Item>

            {addQuestionDetail && (
              <Collapse key="collapse-question-detail" defaultActiveKey={['1']}>
                <Panel header="Question Details" key="panel-question-detail">
                  {addQuestionDetail.map((item, index) => (
                    <Form.Item
                      key={`form-item-${index}`}
                      label={item.title}
                      name={item.dataIndex}
                      rules={[
                        {
                          required: !(
                            item.dataIndex === 'option3' ||
                            item.dataIndex === 'option4' ||
                            item.dataIndex === 'case3' ||
                            item.dataIndex === 'case4'
                          ),
                          message: `Please input your ${item.title}`,
                        },
                      ]}
                    >
                      <Input style={{ width: '100%' }} />
                    </Form.Item>
                  ))}
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
