import { DealerSimulatedWallet } from "./DealerSimulatedWallet"
import { DealerRemoteWallet } from "./DealerRemoteWallet"
import { DealerRemoteWalletV2 } from "./DealerRemoteWalletV2"
import { GaloyWallet } from "./GaloyWalletTypes"

export enum WalletType {
  SimulatedWallet = "SIMULATED_WALLET",
  RemoteWallet = "REMOTE_WALLET",
  RemoteWalletV2 = "REMOTE_WALLET_V2",
}

export function createDealerWallet(walletType: WalletType, logger): GaloyWallet {
  switch (walletType) {
    case WalletType.SimulatedWallet:
      return new DealerSimulatedWallet(logger)

    case WalletType.RemoteWallet:
      return new DealerRemoteWallet(logger)

    case WalletType.RemoteWalletV2: {
      const wallet = new DealerRemoteWalletV2(logger)
      wallet.login()
      return wallet
    }

    default:
      throw new Error("Not implemented!")
  }
}
