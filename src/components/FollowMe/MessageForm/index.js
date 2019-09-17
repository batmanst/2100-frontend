import React, {useState, useEffect, useMemo} from 'react'
import { Form, Button, Row, Col, Container, InputGroup } from 'react-bootstrap'
import {useFollowMeContext} from '../../../contexts/FollowMe'
import {useStoreContext} from '../../../contexts/Store'
import { Link } from 'react-router-dom'
import Slider from '@material-ui/core/Slider'
import ms from 'ms'

import Dots from '../../Dots'
import Meme from '../../Meme'
import memeTypes from '../memeTypes'
import getPercentile from '../../../utils/percentile'
import {BigNumber, toDecimals, fromDecimals, weiDecimals} from '../../../utils'
import HoldersProfiles from '../HoldersProfiles'
import MessageCard from '../MessageCard'

import './style.scss'

const giftHintText = "I am gifting"
const giftRdedeemText = "To redeem"

function isEmpty(message){
  if (!message) return true
  return message.replace(/\s+/, '') === ''
}

const contentLevels = [
  {level: 0,  name: 'Mediocre', holderType: 'New holder'},
  {level: 5, name: 'Regular', holderType: 'Minnow'},
  {level: 50, name: 'Premium', holderType: 'Normie'},
  {level: 75, name: 'Exclusive', holderType: 'Whale'},
  {level: 95, name: 'Ultra Exclusive', holderType: 'Bearwhale'}
]

function ContentLevelSelect({ levels=[], current=0, onChange=()=>{}}){
  function handleChange(e){
    e.preventDefault()
    onChange(e.target.value)
  }

  const options = levels.map( (data, i) =>{
    return <option value={i}>{data.name}</option>
  })
  return (
    <select className="form-control content-level-select" value={current} onChange={handleChange}>
      {options}
    </select>
  )

}

function calcTimeToSee({levels=[], current=0, amounts=[], threshold}){
  amounts.sort(function (a, b) { return BigNumber(a).minus(BigNumber(b)).gt(0) ? 1 : -1 })
  console.log('--------------')
  console.log(amounts.length)
  amounts.forEach( amount => {
    console.log(toDecimals(amount))
  })
  console.log('--------------')
  levels.forEach( data => {
    let amount = BigNumber(1)
    if (data.level !== 0){
      amount = getPercentile(amounts, data.level, true)
    }
    data.amount = amount
  })
  // const threshold = levels[current].amount
  threshold = BigNumber(threshold)
  const blockReward = BigNumber("0.00021").times(weiDecimals)
  const blockTime = 15000
  const minBlock = 1
  console.log('--------')
  console.log('>',levels[current].name, levels[current].level)
  levels.forEach( data => {
    console.log(data.holderType, data.level, toDecimals(data.amount))
    let blocksToSee = BigNumber(threshold).minus(data.amount).div(blockReward)
    blocksToSee = threshold.eq(data.amount) ? BigNumber(0) : blocksToSee
    blocksToSee = blocksToSee.eq(0) && current === 0 ? BigNumber(1) : blocksToSee.lt(0) ? BigNumber(0) : blocksToSee
    const timeToSee = Math.ceil(blocksToSee.times(blockTime).toNumber())
    data.timeToSee = timeToSee === 0 ? "instant" : ms(timeToSee)
  })
  return levels
}

function ThresholdInput({defaultThreshold, onChange = ()=>{}}){
  return <input type='number' step="0.01" min="0" className="threshold-input" value={defaultThreshold} onChange={ (e) => onChange(e.target.value)} />
}

function Tab({currentTab, tabName, setTab}){
  function handleClick(e){
    e.preventDefault()
    setTab(tabName)
  }
  const isActive = currentTab === tabName
  return(
    <li className='nav-item' key={tabName}>
      <a
        className={`nav-link ${isActive && 'active'}`}
        onClick={handleClick}
        href="#"
      >
        {tabName}
      </a>
    </li>
  )
}

function Prepend({type, isHint = true}){
  switch (type){
    case 'Gift':
      const text = isHint ? giftHintText : giftRdedeemText
      return (
        <InputGroup.Prepend>
          <InputGroup.Text>{text}</InputGroup.Text>
        </InputGroup.Prepend>
      )
    default:
      return null
  }
}

function MemeSelect({memeTypes, memeType, onChange=()=>{}}){
  function handleChange(e){
    e.preventDefault()
    onChange(e.target.value)
  }

  const options = memeTypes.map( (data,i)=>{


    return <option value={i}>{data.emoji} {data.name}</option>
  })
  return (
    <select className="form-control meme-type-select" value={memeType} onChange={handleChange}>
      {options}
    </select>
  )
}

