import dateFormat from "dateformat"
import { UpdatedPositionAndLeverageResult } from "src/Dealer"
import { OrderStatus, FundTransferStatus, TradeCurrency } from "src/ExchangeTradingType"
import { Result } from "src/Result"

const DATE_FORMAT_STRING = "yyyymmddHHMMss"

function getValidFetchDepositAddressResponse() {
  //   console.log("Called: getValidFetchDepositAddressResponse()")
  const datetime = dateFormat(new Date(), DATE_FORMAT_STRING)
  const address = `bc1q00exchange00000000000000000000000000datetime${datetime}`
  return {
    code: "0",
    data: [
      {
        chain: "BTC-Bitcoin",
        ctAddr: "",
        ccy: "BTC",
        to: "18",
        addr: address,
        // addr: addr,
        selected: true,
      },
    ],
    msg: "",
  }
}

function getValidWithdrawResponse(id: string, currency, amountInBtc) {
  console.log("Called: getValidWithdrawResponse()")
  return {
    id: id,
    status: FundTransferStatus.Requested,
    info: {
      code: "0",
      msg: "",
      data: [
        {
          amt: amountInBtc,
          wdId: id,
          ccy: currency,
          chain: "BTC-Bitcoin",
        },
      ],
    },
  }
}

function getValidCreateMarketOrderResponse(id: number) {
  console.log(`Called: getValidCreateMarketOrderResponse(id=${id})`)
  return { id: `${id}` }
}

function getValidFetchOrderResponse(status: OrderStatus) {
  console.log("Called: getValidFetchOrderResponse()")
  return { status: status }
}

function getValidFetchBalanceResponse(balance: number) {
  //   console.log("Called: getValidFetchBalanceResponse()")
  return {
    info: {
      data: [
        {
          totalEq: `${balance}`,
        },
      ],
    },
  }
}

function getValidFetchPositionResponse(
  last: number,
  notionalUsd: number,
  margin: number,
) {
  //   console.log("Called: getValidFetchPositionResponse()")
  return {
    last: `${last}`,
    notionalUsd: `${notionalUsd}`,
    margin: `${margin}`,
  }
}

function getValidFetchTickerResponse(instrumentId: string, last: number) {
  //   console.log(`Called: getValidFetchTickerResponse(${instrumentId}, ${last})`)
  return {
    symbol: `${instrumentId}`,
    last: last,
    info: {
      instId: `${instrumentId}`,
      last: `${last}`,
    },
  }
}

function getValidPublicGetPublicInstrumentsResponse({ instType, instId }) {
  console.log("Called: getValidPublicGetPublicInstrumentsResponse()")
  const contractValue = 100
  const contractMinimumSize = 1
  const contractValueCurrency = TradeCurrency.USD
  return {
    code: "0",
    data: [
      {
        ctVal: `${contractValue}`,
        minSz: `${contractMinimumSize}`,
        ctValCcy: `${contractValueCurrency}`,
        instId: `${instId}`,
        instType: `${instType}`,
      },
    ],
    msg: "",
  }
}

export class OkexExchangeMockBuilder {
  private exchangeMockObject
  private walletMockObject

  private updatePositionSkipped
  private expectPositionUpdatedOk
  private expectLeverageUpdatedOk

  constructor() {
    this.exchangeMockObject = {
      checkRequiredCredentials: jest.fn(),
      fetchTicker: jest.fn(),
      fetchPosition: jest.fn(),
      fetchBalance: jest.fn(),
      publicGetPublicInstruments: jest.fn(),
      createMarketOrder: jest.fn(),
      fetchOrder: jest.fn(),
      withdraw: jest.fn(),
    }

    this.exchangeMockObject.checkRequiredCredentials.mockReturnValue(true)

    this.walletMockObject = {
      getWalletUsdBalance: jest.fn(),
      getWalletOnChainDepositAddress: jest.fn(),
      payOnChain: jest.fn(),
    }
  }

  public getExchangeMockObject() {
    return this.exchangeMockObject
  }

  public getWalletMockObject() {
    return this.walletMockObject
  }

