"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Info,
  Wallet,
  Activity,
  Signature,
  FileCheck
} from "lucide-react";
import {
  executePaymentFlow,
  categorizeTransactionError,
  ErrorDetails,
  TREASURY_ADDRESS
} from "@/lib/stellar";

interface TransactionCardProps {
  walletAddress: string | null;
  walletBalance: string | null;
  isNetworkCorrect: boolean;
  onTransactionSuccess: (txHash: string, amountXlm: string, tierName: string, isSoroban: boolean) => void;
}

interface Tier {
  id: string;
  name: string;
  tokens: string;
  xlmAmount: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  gradient: string;
}

export default function TransactionCard({
  walletAddress,
  walletBalance,
  isNetworkCorrect,
  onTransactionSuccess,
}: TransactionCardProps) {
  const [selectedTier, setSelectedTier] = useState<string>("tier-basic");
  const [customAmount, setCustomAmount] = useState<string>("1.0");
  const [txState, setTxState] = useState<"idle" | "signing" | "submitting" | "success" | "error">("idle");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastTxIsSoroban, setLastTxIsSoroban] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  const tiers: Tier[] = [
    {
      id: "tier-basic",
      name: "Lite Developer",
      tokens: "10,000 Tokens",
      xlmAmount: "2.0",
      description: "Perfect for testing sandbox queries and local scripts.",
      icon: <Cpu className="w-5 h-5" />,
      accent: "cyan",
      gradient: "from-cyan-500/20 to-blue-500/5",
    },
    {
      id: "tier-pro",
      name: "Cyber Agent",
      tokens: "50,000 Tokens",
      xlmAmount: "5.0",
      description: "Optimized for continuous, automated autonomous streams.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      accent: "purple",
      gradient: "from-purple-500/20 to-indigo-500/5",
    },
    {
      id: "tier-custom",
      name: "On-Demand Stream",
      tokens: "Custom Credits",
      xlmAmount: "custom",
      description: "Input a manual XLM amount for custom token limits.",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      accent: "amber",
      gradient: "from-amber-500/20 to-orange-500/5",
    },
  ];

  const getActiveAmount = () => {
    const active = tiers.find((t) => t.id === selectedTier);
    if (!active) return "0.0";
    if (active.xlmAmount === "custom") {
      return customAmount;
    }
    return active.xlmAmount;
  };

  const handlePay = async () => {
    if (!walletAddress) return;
    
    const amountToPay = getActiveAmount();
    if (parseFloat(amountToPay) <= 0 || isNaN(parseFloat(amountToPay))) {
      setErrorDetails({
        type: "INSUFFICIENT_FUNDS",
        title: "Invalid Amount",
        message: "Please enter a valid XLM amount greater than zero.",
        solution: "Enter a positive decimal number (e.g. 1.5).",
      });
      setTxState("error");
      return;
    }

    setTxState("signing");
    setErrorDetails(null);
    setLastTxHash(null);

    try {
      // Execute build + sign + submission workflow
      const response = await executePaymentFlow(walletAddress, amountToPay);

      if (response.success && response.hash) {
        setLastTxHash(response.hash);
        setLastTxIsSoroban(response.isSoroban);
        setTxState("success");
        
        // Notify parent layout (starts typewriter simulation and logs history)
        const activeTier = tiers.find((t) => t.id === selectedTier);
        const tierName = activeTier ? `${activeTier.name} (${activeTier.tokens})` : "Custom Tier";
        onTransactionSuccess(response.hash, amountToPay, tierName, response.isSoroban);
      }
    } catch (err: any) {
      console.error("Payment transaction error:", err);
      const details = categorizeTransactionError(err, walletBalance || "0.0000", amountToPay);
      setErrorDetails(details);
      setTxState("error");
    }
  };

  return (
    <div className="glass-card-premium rounded-3xl p-6 border border-white/5 relative overflow-hidden">
      {/* Aesthetic glowing grid in background */}
      <div className="absolute inset-0 bg-[#0B0F19]/50 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-space text-lg font-bold text-white tracking-wide">
              Token Refueling Console
            </h3>
            <p className="text-xs text-slate-400">
              Select your billing structure and authorize payment via Freighter.
            </p>
          </div>
        </div>
      </div>

      {!walletAddress ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#090D1A] border border-white/5 flex items-center justify-center text-cyan-400">
            <Wallet className="w-6 h-6 opacity-60" />
          </div>
          <div className="space-y-1">
            <h4 className="font-space font-bold text-sm text-white">Console Locked</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Please connect your Stellar wallet on the topbar to unlock payments.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tiers List */}
          <div className="space-y-3">
            <label className="text-xs font-space font-bold text-slate-400 uppercase tracking-wider block">
              Structure Plans:
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {tiers.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      if (txState === "success" || txState === "error") {
                        setTxState("idle");
                      }
                    }}
                    className={`p-4 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 relative overflow-hidden group ${
                      isSelected
                        ? `bg-gradient-to-br ${tier.gradient} border-cyan-500/50 shadow-[0_4px_20px_rgba(6,182,212,0.1)] scale-[1.01]`
                        : "bg-[#090D1A]/50 border-white/5 hover:border-slate-800 hover:bg-[#0F1424]/20"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 ${
                        isSelected ? "text-cyan-400 border-cyan-500/25 bg-cyan-500/5" : ""
                      }`}>
                        {tier.icon}
                      </div>
                      <span className="font-space font-extrabold text-cyan-400 text-xs shrink-0 bg-[#061B2E]/60 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                        {tier.xlmAmount === "custom" ? "Custom" : `${tier.xlmAmount} XLM`}
                      </span>
                    </div>

                    <div>
                      <span className="font-space font-bold text-sm text-white block group-hover:text-cyan-300 transition-colors">
                        {tier.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {tier.tokens}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-2">
                        {tier.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Form */}
          {selectedTier === "tier-custom" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-[#090D1A] border border-white/5 space-y-3"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Input Custom XLM:</span>
                <span className="text-[10px] font-mono text-cyan-400">
                  Approx. {parseFloat(customAmount) ? (parseFloat(customAmount) * 5000).toLocaleString() : 0} Tokens
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0.0001"
                  step="0.1"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (txState === "success" || txState === "error") {
                      setTxState("idle");
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/5 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/30 transition-colors"
                  placeholder="0.0000"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-slate-400 select-none">
                  XLM
                </span>
              </div>
            </motion.div>
          )}

          {/* Routing Information */}
          <div className="p-3.5 rounded-2xl bg-[#070A14] border border-white/5 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-normal">
              <span>Smart invoice payments automatically route to: </span>
              <span className="font-mono text-slate-300 block mt-0.5 break-all select-all font-semibold bg-slate-900/40 p-1 rounded border border-white/5">
                {TREASURY_ADDRESS}
              </span>
            </div>
          </div>

          {/* Submit Trigger */}
          {!isNetworkCorrect ? (
            <div className="p-3 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center font-bold">
              Verification Required: Change wallet network to Testnet
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={txState === "signing" || txState === "submitting"}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-space font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Refuel AI Token Stream</span>
            </button>
          )}

          {/* Multi-step Status Indicator */}
          <AnimatePresence mode="wait">
            {(txState === "signing" || txState === "submitting") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-2xl bg-[#090D1A] border border-white/5 space-y-4"
              >
                <h4 className="text-xs font-space font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  Stellar Testnet Transaction Pipeline
                </h4>
                
                <div className="space-y-3.5">
                  {/* Step 1: Sequence Checking */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Cpu className="w-3 h-3" />
                    </div>
                    <span className="text-slate-200">Loaded Sequence and Base Fee</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                  </div>

                  {/* Step 2: Signing */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      txState === "signing"
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 pulse-green"
                        : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
                    }`}>
                      <Signature className="w-3 h-3" />
                    </div>
                    <span className={txState === "signing" ? "text-white font-bold" : "text-slate-300"}>
                      Awaiting Wallet Signature
                    </span>
                    {txState === "signing" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-auto" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                    )}
                  </div>

                  {/* Step 3: Submitting */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      txState === "submitting"
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 pulse-green"
                        : "bg-slate-900 border border-white/5 text-slate-500"
                    }`}>
                      <FileCheck className="w-3 h-3" />
                    </div>
                    <span className={txState === "submitting" ? "text-white font-bold" : "text-slate-400"}>
                      Horizon Consensus Finalization
                    </span>
                    {txState === "submitting" && (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-auto" />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Feedback Card */}
            {txState === "success" && lastTxHash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Transaction Completed Successfully
                      </span>
                      <span className="text-[10px] text-slate-300 block mt-0.5">
                        Successfully sent {getActiveAmount()} XLM. AI Token Stream active.
                      </span>
                    </div>
                  </div>
                  {/* Route Indicator Badge */}
                  <span className={`text-[9px] font-space font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    lastTxIsSoroban 
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  }`}>
                    {lastTxIsSoroban ? "🟢 Soroban Contract" : "⚡ Horizon Pipeline"}
                  </span>
                </div>

                <div className="pt-3 border-t border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[9px] font-mono text-slate-400 truncate max-w-[200px]" title={lastTxHash}>
                    Tx: {lastTxHash}
                  </span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline shrink-0"
                  >
                    <span>Verify on Stellar Expert</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}

            {/* Error Feedback Card */}
            {txState === "error" && errorDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3.5"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {errorDetails.title}
                    </span>
                    <span className="text-[10px] text-slate-300 block mt-1 leading-normal">
                      {errorDetails.message}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-rose-500/10">
                  <span className="text-[9px] text-rose-400 block leading-normal">
                    <strong className="uppercase font-bold">Recommended action:</strong> {errorDetails.solution}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
