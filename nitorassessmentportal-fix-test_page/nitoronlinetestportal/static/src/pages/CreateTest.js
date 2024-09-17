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
  Divider,
  Checkbox
} from 'antd'
import { ACTION } from '../Utils/constants'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import { useFetch } from '../Utils/Hooks/useFetchAPI'
import CreateNewTest from '../components/CreateNewTest'
import EditTest from '../components/EditTest'
import PropTypes from 'prop-types'
import '../styles/create-test.css'
import TestSummary from '../components/TestSummary'
import { languageOptions } from '../Utils/constants'

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
      dataIndex: 'question_details',
      key: 'languages',
      filters: languageOptions.map((lang) => ({
        text: lang.label,
        value: lang.value,
      })),
      onFilter: (value, testRecord) =>
        testRecord.question_details.some((ques) => ques.language === value),
      render: (_, testRecord) => (
        <>
          <p>
            {testRecord.question_details
              .map((ques, index) => (index ? ', ' : '') + ques.language)
              .join('')}
          </p>
        </>
      ),
    }
    ,
    {
      title: 'Total Questions',
      dataIndex: 'total_questions',
      key: 'total_questions',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Deactivate', value: false },
      ],
      onFilter: (value, testRecord) => testRecord.is_active === value,
      render: (_, testRecord) => (
        <>
          {testRecord.is_active === true ? (
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
          <Space wrap>
            {/* activate-deactivate */}
            <Tooltip
              placement="top"
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
            {/* generate link */}
            <Tooltip placement="top" title="Generate Link">
              <label className="container">
                <input
                  checked={testRecord.is_active}
                  type="checkbox"
                  readOnly
                  disabled={!testRecord.is_active}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#b21d21"
                  className="bi bi-link-45deg size-6 text-primary"
                  viewBox="0 0 16 16"
                  onClick={() => {
                    if (testRecord.is_active) {
                      generateTest(testRecord)
                    }
                  }}
                  style={{
                    cursor: testRecord.is_active ? 'pointer' : 'not-allowed',
                    opacity: testRecord.is_active ? 1 : 0.5,
                  }}
                >
                  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                </svg>
              </label>
            </Tooltip>
            {/* view test */}
            <Tooltip placement="top" title="View Test">
              <label className="container">
                <input checked="checked" type="checkbox" readOnly />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#b21d21"
                  className="size-6"
                  viewBox="0 0 16 16"
                  onClick={() => {
                    openDetailModal(testRecord)
                  }}
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                </svg>
              </label>
            </Tooltip>

            {/* edit test */}
            <Tooltip placement="top" title="Edit Test">
              <label className="container">
                <input
                  checked={testRecord.is_active}
                  type="checkbox"
                  readOnly
                  disabled={!testRecord.is_active}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#b21d21"
                  className="size-6"
                  viewBox="0 0 16 16"
                  onClick={() => {
                    if (testRecord.is_active) {
                      openEditModal(testRecord)
                    }
                  }}
                  style={{
                    cursor: testRecord.is_active ? 'pointer' : 'not-allowed',
                    opacity: testRecord.is_active ? 1 : 0.5,
                  }}
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fillRule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                  />
                </svg>
              </label>
            </Tooltip>
            {/* view summary */}
            <Tooltip placement="top" title="View Summary">
              <label className="container">
                <input checked="checked" type="checkbox" readOnly />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#b21d21"
                  className="size-6"
                  viewBox="0 0 16 16"
                  onClick={() => {
                    openSummaryModal(testRecord)
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0m0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0m0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0"
                  />
                </svg>
              </label>
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
    testRecord['from_edit'] = true
    history.push({
      pathname: '/assign-test',
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
          overflowX: 'hidden',
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
          className="custom-modal"
        >
          <Divider />
          {state.rowRecord?.question_details?.map((item, index) => (
            <div key={`collapse-index-${index}`} className="collapse-container">
              <Collapse defaultActiveKey={['0']} className="custom-collapse">
                <Panel
                  header={<span className="panel-header">{item.language}</span>}
                >
                  <div className="details-container">
                    <div className="details-column">
                      <h3>MCQ</h3>
                      <p>Easy: {item.easy_mcq_count}</p>
                      <p>Medium: {item.medium_mcq_count}</p>
                      <p>Hard: {item.hard_mcq_count}</p>
                    </div>
                    {/* <div className="details-column">
                      <h3>Program</h3>
                      <p>Easy: {item.easy_program_count}</p>
                      <p>Medium: {item.medium_program_count}</p>
                      <p>Hard: {item.hard_program_count}</p>
                    </div> */}
                  </div>
                </Panel>
              </Collapse>
            </div>
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
