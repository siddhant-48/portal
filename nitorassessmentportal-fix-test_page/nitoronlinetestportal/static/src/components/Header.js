import React from 'react'
import { Layout, Menu, Image, Row, Col, Button } from 'antd'
import { withRouter, useHistory, Link } from 'react-router-dom'
import { LoginOutlined } from '@ant-design/icons'
import { LogoutAPI } from '../Utils/Hooks/useFetchAPI'
import { message } from 'antd'
import PropTypes from 'prop-types'

import NitorLogo from '../assets/Nitor_white_logo.png'

const Header = (props) => {
  const history = useHistory()

  const logOutUser = async () => {
    const res = await LogoutAPI()
    if (res.status === 200) {
      localStorage.removeItem('authdata')
      message.success(res.data.message)
      history.push('/')
      // Refresh the app
      window.location.reload();
    } else {
      message.error('Something went wrong!')
    }
    props.setSelectedKey('dashboard')
  }

  //active path
  const getSelectedKey = () => {
    const path = history.location.pathname
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/create-test')) return 'create-test'
    if (path.startsWith('/questions')) return 'questions'
    if (path.startsWith('/assign-test')) return 'assign-test'
    if (path.startsWith('/user-submissions')) return 'user-submissions';
    // if (path.startsWith('/use-test-summary')) return 'use-test-summary'
    return 'dashboard'
  }

  return (
    <Layout.Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
      }}
    >
      <Row>
        <Col span={2}>
          <Image src={NitorLogo} alt="Nitor Logo" width={100} preview={false} />
        </Col>
        {history.location.pathname.includes('/screening') ? null : (
          <>
            <Col span={21}>
              <Menu theme="dark" mode="horizontal" selectedKeys={[getSelectedKey()]}>
                <Menu.Item key="dashboard">
                  <span>Dashboard</span>
                  <Link to="/dashboard" />
                </Menu.Item>
                <Menu.Item key="create-test">
                  <span>Test Details</span>
                  <Link to="/create-test" />
                </Menu.Item>
                <Menu.Item key="questions">
                  <span>Questions</span>
                  <Link to="/questions" />
                </Menu.Item>
                <Menu.Item key="assign-test">
                  <span>Assign Test</span>
                  <Link to="/assign-test" />
                </Menu.Item>
                <Menu.Item key="user-submissions">
                  <span>User Submissions</span>
                  <Link to="/user-submissions" />
                </Menu.Item>
                {/* <Menu.Item key="use-test-summary">
                  <span>User Test Summary</span>
                  <Link to="/use-test-summary" />
                </Menu.Item> */}
              </Menu>
            </Col>
            <Col span={1} flex="none">
              <Button
                type="primary"
                shape="round"
                icon={<LoginOutlined size="small" />}
                onClick={() => logOutUser(history)} // took this event outside the icon
              />
            </Col>
          </>
        )}
      </Row>
    </Layout.Header>
  )
}

Header.propTypes = {
  selectedKey: PropTypes.string,
  setSelectedKey: PropTypes.func.isRequired,
}

Header.defaultProps = {
  selectedKey: 'dashboard',
}

export default withRouter(Header)