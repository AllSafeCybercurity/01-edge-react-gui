// @flow

import * as React from 'react'
import { Image, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { sprintf } from 'sprintf-js'

import { SPECIAL_CURRENCY_INFO } from '../../constants/WalletAndCurrencyConstants.js'
import s from '../../locales/strings.js'
import { connect } from '../../types/react-redux.js'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'
import { EdgeText } from './EdgeText.js'
import { ButtonBox } from './ThemedButtons.js'

const allowedCurrencies = Object.keys(SPECIAL_CURRENCY_INFO).filter(code => !!SPECIAL_CURRENCY_INFO[code].displayBuyCrypto)

type OwnProps = {
  // eslint-disable-next-line react/no-unused-prop-types
  walletId: string,
  currencyCode: string
}

type StateProps = {
  currencyName: string,
  currencyImage?: string
}

type Props = OwnProps & StateProps & ThemeProps

class BuyCryptoComponent extends React.PureComponent<Props> {
  render() {
    const { currencyCode, currencyImage, currencyName, theme } = this.props
    const styles = getStyles(theme)

    return (
      <>
        {allowedCurrencies.includes(currencyCode) && (
          <ButtonBox onPress={Actions.pluginBuy} paddingRem={1}>
            <View style={styles.container}>
              <View style={styles.buyCrypto}>
                <Image style={styles.buyCryptoImage} source={{ uri: currencyImage }} resizeMode="cover" />
                <EdgeText style={styles.buyCryptoText}>{sprintf(s.strings.transaction_list_buy_crypto_message, currencyName)}</EdgeText>
              </View>
            </View>
          </ButtonBox>
        )}
        <View style={styles.noTransactionContainer}>
          <EdgeText style={styles.noTransactionText}>{s.strings.transaction_list_no_tx_yet}</EdgeText>
        </View>
      </>
    )
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.rem(1),
    backgroundColor: theme.tileBackground
  },
  buyCrypto: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  buyCryptoImage: {
    width: theme.rem(2.25),
    height: theme.rem(2.25),
    marginVertical: theme.rem(0.25)
  },
  buyCryptoText: {
    fontFamily: theme.fontFaceBold,
    marginVertical: theme.rem(0.25)
  },
  noTransactionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.rem(0.5)
  },
  noTransactionText: {
    fontSize: theme.rem(1.25)
  }
}))

export const BuyCrypto = connect<StateProps, {}, OwnProps>(
  (state, ownProps) => {
    const guiWallet = state.ui.wallets.byId[ownProps.walletId]

    return {
      currencyName: guiWallet.currencyNames[ownProps.currencyCode],
      currencyImage: guiWallet.symbolImage
    }
  },
  dispatch => ({})
)(withTheme(BuyCryptoComponent))
