// @flow

import * as React from 'react'
import { AppState } from 'react-native'

import { logoutRequest } from '../../actions/LoginActions.js'
import { connect } from '../../types/react-redux.js'

type AppStateType = 'active' | 'background' | 'inactive'

type State = {
  timestamp: Date,
  appState: AppStateType
}

type StateProps = {
  autoLogoutTimeInSeconds: ?number,
  loginStatus: boolean
}
type DispatchProps = {
  logout: () => void
}
type Props = StateProps & DispatchProps

class AutoLogoutComponent extends React.Component<Props, State> {
  state = {
    timestamp: new Date(),
    appState: 'active'
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = (nextAppState: AppStateType) => {
    console.log(`APP STATE CHANGED ${this.state.appState} -> ${nextAppState}`)
    const newTimestamp = new Date()
    const oldTimeStamp = this.state.timestamp
    const durationInSeconds = this.props.autoLogoutTimeInSeconds || Infinity
    if (this.foregrounded(nextAppState) && this.props.loginStatus && this.isTimeExpired(durationInSeconds, newTimestamp, oldTimeStamp)) {
      this.props.logout()
    }

    this.setState(state => ({
      ...state,
      timestamp: newTimestamp,
      appState: nextAppState
    }))
  }

  foregrounded(nextAppState: AppStateType): boolean {
    return this.state.appState === 'background' && nextAppState === 'active'
  }

  backgrounded(nextAppState: AppStateType): boolean {
    return this.state.appState === 'background' && nextAppState !== 'active'
  }

  isTimeExpired(durationInSeconds: number, newTimestamp: Date, oldTimeStamp: Date): boolean {
    const differenceInMilliseconds: number = newTimestamp - oldTimeStamp
    const differenceInSeconds: number = differenceInMilliseconds / 1000
    return differenceInSeconds > durationInSeconds
  }

  render() {
    return null
  }
}

export const AutoLogout = connect<StateProps, DispatchProps, {}>(
  state => ({
    loginStatus: state.ui.settings.loginStatus ?? false,
    autoLogoutTimeInSeconds: state.ui.settings.autoLogoutTimeInSeconds
  }),
  dispatch => ({
    logout() {
      return dispatch(logoutRequest())
    }
  })
)(AutoLogoutComponent)