  public mockThis(
    lastPriceInUsd: number,
    liabilityInUsd: number,
    notionalUsd: number,
    marginInBtc: number,
    totalEquity: number,
    hasMinimalLiability: boolean,
    isOrderExpected: boolean,
    isOrderSizeOk: boolean,
    orderId: number,
    firstOrderStatus: OrderStatus,
    numberFetchIteration: number,
    lastOrderStatus: OrderStatus,

    isFundTransferExpected: boolean,
    isTransferWithdraw: boolean,

    updatePositionSkipped: boolean,
    expectPositionUpdatedOk: boolean,
    expectLeverageUpdatedOk: boolean,
    // instrumentId: SupportedInstrument,
  ) {
    this.updatePositionSkipped = updatePositionSkipped
    this.expectPositionUpdatedOk = expectPositionUpdatedOk
    this.expectLeverageUpdatedOk = expectLeverageUpdatedOk
    // Position Loop
    //
    // exchange.fetchTicker()
    // wallet.getWalletUsdBalance()
    //
    // If hasMinimalLiability
    //  exchange.fetchPosition()
    //  exchange.fetchBalance()
    //  If order expected
    //      exchange.publicGetPublicInstruments()
    //      if order size ok
    //          exchange.createMarketOrder()
    //          exchange.fetchOrder()           x this.numberFetchIteration
    //          exchange.fetchPosition()
    //          exchange.fetchBalance()

    // Collateral Loop
    //
    // wallet.getWalletOnChainDepositAddress()
    // exchange.fetchPosition()
    // exchange.fetchBalance()
    //
    // If isFundTransferExpected
    //     If isTransferWithdraw
    //         exchange.withdraw()
    //     Else // deposit
    //         exchange.fetchDepositAddress()
    //         wallet.payOnChain()

    // Position Loop
    this.exchangeMockObject.fetchTicker.mockImplementationOnce((instrumentId: string) => {
      return getValidFetchTickerResponse(instrumentId, lastPriceInUsd)
    })
    this.walletMockObject.getWalletUsdBalance.mockImplementationOnce(
      (): Result<number> => {
        const amount = -liabilityInUsd
        return { ok: true, value: amount }
      },
    )

    if (hasMinimalLiability) {
      this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
        return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
      })
      this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
        return getValidFetchBalanceResponse(totalEquity)
      })
      if (isOrderExpected) {
        this.exchangeMockObject.publicGetPublicInstruments.mockImplementationOnce(
          ({ instType, instId }) => {
            return getValidPublicGetPublicInstrumentsResponse({ instType, instId })
          },
        )
        if (isOrderSizeOk) {
          this.exchangeMockObject.createMarketOrder.mockImplementationOnce(() => {
            return getValidCreateMarketOrderResponse(orderId)
          })
          this.exchangeMockObject.fetchOrder.mockImplementationOnce(() => {
            getValidFetchOrderResponse(firstOrderStatus)
          })
          for (let i = 0; i < numberFetchIteration - 1; i++) {
            this.exchangeMockObject.fetchOrder.mockImplementationOnce(() => {
              // TODO: fix this
              //   getValidFetchOrderResponse(firstOrderStatus)
              getValidFetchOrderResponse(lastOrderStatus)
            })
          }
          this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
            return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
          })
          this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
            return getValidFetchBalanceResponse(totalEquity)
          })
        }
      }
    }

    // Collateral Loop
    this.walletMockObject.getWalletOnChainDepositAddress.mockImplementationOnce(
      (): Result<string> => {
        const datetime = dateFormat(new Date(), DATE_FORMAT_STRING)
        const address = `bc1q00wallet0000000000000000000000000000datetime${datetime}`
        return { ok: true, value: address }
      },
    )
    this.exchangeMockObject.fetchPosition.mockImplementationOnce(() => {
      return getValidFetchPositionResponse(lastPriceInUsd, notionalUsd, marginInBtc)
    })
    this.exchangeMockObject.fetchBalance.mockImplementationOnce(() => {
      return getValidFetchBalanceResponse(totalEquity)
    })
    if (isFundTransferExpected) {
      if (isTransferWithdraw) {
        this.exchangeMockObject.withdraw.mockImplementationOnce((currency, quantity) => {
          return getValidWithdrawResponse("0", currency, quantity)
        })
      } else {
        this.exchangeMockObject.fetchDepositAddress.mockImplementationOnce(() => {
          return getValidFetchDepositAddressResponse()
        })
        this.walletMockObject.payOnChain.mockImplementationOnce((): Result<void> => {
          console.log("Called: payOnChain()")
          return { ok: true, value: undefined }
        })
      }
    }
  }

  public getExpectedValues(): UpdatedPositionAndLeverageResult {
    const result = {} as UpdatedPositionAndLeverageResult
    result.updatePositionSkipped = this.updatePositionSkipped
    result.updatedPositionResult.ok = this.expectPositionUpdatedOk
    if (result.updatedPositionResult.ok) {
      // Before
      result.updatedPositionResult.value.originalPosition.collateralInUsd = NaN
      result.updatedPositionResult.value.originalPosition.exposureInUsd = NaN
      result.updatedPositionResult.value.originalPosition.leverageRatio = NaN
      result.updatedPositionResult.value.originalPosition.totalAccountValueInUsd = NaN
      // After
      result.updatedPositionResult.value.updatedPosition.collateralInUsd = NaN
      result.updatedPositionResult.value.updatedPosition.exposureInUsd = NaN
      result.updatedPositionResult.value.updatedPosition.leverageRatio = NaN
      result.updatedPositionResult.value.updatedPosition.totalAccountValueInUsd = NaN
    }
    // else{
    //     result.updatedPositionResult.error =
    // }
    result.updatedLeverageResult.ok = this.expectLeverageUpdatedOk
    if (result.updatedLeverageResult.ok) {
      result.updatedLeverageResult.value.collateralInUsd = NaN
      result.updatedLeverageResult.value.liabilityInUsd = NaN
      result.updatedLeverageResult.value.newLeverageRatio = NaN
      result.updatedLeverageResult.value.originalLeverageRatio = NaN
    }
    // else{
    //     result.updatedLeverageResult.error
    // }
    return result
  }
}