export default function MessageForm({onSubmitted, replyid}){
  const {query} = useStoreContext()

  let { api, isSignedIn, myToken, messages = {}, publicMessages = {}, followers = {}, actions } = useFollowMeContext()

  const myTokenName=query.getTokenName(myToken)

  const followerCount = Object.keys(followers).length
  const sliderMax =  getPercentile(Object.values(followers), contentLevels[3].level)
  const [submitting, setSubmitting] = useState(false)

  const [data, setData] = useState({})
  const { message, hint } = data
  const [error, setError] = useState()
  const [contentLevel, setContentLevel] = useState(0)

  const [threshold, setThreshold] = useState(fromDecimals("0.00021"))
  // const [threshold, setThreshold] = useState("1")
  const [recipientCount, setRecipientCount] = useState(0)
  const [recipients, setRecipients] = useState([])

  const hasToken = myToken != null
  const hasFollowers = myToken && followerCount > 0

  const isDisabled = !hasToken || submitting



  function changeData(e){
    const { id, value } = e.target
    setData({
      ...data,
      [id]: value
    })
  }

  async function handleSend(e){
    e.preventDefault()
    if (isEmpty(message)) return
    setSubmitting(true)
    const type = /meme/i.test(currentTab) ? `meme:${memeTypes[memeType].key}` : currentTab.toLowerCase()
    const _hint = /gift/i.test(currentTab) ? `${giftHintText} ${hint}` : hint
    const _message = /gift/i.test(currentTab) ? `${giftRdedeemText} ${message}` : message

    const resp = await actions.sendMessage(_message, _hint, threshold.toString(), type)
    setSubmitting(false)
    if (resp) {
      setData({})
      onSubmitted && onSubmitted(resp)
    }
  }

  function handleSetThreshold(val){
    let newThresh = BigNumber(val).times(weiDecimals)
    if (newThresh.eq(0)){
      newThresh = "1"
    }
    setThreshold(newThresh.toString())
  }

  // useEffect( () => {
  //   const holdings = Object.entries(followers)
  //   let count = hasFollowers ? holdings.length : 0
  //   let recipients = []
  //   let holdingSum = BigNumber(0)
  //   if (threshold != null){
  //     recipients = holdings.filter( ([address, amount]) => {
  //       holdingSum = holdingSum.plus(amount)
  //       return BigNumber(amount).gte(threshold)
  //     }).map( ([address]) => address )
  //     count = recipients.length
  //   }
  //   setRecipients(recipients)
  //   setRecipientCount(count)

  // }, [threshold, followers])


  // const timeToDecode = useMemo( ()=> {
  //   const sortedAmounts = Object.values(followers).filter( amount => BigNumber(amount).lt(threshold) ).sort(function (a, b) { return BigNumber(a).minus(BigNumber(b)).gt(0) ? 1 : -1 })
  //   const medianIndex =  Math.floor(sortedAmounts.length/2)
  //   const median = sortedAmounts[medianIndex] || "0"
  //   const blockReward = BigNumber("0.00021").times(weiDecimals)
  //   const blockTime = 15000
  //   const minBlock = 1
  //   let blocksToSee = BigNumber(threshold).minus(median).div(blockReward)
  //   blocksToSee = blocksToSee.lt(minBlock) ? BigNumber(minBlock) : blocksToSee
  //   const timeToSee = Math.ceil(blocksToSee.times(blockTime).toNumber())
  //   const convertedTime = ms(timeToSee || blockTime).replace(/m$/,' min.').replace(/s$/,' sec.')
  //   return `${convertedTime} for most to decode`

  // }, [Object.values(followers).join(''), threshold])

  // const tokenRequirement = (
  //   <div>
  //     <ThresholdInput defaultThreshold={toDecimals(threshold,15)} onChange={handleSetThreshold} /> ${myTokenName} required
  //     <div className="small text-muted">{timeToDecode}</div>
  //   </div>
  // )


  useEffect(()=>{
    calcTimeToSee({levels:contentLevels,current:contentLevel,amounts:Object.values(followers), threshold})
    // setThreshold(contentLevels[contentLevel].amount || "1")
  }, [threshold])

  const tokenRequirement = (
    <Container>
      <Row className='align-items-center'>
        <Col md="8">
          <Slider
             min={0.00021}
             max={Number(toDecimals(sliderMax,15))}
             step={0.00021}
             value={Number(toDecimals(threshold,15))}
             onChange={(e, val) => handleSetThreshold(val)}
            />
        </Col>
        <Col md="4 small">
          <Row>
            <Col md="12"><ThresholdInput defaultThreshold={toDecimals(threshold,15)} onChange={handleSetThreshold} /><span>${myTokenName} required</span>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col md="6 small">
          <ul className='holders-coda'>
            {contentLevels.map( data => {
              return (
                <li style={{cursor: 'pointer'}} onClick={()=> { setThreshold(data.amount) }} >{data.holderType}: {data.timeToSee || "Calculating"}</li>
              )
            })}
          </ul>
        </Col>
      </Row>
    </Container>
  )

  function PrivatePlaceHolder(type = 'Post'){
    switch(type){
      case 'Post':
        return 'Decodable Text'
      case 'Image':
        return 'Link to image'
      case 'Video':
        return 'Link to video'
      case 'Link':
        return 'Decodable Url'
      case 'Meme':
        return 'Bottom Text'
      case 'Gift':
        return 'DM me with the message I HODL YOU'
    }
  }

  function PublicPlaceHolder(type = 'Post'){
    switch(type){
      case 'Meme':
        return 'Top Text'
      case 'Gift':
        return 'a free T-shirt'
      default:
        return 'Public Hint'
    }
  }

  function PrivateControlType(type = 'Post'){
    switch(type){
      case 'Post':
        return 'textarea'
      default:
        return 'input'
    }
  }

  const tabNames = [
    'Post', 'Image', 'Video', 'Link', 'Meme', 'Gift'
  ]

  const [currentTab, setTab] = useState(tabNames[0])

  const tabs = tabNames.map( tabName => <Tab currentTab={currentTab} tabName={tabName} setTab={setTab} key={tabName} /> )

  let footerText = null

  // if (hasToken && hasFollowers && recipientCount === 0){
  //    footerText = 'Future holders'
  // } else if (hasToken) {
  //   footerText = <HoldersProfiles holders={recipients} prefix="Visible to " suffix=" right now"/>
  // } else {
  //   footerText = '0 holders'
  // }

  const publicHint = PublicPlaceHolder(currentTab)

  const [memeType, setMemeType] = useState(0)

  return (
        <div  className="message-form">
            { replyid && <div style={{width: '50%'}}><MessageCard {...{message: messages[replyid], myToken, token: query.getToken(messages[replyid].tokenid), isSignedIn, actions, canCopyUrl:false, canLinkToProfile:false, canComment: false, showFooter: false}} /></div> }

            <ul className='nav nav-pills mt-3 mb-5'>{tabs}</ul>

            { currentTab === 'Meme' && <MemeSelect memeTypes={memeTypes} memeType={memeType} onChange={setMemeType} key='meme-select'/>}

            <Form>
              <Form.Group controlId="hint" className='form-group-hint'>
                <Row>
                  <Col>
                    <InputGroup>
                      <Prepend type={currentTab} isHint={true} />
                      <Form.Control as="input" value={hint || ''} onChange={changeData} disabled={isDisabled ? 'disabled' : null} maxlength={75} placeholder={publicHint}/>
                    </InputGroup>
                    <Form.Label className='small'>
                        <i className='fas fa-eye' /> Everyone
                    </Form.Label>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group controlId="message">
                <Row>
                  <Col>
                    <InputGroup>
                      <Prepend type={currentTab} isHint={false} />
                      <Form.Control as={PrivateControlType(currentTab)} rows="6" value={message || ''} onChange={changeData} disabled={isDisabled ? 'disabled' : null} placeholder={PrivatePlaceHolder(currentTab)}/>
                    </InputGroup>
                    {/*<Form.Label className='small'>
                      <i className='fas fa-eye' /> {footerText}
                    </Form.Label>*/}
                  </Col>
                </Row>
              </Form.Group>

              { currentTab === "Meme" && <Meme toptext={hint} bottomtext={message} url={memeTypes[memeType].url} key='meme-image'/>}

              <Row className='align-items-center mt-4 mb-3'>
                <Col md='12'>
                  { hasToken ? tokenRequirement : <Link className="create-token-message" to={ isSignedIn ? "/manage" : '/' }><i class="fas fa-bolt"></i> {isSignedIn ? 'Create your token to' : 'Sign in to'} send messages</Link> }
                </Col>
              </Row>
              <Row>
                <Col md='12'>
                  <Button variant="primary" disabled={isDisabled || isEmpty(message) ? 'disabled' : null} type="submit" onSubmit={handleSend} onClick={handleSend}>
                    { submitting ? 'Sending' : 'Send' }
                  </Button>
                </Col>
              </Row>
            </Form>
      </div>
  )
}