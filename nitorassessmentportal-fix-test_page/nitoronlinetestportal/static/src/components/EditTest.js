import React, { useEffect, useState, useReducer } from 'react'
import {
  Input,
  Button,
  message,
  Modal,
  Collapse,
  Form,
  Space,
  Select,
  Row,
  DatePicker,
  Col,
  Divider,
} from 'antd'
import {
  CreateTestForm_1,
  CreateTestForm_2,
  CreateTestForm_3,
  languageOptions,
  testSectionOption,
  constInitialQuestionsValue,
  ACTION,
} from '../Utils/constants'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
const { Panel } = Collapse
import '../styles/edit-test.css'

// Initial state
const initialState = {
  difficultyLevel: '1',
  selectedLanguage: '',
  activeTab: '',
  showAddTestError: false,
  showNotEnoughQuesError: false,
  showNotEnoughQuesErrorMessage: '',
  showAddTestError: false,
  dynamicScore: 0,
  initialQuestionsValue: constInitialQuestionsValue,
  totalScoreWeightage: 0,
  endDate: null,
  addedSections: ['Add_MCQs'],
  // addedSections: ['Add_MCQs', 'Add_Programs'],
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_DIFFICULTY_LEVEL:
      return { ...state, difficultyLevel: action.payload.difficultyLevel }
    case ACTION.SET_SELECTED_LANGUAGE:
      return { ...state, selectedLanguage: action.payload.selectedLanguage }
    case ACTION.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload.activeTab,
      }
    case ACTION.SET_ADD_TEST_ERROR:
      return { ...state, showAddTestError: action.payload.showAddTestError }
    case ACTION.SET_DYNAMIC_SCORE:
      return {
        ...state,
        dynamicScore: action.payload.dynamicScore,
      }
    case ACTION.SET_INITIAL_QUESTION_VALUE:
      return {
        ...state,
        initialQuestionsValue: action.payload.initialQuestionsValue,
      }
    case ACTION.SET_TOTAL_SCORE_WEIGHTAGE:
      return {
        ...state,
        totalScoreWeightage: action.payload.totalScoreWeightage,
      }
    case ACTION.SET_END_DATE:
      return {
        ...state,
        endDate: action.payload.endDate,
      }
    case ACTION.SET_ADDED_SECTIONS:
      return {
        ...state,
        addedSections: action.payload.addedSections,
      }
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
    default:
      return state
  }
}

