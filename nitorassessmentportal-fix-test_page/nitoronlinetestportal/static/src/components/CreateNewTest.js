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
        <>
          <Space>
            <Tooltip placement="topLeft" title="Remove From List">
              <CloseOutlined
                onClick={() => {
                  removeDataList(testRecord) // Preserve the same functionality
                }}
              />
            </Tooltip>
          </Space>
        </>
      ),
    },
  ]

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra)
  }

  // Function to Calculate Weightage
  const calculateWeightage = (question) => {
    const weights = {
      easy_program_count: 5,
      medium_program_count: 10,
      hard_program_count: 15,
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

  const removeDataList = (testRecord) => {
    let filterArray = dataList.filter((item) => item.id !== testRecord.id)
    resetDataList(filterArray)
  }

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

  // Handle Date Change
  const onDateChange = (date, dateString) => {
    dispatch({
      type: ACTION.SET_END_DATE,
      payload: { endDate: dateString },
    })
  }

  // Function to add new test
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

    let payload = dataList[dataList.length - 1]
    delete payload['id']
    triggerFetchData('create_update_test/', payload)
      .then((data) => {
        message.success('Test created')
        fetchData()
      })
      .catch((reason) => message.error(reason))
    closeAddNewTestModal()
    form.resetFields()
  }

  // Function to add form data to List with Score Weightage
  const [testName, setTestName] = useState('')
  const handleCreateNewTest = (param) => {
    let values = { ...initialNewTestValues, ...param };
    let name = values['name'];
    let end_date = values['end_date'];
    let language = values['language'];
  
    // Calculate new weightage
    let newWeightage = calculateWeightage(values);
  
    let form_data = {
      name: name,
      end_date: end_date,
      language: language,
      weightage: newWeightage,
      question_details: [values],
    };
  
    setTestName(name);
  
    triggerFetchData('validate_test/', form_data)
      .then((data) => {
        form_data['id'] = Math.floor(Math.random() * 10000);
  
        console.log('Initial dataList:', dataList);
  
        let updatedDataList = [...dataList];
        let languageExists = false;
  
        updatedDataList = updatedDataList.map((item) => {
          if (item.language === language) {
            languageExists = true;
  
            // Replace the question details and update weightage
            return {
              ...item,
              question_details: [values],
              weightage: newWeightage,
            };
          }
          return item;
        });
  
        if (!languageExists) {
          updatedDataList.push(form_data);
        }
  
        console.log('Updated dataList:', updatedDataList);
  
        setDataList(updatedDataList);
  
        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
          payload: { showNotEnoughQuesErrorMessage: '' },
        });
        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
          payload: { showNotEnoughQuesError: false },
        });
      })
      .catch((reason) => {
        console.error('Error Response:', reason);
  
        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR_MESSAGE,
          payload: {
            showNotEnoughQuesErrorMessage: reason && reason.error && reason.message,
          },
        });
  
        dispatch({
          type: ACTION.SET_NOT_ENOUGH_QUES_ERROR,
          payload: { showNotEnoughQuesError: reason && reason.error },
        });
      });
  
    dispatch({
      type: ACTION.SET_EDIT_SECTION,
      payload: { showEditSection: false },
    });
  };
  

  const [selectedSections, setSelectedSections] = useState([])
  const handleAddSection = (value) => {
    dispatch({
      type: ACTION.SET_ADDED_SECTIONS,
      payload: { addedSections: value },
    })
    setSelectedSections(value)
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
        setSelectedSections([])
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
          onFinish={handleCreateNewTest}
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
                        onChange={(value) => {
                          handleAddSection([])
                          form.resetFields(['add_sections'])
                        }}
                        allowClear
                      />
                    ) : item.dataIndex === 'add_sections' ? (
                      <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Please select"
                        onChange={handleAddSection}
                        options={testSectionOption}
                      />
                    ) : item.dataIndex === 'end_date' ? (
                      <DatePicker
                        style={{ width: '100%' }}
                        onChange={onDateChange}
                        disabled={!state.componentDisabled}
                      />
                    ) : item.dataIndex === 'name' ? (
                      <Input disabled={!state.componentDisabled} />
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
            {selectedSections.includes('Add_Programs') && (
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
            )}
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
          {/* Conditionally render the test name and other content */}
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
                Test Name: {testName}
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
