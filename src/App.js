import React, { useRef } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { matchPath } from 'react-router'

import Main from './components/Main'
import Portfolio from './components/Portfolio'
import ProfilePage from './components/ProfilePage'
import SingleMessagePage from './components/SingleMessagePage'
import Onboarding from './components/Onboarding'
import Nav from './components/Nav'
import Breakpoints from './components/Breakpoints'
// import Wallet from './components/Wallet'
import Alerts from './components/Alerts'
import ErrorModal from './components/ErrorModal'
import Manage from './components/Manage'
import Admin from './components/Admin'
import BrowserClasses from './components/BrowserClasses'
import {Row, Col, Card} from 'react-bootstrap'
import Sidebar from './components/Sidebar'
import CreateMessageModal from './components/FollowMe/CreateMessageModal'
import AllocationModal from './components/AllocationModal'

import Discover from './components/Discover'
import history from './utils/history'

import { routeConfigs } from './utils'

import './App.scss'

function App(){
  const node = useRef()
  const onChangePage = () => node.current.scrollTop = 0
  return (
    <Router history={history}>
      <BrowserClasses>
        {/*<Breakpoints />*/}
        <div className='container-fluid'>
          <Row className='no-gutters'>
            <Col md='2' className='nav-column'>
              <Nav />
            </Col>
            <Col md='10'>
              <Switch>
                <Route path='/portfolio' exact component={Portfolio} />
                {/*<Route path='/wallet' exact component={Wallet} />*/}
                <Route path='/manage' exact component={Manage} />
                <Route path='/admin' exact component={Admin} />
                <React.Fragment>
                  <Row className='no-gutters main'>
                    <Col md='6' className='followme' ref={node}>
                        {/* follow me */}
                        <Switch>
                          <Route exact path='/:username([$]{1,1}[a-zA-Z0-9_]+)/:messageid' component={SingleMessagePage} />
                          <Route exact path='/:username([$]{1,1}[a-zA-Z0-9_]+)' component={ProfilePage} />
                          <Route render={ props => <Sidebar onChangePage={onChangePage} {...props} /> } />
                        </Switch>
                    </Col>
                    <Col md='6' className='discover'>
                      <Discover />
                    </Col>
                  </Row>
                </React.Fragment>
              </Switch>
            </Col>
          </Row>
        </div>
        <CreateMessageModal />
        <Alerts />
        <ErrorModal />
        <AllocationModal />
      </BrowserClasses>
    </Router>
  )
}

export default App
