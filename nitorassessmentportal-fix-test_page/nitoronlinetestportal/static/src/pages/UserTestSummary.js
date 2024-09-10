import React, { useEffect, useState } from 'react'
import '../styles/user-submissions.css'
import {
  Row,
  Col,
  Layout,
  Card,
  Tabs,
  Collapse,
  Table,
  Avatar,
  Tooltip,
  Typography,
  Descriptions,
  Modal,
  Input,
  message,
} from 'antd'
import { useFetch, triggerFetchData } from '../Utils/Hooks/useFetchAPI'
import { useParams } from 'react-router-dom'

const getStatusIcon = (correct) => {
  return correct === 'correct' ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#52c41a"
      className="bi bi-check-circle"
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#f5222d"
      className="bi bi-x-circle"
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
    </svg>
  )
}

const columns = [
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Question',
    dataIndex: 'question',
    key: 'question',
  },
  {
    title: 'Language',
    dataIndex: 'language',
    key: 'language',
  },
  {
    title: 'Question Type',
    dataIndex: 'questionType',
    key: 'questionType',
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
  },
]

const formatData = (data) => {
  let formattedData = []

  if (data && data.generated_question) {
    const generatedQuestions = data.generated_question
    for (const language in generatedQuestions) {
      if (Array.isArray(generatedQuestions[language])) {
        generatedQuestions[language].forEach((question, index) => {
          const questionDetails = question.question_details || {}
          const questionOptions = [
            question.option1,
            question.option2,
            question.option3,
            question.option4,
          ]

          formattedData.push({
            key: `${language}-${index}`,
            status: getStatusIcon(
              question.candidate_answers.toLowerCase ===
                question.correct_value.toLowerCase
                ? 'correct'
                : 'incorrect',
            ),
            question: questionDetails.name,
            language: questionDetails.language,
            questionType:
              questionDetails.type === 1 ? 'MCQ' : type === 2 ? 'Program' : '',
            score: question.question_score || 0,
            description: (
              <>
                <div>{questionDetails.name}</div>
                <div>
                  {questionOptions.map((option, idx) =>
                    option ? (
                      question.correct_value === option &&
                      question.candidate_answers === option ? (
                        <div className="correct_answer" key={idx}>
                          {`${idx + 1}. ${option}`}{' '}
                          <span class="answercomment pull-right">
                            &nbsp;&nbsp;Candidate answer&nbsp;&nbsp;
                          </span>
                        </div>
                      ) : question.correct_value === option ? (
                        <div className="correct_answer" key={idx}>
                          {`${idx + 1}. ${option}`}{' '}
                          <span class="answercomment pull-right">
                            &nbsp;&nbsp;Correct answer&nbsp;&nbsp;
                          </span>
                        </div>
                      ) : question.candidate_answers === option ? (
                        <div className="incorrect_answer" key={idx}>
                          {`${idx + 1}. ${option}`}{' '}
                          <span class="answercomment pull-right">
                            &nbsp;&nbsp;Candidate answer&nbsp;&nbsp;
                          </span>
                        </div>
                      ) : (
                        <div className="" key={idx}>{`${idx + 1}. ${option}`}</div>
                      )
                    ) : (
                      <></>
                    ),
                  )}
                </div>
                {/* <div>{`Candidate Answer: ${question.candidate_answers === null ? 'Not answered' : question.candidate_answers}`}</div>
                <div>{`Correct Answer: ${question.correct_value}`}</div> */}
              </>
            ),
          })
        })
      }
    }
  }

  return formattedData
}

