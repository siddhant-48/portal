import React, { useEffect, useState, useReducer } from 'react'
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
  Col,
} from 'antd'
import {
  CreateTestForm,
  languageOptions,
  constInitialQuestionsValue,
  ACTION,
} from '../Utils/constants'
import { CloseOutlined } from '@ant-design/icons'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
const { Panel } = Collapse

// Initial state
const initialState = {
  difficultyLevel: '1',
  componentDisabled: true,
  showEditSection: false,
  dynamicScore: 0,
  activeTab: '',
  selectedLanguage: '',
  showAddTestError: false,
  showNotEnoughQuesError: false,
  showNotEnoughQuesErrorMessage: '',
  initialQuestionsValue: constInitialQuestionsValue,
  totalScoreWeightage: 0,
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_COMPONENT_DISABLED:
      return { ...state, componentDisabled: action.payload.componentDisabled }
    case ACTION.SET_DIFFICULTY_LEVEL:
      return { ...state, difficultyLevel: action.payload.difficultyLevel }
    case ACTION.SET_EDIT_SECTION:
      return { ...state, showEditSection: action.payload.showEditSection }
    case ACTION.SET_DYNAMIC_SCORE:
      return {
        ...state,
        dynamicScore: action.payload.dynamicScore,
      }
    case ACTION.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload.activeTab,
      }
    case ACTION.SET_ADD_TEST_ERROR:
      return { ...state, showAddTestError: action.payload.showAddTestError }
    case ACTION.SET_SELECTED_LANGUAGE:
      return { ...state, selectedLanguage: action.payload.selectedLanguage }
    case ACTION.SET_INITIAL_QUESTION_VALUE:
      return {
        ...state,
        initialQuestionsValue: action.payload.initialQuestionsValue,
      }
    case ACTION.SET_EDIT_SECTION:
      return { ...state, showEditSection: action.payload.showEditSection }
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
    case ACTION.SET_TOTAL_SCORE_WEIGHTAGE:
      return {
        ...state,
        totalScoreWeightage: action.payload.totalScoreWeightage,
      }
    default:
      return state
  }
}

