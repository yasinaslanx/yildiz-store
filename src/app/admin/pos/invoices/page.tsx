"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Printer,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
} from "lucide-react";

type InvoiceItem = {
  id: string;
  productName: string;
  brand: string;
  quantity: number;
  price: number;
};

type InvoiceTx = {
  id: string;
  type: "DEBT" | "PAYMENT";
  amount: number;
  description: string;
  createdAt: string;
};

type Invoice = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  deliveryType: string;
  totalUSD: number;
  discountAmount: number;
  debtAmount: number;
  paidAmount: number;
  remainingDebt: number;
  isPaid: boolean;
  itemCount: number;
  items: InvoiceItem[];
  dealer: { id: string; name: string; email: string; phone: string } | null;
  transactions: InvoiceTx[];
};

type Stats = {
  totalDebt: number;
  totalRevenue: number;
  totalInvoices: number;
  unpaidCount: number;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "debt" | "paid">("all");
  const [hideZero, setHideZero] = useState(true);

  // Detail drawer
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        hideZero: hideZero.toString(),
      });
      const res = await fetch(`/api/admin/pos/invoices?${params}`);
      const data = await res.json();
      if (data.success) {
        // Arama varsa önceliklendirme: prefix eşleşmesi → içinde geçen → alfabetik
        let results: Invoice[] = data.invoices;
        if (search.trim()) {
          const q = search.trim().toLocaleLowerCase("tr-TR");
          const score = (inv: Invoice) => {
            const name = inv.customerName.toLocaleLowerCase("tr-TR");
            const phone = inv.customerPhone.toLocaleLowerCase("tr-TR");
            const orderNo = inv.orderNumber.toLocaleLowerCase("tr-TR");
            if (name.startsWith(q) || orderNo.startsWith(q)) return 0;        // başından eşleşiyor
            if (phone.startsWith(q)) return 1;
            if (name.includes(q) || orderNo.includes(q)) return 2;            // içinde geçiyor
            return 3;
          };
          results = [...results].sort((a, b) => {
            const diff = score(a) - score(b);
            if (diff !== 0) return diff;
            return a.customerName.localeCompare(b.customerName, "tr-TR");     // aynı skorsa alfabetik
          });
        }
        setInvoices(results);
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, hideZero]);

  useEffect(() => {
    const timer = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const fmt = (n: number) =>
    n.toFixed(2).replace(".", ",") + " $";

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* HEADER */}
      <div className="bg-white border-b border-stone-200 px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">
                POS Sistemi
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                Faturalar
              </h1>
              <p className="text-stone-500 font-bold mt-1 text-sm">
                Tüm toptan satış fişleri ve ödeme durumları
              </p>
            </div>
            <a
              href="/admin/pos"
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition"
            >
              POS&apos;a Dön
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* İSTATİSTİK KARTLARI */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">
                  Toplam Fatura
                </p>
                <p className="text-2xl font-black text-stone-900">
                  {stats.totalInvoices}
                </p>
                <p className="text-[10px] text-stone-400 font-bold mt-0.5 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Kayıtlı Fiş
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">
                  Açık Borç
                </p>
                <p className="text-2xl font-black text-red-600">
                  {fmt(stats.totalDebt)}
                </p>
                <p className="text-[10px] text-red-400 font-bold mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {stats.unpaidCount} ödenmemiş
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-green-400 mb-1">
                  Toplam Tahsilat
                </p>
                <p className="text-2xl font-black text-green-600">
                  {fmt(stats.totalRevenue)}
                </p>
                <p className="text-[10px] text-green-400 font-bold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Alınan Ödeme
                </p>
              </div>
              <div className="bg-stone-900 rounded-2xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">
                  Ödeme Oranı
                </p>
                <p className="text-2xl font-black text-white">
                  {stats.totalInvoices > 0
                    ? Math.round(
                        ((stats.totalInvoices - stats.unpaidCount) /
                          stats.totalInvoices) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="text-[10px] text-stone-400 font-bold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Tahsilat Başarısı
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-8 space-y-6">
        {/* FİLTRELER */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center gap-4">
          {/* Arama */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Müşteri adı, telefon, fiş no..."
              className="w-full border-2 border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold outline-none focus:border-stone-900 transition"
            />
          </div>

          {/* Durum Filtresi */}
          <div className="flex gap-2">
            {(
              [
                { key: "all", label: "Tümü" },
                { key: "debt", label: "Borçlu" },
                { key: "paid", label: "Ödendi" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-150 ${
                  statusFilter === opt.key
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 0 TL Gizle */}
          <button
            onClick={() => setHideZero(!hideZero)}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-150 border-2 ${
              hideZero
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-400"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            0$ Gizle
          </button>

          {/* Sonuç sayısı */}
          <span className="text-xs font-bold text-stone-400 ml-auto">
            {invoices.length} fatura
          </span>
        </div>

        {/* FATURA LİSTESİ */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-stone-400 font-bold">
              Yükleniyor...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 font-bold">Fatura bulunamadı.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-[9px] font-black uppercase tracking-widest text-stone-400">
                <tr>
                  <th className="px-5 py-3">Fiş No</th>
                  <th className="px-5 py-3">Müşteri / Bayi</th>
                  <th className="px-5 py-3">Tarih</th>
                  <th className="px-5 py-3 text-center">Ürün</th>
                  <th className="px-5 py-3 text-right">Tutar</th>
                  <th className="px-5 py-3 text-right">Ödenen</th>
                  <th className="px-5 py-3 text-right">Kalan Borç</th>
                  <th className="px-5 py-3 text-center">Durum</th>
                  <th className="px-5 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`cursor-pointer transition-all duration-150 hover:bg-stone-50 group ${
                      !inv.isPaid && inv.remainingDebt > 0
                        ? "border-l-4 border-l-red-400"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-black text-stone-900 group-hover:text-stone-700">
                        {inv.orderNumber.replace("POS-", "")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p
                        className={`text-sm font-black ${
                          !inv.isPaid && inv.remainingDebt > 0
                            ? "text-red-600"
                            : "text-stone-900"
                        }`}
                      >
                        {inv.customerName}
                      </p>
                      {inv.customerPhone && (
                        <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {inv.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-stone-700">
                        {fmtDate(inv.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 text-[10px] font-black px-2.5 py-1 rounded-lg">
                        <Package className="w-3 h-3" />
                        {inv.itemCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-black text-stone-900">
                        {fmt(inv.totalUSD)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-black text-green-600">
                        {fmt(inv.paidAmount)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`text-sm font-black ${
                          inv.remainingDebt > 0
                            ? "text-red-600"
                            : "text-stone-400"
                        }`}
                      >
                        {fmt(inv.remainingDebt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {inv.isPaid ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" />
                          Ödendi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" />
                          Borçlu
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(inv);
                          }}
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-stone-100 transition text-stone-400 hover:text-stone-900"
                          title="Detayları Gör"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/admin/pos/${inv.id}/print`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-stone-100 transition text-stone-400 hover:text-stone-900"
                          title="Faturayı Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAY DRAWER */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl animate-slide-in">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-5 flex items-center justify-between z-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                  Fatura Detayı
                </p>
                <h2 className="text-lg font-black text-stone-900">
                  {selectedInvoice.orderNumber.replace("POS-", "FŞ-")}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/pos/${selectedInvoice.id}/print`}
                  target="_blank"
                  className="flex items-center gap-1.5 bg-white text-stone-900 border-2 border-stone-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-100 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Yazdır
                </a>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="cursor-pointer p-2 rounded-xl hover:bg-stone-100 transition text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* DURUM BADGE */}
              <div
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  selectedInvoice.isPaid
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-widest ${
                      selectedInvoice.isPaid ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {selectedInvoice.isPaid ? "✓ Ödendi" : "⚠ Ödenmemiş"}
                  </p>
                  <p className="text-2xl font-black mt-1 text-stone-900">
                    {fmt(selectedInvoice.totalUSD)}
                  </p>
                </div>
                {!selectedInvoice.isPaid && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-red-400">
                      Kalan
                    </p>
                    <p className="text-xl font-black text-red-600">
                      {fmt(selectedInvoice.remainingDebt)}
                    </p>
                  </div>
                )}
              </div>

              {/* MÜŞTERİ BİLGİLERİ */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3">
                  Müşteri Bilgileri
                </p>
                <div className="bg-stone-50 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center text-[10px] font-black">
                      {selectedInvoice.customerName[0]}
                    </div>
                    <span className="text-stone-900 font-black">
                      {selectedInvoice.customerName}
                    </span>
                    {selectedInvoice.dealer && (
                      <a
                        href={`/admin/pos/dealers/${selectedInvoice.dealer.id}/ledger`}
                        target="_blank"
                        className="ml-auto text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 flex items-center gap-1 transition"
                      >
                        Cari Hesap
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {selectedInvoice.customerPhone && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedInvoice.customerPhone}
                    </div>
                  )}
                  {selectedInvoice.shippingAddress && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedInvoice.shippingAddress}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    {fmtDateTime(selectedInvoice.createdAt)}
                  </div>
                </div>
              </div>

              {/* ÜRÜNLER */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3">
                  Alınan Ürünler ({selectedInvoice.itemCount})
                </p>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-stone-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-stone-900 uppercase">
                            {item.brand} {item.productName}
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold">
                            {item.quantity} adet × {fmt(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-stone-900">
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Özet */}
                <div className="mt-3 p-3 border border-stone-200 rounded-xl space-y-1.5 text-xs font-bold">
                  <div className="flex justify-between text-stone-500">
                    <span>Ara Toplam</span>
                    <span>{fmt(selectedInvoice.totalUSD + selectedInvoice.discountAmount)}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>İndirim</span>
                      <span>-{fmt(selectedInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-stone-900 pt-1.5 border-t border-stone-200">
                    <span>Genel Toplam</span>
                    <span>{fmt(selectedInvoice.totalUSD)}</span>
                  </div>
                </div>
              </div>

              {/* ÖDEME HAREKETLERİ */}
              {selectedInvoice.transactions.length > 0 && (
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3">
                    Ödeme Hareketleri
                  </p>
                  <div className="space-y-2">
                    {selectedInvoice.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          tx.type === "PAYMENT"
                            ? "bg-green-50 border border-green-100"
                            : "bg-red-50 border border-red-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {tx.type === "PAYMENT" ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <div>
                            <p
                              className={`text-xs font-black ${
                                tx.type === "PAYMENT"
                                  ? "text-green-700"
                                  : "text-red-600"
                              }`}
                            >
                              {tx.type === "PAYMENT" ? "Ödeme" : "Borç"}
                            </p>
                            <p className="text-[10px] text-stone-400 font-bold">
                              {tx.description} · {fmtDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-black ${
                            tx.type === "PAYMENT"
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "PAYMENT" ? "+" : "-"}
                          {fmt(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bakiye Özeti */}
                  <div
                    className={`mt-3 p-3 rounded-xl text-sm font-black flex justify-between items-center ${
                      selectedInvoice.isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      {selectedInvoice.isPaid ? "Hesap Kapalı" : "Kalan Borç"}
                    </span>
                    <span>{fmt(selectedInvoice.remainingDebt)}</span>
                  </div>
                </div>
              )}

              {/* CARİ HESABA GİT */}
              {selectedInvoice.dealer && (
                <a
                  href={`/admin/pos/dealers/${selectedInvoice.dealer.id}/ledger`}
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-white text-stone-900 border-2 border-stone-900 rounded-2xl hover:bg-stone-100 transition cursor-pointer group"
                >
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
                      Bayi Cari Hesabı
                    </p>
                    <p className="text-sm font-black">
                      {selectedInvoice.dealer.name}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-white transition" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
      ` }} />
    </div>
  );
}
