import React, { useState } from 'react'
import CodeEditor from '../components/CodeEditor'
import OutputWindow from '../components/OutputWindow'
import OutputDetails from '../components/OutputDetails'
import CustomInput from '../components/CustomInput'
import { Select, Row, Col, Button, message, Space, Typography } from 'antd'
import { languageOptions } from '../Utils/constants'
import axios from 'axios'
import { triggerFetchData } from '../Utils/Hooks/useFetchAPI'

const pythonDefault = `a,b=[int(x) for x in input().split()]
print(a+b)`

const TestCodeEditor = () => {
  const [code, setCode] = useState(pythonDefault)
  const [customInput, setCustomInput] = useState('')
  const [outputDetails, setOutputDetails] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [theme, setTheme] = useState('cobalt')
  const [language, setLanguage] = useState([
    { id: 5, label: 'Python', name: 'Python', value: 'Python' },
  ])

  const onSelectChange = (sl) => {
    const selectedLanguage = languageOptions.filter(
      (item) => item.value.toLowerCase() == sl.toLowerCase(),
    )
    setLanguage(selectedLanguage)
  }

  const onChange = (action, data) => {
    switch (action) {
      case 'code': {
        setCode(data)
        console.log(code)
        break
      }
      default: {
        console.warn('case not handled!', action, data)
      }
    }
  }

  const handleCompile = () => {
    setProcessing(true)
    const encodedParams = new URLSearchParams()
    encodedParams.set('LanguageChoice', language[0].id)
    encodedParams.set('Program', code)
    encodedParams.set('Input', customInput)
    let user = null
    if ('user_details' in localStorage) {
      user = JSON.parse(localStorage.getItem('user_details'))['id']
    }
    let data = {
      LanguageChoice: language[0].id.toString(),
      Program: code,
      Input: customInput,
      q_type: 2,
    }

    const options = {
      method: 'POST',
      url: process.env.REACT_APP_RAPID_API_URL,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
        'X-RapidAPI-Host': process.env.REACT_APP_RAPID_API_HOST,
      },
      data: data,
      userTestId: user,
      q_type: 2,
    }

    axios
      .request(options)
      .then(function (response) {
        console.log('res.data', response.data)
        setOutputDetails(response.data)
        setProcessing(false)
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err
        console.log('error', error)
        setProcessing(false)
        setOutputDetails(err.response.data)
        console.log(error)
      })
    triggerFetchData(`save_candidate_answer/`, options)
      .then((data) => {
        console.log('response data', data)
      })
      .catch((reason) => message.error(reason))
  }

  function handleThemeChange(th) {
    // We will come to the implementation later in the code
  }

  return (
    <>
      <Space
        direction="vertical"
        size="middle"
        style={{ display: 'flex', marginTop: '1rem', marginLeft: '1rem' }}
      >
        <Row>
          <Typography.Text style={{ alignSelf: 'center' }}>
            Select your language:{' '}
          </Typography.Text>
          <Select
            style={{ width: '20%', marginLeft: '1rem' }}
            placeholder={`Filter By Category`}
            options={languageOptions.map((lang) => {
              return { name: lang.name, value: lang.value }
            })}
            //   styles={customStyles}
            defaultValue={language[0].value.toLowerCase()}
            onChange={(selectedOption) => onSelectChange(selectedOption)}
          />
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={16}>
            <CodeEditor
              code={code}
              onChange={onChange}
              language={language[0].value}
              theme="Cobalt"
            />
          </Col>

          <Col span={6}>
            <OutputWindow outputDetails={outputDetails} />
            <CustomInput customInput={customInput} setCustomInput={setCustomInput} />

            <Button
              style={{ marginTop: '1rem' }}
              type="primary"
              onClick={handleCompile}
              disabled={!code || processing}
            >
              {processing ? 'Processing...' : 'Compile and Execute'}
            </Button>
            {outputDetails && <OutputDetails outputDetails={outputDetails} />}
          </Col>
        </Row>
      </Space>
    </>
  )
}

export default TestCodeEditor
