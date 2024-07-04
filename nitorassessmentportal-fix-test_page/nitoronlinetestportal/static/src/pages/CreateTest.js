import React, { useEffect, useReducer } from 'react'
import { withRouter } from 'react-router-dom'
import {
  Input,
  Layout,
  Button,
  message,
  Table,
  Modal,
  Collapse,
  Space,
  Tooltip,
  Tag,
} from 'antd'
import { ACTION } from '../Utils/constants'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import { useFetch } from '../Utils/Hooks/useFetchAPI'
import { EditFilled, EyeFilled, UnorderedListOutlined } from '@ant-design/icons'
import CreateNewTest from '../components/CreateNewTest'
import EditTest from '../components/EditTest'
import PropTypes from 'prop-types'
import '../styles/create-test.css'
import TestSummary from '../components/TestSummary'

const { Panel } = Collapse

// Initial state
const initialState = {
  isAddTestModalOpen: false,
  isEditTestModalOpen: false,
  isDeleteModalOpen: false,
  isViewTestModalOpen: false,
  isSummaryModalOpen: false,
  rowRecord: false,
  testRecord: null,
  dataList: [],
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION.SET_ADD_TEST_MODEL_OPEN:
      return { ...state, isAddTestModalOpen: action.payload.isAddTestModalOpen }
    case ACTION.SET_EDIT_TEST_MODEL_OPEN:
      return { ...state, isEditTestModalOpen: action.payload.isEditTestModalOpen }
    case ACTION.SET_DELETE_MODEL_OPEN:
      return { ...state, isDeleteModalOpen: action.payload.isDeleteModalOpen }
    case ACTION.SET_SUMMARY_MODEL_OPEN:
      return { ...state, isSummaryModalOpen: action.payload.isSummaryModalOpen }
    case ACTION.SET_VIEW_TEST_MODEL_OPEN:
      return { ...state, isViewTestModalOpen: action.payload.isViewTestModalOpen }
    case ACTION.SET_ROW_RECORD:
      return { ...state, rowRecord: action.payload.rowRecord }
    case ACTION.SET_TEST_RECORD:
      return { ...state, testRecord: action.payload.testRecord }
    case ACTION.SET_DATA_LIST:
      return { ...state, dataList: [...state.dataList, action.payload.dataList] }
    case ACTION.RESET_FORM_DATA:
      return { ...state, dataList: action.payload.dataList }

    default:
      return state
  }
}

