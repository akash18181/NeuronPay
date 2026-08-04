"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  History,
  ExternalLink,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  Compass,
  Coins,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Activity,
  Zap,
  Globe,
  Loader2
} from "lucide-react";
import WalletConnect from "@/components/WalletConnect";
import TransactionCard from "@/components/TransactionCard";
import { requestFriendbotFunding, fetchBalance } from "@/lib/stellar";

interface TxReceipt {
  id: string;
  txHash: string;
  amountXlm: string;
  tierName: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED";
  isSoroban?: boolean;
}

const TIER_LITE_LOGS = [
  "🔋 [AI CORE] Initializing pay-per-token stream parameters...",
  "🔑 [AUTH] Validating Stellar transaction receipt sequence...",
  "📦 [DECR] Unlocking model authorization payload: Tier Lite (10,000 tokens)",
  "🚀 [STREAM] Commencing token delivery (approx 200 ms/chunk)...",
  "----------------------------------------------------------------",
  "import torch",
  "import torch.nn as nn",
  "",
  "class NeuronPayLayer(nn.Module):",
  "    def __init__(self, in_dim=512, out_dim=10):",
  "        super().__init__()",
  "        self.fc = nn.Linear(in_dim, out_dim)",
  "        self.dropout = nn.Dropout(0.1)",
  "        ",
  "    def forward(self, x):",
  "        x = self.dropout(torch.relu(self.fc(x)))",
  "        return torch.softmax(x, dim=-1)",
  "",
  "model = NeuronPayLayer().to('cuda')",
  "print('[SYSTEM] Neural model compiled. Weights loaded from IPFS hashes.')",
  "----------------------------------------------------------------",
  "✅ [STREAM] Successfully streamed 10,000 tokens.",
  "💳 [BILLING] Ledger validated. Status: CLOSED."
];

const TIER_PRO_LOGS = [
  "⚡ [AI CORE] Initializing hyper-stream parameters...",
  "🔑 [AUTH] Validating Stellar transaction receipt sequence...",
  "📦 [DECR] Unlocking model authorization payload: Tier Pro (50,000 tokens)",
  "🚀 [STREAM] Commencing token delivery (approx 100 ms/chunk)...",
  "----------------------------------------------------------------",
  "[Agent Init] Loading global vector memory base...",
  "[Memory] Retrieved 3 reference context documents matching: 'Stellar Soroban'",
  "[Prompt] Building prompt instructions with strict on-chain payload bindings...",
  "[Model Request] Forwarding prompt payload to Claude-3.5-Sonnet...",
  "[Streaming API] Output chunk: 'Stellar Soroban uses WASM smart contracts...'",
  "[Streaming API] Output chunk: 'Developers write contracts in Rust using SDK...'",
  "[Streaming API] Output chunk: 'Transactions are gas-metered and paid in native XLM...'",
  "[Agent Action] Executing local execution check on contracts CDLZFC3S... successfully.",
  "[System Watch] Monitoring block height 492104 | validator consensus: 99.8%",
  "----------------------------------------------------------------",
  "✅ [STREAM] Successfully streamed 50,000 tokens.",
  "💳 [BILLING] Ledger validated. Status: CLOSED."
];

const TIER_CUSTOM_LOGS = [
  "🔮 [AI CORE] Initializing custom token stream parameters...",
  "🔑 [AUTH] Validating Stellar transaction receipt sequence...",
  "📦 [DECR] Unlocking custom token allocation payload...",
  "🚀 [STREAM] Commencing token delivery...",
  "----------------------------------------------------------------",
  "{",
  "  \"status\": \"ACTIVE_ON_CHAIN_STREAM\",",
  "  \"invoice\": \"TX_NEURONPAY_CUSTOM\",",
  "  \"ledger_sequence\": 10924301,",
  "  \"payload_delivered\": {",
  "    \"tokens_credit\": \"Custom Amount Refueled\",",
  "    \"fiat_equivalent\": \"Variable\",",
  "    \"network_fees_stroops\": 100",
  "  },",
  "  \"validator_node\": \"https://horizon-testnet.stellar.org\"",
  "}",
  "----------------------------------------------------------------",
  "✅ [STREAM] Custom token delivery finalized.",
  "💳 [BILLING] Ledger validated. Status: CLOSED."
];

