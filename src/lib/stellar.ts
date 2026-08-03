import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
  requestAccess as freighterRequestAccess,
  getNetwork as freighterGetNetwork,
  signTransaction as freighterSignTx,
} from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, Operation, Asset } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const TREASURY_ADDRESS = "GDOLQUM4D5SKAJQUT4XARMQVXRAP63RDK4FQKYG52GCOBJMQCF2WCQBX";

// Initialize the Horizon server for Testnet
export const server = new Horizon.Server(HORIZON_URL);

/**
 * Check if the Freighter extension is installed in the browser.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await freighterIsConnected();
    if (typeof res === "boolean") return res;
    if (res && typeof res === "object" && "isConnected" in res) {
      return Boolean(res.isConnected);
    }
    if (typeof window !== "undefined" && ((window as any).freighter || (window as any).freighterApi)) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking Freighter connection status:", error);
    return false;
  }
}

/**
 * Connect to Freighter Wallet by requesting access.
 */
export async function connectFreighterWallet(): Promise<{ address: string | null; error?: string }> {
  try {
    const installed = await isFreighterInstalled();
    if (!installed) {
      return {
        address: null,
        error: "Freighter extension not detected. Please install Freighter from freighter.app or enable browser extension permissions.",
      };
    }

    const accessRes = await freighterRequestAccess();
    if (accessRes && typeof accessRes === "object") {
      if ("address" in accessRes && typeof accessRes.address === "string" && accessRes.address) {
        return { address: accessRes.address };
      }
      if ("error" in accessRes && accessRes.error) {
        return { address: null, error: String(accessRes.error) };
      }
    }

    const addrRes = await freighterGetAddress();
    if (addrRes && typeof addrRes === "object" && "address" in addrRes && addrRes.address) {
      return { address: addrRes.address };
    }

    return { address: null, error: "Could not retrieve account address from Freighter." };
  } catch (error: any) {
    console.error("Freighter connect error:", error);
    return {
      address: null,
      error: error?.message || "Freighter connection request was canceled or rejected by user.",
    };
  }
}

/**
 * Retrieve current network setting from Freighter.
 */
export async function getFreighterNetwork(): Promise<string | null> {
  try {
    const res = await freighterGetNetwork();
    if (typeof res === "string") return res;
    if (res && typeof res === "object" && "network" in res) {
      return String(res.network);
    }
    return null;
  } catch (error) {
    console.error("Error getting Freighter network:", error);
    return null;
  }
}

/**
 * Fetch the XLM balance of a given public key.
 * If the account does not exist on Testnet (404), return "0.0000".
 */
export async function fetchBalance(publicKey: string): Promise<string> {
  try {
    const accountInfo = await server.loadAccount(publicKey);
    const nativeBalance = accountInfo.balances.find((b) => b.asset_type === "native");
    if (nativeBalance) {
      return parseFloat(nativeBalance.balance).toFixed(4);
    }
    return "0.0000";
  } catch (error: any) {
    // If account is not found on Testnet, it means it is not yet funded
    if (error?.response?.status === 404) {
      return "0.0000";
    }
    console.error("Error fetching balance:", error);
    throw error;
  }
}

/**
 * Request Friendbot to fund an account on Stellar Testnet if unfunded.
 */
export async function requestFriendbotFunding(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return response.ok;
  } catch (error) {
    console.error("Friendbot request failed:", error);
    return false;
  }
}

/**
 * Build and sign a payment transaction using Freighter Wallet.
 * Returns the txHash after successful submission.
 */