const AddTest = ({
  isAddTestModalOpen,
  isEditTestModalOpen,
  closeAddNewTestModal,
  openDetailModal,
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

  // Table in Add New Test Modal
  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
      width: '400px',
      // colSpan: 16,
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord)
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
      // colSpan: 16,
      render: (text, testRecord) => (
        <>
          <a
            onClick={() => {
              openDetailModal(testRecord)
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
                  removeDataList(testRecord)
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

    triggerFetchData('create_update_test/', dataList[dataList.length - 1])
      .then((data) => {
        message.success('Test created')
        fetchData()
      })
      .catch((reason) => message.error(reason))
    closeAddNewTestModal()
    form.resetFields()
  }

  // Function to add form data to List with Score Weightage
  const handleCreateNewTest = (values) => {
    let name = values['name']
    delete values['name']
    values['mcq_difficulty'] = state.difficultyLevel
    let weightage = calculateWeightage(values)
    let form_data = {
      name: name,
      weightage: weightage,
      question_details: [values],
    }

    triggerFetchData('validate_test/', form_data)
      .then((data) => {
        if (dataList.length == 0) {
          setDataList((oldArray) => [...oldArray, form_data])
          dispatch({
            type: ACTION.SET_COMPONENT_DISABLED,
            payload: { componentDisabled: false },
          })
        } else {
          let filterArray = dataList.filter((item) => item.name == name)
          filterArray.map((item) => {
            form_data.question_details = [item.question_details[0], values]
            setDataList((oldArray) => [...oldArray, form_data])
          })
        }
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

    dispatch({ type: ACTION.SET_EDIT_SECTION, payload: { showEditSection: false } })
  }

  // Function to edit existing test
  const handleEditTest = (values) => {
    delete values['name']
    values['language'] = state.selectedLanguage
      ? state.selectedLanguage
      : state.activeTab
    values['mcq_difficulty'] = state.difficultyLevel
    let dList = {}
    let weightage = calculateWeightage(values)

    dataList.map((item) => {
      let index = item.question_details.findIndex(
        (obj) => obj.language === state.activeTab,
      )
      item.question_details[index] = values
      item.weightage = weightage
      dispatch({
        type: ACTION.SET_SELECTED_LANGUAGE,
        payload: { selectedLanguage: '' },
      })
      dList = item
    })
    setDataList([dList])
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

  const selectAfter = (rec) => {
    return (
      <Select defaultValue={rec ? rec.mcq_difficulty : '1'} onChange={handleChange}>
        <Option value="1">Easy</Option>
        <Option value="2">Medium</Option>
        <Option value="3">Hard</Option>
      </Select>
    )
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

  const removeDataList = (testRecord) => {
    let filterArray = dataList.filter((item) => item.name !== testRecord.name)
    setDataList(filterArray)
  }

  const onCollapseChange = (key) => {
    dispatch({
      type: ACTION.SET_ACTIVE_TAB,
      payload: { activeTab: key },
    })
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

  return (
    <>
      {!isEditTestModalOpen ? (
        <Modal
          title="Add New Test"
          open={isAddTestModalOpen}
          onOk={createTest}
          onCancel={closeAddNewTestModal}
          width={900}
          okText="Submit"
        >
          <Row>
            <Form
              form={form}
              name="basic"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              style={{
                maxWidth: 'none',
              }}
              layout="inline"
              initialValues={testRecord}
              onFinish={handleCreateNewTest}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              {CreateTestForm.map((item, index) => (
                <>
                  <Col span={12}>
                    <Form.Item
                      key={`form-item-${index}`}
                      label={item.title}
                      name={item.dataIndex}
                      rules={[
                        {
                          required: item.dataIndex !== 'end_date',
                          message: `Please input your ${item.title}`,
                        },
                      ]}
                    >
                      {item.dataIndex == 'language' ? (
                        <Select
                          showSearch
                          placeholder="Select a language"
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? '')
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={languageOptions}
                        />
                      ) : item.dataIndex == 'mcq_count' ? (
                        <Input addonAfter={selectAfter()} />
                      ) : item.dataIndex == 'name' ? (
                        <Input disabled={!state.componentDisabled} />
                      ) : (
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
                      )}
                    </Form.Item>
                    <br></br>
                  </Col>
                </>
              ))}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Button type="primary" ghost onClick={form.submit}>
                  Add To List
                </Button>
                {state.showNotEnoughQuesError && (
                  <p style={{ color: 'red' }}>
                    {state.showNotEnoughQuesErrorMessage}
                  </p>
                )}
                <p>
                  <b>Score Weightage: </b>
                  {state.dynamicScore}
                </p>
              </div>

              <Divider></Divider>
            </Form>
            <Table
              columns={columns}
              dataSource={dataList ? dataList : question_details}
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
          </Row>
        </Modal>
      ) : (
        <Modal
          title="Edit Test"
          open={isEditTestModalOpen}
          onOk={createTest}
          onCancel={closeAddNewTestModal}
          width={900}
          okText="Submit"
        >
          <>
            {testRecord?.question_details?.map((rec, index) => (
              <Form
                form={form}
                name="basic"
                labelCol={{
                  span: 8,
                }}
                wrapperCol={{
                  span: 16,
                }}
                style={{
                  maxWidth: 'none',
                }}
                layout="inline"
                initialValues={{ name: testRecord.name, ...rec }}
                onFinish={handleEditTest}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Col span={24}>
                  <Collapse
                    accordion
                    key={`collapse-index-${index}`}
                    onChange={onCollapseChange}
                  >
                    <Panel header={rec.language} key={rec.language}>
                      <Row>
                        {CreateTestForm.map((item, index) => (
                          <>
                            <Col span={12}>
                              <Form.Item
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
                                <Space.Compact>
                                  {item.dataIndex == 'language' ? (
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
                                    />
                                  ) : item.dataIndex == 'mcq_count' ? (
                                    <Input
                                      addonAfter={selectAfter(rec)}
                                      defaultValue={rec[item.dataIndex]}
                                    />
                                  ) : item.dataIndex == 'name' ? (
                                    <Input
                                      defaultValue={testRecord[item.dataIndex]}
                                      disabled={true}
                                    />
                                  ) : (
                                    <Input
                                      defaultValue={rec[item.dataIndex]}
                                      type="text"
                                      onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                          event.preventDefault()
                                        }
                                      }}
                                    />
                                  )}
                                </Space.Compact>
                              </Form.Item>
                              <br></br>
                            </Col>
                          </>
                        ))}
                        <Button type="primary" ghost onClick={form.submit}>
                          Update
                        </Button>
                      </Row>
                    </Panel>
                  </Collapse>
                </Col>
              </Form>
            ))}
            <br></br>
          </>
        </Modal>
      )}
    </>
  )
}

export default AddTest
