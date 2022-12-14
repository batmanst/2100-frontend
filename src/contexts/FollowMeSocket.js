import Socket from 'socket.io-client'

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect
} from 'react'

export const FollowMeSocketContext = createContext()

export function useFollowMeSocketContext () {
  return useContext(FollowMeSocketContext)
}

export const FollowMeSocketContextConsumer = FollowMeSocketContext.Consumer

export default function FollowMeSocketProvider ({ children, host }) {
  const [io, setIo] = useState()

  const [network, setNetwork] = useState({
    loading: true,
    connected: false,
    error: false
  })

  useEffect(() => {
    // when io is assigned, we need to add connection handlers immediately; can't wait for react cycle to update
    let _io = io

    if (!_io) {
      _io = Socket(host)
      setIo(_io)
      setNetwork({ loading: false, connected: false, error: false })
    }

    _io.on('connect', () => {
      console.log()
      console.log('followme io.connect')

      // reconnect will handle setting connected: true
      return setNetwork( prevNetwork => {
        if (prevNetwork.reconnected) return prevNetwork
        return { loading: false, connected: true, error: false }
      })
      console.log('followme io.connect after reconnected')
    })
    _io.on('connect_error', error => {
      console.log()
      console.log('followme io.connect_error')

      setNetwork(prevNetwork => {
        return { loading: false, connected: false, disconnected: prevNetwork.disconnected, error: error.message }
      })
    })
    _io.on('error', error => {
      console.log()
      console.log('followme io.error')

      setNetwork(prevNetwork => {
        return { loading: false, connected: false, disconnected: prevNetwork.disconnected, error: error.message }
      })
    })
    _io.on('disconnect', reason => {
      console.log()
      console.log('followme io.disconnect')

      setNetwork({ loading: false, disconnected: true, connected: false, error: reason })
      if (reason === 'io server disconnect') {
        io.connect()
      }
    })
    _io.on('reconnect', e => {
      console.log('followme io.reconnect')
      setNetwork({ loading: false, connected: true, reconnected: true, error: false })
    })
  }, [])

  useEffect(() => {
    if (!network.loading) return
    const timeoutId = setTimeout(() => {
      if (network.loading) {
        setNetwork({
          loading: false,
          connected: false,
          error: 'Network failed to load'
        })
      }
    }, 5000)
    return () => clearTimeout(timeoutId)
  }, [network.loading])

  const contextValue = useMemo(() => {
    function call (path) {
      return (action, ...args) => {
        return new Promise((resolve, reject) => {
          io.emit(path, action, args, (err, result) => {
            if (err) return reject(err)
            resolve(result)
          })
        })
      }
    }

    function listen (path, cb) {
      return io.on(path, cb)
    }
    function stop (path) {
      return io.off(path)
    }

    const reqresp = {
      auth: call('auth'),
      public: call('public'),
      admin: call('admin'),
      system: call('system'),
      private: call('private')
    }
    return { network, call, listen, stop, ...reqresp }
  }, [network])

  return (
    <FollowMeSocketContext.Provider value={contextValue}>
      {children}
    </FollowMeSocketContext.Provider>
  )
}
