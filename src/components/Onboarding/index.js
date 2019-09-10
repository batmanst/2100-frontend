import React from 'react';
import {Modal,Button,Col,Row,Carousel} from 'react-bootstrap';
import ProfileImage from '../ProfileImage';
import './style.scss';

function HiddenMessageExample(){
  const message_id = '0f2e0687-65d7-4372-a18b-0270b94abbc9'
  const id = message_id.replace(/-/g,'').toUpperCase().split('').map( c => <span className={`char-${c}`}>{c} </span>)

  return(
    <div className='hidden-message-block'>
      <div className='pretend-encryption'>
        {id} {id}
      </div>
    </div>
  )
}

function OnboardingTwitterProfile({token}){
  return(
  <div style={{
    width: '5rem', 
    textAlign: 'center', 
    fontWeight: 'bold',
    marginRight: '1rem'
  }}>
    <ProfileImage token={token} style={{width: '5rem'}} />
    <div>2100</div>
  </div>
  )
}

function Section1(){
  return(
      <div className='section section1'>
      <Row>
        <Col md='12'><img src='img/logo3.png' /></Col>
      </Row>
      <Row>
        <Col md='12'>
          <h3>Welcome to 2100</h3>
        </Col>
      </Row>
      </div>
    )
}

function Section2(){
  return(
          <div className='section section2'>
            <Row>
              <Col md='2'>
                <OnboardingTwitterProfile token={'benjmnr'}/>
              </Col>
              <Col md='2'>
                <OnboardingTwitterProfile token={'brttb'}/>
              </Col>
              <Col md='2'>
                <OnboardingTwitterProfile token={'vitalikbuterin'}/>
              </Col>
              <Col md='2'>
                <OnboardingTwitterProfile token={'bwertz'}/>
              </Col>
              <Col md='2'>
                <OnboardingTwitterProfile token={'angelatytran'}/>
              </Col>
              <Col md='2'>
                <OnboardingTwitterProfile token={'brttb'}/>
              </Col>
            </Row>
            <Row>
              <Col md='12'>
                <h3>Your Twitter account has 2100 tokens</h3>
              </Col>
            </Row>
          </div>
    )
}

function Section3(){
  return(
      <div className='section section3'>
        <Row>
          <Col md='12'>
            <img src='img/group-stake.png' style={{width: '33%'}}/>
          </Col>
        </Row>
        <Row>
          <Col md='12'>
            <h3>Others stake DAI to earn your tokens because...</h3>
          </Col>
        </Row>
      </div>
    )
}

export default function Onboarding(){
    return (
      <Modal
        aria-labelledby="contained-modal-title-vcenter"
        show={true}
        className='onboarding'
      >
        <Modal.Body>
        <div className='container'>
          <Row className='onboarding-body'>
            <Col md='12'>
              <Section1 />
              <Section2 />
              <Section3 />
{/*            
            <Section2 />*/}
{/*            <Section3 />*/}


           {/* <div className='section section3'>
              <h4>Let's try it out</h4>
              <p>Below is a hidden message from <span>$vitalik</span>. <br/>Add some stake and earn enough $vitalik to reveal the message.</p>
              <div>
                <img src='../img/dai.png' style={{ width: '14px','vertical-align': 'baseline' }} /> 
                10 DAI 
                [][][][][][][][][]
              </div>
              <div>0 $vitalik</div>
                <HiddenMessageExample />
            </div>
            <div className='section section4'>
            <h4>Great job!</h4>
            <p>You're such an efficient capital allocator that we've credited 10 testnet DAI to your account.</p>
            <a href='/'>Sign in with Metamask</a>
            <p>to claim it and be among the first to experience 2100.</p>
            </div>*/}
            </Col>
          </Row>
        </div>
        </Modal.Body>
      </Modal>
  )
}