const UserTestSummary = (props) => {
  useEffect(() => {
    props.setSelectedKey('user-test-summary')
  }, [props])

  const { id } = useParams()
  const [fetchUrl, setFetchUrl] = useState(`candidate_test_summary/${id}`)
  const { isLoading, serverError, apiData, fetchData } = useFetch(fetchUrl)

  const onChange = (key) => {
    console.log(key)
  }

  //percentage calculate
  const calculatePercentage = (score, weightage) => {
    if (weightage > 0) {
      return ((score / weightage) * 100).toFixed(2)
    }
    return 0
  }
  const percentage = apiData
    ? calculatePercentage(
        apiData.data.score,
        apiData.data.generated_question?.weightage,
      )
    : 0

  console.log(apiData)

  const items = [
    {
      key: '1',
      label: 'Performance',
      children: (
        <>
          <Card>
            <>
              <b>Score distribution</b> - {apiData?.data?.score}/
              {apiData?.data?.generated_question?.weightage} ({percentage}%)
            </>
          </Card>
          <Card style={{ marginTop: '16px' }} title="Candidate Summary">
            <Table
              columns={columns}
              expandable={{
                expandedRowRender: (record) => (
                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    {record.description}
                  </p>
                ),
              }}
              dataSource={formatData(apiData?.data)}
            />
          </Card>
        </>
      ),
    },
    {
      key: '2',
      label: 'Candidate Information',
      children: (
        <Card>
          <Typography.Title level={4}>Candidate Information</Typography.Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="First Name">
              {apiData?.data?.first_name}
            </Descriptions.Item>
            <Descriptions.Item label="Last Name">
              {apiData?.data?.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {apiData?.data?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Test Name">
              {apiData?.data?.test_name}
            </Descriptions.Item>
            <Descriptions.Item label="Allocation Date">
              {apiData?.data?.created_at}
            </Descriptions.Item>
            <Descriptions.Item label="Completion Date">
              {apiData?.data?.submission_date}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
  ]
  const handleDownload = async () => {
    try {
      const response = await fetch(`download_test_details/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf', // Ensure the server response type is correct
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok.')
      }

      const blob = await response.blob() // Get the blob from the response

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Test-Report.pdf`) // Set the default filename

      // Append link to the body
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading the file:', error)
    }
  }
  //share result
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)

  const handleShare = () => {
    setIsModalOpen(true)
  }

  const handleEditCancel = () => {
    resetFields()
    setIsModalOpen(false)
  }

  const submitShareEmail = (payload) => {
    const { data } = triggerFetchData('/share_test_details/', payload)
    message.success('Report shared successfully!')
    console.log(data)
  }

  const handleOk = () => {
    if (validateEmail(email)) {
      // handle the logic here
      submitShareEmail({ userTestId: id, shareEmailId: email })
      setIsModalOpen(false)
      resetFields()
    } else {
      setEmailError(true)
      message.error('Report not shared')
      //handle error logic
    }
  }

  const handleEmail = (e) => {
    setEmail(e.target.value)
    if (emailError) {
      setEmailError(false)
    }
  }

  const resetFields = () => {
    setEmail('')
    setEmailError(false)
  }
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <Layout.Content style={{ height: '100vh', padding: '1rem' }}>
      <Card title="Candidate Summary">
        <Row>
          <Col
            style={{
              alignSelf: 'center',
              margin: 10,
              borderRadius: '50%',
              backgroundColor: 'gray',
            }}
          >
            <Avatar
              size={50}
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
            />
          </Col>
          <Col style={{ marginLeft: 16 }}>
            <p style={{ fontWeight: 'bold', fontSize: '28px' }}>
              {apiData?.data?.name || 'Loading...'}
            </p>
            {/* <p>Senior Level</p> */}
          </Col>

          <Col
            offset={18}
            style={{
              alignSelf: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <Tooltip placement="top" title="Download Test Result">
              <label className="container">
                <input
                  checked="checked"
                  type="checkbox"
                  onClick={handleDownload}
                  readOnly
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#b21d21"
                  class="bi bi-download"
                  viewBox="0 0 16 16"
                >
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                </svg>
              </label>
            </Tooltip>
            <Tooltip placement="top" title="Share Test Result">
              <label className="container">
                <input
                  checked="checked"
                  type="checkbox"
                  readOnly
                  onClick={handleShare}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#b21d21"
                  className="bi bi-share"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
                </svg>
              </label>
            </Tooltip>
          </Col>
        </Row>
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </Card>
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleEditCancel}
        okText="Share"
      >
        <div className="share-result">
          <p>Please enter Email address to Share the Result!</p>
          <Input
            type="email"
            value={email}
            placeholder="example@email.com"
            onChange={handleEmail}
            style={{ width: '60%', borderColor: emailError ? 'red' : undefined }}
          />
          {emailError && <p style={{ color: 'red' }}>Please enter a valid email</p>}
        </div>
      </Modal>
    </Layout.Content>
  )
}

export default UserTestSummary
