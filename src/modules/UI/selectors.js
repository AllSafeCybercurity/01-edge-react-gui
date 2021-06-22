// @flow

import { type EdgeCurrencyWallet, type EdgeDenomination } from 'edge-core-js'

import { formatNumber } from '../../locales/intl.js'
import { type RootState } from '../../types/reduxTypes.js'
import type { GuiDenomination, GuiWallet } from '../../types/types.js'
import { convertNativeToExchange, getCurrencyInfo } from '../../util/utils.js'

export function getSelectedWallet(state: RootState): GuiWallet {
  return state.ui.wallets.byId[state.ui.wallets.selectedWalletId]
}

export const getActiveWalletCurrencyCodes = (state: RootState) => {
  const { account } = state.core
  const { activeWalletIds, currencyWallets } = account
  const currencyCodesMap = activeWalletIds.reduce((map, id) => {
    const wallet = currencyWallets[id]
    if (!wallet) return map

    map[wallet.currencyInfo.currencyCode] = true
    return map
  }, {})
  const currencyCodes: string[] = Object.keys(currencyCodesMap)
  return currencyCodes
}

export const getActiveWalletCurrencyInfos = (state: RootState) => {
  const currencyInfos = []
  const { account } = state.core
  const { currencyConfig = {} } = account
  const activeCurrencyCodes = getActiveWalletCurrencyCodes(state)
  for (const pluginId of Object.keys(currencyConfig)) {
    const info = currencyConfig[pluginId].currencyInfo
    if (activeCurrencyCodes.includes(info.currencyCode)) {
      currencyInfos.push(info)
    }
  }
  return currencyInfos
}

export const getDefaultDenomination = (state: RootState, currencyCode: string): EdgeDenomination => {
  const { allCurrencyInfos } = state.ui.settings.plugins
  const currencyInfo = getCurrencyInfo(allCurrencyInfos, currencyCode)
  if (currencyInfo) return currencyInfo[0]
  const settings = state.ui.settings
  const currencySettings = settings[currencyCode]
  const defaultMultiplier = currencySettings.denomination
  const denomination = currencySettings.denominations.find(denom => denom.multiplier === defaultMultiplier)
  if (!denomination) throw new Error('Edge: Denomination not found. Possible invalid currencyCode.')
  return denomination
}

export const getTokenExchangeDenomination = (state: RootState, currencyCode: string, specificWallet?: GuiWallet): GuiDenomination => {
  const { customTokens } = state.ui.settings
  const walletId = specificWallet ? specificWallet.id : state.ui.wallets.selectedWalletId
  const wallet = state.ui.wallets.byId[walletId]
  if (wallet.allDenominations[currencyCode]) {
    for (const key of Object.keys(wallet.allDenominations[currencyCode])) {
      const denomination = wallet.allDenominations[currencyCode][key]
      if (denomination.name === currencyCode) return denomination
    }
  } else {
    const customToken = customTokens.find(item => item.currencyCode === currencyCode)
    if (customToken && customToken.denomination && customToken.denomination[0]) {
      const denomination = customToken.denominations[0]
      return denomination
    }
  }
  throw new Error('Edge: Denomination not found. Possible invalid currencyCode.')
}

export const getExchangeRate = (state: RootState, fromCurrencyCode: string, toCurrencyCode: string): number => {
  const exchangeRates = state.exchangeRates
  const rateKey = `${fromCurrencyCode}_${toCurrencyCode}`
  const rate = exchangeRates[rateKey] ? exchangeRates[rateKey] : 0
  return rate
}

export const convertCurrency = (state: RootState, fromCurrencyCode: string, toCurrencyCode: string, amount: number = 1) => {
  const exchangeRate = getExchangeRate(state, fromCurrencyCode, toCurrencyCode)
  const convertedAmount = amount * exchangeRate
  return convertedAmount
}

const convertCurrencyWithoutState = (exchangeRates: { [string]: number }, fromCurrencyCode: string, toCurrencyCode: string, amount: number = 1) => {
  const rateKey = `${fromCurrencyCode}_${toCurrencyCode}`
  const exchangeRate = exchangeRates[rateKey] ? exchangeRates[rateKey] : 0
  const convertedAmount = amount * exchangeRate
  return convertedAmount
}

export const convertCurrencyFromExchangeRates = (exchangeRates: { [string]: number }, fromCurrencyCode: string, toCurrencyCode: string, amount: number) => {
  if (!exchangeRates) return 0 // handle case of exchange rates not ready yet
  const rateKey = `${fromCurrencyCode}_${toCurrencyCode}`
  const rate = exchangeRates[rateKey]
  const convertedAmount = amount * rate
  return convertedAmount
}

export const calculateWalletFiatBalanceWithoutState = (wallet: GuiWallet, currencyCode: string, settings: Object, exchangeRates: { [string]: number }) => {
  let fiatValue = 0 // default to zero if not calculable
  const nativeBalance = wallet.nativeBalances[currencyCode]
  if (!nativeBalance || nativeBalance === '0') return '0'
  const denominations = settings[currencyCode].denominations
  const exchangeDenomination = denominations.find(denomination => denomination.name === currencyCode)
  if (!exchangeDenomination) return '0'
  const nativeToExchangeRatio: string = exchangeDenomination.multiplier
  const cryptoAmount: number = parseFloat(convertNativeToExchange(nativeToExchangeRatio)(nativeBalance))
  fiatValue = convertCurrencyWithoutState(exchangeRates, currencyCode, wallet.isoFiatCurrencyCode, cryptoAmount)
  return formatNumber(fiatValue, { toFixed: 2 }) || '0'
}

export const calculateWalletFiatBalanceUsingDefaultIsoFiat = (
  wallet: GuiWallet,
  currencyCode: string,
  settings: Object,
  exchangeRates: { [string]: number }
) => {
  const nativeBalance = wallet.nativeBalances[currencyCode]
  if (!settings[currencyCode]) return 0
  const denominations = settings[currencyCode].denominations
  if (!nativeBalance || nativeBalance === '0' || !denominations) return 0
  const exchangeDenomination = denominations.find(denomination => denomination.name === currencyCode)
  if (!exchangeDenomination) return 0
  const nativeToExchangeRatio: string = exchangeDenomination.multiplier
  const cryptoAmount: number = parseFloat(convertNativeToExchange(nativeToExchangeRatio)(nativeBalance))
  return convertCurrencyWithoutState(exchangeRates, currencyCode, settings.defaultIsoFiat, cryptoAmount) || 0
}

export const convertNativeToExchangeRateDenomination = (settings: Object, currencyCode: string, nativeAmount: string): string => {
  const denominations = settings[currencyCode].denominations
  const exchangeDenomination = denominations.find(denomination => denomination.name === currencyCode)
  if (!exchangeDenomination || !nativeAmount || nativeAmount === '0') return '0'
  const nativeToExchangeRatio: string = exchangeDenomination.multiplier
  return convertNativeToExchange(nativeToExchangeRatio)(nativeAmount)
}

export const findWalletByFioAddress = async (state: RootState, fioAddress: string): Promise<EdgeCurrencyWallet | null> => {
  const fioWallets: EdgeCurrencyWallet[] = state.ui.wallets.fioWallets

  if (fioWallets && fioWallets.length) {
    for (const wallet: EdgeCurrencyWallet of fioWallets) {
      const fioAddresses: string[] = await wallet.otherMethods.getFioAddressNames()
      if (fioAddresses.length > 0) {
        for (const address of fioAddresses) {
          if (address.toLowerCase() === fioAddress.toLowerCase()) {
            return wallet
          }
        }
      }
    }

    return null
  } else {
    return null
  }
}
