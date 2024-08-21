import React, { useState, useEffect, useReducer } from 'react'
import {
  Input,
  Button,
  message,
  Divider,
  Table,
  Modal,
  Collapse,
  Form,
  Space,
  Tooltip,
  Select,
  Row,
  DatePicker,
  Col,
} from 'antd'
import {
  CreateTestForm_1,
  CreateTestForm_2,
  CreateTestForm_3,
  initialNewTestValues,
  testSectionOption,
  languageOptions,
  constInitialQuestionsValue,
  ACTION,
} from '../Utils/constants'
import { CloseOutlined } from '@ant-design/icons'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
const { Panel } = Collapse

// Initial state
const initialState = {
  componentDisabled: true,
  showEditSection: false,
  showAddTestError: false,
  showNotEnoughQuesError: false,
  showNotEnoughQuesErrorMessage: '',
  dynamicScore: 0,
  endDate: null,
  initialQuestionsValue: constInitialQuestionsValue,
  totalScoreWeightage: 0,
  addedSections: [],
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_COMPONENT_DISABLED:
      return { ...state, componentDisabled: action.payload.componentDisabled }
    case ACTION.SET_EDIT_SECTION:
      return { ...state, showEditSection: action.payload.showEditSection }
    case ACTION.SET_ADD_TEST_ERROR:
      return { ...state, showAddTestError: action.payload.showAddTestError }
    case ACTION.SET_NOT_ENOUGH_QUES_ERROR:
      return {
        ...state,
        showNotEnoughQuesError: action.payload.showNotEnoughQuesError,
      }
    case ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE:
      return {
        ...state,
        showNotEnoughQuesErrorMessage: action.payload.showNotEnoughQuesErrorMessage,
      }
    case ACTION.SET_DYNAMIC_SCORE:
      return {
        ...state,
        dynamicScore: action.payload.dynamicScore,
      }

    case ACTION.SET_END_DATE:
      return {
        ...state,
        endDate: action.payload.endDate,
      }
    case ACTION.SET_TOTAL_SCORE_WEIGHTAGE:
      return {
        ...state,
        totalScoreWeightage: action.payload.totalScoreWeightage,
      }
    case ACTION.SET_INITIAL_QUESTION_VALUE:
      return {
        ...state,
        initialQuestionsValue: action.payload.initialQuestionsValue,
      }
    case ACTION.SET_ADDED_SECTIONS:
      return {
        ...state,
        addedSections: action.payload.addedSections,
      }
    default:
      return state
  }
}

