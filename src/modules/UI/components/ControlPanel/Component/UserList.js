import React, { Component } from 'react'
import { Alert, Platform, View, ScrollView, TouchableNativeFeedback, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { Text, Icon } from 'native-base'
import _ from 'lodash'

import styles from '../style'
const platform = Platform.OS

import * as CORE_SELECTORS from '../../../../Core/selectors.js'
import * as CONTEXT_API from '../../../../Core/Context/api.js'

class UserListComponent extends Component {

  _handlePressUserSelect = (id) => {}

  _handleDeleteLocalAccount = (username) => {
    this.props.deleteLocalAccount(username)
  }

  _handlePressDeleteLocalAccount = (username) => {
    return Alert.alert(
      'Delete Account',
      "Delete '" + username + "' on this device? This will disable access via PIN. If 2FA is enabled on this account, this device will not be able to login without 2FA reset which takes 7 days",
      [
        {text: 'No', style: 'cancel'},
        {text: 'Yes', onPress: () => this._handleDeleteLocalAccount(username)}
      ]
    )
  }

  rows = () => {
    return _.map(this.props.usernames, (username, index) => {
      if (platform === 'android') {
        return (
          <View key={index} style={styles.userList.row}>
            <TouchableNativeFeedback onPress={e => this._handlePressUserSelect(username)} background={TouchableNativeFeedback.SelectableBackground()} >
              <Text style={styles.userList.text}>{username}</Text>
            </TouchableNativeFeedback>
            <TouchableOpacity style={styles.userList.icon} onPress={e => this._handlePressDeleteLocalAccount(username)}>
              <Icon name='close' />
            </TouchableOpacity>
          </View>
        )
      }
      if (platform !== 'android') {
        return (
          <View key={index} style={styles.userList.row}>
            <TouchableOpacity style={styles.userList.text} onPress={e => this._handlePressUserSelect(username)}>
              <Text>{username}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userList.icon} onPress={e => this._handlePressDeleteLocalAccount(username)}>
              <Icon name='close' />
            </TouchableOpacity>
          </View>
        )
      }
    })
  }

  render () {
    return (
      <ScrollView style={styles.userList.container}>
        {this.rows()}
      </ScrollView>
    )
  }
}

const mapStateToProps = state => ({
  usernames: CORE_SELECTORS.getUsernames(state)
})
const mapDispatchToProps = dispatch => ({
  deleteLocalAccount: (username) => { dispatch(CONTEXT_API.deleteLocalAccount(username)) }
})

export default connect(mapStateToProps, mapDispatchToProps)(UserListComponent)