const CreateTest = ({ setSelectedKey, history }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { isLoading, serverError, apiData, fetchData } = useFetch('get_test_list')
  function setDataList(dataList) {
    dispatch({
      type: ACTION.SET_DATA_LIST,
      payload: { dataList: dataList },
    })
  }

  function resetDataList(dataList) {
    dispatch({
      type: ACTION.RESET_FORM_DATA,
      payload: { dataList: dataList },
    })
  }

  // trigger on component mount
  useEffect(() => {
    setSelectedKey('create-test')
  }, [])

  const filter_test = () => {
    let filter_test_data = []
    if (apiData) {
      apiData.data.map((data, index) => {
        if (!filter_test_data.some((item) => data.name === item.value)) {
          filter_test_data.push({ value: data.name, text: data.name })
        }
      })
    }
    return filter_test_data
  }

  const columns = [
    {
      title: 'Test Name',
      dataIndex: 'name',
      key: 'name',
      filters: filter_test(),
      onFilter: (value, testRecord) => testRecord.name.indexOf(value) === 0,
      filterMultiple: true,
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
      title: 'Languages',
      render: (_, testRecord) => (
        <>
          {
            <p>
              {testRecord.question_details.map((ques, index) => {
                return (index ? ',' : '') + ques.language
              })}
            </p>
          }
        </>
      ),
    },
    {
      title: 'Total Questions',
      dataIndex: 'total_questions',
      key: 'total_questions',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (_, testRecord) => (
        <>
          {testRecord.is_active == true ? (
            <Tag color="blue">Active</Tag>
          ) : (
            <Tag color="pink">Deactivate</Tag>
          )}
        </>
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
    },
    {
      title: 'Action',
      render: (_, testRecord) => (
        <>
          <Space>
            <Tooltip placement="topLeft" title="View Test">
              <EyeFilled
                onClick={() => {
                  openDetailModal(testRecord)
                }}
              />
            </Tooltip>
            <Tooltip placement="topLeft" title="Edit Test">
              <EditFilled
                onClick={() => {
                  openEditModal(testRecord)
                }}
              />
            </Tooltip>
            <Tooltip placement="topLeft" title="Generate Link">
              <Button
                size="small"
                type="default"
                onClick={() => {
                  generateTest(testRecord)
                }}
              >
                Generate Link
              </Button>
            </Tooltip>
            <Tooltip
              placement="topLeft"
              title={testRecord.is_active ? 'Deactivate' : 'Activate'}
            >
              <label className="toggle">
                <Input
                  className="toggle-checkbox"
                  type="checkbox"
                  onClick={() => {
                    showDeactivateModal(testRecord)
                  }}
                  checked={testRecord.is_active}
                />
                <div className="toggle-switch"></div>
              </label>
            </Tooltip>
            <Tooltip placement="topLeft" title="View Summary">
              <UnorderedListOutlined
                onClick={() => {
                  openSummaryModal(testRecord)
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

  // Function to open details Test Model
  const openDetailModal = (testRecord) => {
    dispatch({
      type: ACTION.SET_VIEW_TEST_MODEL_OPEN,
      payload: { isViewTestModalOpen: true },
    })

    dispatch({
      type: ACTION.SET_ROW_RECORD,
      payload: { rowRecord: testRecord },
    })
  }

  // Function to close details Test Model
  const closeDetailModal = (testRecord) => {
    dispatch({
      type: ACTION.SET_VIEW_TEST_MODEL_OPEN,
      payload: { isViewTestModalOpen: false },
    })
    dispatch({
      type: ACTION.SET_ROW_RECORD,
      payload: { rowRecord: null },
    })
  }

  // Function to open deactivate Test Model
  const showDeactivateModal = (testRecord) => {
    dispatch({
      type: ACTION.SET_DELETE_MODEL_OPEN,
      payload: { isDeleteModalOpen: true },
    })
    dispatch({
      type: ACTION.SET_TEST_RECORD,
      payload: { testRecord: testRecord },
    })
  }

  // Function to close deactivate Test Model
  const closeDeactivateModal = () => {
    dispatch({
      type: ACTION.SET_DELETE_MODEL_OPEN,
      payload: { isDeleteModalOpen: false },
    })
    dispatch({
      type: ACTION.SET_ROW_RECORD,
      payload: { rowRecord: null },
    })
  }
  // Function to close deactivate Test Model
  const openSummaryModal = (testRecord) => {
    dispatch({
      type: ACTION.SET_SUMMARY_MODEL_OPEN,
      payload: { isSummaryModalOpen: true },
    })
    dispatch({
      type: ACTION.SET_TEST_RECORD,
      payload: { testRecord: testRecord },
    })
  }

  const closeSummaryModal = () => {
    dispatch({
      type: ACTION.SET_SUMMARY_MODEL_OPEN,
      payload: { isSummaryModalOpen: false },
    })
    dispatch({
      type: ACTION.SET_ROW_RECORD,
      payload: { rowRecord: null },
    })
    resetDataList([])
  }
  // Function to deactivate the test
  const handleDeactivate = (testStatus) => {
    triggerFetchData(`deactivate_test/?testId=${state.testRecord.id}`, [], 'PATCH')
      .then((data) => {
        message.success(data.message)
        fetchData()
      })
      .catch((reason) => message.error(reason))

    dispatch({
      type: ACTION.SET_DELETE_MODEL_OPEN,
      payload: { isDeleteModalOpen: false },
    })
    dispatch({
      type: ACTION.SET_ROW_RECORD,
      payload: { rowRecord: null },
    })
  }

  // Function to open Add Test Model
  const openAddNewTestModal = () => {
    dispatch({
      type: ACTION.SET_ADD_TEST_MODEL_OPEN,
      payload: { isAddTestModalOpen: true },
    })
  }

  // Function to close Add and Edit Test Model
  const closeAddNewTestModal = () => {
    dispatch({
      type: ACTION.SET_ADD_TEST_MODEL_OPEN,
      payload: { isAddTestModalOpen: false },
    })
    dispatch({
      type: ACTION.SET_EDIT_TEST_MODEL_OPEN,
      payload: { isEditTestModalOpen: false },
    })
    dispatch({
      type: ACTION.SET_TEST_RECORD,
      payload: { testRecord: null },
    })
    resetDataList([])
  }

  // Function to open Edit existing Test Model
  const openEditModal = (testRecord) => {
    let form_val = {
      ...testRecord,
    }
    dispatch({
      type: ACTION.SET_TEST_RECORD,
      payload: { testRecord: form_val },
    })
    dispatch({
      type: ACTION.SET_EDIT_TEST_MODEL_OPEN,
      payload: { isEditTestModalOpen: true },
    })
    let listOfData = (oldArray) => [
      ...oldArray,
      { name: testRecord.name, question_details: testRecord.question_details },
    ]
    setDataList(listOfData(state.dataList))
  }

  // Function to open Edit existing Test Model
  const closeEditModal = () => {
    dispatch({
      type: ACTION.SET_EDIT_TEST_MODEL_OPEN,
      payload: { isEditModalOpen: true },
    })
    dispatch({
      type: ACTION.SET_ROW_RECORD,
      payload: { rowRecord: null },
    })
    resetDataList([])
  }

  // TODO: Function to go on generate Test link
  const generateTest = (testRecord) => {
    testRecord['test'] = testRecord.name + '_'
    history.push({
      pathname: '/generate-link',
      state: { testRecord: testRecord, isModalOpen: true },
    })
  }

  return (
    <>
      {/* Mutate Mode */}
      <Layout.Content
        style={{
          minHeight: 'calc(100vh - 64px)',
          padding: '1rem',
          overflowX:'hidden',
        }}
      >
        <div
          style={{
            float: 'right',
            marginBottom: '10px',
            marginLeft: '10px',
            marginRight: '10px',
          }}
        >
          <Button type="primary" onClick={openAddNewTestModal}>
            Add New Test
          </Button>
        </div>

        {/* Table of all test*/}
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={apiData ? apiData.data : []}
          onChange={onChange}
        />

        {/* Deactivate and Activate Confirmation Pop-up */}
        <Modal
          title={state.isDeleteModalOpen}
          open={state.isDeleteModalOpen}
          onOk={() =>
            handleDeactivate(state.testRecord && state.testRecord.is_active)
          }
          onCancel={closeDeactivateModal}
          okText="Yes"
        >
          <p>
            Are you sure you want to{' '}
            {state.testRecord && state.testRecord.is_active
              ? `deactivate`
              : `activate`}{' '}
            this test?
          </p>
        </Modal>

        {/* Add New Test Modal */}
        {state.isAddTestModalOpen && (
          <CreateNewTest
            isAddTestModalOpen={state.isAddTestModalOpen}
            fetchData={fetchData}
            testRecord={state.testRecord}
            dataList={state.dataList}
            setDataList={setDataList}
            resetDataList={resetDataList}
            closeAddNewTestModal={closeAddNewTestModal}
            openDetailModal={openDetailModal}
          />
        )}
        {/* Edit Test Modal */}
        {state.isEditTestModalOpen && (
          <EditTest
            fetchData={fetchData}
            testRecord={state.testRecord}
            dataList={state.dataList}
            setDataList={setDataList}
            isEditTestModalOpen={state.isEditTestModalOpen}
            closeEditModal={closeEditModal}
            openDetailModal={openDetailModal}
          />
        )}
      </Layout.Content>

      {/* View Test Modal */}
      {state.isViewTestModalOpen && (
        <Modal
          title={state.rowRecord.name}
          open={state.isViewTestModalOpen}
          onCancel={closeDetailModal}
          footer={null}
        >
          {state.rowRecord?.question_details?.map((item, index) => (
            <>
              <Collapse key={`collapse-index-${index}`} defaultActiveKey={['1']}>
                <Panel header={item.language}>
                  {
                    <ul>
                      <li> Easy MCQ: {item.easy_mcq_count}</li>
                      <li>Medium MCQ: {item.medium_mcq_count}</li>
                      <li> Hard MCQ: {item.hard_mcq_count}</li>
                      <li> Easy Program: {item.easy_program_count}</li>
                      <li>Medium Count: {item.medium_program_count}</li>
                      <li> Hard Program: {item.hard_program_count}</li>
                    </ul>
                  }
                </Panel>
              </Collapse>
            </>
          ))}
        </Modal>
      )}
      {/* View Summary Modal */}
      {state.isSummaryModalOpen && (
        <TestSummary
          testRecord={state.testRecord}
          isSummaryModalOpen={state.isSummaryModalOpen}
          closeSummaryModal={closeSummaryModal}
        />
      )}
    </>
  )
}

CreateTest.propTypes = {
  setSelectedKey: PropTypes.func,
}

CreateTest.defaultProps = {
  setSelectedKey: (key) => {
    console.log(key)
  },
}

export default withRouter(CreateTest)