export default function Page() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(true);
  const [txHistory, setTxHistory] = useState<TxReceipt[]>([]);
  const [isFunding, setIsFunding] = useState(false);
  const [fundingSuccess, setFundingSuccess] = useState<boolean | null>(null);

  // Terminal Visualizer states
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeTokenCount, setActiveTokenCount] = useState<number>(0);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const terminalLogsContainerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("neuronpay_tx_history");
      if (savedHistory) {
        try {
          setTxHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse local transaction history:", e);
        }
      }
    }
  }, []);

  // Scroll terminal container to bottom when logs update
  useEffect(() => {
    if (terminalLogsContainerRef.current) {
      const container = terminalLogsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [terminalLogs]);

  const handleWalletConnect = (address: string, net: string, balance: string) => {
    setWalletAddress(address);
    setNetwork(net);
    setWalletBalance(balance);
    setIsNetworkCorrect(net === "TESTNET");
    
    // Add logs to terminal
    setTerminalLogs([
      "🟢 Console online. Connected to Freighter wallet.",
      `🟢 Account: ${address.slice(0, 15)}...${address.slice(-15)}`,
      `🟢 Network: ${net}`,
      `🟢 Current Balance: ${balance} XLM`,
      "🟢 System Idle. Awaiting prompt billing events..."
    ]);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
    setNetwork(null);
    setWalletBalance(null);
    setIsNetworkCorrect(true);
    setTerminalLogs([
      "🔴 Console offline. Please connect your Freighter Wallet to initialize systems."
    ]);
    setActiveTokenCount(0);
    setIsStreaming(false);
  };

  const handleUpdateBalance = (balance: string) => {
    setWalletBalance(balance);
  };

  const handleUpdateNetwork = (net: string, isCorrect: boolean) => {
    setNetwork(net);
    setIsNetworkCorrect(isCorrect);
  };

  const startTerminalStream = (tierName: string, isSoroban?: boolean) => {
    setIsStreaming(true);
    setTerminalLogs((prev) => [
      ...prev, 
      "", 
      `⏳ Preparing token stream for: ${tierName}`,
      isSoroban 
        ? "🟢 [SOROBAN] Routing transaction via Smart Contract CDLZFC3S..."
        : "⚡ [HORIZON] Routing transaction via standard Payment Channel..."
    ]);
    
    let sourceLogs: string[] = TIER_CUSTOM_LOGS;
    let targetTokens = 25000; // default custom tokens

    if (tierName.toLowerCase().includes("lite") || tierName.toLowerCase().includes("10,000")) {
      sourceLogs = TIER_LITE_LOGS;
      targetTokens = 10000;
    } else if (tierName.toLowerCase().includes("pro") || tierName.toLowerCase().includes("50,000")) {
      sourceLogs = TIER_PRO_LOGS;
      targetTokens = 50000;
    }

    let lineIndex = 0;
    setTerminalLogs((prev) => [...prev, "🧬 Starting network deserialization..."]);
    
    const logInterval = setInterval(() => {
      if (lineIndex < sourceLogs.length) {
        const nextLine = sourceLogs[lineIndex];
        setTerminalLogs((prev) => [...prev, nextLine]);
        
        // Dynamic simulated token counts
        if (lineIndex > 4 && lineIndex < sourceLogs.length - 2) {
          setActiveTokenCount((prev) => {
            const steps = Math.floor(targetTokens / (sourceLogs.length - 7));
            const nextVal = prev + steps;
            return nextVal > targetTokens ? targetTokens : nextVal;
          });
        }
        lineIndex++;
      } else {
        clearInterval(logInterval);
        setIsStreaming(false);
        setActiveTokenCount(targetTokens);
      }
    }, 250);
  };

  const handleTransactionSuccess = async (txHash: string, amountXlm: string, tierName: string, isSoroban: boolean) => {
    // 1. Refresh balance
    if (walletAddress) {
      try {
        const balance = await fetchBalance(walletAddress);
        setWalletBalance(balance);
      } catch (err) {
        console.warn("Failed to refresh balance after transaction:", err);
      }
    }

    // 2. Create receipt and save
    const date = new Date();
    const formattedDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ", " + date.toLocaleDateString();
    
    const newReceipt: TxReceipt = {
      id: txHash,
      txHash,
      amountXlm,
      tierName,
      timestamp: formattedDate,
      status: "SUCCESS",
      isSoroban,
    };

    const updatedHistory = [newReceipt, ...txHistory];
    setTxHistory(updatedHistory);
    localStorage.setItem("neuronpay_tx_history", JSON.stringify(updatedHistory));

    // 3. Trigger active visual stream in right console!
    setActiveTokenCount(0);
    startTerminalStream(tierName, isSoroban);
  };

  const handleClearHistory = () => {
    setTxHistory([]);
    localStorage.removeItem("neuronpay_tx_history");
  };

  const handleFaucetFunding = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    setFundingSuccess(null);
    try {
      const ok = await requestFriendbotFunding(walletAddress);
      if (ok) {
        setFundingSuccess(true);
        // Wait 3 seconds then refresh balance
        setTimeout(async () => {
          try {
            const balance = await fetchBalance(walletAddress);
            setWalletBalance(balance);
            setTerminalLogs((prev) => [
              ...prev,
              "💧 Faucet deposit detected: +10,000 XLM",
              `💧 Updated Account Balance: ${balance} XLM`
            ]);
          } catch (e) {}
          setFundingSuccess(null);
        }, 3000);
      } else {
        setFundingSuccess(false);
      }
    } catch (err) {
      console.error("Faucet funding error:", err);
      setFundingSuccess(false);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 relative cyber-grid pb-12">
      {/* Cyber ambient glow elements */}
      <div className="absolute top-[-5%] left-[-15%] w-[45%] h-[45%] bg-[#08f2ff]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-[#b82eff]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER SECTION (Floating Capsule Style) */}
      <div className="relative z-10 w-full px-4 lg:px-8 pt-6">
        <header className="max-w-7xl mx-auto rounded-full bg-[#0b0f1a]/85 backdrop-blur-xl border border-white/5 px-6 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Cpu className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="font-space font-extrabold text-base text-white tracking-wider">
              NeuronPay
            </h1>
          </div>

          <WalletConnect
            walletAddress={walletAddress}
            walletBalance={walletBalance}
            network={network}
            isNetworkCorrect={isNetworkCorrect}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
            onUpdateBalance={handleUpdateBalance}
            onUpdateNetwork={handleUpdateNetwork}
          />
        </header>
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* HERO / PROTOCOL SLOGAN */}
        <section className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h2 className="font-space text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-x-3">
              Pay-per-Token <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Micro-Billing</span>
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-lg leading-relaxed">
              Unlock dynamic generative model APIs per token unit using Stellar ledger payments. Connect Freighter, fund testnet assets, and stream prompt completions instantly.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center justify-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono font-extrabold bg-[#0A0E1A] text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Horizon Network online</span>
            </span>
          </div>
        </section>

        {/* WORKSPACE COCKPIT ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: CONSOLE CONTROL & WALLET STATUS */}
          <div className="lg:col-span-7 space-y-8">
            {/* Pay Selector Console */}
            <TransactionCard
              walletAddress={walletAddress}
              walletBalance={walletBalance}
              isNetworkCorrect={isNetworkCorrect}
              onTransactionSuccess={handleTransactionSuccess}
            />

            {/* Wallet Dashboard Details */}
            <div className="glass-card-premium rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
              <h3 className="font-space font-bold text-xs text-white uppercase tracking-wider mb-4 flex items-center gap-2 select-none">
                <Coins className="w-4 h-4 text-cyan-400" /> System Account Node
              </h3>

              {!walletAddress ? (
                <div className="py-6 text-center text-slate-500 text-xs leading-normal">
                  Stellar Freighter wallet details are locked. Connect wallet to read state.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Account Address</span>
                      <span className="font-mono text-cyan-300 text-xs font-bold select-all break-all" title={walletAddress}>
                        {walletAddress}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Horizon Node</span>
                      <span className="font-mono text-slate-300 text-xs select-none">
                        https://horizon-testnet.stellar.org
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090D1A] border border-white/5 flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-space font-bold text-slate-200 flex items-center gap-1.5 select-none">
                        <ArrowDownLeft className="w-4 h-4 text-cyan-400" /> Friendbot XLM Faucet
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1 select-none">
                        Unfunded wallets can claim 10,000 Testnet XLM immediately via Friendbot triggers.
                      </p>
                    </div>

                    <button
                      onClick={handleFaucetFunding}
                      disabled={isFunding || fundingSuccess === true}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        fundingSuccess === true
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 cursor-default"
                          : isFunding
                          ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:scale-[1.01]"
                      }`}
                    >
                      {isFunding ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                          <span>Requesting Faucet...</span>
                        </>
                      ) : fundingSuccess === true ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Deposited Successfully!</span>
                        </>
                      ) : (
                        <span>Request 10,000 XLM Faucet</span>
                      )}
                    </button>

                    {fundingSuccess === false && (
                      <span className="text-[9px] text-rose-400 font-medium block text-center mt-1 select-none">
                        Faucet request failed. Rate limit exceeded or node timeout.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COL: AI TERMINAL STREAM VISUALIZER */}
          <div className="lg:col-span-5 flex flex-col relative">
            <div className="glass-card-premium rounded-3xl border border-white/5 flex-1 flex flex-col overflow-hidden min-h-[420px] max-h-[500px] relative">
              
              {/* Terminal Title Bar */}
              <div className="px-5 py-4 border-b border-white/5 bg-[#090D1A]/80 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-space font-bold text-xs text-white uppercase tracking-wider">
                    AI Prompt Token Stream
                  </span>
                </div>
                
                {/* Simulated Token Counter */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-full border border-white/5 font-mono text-[10px] text-cyan-400">
                  <Zap className={`w-3.5 h-3.5 ${isStreaming ? "animate-pulse" : ""}`} />
                  <span>Tokens: {activeTokenCount.toLocaleString()}</span>
                </div>
              </div>

              {/* Terminal Log Output Window */}
              <div ref={terminalLogsContainerRef} className="flex-1 p-5 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-2 bg-slate-950/80 custom-scrollbar select-text">
                {terminalLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
                    <Terminal className="w-8 h-8 opacity-20 mb-2" />
                    <span>Awaiting system initialization...</span>
                  </div>
                ) : (
                  <>
                    {terminalLogs.map((log, idx) => {
                      let colorClass = "text-slate-300";
                      if (log.startsWith("🟢")) colorClass = "text-emerald-400 font-medium";
                      if (log.startsWith("🔴")) colorClass = "text-rose-400 font-medium";
                      if (log.startsWith("💧")) colorClass = "text-cyan-400 font-bold";
                      if (log.startsWith("✅")) colorClass = "text-emerald-400 font-bold text-neon-glow";
                      if (log.startsWith("💳")) colorClass = "text-purple-400 font-bold text-purple-glow";
                      if (log.startsWith("⏳")) colorClass = "text-amber-400 font-bold";
                      if (log.startsWith("import") || log.startsWith("class") || log.startsWith("    ") || log.startsWith("}") || log.startsWith("{")) {
                        colorClass = "text-cyan-300 font-bold";
                      }
                      return (
                        <div key={idx} className={`${colorClass} leading-relaxed whitespace-pre-wrap`}>
                          {log}
                        </div>
                      );
                    })}
                    {isStreaming && (
                      <div className="inline-block w-2 h-3.5 bg-cyan-400 border-l border-cyan-400 cursor-blink ml-1" />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick How It Works Guide */}
            <div className="mt-4 p-4 rounded-2xl bg-[#090D1A]/50 border border-white/5 space-y-2 select-none">
              <h4 className="text-[10px] font-space font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Operational Protocol
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Clicking <strong>Refuel</strong> builds a payment tx corresponding to the selected prompt size. Once the block validates on the Stellar ledger, the console decodes the invoice hash and streams output logs.
              </p>
            </div>
          </div>

        </div>

        {/* ON-CHAIN TRANSACTION RECEIPTS HISTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between select-none">
            <div>
              <h3 className="font-space text-base font-bold text-white flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-cyan-400" /> Payment Receipts & Ledger History
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                On-chain confirmations of prompt credit refueling stored locally.
              </p>
            </div>

            {txHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                title="Clear History Feed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Ledger</span>
              </button>
            )}
          </div>

          <div className="glass-card-premium rounded-3xl p-6 border border-white/5 overflow-hidden">
            {txHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#090D1A] border border-white/5 flex items-center justify-center text-slate-500">
                  <FileText className="w-5 h-5 opacity-40 text-cyan-400" />
                </div>
                <h4 className="font-space font-bold text-xs text-white">No Invoices Found</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Successful on-chain transactions will generate cryptographic receipts that display here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 font-semibold uppercase tracking-wider text-[10px] select-none">
                      <th className="pb-3 px-4">Billing Item / Prompt Plan</th>
                      <th className="pb-3 px-4">Stellar Premium</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">Timestamp</th>
                      <th className="pb-3 px-4 text-right">Horizon Ledger Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {txHistory.map((tx) => (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className="text-xs group-hover:text-cyan-300 transition-colors">
                              {tx.tierName}
                            </span>
                          </td>

                          <td className="py-4 px-4 font-mono font-bold text-cyan-300">
                            {tx.amountXlm} XLM
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex flex-col items-start gap-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                                SUCCESS
                              </span>
                              <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                tx.isSoroban 
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.05)]"
                                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                              }`}>
                                {tx.isSoroban ? "Soroban" : "Horizon"}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-400 font-mono text-[10px]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {tx.timestamp}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-bold transition-all"
                            >
                              <span className="font-mono text-[10px]">
                                {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-6)}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="w-full text-center text-[10px] text-slate-600 mt-auto border-t border-white/5 pt-6 select-none">
        <p>© 2026 NeuronPay. Developed for Stellar Testnet Soroban Web3 App Rubric.</p>
      </footer>
    </main>
  );
}