const CreateNewTest = ({
  isAddTestModalOpen,
  closeAddNewTestModal,
  openDetailModal,
  fetchData,
  testRecord,
  resetDataList,
}) => {
  const [form] = Form.useForm()
  const [dataList, setDataList] = useState([])
  const [state, dispatch] = useReducer(reducer, initialState)

  // Updating the Score Weightage dynamically
  useEffect(() => {
    const calculatedScore = calculateWeightage(state.initialQuestionsValue)
    dispatch({
      type: ACTION.SET_DYNAMIC_SCORE,
      payload: { dynamicScore: calculatedScore },
    })
  }, [state.initialQuestionsValue])

  // Updating the Total Score Weightage dynamically
  useEffect(() => {
    let sum = 0
    dataList.map((data) => {
      sum = sum + data.weightage
    })
    dispatch({
      type: ACTION.SET_TOTAL_SCORE_WEIGHTAGE,
      payload: { totalScoreWeightage: sum },
    })
  }, [dataList])

  // Table in Add New Test Modal
  const columns = [
    {
      title: 'Language Name', // Updated title
      dataIndex: 'language', // Updated dataIndex to match the field name for language
      key: 'language', // Updated key
      width: '400px',
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord) // Preserve the same functionality
            }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: 'Score Weightage',
      dataIndex: 'weightage',
      key: 'weightage',
      width: '400px',
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord) // Preserve the same functionality
            }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: 'Action',
      render: (_, testRecord) => (
        <Space>
          <Tooltip placement="topLeft" title="Remove From List">
            <CloseOutlined onClick={() => removeDataList(testRecord)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra)
  }

  // Function to Calculate Weightage
  const calculateWeightage = (question) => {
    const weights = {
      // easy_program_count: 5,
      // medium_program_count: 10,
      // hard_program_count: 15,
      easy_mcq_count: 5,
      medium_mcq_count: 5,
      hard_mcq_count: 5,
    }

    let score = 0

    for (const key in weights) {
      const count = parseInt(question[key])
      if (!isNaN(count) && count > 0) {
        score += weights[key] * count
      }
    }
    return score
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const removeDataList = (record) => {
    console.log('Removing record:', record)
    setDataList((prevDataList) =>
      prevDataList.filter((item) => item.id !== record.id),
    )
  }

  // Function to Update the Score Weightage dynamically
  const handleCountInputChange = (field, value) => {
    const updatedValues = form.getFieldsValue()
    const updatedWeightage = calculateWeightage(updatedValues)
    form.setFieldValue(field, value)
    // Update the dynamic score in the state
    dispatch({
      type: ACTION.SET_DYNAMIC_SCORE,
      payload: { dynamicScore: updatedWeightage },
    })
    dispatch({
      type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
      payload: { showNotEnoughQuesErrorMessage: '' },
    })

    dispatch({
      type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
      payload: { showNotEnoughQuesError: false },
    })
  }

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    dispatch({
      type: ACTION.SET_END_DATE,
      payload: { endDate: dateString },
    })
  }

  // Function to add form data to List with Score Weightage
  const [testName, setTestName] = useState('')
  const [testPayload, setTestPayload] = useState(null) //for payloadn
  const [fieldDisable, setFieldDisable] = useState(false)

  //add to list function
  const handleAddToList = (param) => {
    let values = { ...initialNewTestValues, ...param }
    let {
      name,
      end_date,
      language,
      easy_mcq_count,
      medium_mcq_count,
      hard_mcq_count,
    } = values

    // Calculate new weightage
    let newWeightage = calculateWeightage(values)

    // Check if there is at least one valid MCQ count
    const hasValidMCQ =
      parseInt(easy_mcq_count) > 0 ||
      parseInt(medium_mcq_count) > 0 ||
      parseInt(hard_mcq_count) > 0

    if (!hasValidMCQ) {
      console.error('No valid MCQs found. The entry will not be added to the table.')
      dispatch({
        type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
        payload: { showNotEnoughQuesErrorMessage: 'No valid MCQs found.' },
      })
      dispatch({
        type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
        payload: { showNotEnoughQuesError: true },
      })
      return
    }
    setFieldDisable(true)
    let form_data = {
      name: name,
      end_date: end_date,
      language: language,
      weightage: newWeightage,
      question_details: [values],
    }

    setTestName(name)

    // Prepare the updated data list without setting it directly
    let tempUpdatedDataList = [...dataList]
    let languageExists = false

    tempUpdatedDataList = tempUpdatedDataList.map((item) => {
      if (item.language === language) {
        languageExists = true

        // Update the question details and weightage for the existing language
        return {
          ...item,
          question_details: [
            {
              ...item.question_details[0],
              easy_mcq_count: parseInt(easy_mcq_count),
              medium_mcq_count: parseInt(medium_mcq_count),
              hard_mcq_count: parseInt(hard_mcq_count),
            },
          ],
          weightage: newWeightage,
        }
      }
      return item
    })

    if (!languageExists) {
      tempUpdatedDataList.push(form_data)
    }

    // Create an array of all weightages
    const weightageList = tempUpdatedDataList.map((item) => ({
      language: item.language,
      weightage: item.weightage,
    }))

    // Create payload
    let payload = {
      name,
      end_date,
      weightages: weightageList, // Passing weightages outside question_details
      question_details: tempUpdatedDataList.flatMap((item) => item.question_details),
    }

    console.log('Payload from handleAddToList:', payload)

    // Submit the payload
    triggerFetchData('validate_test/', payload)
      .then((data) => {
        console.log('Response:', data)

        // Update dataList and use updatedDataList as payload only if the submission is successful
        setDataList(tempUpdatedDataList)

        // Store the payload in state
        setTestPayload(payload)

        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
          payload: { showNotEnoughQuesErrorMessage: '' },
        })
        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
          payload: { showNotEnoughQuesError: false },
        })
      })
      .catch((reason) => {
        console.error('Error Response:', reason)

        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
          payload: {
            showNotEnoughQuesErrorMessage: reason && reason.error && reason.message,
          },
        })

        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
          payload: { showNotEnoughQuesError: reason && reason.error },
        })
      })

    dispatch({
      type: ACTION.SET_EDIT_SECTION,
      payload: { showEditSection: false },
    })
  }

  // Create Test Function
  const createTest = () => {
    if (testRecord) {
      dataList[0]['id'] = testRecord.id
    }

    if (dataList.length === 0) {
      dispatch({
        type: ACTION.SET_ADD_TEST_ERROR,
        payload: { showAddTestError: true },
      })
      return
    }

    if (!testPayload) {
      console.error('No payload available to create the test.')
      return
    }

    // Calculate the total weightage
    const weightages = testPayload.weightages || []
    const totalWeightage = weightages.reduce((sum, item) => sum + item.weightage, 0)

    // Modify the payload
    let payload = { ...testPayload }
    delete payload['id']
    payload.weightage = totalWeightage // Include only the total weightage

    console.log('Payload from createTest:', payload)

    triggerFetchData('create_update_test/', payload)
      .then((data) => {
        message.success('Test created')
        fetchData()
      })
      .catch((reason) => message.error(reason))

    closeAddNewTestModal()
    form.resetFields()
  }

  const [selectedSections, setSelectedSections] = useState(['Add_MCQs'])
  const handleAddSection = (value) => {
    if (!value.includes('Add_MCQs')) {
      // Reset MCQ fields when "Add_MCQs" is removed from selected sections
      form.resetFields(['easy_mcq_count', 'medium_mcq_count', 'hard_mcq_count'])
    }
    dispatch({
      type: ACTION.SET_ADDED_SECTIONS,
      payload: { addedSections: value },
    })
    setSelectedSections(value)
  }
  const handleLanguageChange = () => {
    form.resetFields([
      'add_sections',
      'easy_mcq_count',
      'medium_mcq_count',
      'hard_mcq_count',
    ])
    dispatch({
      type: ACTION.SET_DYNAMIC_SCORE,
      payload: { dynamicScore: 0 },
    })
    // setSelectedSections([]) // Clear the sections to hide "Add MCQ"
    //validation
    dispatch({
      type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
      payload: { showNotEnoughQuesErrorMessage: '' },
    })

    dispatch({
      type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
      payload: { showNotEnoughQuesError: false },
    })
  }
  const [isAddedToList, setIsAddedToList] = useState(false)

  const handleAddToListClick = () => {
    setIsAddedToList(true)
    form.submit()
  }

  return (
    <Modal
      title="Add New Test"
      open={isAddTestModalOpen}
      onOk={createTest}
      onCancel={closeAddNewTestModal}
      width={900}
      okText="Submit"
      afterClose={() => {
        // Reset form and state after the modal is closed
        form.resetFields()
        setSelectedSections([]) // Clear selected sections
      }}
    >
      <Row>
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 12,
          }}
          wrapperCol={{
            span: 12,
          }}
          style={{
            maxWidth: 'none',
          }}
          layout="inline"
          initialValues={initialNewTestValues}
          onFinish={handleAddToList}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Col span={24}>
            <Row>
              {CreateTestForm_1.map((item, index) => (
                <Col span={12} key={`form-item-${index}`}>
                  <Form.Item
                    label={item.title}
                    name={item.dataIndex}
                    rules={[
                      {
                        required: item.dataIndex !== 'end_date',
                        message: `Please input your ${item.title}`,
                      },
                    ]}
                  >
                    {item.dataIndex === 'language' ? (
                      <Select
                        placeholder="Select a language"
                        options={languageOptions}
                        onChange={(value) => handleLanguageChange(value)}
                        allowClear
                      />
                    ) : item.dataIndex === 'add_sections' ? (
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        onChange={(value) => {
                          handleAddSection(value)
                        }}
                        options={testSectionOption}
                      />
                    ) : item.dataIndex === 'end_date' ? (
                      <DatePicker
                        style={{ width: '100%' }}
                        onChange={onDateChange}
                        disabled={fieldDisable}
                      />
                    ) : item.dataIndex === 'name' ? (
                      <Input disabled={fieldDisable} />
                    ) : null}
                  </Form.Item>
                  <br />
                </Col>
              ))}
            </Row>
            {selectedSections.includes('Add_MCQs') && (
              <Row justify="start">
                <Col span={24}>
                  <h4>MCQ Count</h4>
                </Col>
                {CreateTestForm_2.map((item, index) => (
                  <Col span={12} key={`form-item-${index}`}>
                    <Form.Item
                      label={item.title}
                      name={item.dataIndex}
                      rules={[
                        {
                          required: true,
                          message: `Please input your ${item.title}`,
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault()
                          }
                        }}
                        onChange={(e) =>
                          handleCountInputChange(item.dataIndex, e.target.value)
                        }
                      />
                    </Form.Item>
                    <br />
                  </Col>
                ))}
              </Row>
            )}

            {/* comment code due to programs */}
            {/* {selectedSections.includes('Add_Programs') && (
              <Row justify="start">
                <Col span={24}>
                  <h4>Program Count</h4>
                </Col>
                {CreateTestForm_3.map((item, index) => (
                  <Col span={12} key={`form-item-${index}`}>
                    <Form.Item
                      label={item.title}
                      name={item.dataIndex}
                      rules={[
                        {
                          required: true,
                          message: `Please input your ${item.title}`,
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault()
                          }
                        }}
                        onChange={(e) =>
                          handleCountInputChange(item.dataIndex, e.target.value)
                        }
                      />
                    </Form.Item>
                    <br />
                  </Col>
                ))}
              </Row>
            )} */}
          </Col>

          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button type="primary" ghost onClick={handleAddToListClick}>
              Add To List
            </Button>
            {state.showNotEnoughQuesError && (
              <p style={{ color: 'red' }}>{state.showNotEnoughQuesErrorMessage}</p>
            )}
            <p>
              <b>Score Weightage: </b>
              {state.dynamicScore}
            </p>
          </div>

          <Divider />
          {isAddedToList && (
            <>
              <h3
                style={{
                  padding: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                {testName && testName.trim() !== '' && (
                  <div>Test Name: {testName}</div>
                )}
              </h3>
            </>
          )}
          <Table
            columns={columns}
            dataSource={dataList?.length ? dataList : []}
            onChange={onChange}
          />
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '8px',
            }}
          >
            {state.showAddTestError && (
              <p style={{ color: 'red' }}>Please add at least one Test!</p>
            )}
          </div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'end',
              marginTop: '8px',
            }}
          >
            <p>
              <b>Total Score Weightage: </b> {state.totalScoreWeightage}
            </p>
          </div>
        </Form>
      </Row>
    </Modal>
  )
}

export default CreateNewTest
