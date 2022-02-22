import { DealerSimulatedWallet } from "./DealerSimulatedWallet"
import { DealerRemoteWallet } from "./DealerRemoteWallet"
import { GaloyWallet } from "./GaloyWalletTypes"

export enum WalletType {
  SimulatedWallet = "SIMULATED_WALLET",
  RemoteWallet = "REMOTE_WALLET",
}

export function createDealerWallet(walletType: WalletType, logger): GaloyWallet {
  switch (walletType) {
    case WalletType.SimulatedWallet:
      return new DealerSimulatedWallet(logger)

    case WalletType.RemoteWallet:
      return new DealerRemoteWallet(logger)

    default:
      throw new Error("Not implemented!")
  }
}
