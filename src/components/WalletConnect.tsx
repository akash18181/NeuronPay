"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, ShieldAlert, Loader2, RefreshCw } from "lucide-react";

interface WalletConnectProps {
  walletAddress: string | null;
  walletBalance: string | null;
  network: string | null;
  isNetworkCorrect: boolean;
  isConnecting: boolean;
  isRefreshing: boolean;
  onConnectClick: () => void;
  onDisconnectClick: () => void;
  onRefreshClick: () => void;
}

export default function WalletConnect({
  walletAddress,
  walletBalance,
  network,
  isNetworkCorrect,
  isConnecting,
  isRefreshing,
  onConnectClick,
  onDisconnectClick,
  onRefreshClick,
}: WalletConnectProps) {
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Network Warning */}
      {walletAddress && !isNetworkCorrect && (
        <div className="flex items-center gap-1.5 px-3 py-1 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-full font-medium animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Wallet is not set to Testnet</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {walletAddress ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-[#090D1A]/90 border border-white/10 p-2 sm:p-1.5 rounded-2xl sm:rounded-full shadow-[0_4px_20px_rgba(0,243,255,0.05)] w-full sm:w-auto"
          >
            {/* Balance Badge */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 px-3 py-1 text-slate-300 font-mono text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 select-none">Balance:</span>
                <span className="text-cyan-400 font-extrabold">{walletBalance} XLM</span>
              </div>
              <button
                onClick={onRefreshClick}
                disabled={isRefreshing}
                className="p-1 rounded-full hover:bg-white/5 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-5 bg-white/10 select-none" />

            {/* Address & Network Info */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3.5 px-3 py-2 sm:py-1 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-1">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-xs">
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
                onClick={onDisconnectClick}
                className="p-1.5 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200"
                title="Disconnect Wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
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
              onClick={onConnectClick}
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
    </div>
  );
}