const EditTest = ({
  isEditTestModalOpen,
  isDupTestModalOpen,
  closeEditModal,
  fetchData,
  testRecord,
  dataList,
  setDataList,
}) => {
  const [form] = Form.useForm()
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

  // Function to Update the Score Weightage dynamically
  const handleCountInputChange = (index, value) => {
    let questionVal = (pre) => {
      let temp = Object.assign({}, pre)
      value == '' ? (temp[index] = 0) : (temp[index] = value)
      return temp
    }
    dispatch({
      type: ACTION.SET_INITIAL_QUESTION_VALUE,
      payload: {
        initialQuestionsValue: questionVal(state.initialQuestionsValue),
      },
    })
  }

  const [minMCQ, setMinMCQ] = useState('')

  // Function to add new test
  const EditTestModel = () => {
    form.validateFields().then((values) => {
      console.log('values', values)

      let invalidLanguages = []
      Object.values(values).forEach((value) => {
        const hasValidMCQ =
          parseInt(value.easy_mcq_count) > 0 ||
          parseInt(value.medium_mcq_count) > 0 ||
          parseInt(value.hard_mcq_count) > 0

        if (!hasValidMCQ) {
          invalidLanguages.push(value.language)
        }
      })

      if (invalidLanguages.length > 0) {
        setMinMCQ(`No valid MCQs found for: ${invalidLanguages.join(', ')}`)
        console.error(
          `No valid MCQs found for: ${invalidLanguages.join(', ')}. The entry will not be added to the table.`,
        )
        return
      }

      if (testRecord) {
        dataList[0]['id'] = testRecord.id
      }

      let weightage = 0
      for (let value in values) {
        weightage += calculateWeightage(values[value])
      }

      let apiPayload = {
        name: testRecord['name'],
        id: testRecord['id'],
        question_details: Object.values(values),
        weightage: weightage,
      }

      // Call validate_test first
      triggerFetchData('validate_test/', apiPayload)
        .then((validateResponse) => {
          console.log('Validation successful:', validateResponse)

          triggerFetchData('create_update_test/', apiPayload)
            .then(() => {
              message.success('Test updated!')
              fetchData()
              dispatch({
                type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
                payload: { showNotEnoughQuesErrorMessage: '' },
              })
              dispatch({
                type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
                payload: { showNotEnoughQuesError: false },
              })

              closeEditModal()
              form.resetFields()
            })
            .catch((reason) => {
              console.error('Error in create_update_test:', reason)

              message.error(reason?.message || 'Error while updating the test.')
            })
        })
        .catch((validationError) => {
          dispatch({
            type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
            payload: {
              showNotEnoughQuesErrorMessage:
                validationError?.message || 'Unknown error',
            },
          })

          dispatch({
            type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
            payload: { showNotEnoughQuesError: !!validationError?.error },
          })
          console.error('Validation failed:', validationError)
          message.error('Validation failed. Please fix errors before proceeding.')
        })
    })
  }

  //duplicate record
  const DuplicateTestModel = () => {
    form.validateFields().then((values) => {
      console.log('values', values)

      let invalidLanguages = []
      Object.values(values).forEach((value) => {
        const hasValidMCQ =
          parseInt(value.easy_mcq_count) > 0 ||
          parseInt(value.medium_mcq_count) > 0 ||
          parseInt(value.hard_mcq_count) > 0

        if (!hasValidMCQ) {
          invalidLanguages.push(value.language)
        }
      })

      if (invalidLanguages.length > 0) {
        setMinMCQ(`No valid MCQs found for: ${invalidLanguages.join(', ')}`)
        console.error(
          `No valid MCQs found for: ${invalidLanguages.join(', ')}. The entry will not be added to the table.`,
        )
        return
      }

      // Create a new deep copy of the testRecord
      let newTestRecord = structuredClone(testRecord)

      if (newTestRecord) {
        delete newTestRecord.id
      }

      let weightage = 0
      for (let value in values) {
        weightage += calculateWeightage(values[value])
      }

      let apiPayload = {
        name: `${newTestRecord['name']} - Copy`, 
        question_details: Object.values(values),
        weightage: weightage,
      }

      // Call validate_test first
      triggerFetchData('validate_test/', apiPayload)
        .then((validateResponse) => {
          console.log('Validation successful:', validateResponse)

          triggerFetchData('create_update_test/', apiPayload)
            .then(() => {
              message.success('Test copied and updated successfully!')
              fetchData()
              dispatch({
                type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
                payload: { showNotEnoughQuesErrorMessage: '' },
              })
              dispatch({
                type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
                payload: { showNotEnoughQuesError: false },
              })

              closeEditModal()
              form.resetFields()
            })
            .catch((reason) => {
              console.error('Error in create_update_test:', reason)
              message.error(reason?.message || 'Error while creating the new test.')
            })
        })
        .catch((validationError) => {
          dispatch({
            type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
            payload: {
              showNotEnoughQuesErrorMessage:
                validationError?.message || 'Unknown error',
            },
          })

          dispatch({
            type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
            payload: { showNotEnoughQuesError: !!validationError?.error },
          })
          console.error('Validation failed:', validationError)
          message.error('Validation failed. Please fix errors before proceeding.')
        })
    })
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
      if (count !== 0) {
        score += weights[key] * count
      }
    }
    return score
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const handleChange = (value) => {
    isNaN(value)
      ? dispatch({
          type: ACTION.SET_SELECTED_LANGUAGE,
          payload: { selectedLanguage: value },
        })
      : dispatch({
          type: ACTION.SET_DIFFICULTY_LEVEL,
          payload: { difficultyLevel: value },
        })
  }

  const onCollapseChange = (key) => {
    dispatch({
      type: ACTION.SET_ACTIVE_TAB,
      payload: { activeTab: key },
    })
  }

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    dispatch({
      type: ACTION.SET_END_DATE,
      payload: { endDate: dateString },
    })
  }

  const handleAddSection = (value) => {
    dispatch({
      type: ACTION.SET_ADDED_SECTIONS,
      payload: { addedSections: value },
    })
    setSelectedSections(value)
  }

  const [selectedSections, setSelectedSections] = useState([
    'Add_MCQs',
    // 'Add_Programs',
  ])

  const handleSectionChange = (value) => {
    setSelectedSections(value)
  }

  return (
    <>
      <Modal
        title="Edit Test"
        open={isEditTestModalOpen}
        onOk={EditTestModel}
        onCancel={closeEditModal}
        width={900}
        okText="Submit"
      >
        <Divider />
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            style={{ maxWidth: 'none' }}
            layout="inline"
            initialValues={testRecord.question_details}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {testRecord?.question_details?.map((rec, idx) => (
              <Col span={24} key={`collapse-index-${idx}`}>
                <Collapse
                  accordion
                  defaultActiveKey={[`${idx}-0`]}
                  className="custom-collapse"
                >
                  <Panel header={rec.language} key={`${idx}-0`}>
                    <Col span={24}>
                      <Row>
                        {CreateTestForm_1.map((item, index) => (
                          <Col span={12} key={`form-item-${index}`}>
                            <Form.Item
                              label={item.title}
                              name={[idx, item.dataIndex]}
                              rules={[
                                {
                                  required: item.dataIndex !== 'end_date',
                                  message: `Please input your ${item.title}`,
                                },
                              ]}
                            >
                              <Space.Compact>
                                {(() => {
                                  if (item.dataIndex === 'language') {
                                    return (
                                      <Select
                                        showSearch
                                        placeholder="Select a language"
                                        optionFilterProp="children"
                                        defaultValue={rec[item.dataIndex]}
                                        filterOption={(input, option) =>
                                          (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                        }
                                        options={languageOptions}
                                        onChange={handleChange}
                                        style={{ width: 200 }}
                                        disabled
                                      />
                                    )
                                  } else if (item.dataIndex === 'add_sections') {
                                    return (
                                      <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: 200 }}
                                        placeholder="Please select"
                                        defaultValue={selectedSections}
                                        onChange={(value) => {
                                          handleSectionChange(value)
                                          form.setFieldsValue({
                                            [idx]: {
                                              add_sections: value,
                                            },
                                          })
                                        }}
                                        options={testSectionOption}
                                      />
                                    )
                                  } else if (item.dataIndex === 'end_date') {
                                    return (
                                      <DatePicker
                                        style={{ width: '100%' }}
                                        onChange={onDateChange}
                                        placeholder={testRecord.end_date}
                                        disabled
                                      />
                                    )
                                  } else if (item.dataIndex === 'name') {
                                    return (
                                      <Input
                                        disabled
                                        defaultValue={rec[item.dataIndex]}
                                      />
                                    )
                                  } else {
                                    return null
                                  }
                                })()}
                              </Space.Compact>
                            </Form.Item>
                            <br />
                          </Col>
                        ))}
                      </Row>
                      {selectedSections.includes('Add_MCQs') && (
                        <Row justify="start" gutter={[16, 16]}>
                          <Col span={24}>
                            <h4>MCQ Count</h4>
                          </Col>
                          {CreateTestForm_2.map((item, index) => (
                            <Col span={12} key={`form-item-${index}`}>
                              <Form.Item
                                label={item.title}
                                name={[idx, item.dataIndex]}
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
                                  defaultValue={rec[item.dataIndex]}
                                  onChange={(e) =>
                                    handleCountInputChange(
                                      item.dataIndex,
                                      e.target.value,
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                          ))}
                        </Row>
                      )}
                      {/* {selectedSections.includes('Add_Programs') && (
                      <Row justify="start">
                        <Col span={24}>
                          <h4>Program Count</h4>
                        </Col>
                        {CreateTestForm_3.map((item, index) => (
                          <Col span={12} key={`form-item-${index}`}>
                            <Form.Item
                              label={item.title}
                              name={[idx, item.dataIndex]}
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
                                  handleCountInputChange(
                                    item.dataIndex,
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    )} */}
                    </Col>
                  </Panel>
                </Collapse>
              </Col>
            ))}
            {state.showNotEnoughQuesError && (
              <p style={{ color: 'red', textAlign: 'center', width: '100%' }}>
                {state.showNotEnoughQuesErrorMessage}
              </p>
            )}
            {minMCQ && (
              <p
                style={{
                  color: 'red',
                  textAlign: 'center',
                  marginBottom: '-2px',
                  width: '100%',
                  display: 'block',
                }}
              >
                {minMCQ}
              </p>
            )}
          </Form>
          <br />
        </div>
      </Modal>

      {/* duplicate modal */}
      <Modal
        title="Duplicate Test"
        open={isDupTestModalOpen}
        onOk={DuplicateTestModel}
        onCancel={closeEditModal}
        width={900}
        okText="Duplicate"
      >
        <Divider />
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 12 }}
            style={{ maxWidth: 'none' }}
            layout="inline"
            initialValues={testRecord.question_details}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {testRecord?.question_details?.map((rec, idx) => (
              <Col span={24} key={`collapse-index-${idx}`}>
                <Collapse
                  accordion
                  defaultActiveKey={[`${idx}-0`]}
                  className="custom-collapse"
                >
                  <Panel header={rec.language} key={`${idx}-0`}>
                    <Col span={24}>
                      <Row>
                        {CreateTestForm_1.map((item, index) => (
                          <Col span={12} key={`form-item-${index}`}>
                            <Form.Item
                              label={item.title}
                              name={[idx, item.dataIndex]}
                              rules={[
                                {
                                  required: item.dataIndex !== 'end_date',
                                  message: `Please input your ${item.title}`,
                                },
                              ]}
                            >
                              <Space.Compact>
                                {(() => {
                                  if (item.dataIndex === 'language') {
                                    return (
                                      <Select
                                        showSearch
                                        placeholder="Select a language"
                                        optionFilterProp="children"
                                        defaultValue={rec[item.dataIndex]}
                                        filterOption={(input, option) =>
                                          (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                        }
                                        options={languageOptions}
                                        onChange={handleChange}
                                        style={{ width: 200 }}
                                      />
                                    )
                                  } else if (item.dataIndex === 'add_sections') {
                                    return (
                                      <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: 200 }}
                                        placeholder="Please select"
                                        defaultValue={selectedSections}
                                        onChange={(value) => {
                                          handleSectionChange(value)
                                          form.setFieldsValue({
                                            [idx]: {
                                              add_sections: value,
                                            },
                                          })
                                        }}
                                        options={testSectionOption}
                                      />
                                    )
                                  } else if (item.dataIndex === 'end_date') {
                                    return (
                                      <DatePicker
                                        style={{ width: '100%' }}
                                        onChange={onDateChange}
                                        placeholder={testRecord.end_date}
                                        disabled
                                      />
                                    )
                                  } else if (item.dataIndex === 'name') {
                                    return (
                                      <Input
                                        disabled={testRecord.copied === false}
                                        defaultValue={rec[item.dataIndex]}
                                      />
                                    )
                                  } else {
                                    return null
                                  }
                                })()}
                              </Space.Compact>
                            </Form.Item>
                            <br />
                          </Col>
                        ))}
                      </Row>
                      {selectedSections.includes('Add_MCQs') && (
                        <Row justify="start" gutter={[16, 16]}>
                          <Col span={24}>
                            <h4>MCQ Count</h4>
                          </Col>
                          {CreateTestForm_2.map((item, index) => (
                            <Col span={12} key={`form-item-${index}`}>
                              <Form.Item
                                label={item.title}
                                name={[idx, item.dataIndex]}
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
                                  defaultValue={rec[item.dataIndex]}
                                  onChange={(e) =>
                                    handleCountInputChange(
                                      item.dataIndex,
                                      e.target.value,
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                          ))}
                        </Row>
                      )}
                      {/* {selectedSections.includes('Add_Programs') && (
                      <Row justify="start">
                        <Col span={24}>
                          <h4>Program Count</h4>
                        </Col>
                        {CreateTestForm_3.map((item, index) => (
                          <Col span={12} key={`form-item-${index}`}>
                            <Form.Item
                              label={item.title}
                              name={[idx, item.dataIndex]}
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
                                  handleCountInputChange(
                                    item.dataIndex,
                                    e.target.value,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    )} */}
                    </Col>
                  </Panel>
                </Collapse>
              </Col>
            ))}
            {state.showNotEnoughQuesError && (
              <p style={{ color: 'red', textAlign: 'center', width: '100%' }}>
                {state.showNotEnoughQuesErrorMessage}
              </p>
            )}
            {minMCQ && (
              <p
                style={{
                  color: 'red',
                  textAlign: 'center',
                  marginBottom: '-2px',
                  width: '100%',
                  display: 'block',
                }}
              >
                {minMCQ}
              </p>
            )}
          </Form>
          <br />
        </div>
      </Modal>
    </>
  )
}

export default EditTest
