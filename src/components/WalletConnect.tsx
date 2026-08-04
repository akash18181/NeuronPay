"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, ShieldAlert, Loader2, RefreshCw, Cpu, Zap } from "lucide-react";
import albedo from "@albedo-link/intent";
import {
  isFreighterInstalled,
  connectFreighterWallet,
  getFreighterNetwork,
  fetchBalance
} from "@/lib/stellar";

interface WalletConnectProps {
  walletAddress: string | null;
  walletBalance: string | null;
  network: string | null;
  isNetworkCorrect: boolean;
  onConnect: (address: string, network: string, balance: string, walletType: "freighter" | "albedo") => void;
  onDisconnect: () => void;
  onUpdateBalance: (balance: string) => void;
  onUpdateNetwork: (network: string, isCorrect: boolean) => void;
}

export default function WalletConnect({
  walletAddress,
  walletBalance,
  network,
  isNetworkCorrect,
  onConnect,
  onDisconnect,
  onUpdateBalance,
  onUpdateNetwork,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  // Check if Freighter is installed on mount
  useEffect(() => {
    async function checkInstallation() {
      const installed = await isFreighterInstalled();
      setIsInstalled(installed);

      // Auto-connect if wallet was previously active and not explicitly disconnected
      const savedWallet = localStorage.getItem("neuronpay_active_wallet");
      const savedType = localStorage.getItem("neuronpay_wallet_type") as "freighter" | "albedo" || "freighter";
      const userDisconnected = localStorage.getItem("neuronpay_user_disconnected");

      if (savedWallet && userDisconnected !== "true") {
        try {
          if (savedType === "albedo") {
            const balance = await fetchBalance(savedWallet);
            onConnect(savedWallet, "TESTNET", balance, "albedo");
          } else if (installed) {
            const networkName = await getFreighterNetwork();
            const balance = await fetchBalance(savedWallet);
            onConnect(savedWallet, networkName || "UNKNOWN", balance, "freighter");
          }
        } catch (err) {
          console.warn("Auto-connect failed:", err);
        }
      }
    }
    checkInstallation();
  }, []);

  // Poll for network changes occasionally when wallet is connected
  useEffect(() => {
    if (!walletAddress) return;
    const savedType = localStorage.getItem("neuronpay_wallet_type");
    if (savedType === "albedo") {
      onUpdateNetwork("TESTNET", true);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const networkName = await getFreighterNetwork();
        const isCorrect = networkName === "TESTNET";
        onUpdateNetwork(networkName || "UNKNOWN", isCorrect);
      } catch (err) {
        console.warn("Error polling network state:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleConnectFreighter = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    setShowSelector(false);
    try {
      const result = await connectFreighterWallet();
      if (result.address) {
        const networkName = await getFreighterNetwork();
        
        let balance = "0.0000";
        try {
          balance = await fetchBalance(result.address);
        } catch (bErr) {
          console.warn("Could not fetch initial balance, defaulting to 0", bErr);
        }

        // Save state in parent component
        onConnect(result.address, networkName || "UNKNOWN", balance, "freighter");
        
        // Save in local storage
        localStorage.setItem("neuronpay_active_wallet", result.address);
        localStorage.setItem("neuronpay_wallet_type", "freighter");
        localStorage.removeItem("neuronpay_user_disconnected");
      } else {
        setErrorMsg(result.error || "Could not retrieve public key from Freighter.");
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      setErrorMsg(err?.message || "Freighter connection failed. Check your wallet settings.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectAlbedo = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    setShowSelector(false);
    try {
      const res = await albedo.publicKey({});
      if (res.pubkey) {
        let balance = "0.0000";
        try {
          balance = await fetchBalance(res.pubkey);
        } catch (bErr) {
          console.warn("Could not fetch initial balance, defaulting to 0", bErr);
        }

        // Save state in parent component
        onConnect(res.pubkey, "TESTNET", balance, "albedo");

        // Save in local storage
        localStorage.setItem("neuronpay_active_wallet", res.pubkey);
        localStorage.setItem("neuronpay_wallet_type", "albedo");
        localStorage.removeItem("neuronpay_user_disconnected");
      } else {
        setErrorMsg("Could not retrieve public key from Albedo.");
      }
    } catch (err: any) {
      console.error("Albedo connection error:", err);
      setErrorMsg(err?.message || "Albedo connection request was closed or canceled by user.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.setItem("neuronpay_user_disconnected", "true");
    localStorage.removeItem("neuronpay_active_wallet");
    localStorage.removeItem("neuronpay_wallet_type");
    onDisconnect();
  };

  const refreshWalletBalance = async () => {
    if (!walletAddress) return;
    setIsRefreshing(true);
    try {
      const balance = await fetchBalance(walletAddress);
      onUpdateBalance(balance);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Installation Warning */}
      {isInstalled === false && (
        <div className="flex items-center gap-1.5 px-3 py-1 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-full font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Freighter missing. <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="underline font-bold hover:text-rose-300">Install app</a>.</span>
        </div>
      )}

      {/* Network Warning */}
      {walletAddress && !isNetworkCorrect && (
        <div className="flex items-center gap-1.5 px-3 py-1 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-full font-medium animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Freighter is not set to Testnet</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {walletAddress ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2 bg-[#090D1A]/90 border border-white/10 p-1.5 rounded-full shadow-[0_4px_20px_rgba(0,243,255,0.05)]"
          >
            {/* Balance Badge */}
            <div className="flex items-center gap-2 pl-3.5 pr-2.5 py-1 text-slate-300 font-mono text-xs font-semibold">
              <span className="text-slate-500 select-none">Balance:</span>
              <span className="text-cyan-400 font-extrabold">{walletBalance} XLM</span>
              <button
                onClick={refreshWalletBalance}
                disabled={isRefreshing}
                className="p-1 rounded-full hover:bg-white/5 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10 select-none" />

            {/* Address & Network Info */}
            <div className="flex items-center gap-2.5 px-3.5 py-1 text-slate-300 font-mono text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
              <span className="font-bold text-slate-100 select-all" title={walletAddress}>
                {truncateAddress(walletAddress)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-sans font-extrabold tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-500/20 uppercase select-none">
                {network}
              </span>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="p-2 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200"
              title="Disconnect Wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button
              id="connect-wallet-btn"
              onClick={() => setShowSelector(true)}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-full font-space font-bold text-xs flex items-center gap-2 transition-all relative overflow-hidden bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-3.5 h-3.5 text-slate-950" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Selector Modal Overlay */}
      <AnimatePresence>
        {showSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#0b0f1a] border border-white/10 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowSelector(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white font-mono text-lg font-bold"
              >
                ×
              </button>
              
              <h3 className="font-space text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                Connect Wallet
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Select your Web3 authorization keys gateway to connect with Testnet.
              </p>
              
              <div className="space-y-3">
                {/* Option 1: Freighter Wallet */}
                <button
                  onClick={handleConnectFreighter}
                  disabled={isConnecting}
                  className="w-full p-4 text-left rounded-2xl bg-slate-900/50 hover:bg-[#12182b] border border-white/5 hover:border-cyan-500/30 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                    <Cpu className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="font-space font-bold text-sm text-white block">
                      Freighter Extension
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Stellar browser extension
                    </span>
                  </div>
                </button>

                {/* Option 2: Albedo Wallet */}
                <button
                  onClick={handleConnectAlbedo}
                  disabled={isConnecting}
                  className="w-full p-4 text-left rounded-2xl bg-slate-900/50 hover:bg-[#12182b] border border-white/5 hover:border-purple-500/30 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                    <Zap className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="font-space font-bold text-sm text-white block">
                      Albedo Web Wallet
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Secure browser-delegate keys
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-[#12070A] border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-white mb-0.5">Wallet Error</span>
            <span className="text-slate-300 leading-normal">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold ml-2 font-mono text-sm leading-none">×</button>
        </div>
      )}
    </div>
  );
}