export async function executePaymentFlow(
  senderPublicKey: string,
  amountXlm: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    // Check balance first
    const currentBalance = await fetchBalance(senderPublicKey);
    if (parseFloat(currentBalance) < parseFloat(amountXlm)) {
      return {
        success: false,
        error: `Insufficient balance. Required: ${amountXlm} XLM, Available: ${currentBalance} XLM`,
      };
    }

    // Load account
    const account = await server.loadAccount(senderPublicKey);

    // Fetch base fee
    let baseFee = 100;
    try {
      baseFee = await server.fetchBaseFee();
    } catch (e) {
      console.warn("Could not fetch base fee, defaulting to 100 stroops", e);
    }

    // Build the transaction
    const transaction = new TransactionBuilder(account, {
      fee: baseFee.toString(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: TREASURY_ADDRESS,
          asset: Asset.native(),
          amount: amountXlm,
        })
      )
      .setTimeout(300)
      .build();

    const xdr = transaction.toXDR();
    let signedXdr: string | null = null;

    try {
      const signedResult = await freighterSignTx(xdr, {
        networkPassphrase: Networks.TESTNET,
      });

      if (typeof signedResult === "string") {
        signedXdr = signedResult;
      } else if (signedResult && typeof signedResult === "object") {
        if ("signedTxXdr" in signedResult && typeof signedResult.signedTxXdr === "string") {
          signedXdr = signedResult.signedTxXdr;
        } else if ("error" in signedResult && signedResult.error) {
          throw new Error(String(signedResult.error));
        }
      }
    } catch (signErr: any) {
      console.error("Freighter signing error:", signErr);
      throw signErr;
    }

    if (!signedXdr) {
      throw new Error("User canceled the signature request or Freighter returned an empty signature.");
    }

    const txToSubmit = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const submitResult = await server.submitTransaction(txToSubmit);

    return {
      success: true,
      hash: submitResult.hash,
    };
  } catch (error: any) {
    console.error("Transaction execution failed:", error);
    throw error;
  }
}

export const ErrorType = {
  USER_REJECTION: "USER_REJECTION",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  CONTRACT_NETWORK_FAILURE: "CONTRACT_NETWORK_FAILURE",
} as const;

export type ErrorDetails = {
  type: typeof ErrorType[keyof typeof ErrorType];
  title: string;
  message: string;
  solution: string;
};

/**
 * Categorize transaction and wallet errors for user-friendly UI display.
 */
export function categorizeTransactionError(
  error: any,
  senderBalanceXlm?: string,
  requiredXlm?: string
): ErrorDetails {
  const errString = String(error?.message || error || "").toLowerCase();

  // User rejection or Freighter modal closed
  if (
    errString.includes("cancel") ||
    errString.includes("reject") ||
    errString.includes("decline") ||
    errString.includes("closed") ||
    errString.includes("user denied")
  ) {
    return {
      type: ErrorType.USER_REJECTION,
      title: "Signature Request Cancelled",
      message: "You rejected or closed the Freighter Wallet signature confirmation popup.",
      solution: "Click the payment button again and approve the signature prompt inside your Freighter Wallet.",
    };
  }

  // Underfunded/Insufficient XLM balance
  if (
    errString.includes("underfunded") ||
    errString.includes("insufficient balance") ||
    errString.includes("op_underfunded") ||
    errString.includes("404") ||
    (senderBalanceXlm && requiredXlm && parseFloat(senderBalanceXlm) < parseFloat(requiredXlm))
  ) {
    return {
      type: ErrorType.INSUFFICIENT_FUNDS,
      title: "Insufficient XLM Balance",
      message: `Your account balance (${senderBalanceXlm || "0.0000"} XLM) is lower than the required amount (${requiredXlm || "0.0000"} XLM) plus fees.`,
      solution: "Fund your account using the Friendbot faucet link, or transfer testnet XLM to this address.",
    };
  }

  // Default fallback network error
  return {
    type: ErrorType.CONTRACT_NETWORK_FAILURE,
    title: "Horizon Network / Wallet Error",
    message: error?.message || "Transaction creation failed or the Horizon Testnet node timed out.",
    solution: "Ensure Freighter is set to Testnet, check your network connection, and try again.",
  };
}
