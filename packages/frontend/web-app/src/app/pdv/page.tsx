'use client';

import { useState, useEffect, useReducer, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  PersonAdd,
  Percent,
  Payments,
  CreditCard,
  AccountBalance,
  QrCode,
  Handshake,
  Restaurant,
  Fastfood,
  Storefront,
  CheckCircle,
  Cancel,
  Print,
  Receipt,
  Money,
  Pix,
  Keyboard,
} from '@mui/icons-material';
import { pdvApi, inventoryApi, crmApi } from '@/lib/api';
import toast from 'react-hot-toast';

// Types
interface CartItem {
  id: string;
  codigo: string;
  nome: string;
  preco: number;
  quantidade: number;
  unidade: string;
}

interface CartItemAction {
  type: 'ADD_ITEM' | 'REMOVE_ITEM' | 'UPDATE_QTY' | 'CLEAR';
  payload?: any;
}

interface PaymentEntry {
  method: string;
  valor: number;
  detalhes?: any;
}

interface ProductSuggestion {
  id: string;
  codigo: string;
  nome: string;
  preco: number;
  precoVenda: number;
  unidade: string;
}

interface CustomerResult {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
}

interface CouponResult {
  codigo: string;
  tipo: 'PERCENTUAL' | 'FIXO';
  valor: number;
  descricao: string;
}

interface PdvResult {
  id: string;
  nome: string;
  status: string;
}

// Sound effects
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch { }
}

function playSuccess() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.2);
  } catch { }
}

function playError() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 300;
    osc.type = 'sawtooth';
    gain.gain.value = 0.2;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch { }
}

function formatMoney(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function cartReducer(state: CartItem[], action: CartItemAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.payload.id);
      if (existing) {
        return state.map(i =>
          i.id === action.payload.id
            ? { ...i, quantidade: i.quantidade + (action.payload.quantidade || 1) }
            : i
        );
      }
      return [...state, {
        id: action.payload.id,
        codigo: action.payload.codigo,
        nome: action.payload.nome,
        preco: action.payload.precoVenda || action.payload.preco,
        quantidade: action.payload.quantidade || 1,
        unidade: action.payload.unidade || 'UN',
      }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload);
    case 'UPDATE_QTY': {
      const { id, quantidade } = action.payload;
      if (quantidade <= 0) return state.filter(i => i.id !== id);
      return state.map(i => i.id === id ? { ...i, quantidade } : i);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export default function PdvPage() {
  // Refs
  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  // Cart state
  const [cartItems, dispatch] = useReducer(cartReducer, []);
  const [subtotal, setSubtotal] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  // PDV state
  const [pdvAtivo, setPdvAtivo] = useState<PdvResult | null>(null);
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);

  // Customer state
  const [customer, setCustomer] = useState<CustomerResult | null>(null);
  const [customerDialog, setCustomerDialog] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [cpfNaNota, setCpfNaNota] = useState('');

  // Discount state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'PERCENTUAL' | 'FIXO' | null>(null);
  const [discountDesc, setDiscountDesc] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Payment state
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [mistoDialog, setMistoDialog] = useState(false);
  const [mistoPayments, setMistoPayments] = useState<PaymentEntry[]>([]);
  const [mistoMethod, setMistoMethod] = useState('');

  // Cash
  const [trocoPara, setTrocoPara] = useState(0);
  const [troco, setTroco] = useState(0);

  // Credit card
  const [parcelas, setParcelas] = useState(1);
  const [cardBrand, setCardBrand] = useState('Visa');

  // PIX
  const [pixQrCode, setPixQrCode] = useState('');
  const [pixCopiaCola, setPixCopiaCola] = useState('');
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const [processingPix, setProcessingPix] = useState(false);

  // Convênio
  const [convenioSearch, setConvenioSearch] = useState('');
  const [convenioResults, setConvenioResults] = useState<any[]>([]);
  const [selectedConvenio, setSelectedConvenio] = useState<any>(null);
  const [convenioContract, setConvenioContract] = useState('');

  // Receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [totalPago, setTotalPago] = useState(0);

  // Quick categories
  const categories = [
    { label: 'Padaria', icon: '🍞', filter: 'padaria' },
    { label: 'Açougue', icon: '🥩', filter: 'acougue' },
    { label: 'Hortifrúti', icon: '🥬', filter: 'hortifruti' },
    { label: 'Mercearia', icon: '🧃', filter: 'mercearia' },
    { label: 'Bebidas', icon: '🥤', filter: 'bebidas' },
    { label: 'Limpeza', icon: '🧹', filter: 'limpeza' },
  ];

  // Payment method definitions
  const paymentMethods = [
    { id: 'DINHEIRO', label: 'Dinheiro', icon: <Money sx={{ fontSize: 40 }} />, color: '#2e7d32' },
    { id: 'CARTAO_CREDITO', label: 'Cartão\nCrédito', icon: <CreditCard sx={{ fontSize: 40 }} />, color: '#1565c0' },
    { id: 'CARTAO_DEBITO', label: 'Cartão\nDébito', icon: <AccountBalance sx={{ fontSize: 40 }} />, color: '#0d47a1' },
    { id: 'PIX', label: 'PIX', icon: <Pix sx={{ fontSize: 40 }} />, color: '#32bcad' },
    { id: 'CONVENIO', label: 'Convênio', icon: <Handshake sx={{ fontSize: 40 }} />, color: '#e65100' },
    { id: 'VALE_ALIMENTACAO', label: 'Vale\nAlimentação', icon: <Restaurant sx={{ fontSize: 40 }} />, color: '#827717' },
    { id: 'VALE_REFEICAO', label: 'Vale\nRefeição', icon: <Fastfood sx={{ fontSize: 40 }} />, color: '#4e342e' },
    { id: 'CREDIARIO', label: 'Crediário', icon: <Storefront sx={{ fontSize: 40 }} />, color: '#6a1b9a' },
    { id: 'MISTO', label: 'Misto', icon: <Payments sx={{ fontSize: 40 }} />, color: '#37474f' },
  ];

  // Compute totals
  useEffect(() => {
    const s = cartItems.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
    setSubtotal(s);
  }, [cartItems]);

  const valorDesconto = discountType === 'PERCENTUAL'
    ? subtotal * (discount / 100)
    : discountType === 'FIXO'
      ? Math.min(discount, subtotal)
      : 0;

  const totalPagar = subtotal - valorDesconto;

  const valorJaPago = payments.reduce((acc, p) => acc + p.valor, 0);
  const trocoCalc = totalPago > totalPagar ? totalPago - totalPagar : 0;

  // Auto-select first available PDV
  useEffect(() => {
    async function loadPdv() {
      try {
        const { data } = await pdvApi.get('/pdv?status=LIVRE');
        const list = Array.isArray(data) ? data : data.data || [];
        if (list.length > 0) setPdvAtivo(list[0]);
      } catch { }
    }
    loadPdv();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showReceipt || confirmCancel || confirmFinalize || paymentDialog) return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case 'F2':
          e.preventDefault();
          qtyRef.current?.focus();
          break;
        case 'F3':
          e.preventDefault();
          document.getElementById('coupon-input')?.focus();
          break;
        case 'F4':
          e.preventDefault();
          document.getElementById('payment-area')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'F5':
          e.preventDefault();
          if (cartItems.length > 0) {
            setConfirmFinalize(true);
          }
          break;
        case 'F8':
          e.preventDefault();
          if (cartItems.length > 0) setConfirmCancel(true);
          break;
        case 'Escape':
          e.preventDefault();
          if (customerDialog) setCustomerDialog(false);
          else if (paymentDialog) setPaymentDialog(null);
          else if (confirmCancel) setConfirmCancel(false);
          else if (confirmFinalize) setConfirmFinalize(false);
          else if (showReceipt) { resetSale(); }
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReceipt, confirmCancel, confirmFinalize, paymentDialog, customerDialog, cartItems, totalPagar]);

  // Search products
  const searchProducts = useCallback(async (term: string) => {
    if (!term || term.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    try {
      const { data } = await inventoryApi.get('/produtos', { params: { search: term, limite: 10 } });
      const list = Array.isArray(data) ? data : data.data || data.content || [];
      setSuggestions(list);
      setShowSuggestions(list.length > 0);
    } catch { setSuggestions([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  function selectProduct(product: ProductSuggestion) {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, precoVenda: product.precoVenda || product.preco } });
    playBeep();
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchRef.current?.focus();
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      selectProduct(suggestions[0]);
    }
  }

  function handleSearchByBarcode(value: string) {
    if (value.length >= 8) {
      searchProducts(value);
      setTimeout(() => {
        if (suggestions.length > 0) {
          selectProduct(suggestions[0]);
        }
      }, 500);
    }
  }

  // Category search
  async function searchByCategory(filter: string) {
    setSearchTerm(filter);
    setSearching(true);
    try {
      const { data } = await inventoryApi.get('/produtos', { params: { categoria: filter, limite: 20 } });
      const list = Array.isArray(data) ? data : data.data || data.content || [];
      setSuggestions(list);
      setShowSuggestions(true);
    } catch { }
    finally { setSearching(false); }
  }

  // Customer search
  async function searchCustomers(term: string) {
    if (term.length < 2) { setCustomerResults([]); return; }
    setSearchingCustomer(true);
    try {
      const { data } = await crmApi.get('/clientes', { params: { search: term } });
      setCustomerResults(Array.isArray(data) ? data : data.data || []);
    } catch { setCustomerResults([]); }
    finally { setSearchingCustomer(false); }
  }

  function selectCustomer(c: CustomerResult) {
    setCustomer(c);
    setCpfNaNota(c.cpfCnpj || '');
    setCustomerDialog(false);
    setCustomerSearch('');
    toast.success(`Cliente ${c.nome} adicionado`);
  }

  // Coupon
  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await pdvApi.post('/cupons/validar', { codigo: couponCode, valorTotal: subtotal });
      setDiscount(data.valor || data.desconto || 0);
      setDiscountType(data.tipo || 'PERCENTUAL');
      setDiscountDesc(data.descricao || '');
      toast.success(`Cupom aplicado: ${data.descricao || couponCode}`);
    } catch {
      toast.error('Cupom inválido ou expirado');
      playError();
    }
    finally { setApplyingCoupon(false); }
  }

  // Payment handlers
  function openPaymentDialog(method: string) {
    if (method === 'MISTO') {
      setMistoPayments([]);
      setMistoMethod('');
      setMistoDialog(true);
      return;
    }
    setPaymentDialog(method);
    setTrocoPara(0);
    setTroco(0);
    setParcelas(1);
    setCardBrand('Visa');
    setPixQrCode('');
    setPixCopiaCola('');
    setPixConfirmed(false);
    if (method === 'PIX') generatePix();
  }

  function confirmCashPayment() {
    const valorPago = trocoPara > 0 ? trocoPara : totalPagar;
    setTotalPago(valorPago);
    setTroco(valorPago > totalPagar ? valorPago - totalPagar : 0);
    const entry: PaymentEntry = { method: 'DINHEIRO', valor: valorPago, detalhes: { trocoPara: valorPago } };
    setPayments([entry]);
    setPaymentDialog(null);
    toast.success(`Pagamento em dinheiro: ${formatMoney(valorPago)}`);
  }

  function confirmCardPayment() {
    const entry: PaymentEntry = {
      method: paymentDialog === 'CARTAO_CREDITO' ? 'CARTAO_CREDITO' : 'CARTAO_DEBITO',
      valor: totalPagar,
      detalhes: { parcelas, bandeira: cardBrand },
    };
    setPayments([entry]);
    setTotalPago(totalPagar);
    setPaymentDialog(null);
    toast.success(`Cartão ${paymentDialog === 'CARTAO_CREDITO' ? 'Crédito' : 'Débito'}: ${formatMoney(totalPagar)}`);
  }

  async function generatePix() {
    setProcessingPix(true);
    try {
      const { data } = await pdvApi.post('/pagamentos/processar', {
        metodo: 'PIX',
        valor: totalPagar,
        vendaId: currentSaleId || `temp-${Date.now()}`,
      });
      setPixQrCode(data.qrCode || data.qrcode || '');
      setPixCopiaCola(data.copiaECola || data.pixCopiaECola || data.txid || '');
      setPixConfirmed(false);
    } catch {
      // Generate a mock PIX for demo
      setPixQrCode('iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABlBMVEX///8AAABVwtN+AAAAWklEQVRYw2NgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgYBaNgFIyCUTAKRsEoGAWjYBSMglEwCgDcRQAW4AG9HwAAAABJRU5ErkJggg==');
      setPixCopiaCola(`00020126580014BR.GOV.BCB.PIX0136${Date.now()}@pix.com5204000053039865406${totalPagar.toFixed(2)}5802BR5925Supermercado CRM6008BRASILIA62070503***6304ABCD`);
    }
    finally { setProcessingPix(false); }
  }

  function confirmPixPayment() {
    const entry: PaymentEntry = { method: 'PIX', valor: totalPagar, detalhes: { pixCopiaCola, pixQrCode } };
    setPayments([entry]);
    setTotalPago(totalPagar);
    setPixConfirmed(true);
    setPaymentDialog(null);
    toast.success('Pagamento PIX confirmado');
  }

  function confirmConvenioPayment() {
    if (!selectedConvenio) { toast.error('Selecione um convênio'); return; }
    const entry: PaymentEntry = {
      method: 'CONVENIO',
      valor: totalPagar,
      detalhes: { convenioId: selectedConvenio.id, contrato: convenioContract },
    };
    setPayments([entry]);
    setTotalPago(totalPagar);
    setPaymentDialog(null);
    toast.success(`Convênio: ${selectedConvenio.nome}`);
  }

  function confirmDirectPayment(method: string) {
    const entry: PaymentEntry = { method, valor: totalPagar };
    setPayments([entry]);
    setTotalPago(totalPagar);
    setPaymentDialog(null);
    toast.success(`Pagamento: ${method}`);
  }

  function addMistoPayment() {
    if (!mistoMethod || !totalPagar) return;
    const remaining = totalPagar - mistoPayments.reduce((a, p) => a + p.valor, 0);
    if (remaining <= 0) { toast.error('Valor já totalmente coberto'); return; }
    setMistoPayments([...mistoPayments, { method: mistoMethod, valor: remaining, detalhes: {} }]);
    setMistoMethod('');
  }

  function confirmMistoPayment() {
    const totalMisto = mistoPayments.reduce((a, p) => a + p.valor, 0);
    if (totalMisto < totalPagar - 0.01) { toast.error('Valor total não atingido'); return; }
    setPayments(mistoPayments);
    setTotalPago(totalPagar);
    setMistoDialog(false);
    toast.success('Pagamento misto configurado');
  }

  // Checkout
  async function finalizeSale() {
    if (cartItems.length === 0) return;
    setFinalizing(true);
    try {
      const salePayload = {
        pdvId: pdvAtivo?.id || '1',
        companyId: '1',
        unidadeId: '1',
        clienteId: customer?.id || null,
        cpfNaNota: cpfNaNota || null,
        itens: cartItems.map(i => ({
          produtoId: i.id,
          codigo: i.codigo,
          nome: i.nome,
          quantidade: i.quantidade,
          precoUnitario: i.preco,
          total: i.preco * i.quantidade,
        })),
        descontos: discount > 0 ? [{ tipo: discountType, valor: valorDesconto, descricao: discountDesc }] : [],
        pagamentos: payments.map(p => ({
          metodo: p.method,
          valor: p.valor,
          detalhes: p.detalhes || {},
        })),
        subtotal,
        totalDesconto: valorDesconto,
        total: totalPagar,
      };

      const { data: saleData } = await pdvApi.post('/vendas', salePayload);
      const saleId = saleData.id || saleData.vendaId;

      await pdvApi.post(`/vendas/${saleId}/finalizar`);

      playSuccess();
      setReceiptData({
        id: saleId,
        numero: saleData.numero || saleId,
        data: new Date().toISOString(),
        itens: cartItems,
        subtotal,
        desconto: valorDesconto,
        total: totalPagar,
        pagamentos: payments,
        troco: payments.some(p => p.method === 'DINHEIRO') ? troco : 0,
        cliente: customer,
        pix: payments.find(p => p.method === 'PIX')?.detalhes,
      });
      setShowReceipt(true);
      setCurrentSaleId(saleId);
      toast.success('Venda finalizada com sucesso!');
    } catch {
      playError();
      toast.error('Erro ao finalizar a venda');
    }
    finally { setFinalizing(false); setConfirmFinalize(false); }
  }

  async function cancelSale() {
    if (currentSaleId) {
      try {
        await pdvApi.post(`/vendas/${currentSaleId}/cancelar`);
      } catch { }
    }
    resetSale();
    toast.success('Venda cancelada');
    setConfirmCancel(false);
  }

  function resetSale() {
    dispatch({ type: 'CLEAR' });
    setCustomer(null);
    setCpfNaNota('');
    setCouponCode('');
    setDiscount(0);
    setDiscountType(null);
    setDiscountDesc('');
    setPayments([]);
    setTotalPago(0);
    setTroco(0);
    setShowReceipt(false);
    setReceiptData(null);
    setCurrentSaleId(null);
    setPixQrCode('');
    setPixCopiaCola('');
    searchRef.current?.focus();
  }

  async function reprintReceipt() {
    try {
      if (receiptData?.id) {
        await pdvApi.post(`/vendas/${receiptData.id}/reimprimir`);
        toast.success('Comando de reimpressão enviado');
      }
    } catch {
      toast.error('Erro ao reimprimir');
    }
  }

  // Convenio search
  async function searchConvenios(term: string) {
    if (term.length < 2) { setConvenioResults([]); return; }
    try {
      const { data } = await pdvApi.get('/convenios', { params: { search: term } });
      setConvenioResults(Array.isArray(data) ? data : data.data || []);
    } catch { setConvenioResults([]); }
  }

  return (
    <Box className="pos-interface" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
      {/* Keyboard shortcuts bar */}
      <Box sx={{ bgcolor: '#263238', color: '#b0bec5', px: 2, py: 0.5, display: 'flex', gap: 2, fontSize: 12, alignItems: 'center' }}>
        <Keyboard sx={{ fontSize: 16 }} />
        <span><b>F1</b> Busca</span>
        <span><b>F2</b> Qtd</span>
        <span><b>F3</b> Cupom</span>
        <span><b>F4</b> Pagto</span>
        <span><b>F5</b> Finalizar</span>
        <span><b>F8</b> Cancelar</span>
        <span><b>ESC</b> Voltar</span>
        {pdvAtivo && <Chip label={`PDV: ${pdvAtivo.nome || pdvAtivo.id}`} size="small" sx={{ ml: 'auto', color: '#fff', bgcolor: '#37474f', height: 20, fontSize: 11 }} />}
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL - 65% */}
        <Box sx={{ width: '65%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #e0e0e0', bgcolor: '#fff' }}>
          {/* Search bar */}
          <Box sx={{ p: 2, pb: 1, position: 'relative' }}>
            <TextField
              inputRef={searchRef}
              fullWidth
              size="medium"
              placeholder="Digite código de barras, nome do produto..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handleSearchByBarcode(e.target.value); }}
              onKeyDown={handleSearchKeyDown}
              autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                sx: { fontSize: 18, borderRadius: 2, bgcolor: '#fafafa', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bdbdbd', borderWidth: 2 } },
              }}
            />
            {searching && <LinearProgress sx={{ mt: 0.5 }} />}
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <Paper sx={{ position: 'absolute', zIndex: 100, left: 16, right: 16, top: 80, maxHeight: 300, overflow: 'auto', boxShadow: 4 }}>
                <List dense>
                  {suggestions.map((p) => (
                    <ListItem key={p.id} component="button" onClick={() => selectProduct(p)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' }, textAlign: 'left', border: 'none', width: '100%', display: 'flex', gap: 1 }}>
                      <ListItemAvatar><Avatar sx={{ bgcolor: '#1565c0', width: 36, height: 36 }}>{p.nome[0]}</Avatar></ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight="medium">{p.nome}</Typography>}
                        secondary={<>{p.codigo} - {formatMoney(p.precoVenda || p.preco)} / {p.unidade}</>}
                      />
                      <Chip label={formatMoney(p.precoVenda || p.preco)} color="primary" size="small" />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            {/* Category quick buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <Chip
                  key={cat.filter}
                  label={`${cat.icon} ${cat.label}`}
                  variant="outlined"
                  onClick={() => searchByCategory(cat.filter)}
                  sx={{ fontSize: 13, py: 1.5, '&:hover': { bgcolor: '#e3f2fd', borderColor: '#1565c0' }, cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>

          {/* Cart items table */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
            {cartItems.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9e9e9e' }}>
                <ShoppingCart sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5" color="text.secondary">Nenhum item na venda</Typography>
                <Typography variant="body2" color="text.secondary">Busque produtos acima ou escaneie o código de barras</Typography>
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr 120px 120px 80px', gap: 0, fontWeight: 'bold', fontSize: 14, bgcolor: '#f5f5f5', p: 1.5, borderBottom: '2px solid #e0e0e0' }}>
                  <Typography variant="body2" fontWeight="bold">Qtd</Typography>
                  <Typography variant="body2" fontWeight="bold">Código</Typography>
                  <Typography variant="body2" fontWeight="bold">Produto</Typography>
                  <Typography variant="body2" fontWeight="bold" textAlign="right">Preço Unit</Typography>
                  <Typography variant="body2" fontWeight="bold" textAlign="right">Total</Typography>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">Ações</Typography>
                </Box>
                {cartItems.map((item) => (
                  <Box key={item.id} sx={{
                    display: 'grid', gridTemplateColumns: '80px 120px 1fr 120px 120px 80px', gap: 0,
                    p: 1.5, borderBottom: '1px solid #f0f0f0', alignItems: 'center',
                    '&:hover': { bgcolor: '#fafafa' },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton size="small" color="primary" onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, quantidade: item.quantidade - 1 } })}>
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>{item.quantidade}</Typography>
                      <IconButton size="small" color="primary" onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, quantidade: item.quantidade + 1 } })}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>{item.codigo}</Typography>
                    <Typography variant="body2" fontWeight="medium">{item.nome}</Typography>
                    <Typography variant="body2" textAlign="right" sx={{ fontSize: 15 }}>{formatMoney(item.preco)}</Typography>
                    <Typography variant="body2" textAlign="right" fontWeight="bold" sx={{ fontSize: 16, color: '#1565c0' }}>{formatMoney(item.preco * item.quantidade)}</Typography>
                    <Box textAlign="center">
                      <IconButton size="small" color="error" onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* Cart summary at bottom of left panel */}
          <Box sx={{ p: 2, borderTop: '2px solid #e0e0e0', bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="h5" fontWeight="bold">{formatMoney(subtotal)}</Typography>
              </Box>
              {discount > 0 && (
                <Box>
                  <Typography variant="body2" color="error">Desconto</Typography>
                  <Typography variant="h6" color="error">-{formatMoney(valorDesconto)}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">{formatMoney(totalPagar)}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" color="warning" size="large" startIcon={<Cancel />}
                onClick={() => setConfirmCancel(true)} disabled={cartItems.length === 0}
                sx={{ flex: 1, py: 1.5, fontSize: 15 }}>
                Suspender Venda
              </Button>
              <Button variant="outlined" color="error" size="large" startIcon={<Delete />}
                onClick={() => setConfirmCancel(true)} disabled={cartItems.length === 0}
                sx={{ flex: 1, py: 1.5, fontSize: 15 }}>
                Cancelar Venda
              </Button>
            </Box>
          </Box>
        </Box>

        {/* RIGHT PANEL - 35% */}
        <Box id="payment-area" sx={{ width: '35%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
          {/* Customer section */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonAdd color="action" />
              <Typography variant="subtitle1" fontWeight="bold">Cliente</Typography>
            </Box>
            {customer ? (
              <Card variant="outlined" sx={{ p: 1.5, bgcolor: '#e8f5e9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">{customer.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">{customer.cpfCnpj}</Typography>
                    <Typography variant="body2" color="text.secondary">{customer.telefone}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setCustomer(null)}><Cancel fontSize="small" /></IconButton>
                </Box>
                <TextField size="small" label="CPF na nota" value={cpfNaNota} onChange={e => setCpfNaNota(e.target.value)}
                  sx={{ mt: 1, width: '100%' }} placeholder="CPF/CNPJ para nota fiscal" />
              </Card>
            ) : (
              <Button variant="outlined" fullWidth startIcon={<PersonAdd />} onClick={() => setCustomerDialog(true)}
                sx={{ py: 1.5, fontSize: 14 }}>
                Adicionar Cliente
              </Button>
            )}
          </Box>

          {/* Coupon/Discount section */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Percent color="action" />
              <Typography variant="subtitle1" fontWeight="bold">Cupom / Desconto</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                id="coupon-input"
                size="small"
                placeholder="Código do cupom"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                sx={{ flex: 1 }}
              />
              <Button variant="contained" color="warning" onClick={applyCoupon} disabled={applyingCoupon || !couponCode.trim()}
                sx={{ minWidth: 80 }}>
                {applyingCoupon ? '...' : 'Aplicar'}
              </Button>
            </Box>
            {discount > 0 && (
              <Alert severity="success" sx={{ mt: 1, py: 0 }}>
                Desconto {discountType === 'PERCENTUAL' ? `${discount}%` : formatMoney(discount)} aplicado!
                {discountDesc && <> - {discountDesc}</>}
              </Alert>
            )}
          </Box>

          {/* Payment methods grid */}
          <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Payments color="action" />
              <Typography variant="subtitle1" fontWeight="bold">Forma de Pagamento</Typography>
            </Box>
            <Grid container spacing={1}>
              {paymentMethods.map(pm => (
                <Grid xs={4} key={pm.id}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => openPaymentDialog(pm.id)}
                    disabled={cartItems.length === 0}
                    sx={{
                      display: 'flex', flexDirection: 'column', gap: 0.5, py: 1.5, minHeight: 80,
                      borderColor: '#bdbdbd', borderWidth: 2, borderRadius: 2,
                      color: pm.color,
                      '&:hover': { borderColor: pm.color, bgcolor: `${pm.color}10`, borderWidth: 2 },
                      '&.Mui-disabled': { opacity: 0.4 },
                      fontSize: 11, textTransform: 'none',
                      whiteSpace: 'pre-line', lineHeight: 1.2,
                    }}>
                    {pm.icon}
                    <Typography sx={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                      {pm.label}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Total summary */}
          <Box sx={{ p: 2, borderTop: '2px solid #e0e0e0', bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Itens:</Typography>
              <Typography variant="body2">{formatMoney(subtotal)}</Typography>
            </Box>
            {discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="error">Descontos:</Typography>
                <Typography variant="body2" color="error">-{formatMoney(valorDesconto)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h5" fontWeight="bold">Total a pagar:</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">{formatMoney(totalPagar)}</Typography>
            </Box>
            {valorJaPago > 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Valor pago:</Typography>
                  <Typography variant="body2" fontWeight="bold">{formatMoney(valorJaPago)}</Typography>
                </Box>
                {troco > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="success.main">Troco:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">{formatMoney(troco)}</Typography>
                  </Box>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={<CheckCircle />}
                onClick={() => setConfirmFinalize(true)}
                disabled={cartItems.length === 0 || totalPagar <= 0 || valorJaPago < totalPagar - 0.01 || finalizing}
                sx={{ py: 2, fontSize: 18, fontWeight: 'bold', minHeight: 56 }}>
                {finalizing ? 'Finalizando...' : 'Finalizar Venda'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* CUSTOMER DIALOG */}
      <Dialog open={customerDialog} onClose={() => setCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Cliente</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Buscar cliente (nome, CPF, telefone)" value={customerSearch}
            onChange={e => { setCustomerSearch(e.target.value); searchCustomers(e.target.value); }}
            sx={{ mt: 1 }} autoFocus />
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {customerResults.map(c => (
              <ListItem key={c.id} component="button" onClick={() => selectCustomer(c)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' }, border: 'none', width: '100%', textAlign: 'left', display: 'flex', gap: 1 }}>
                <ListItemAvatar><Avatar>{c.nome[0]}</Avatar></ListItemAvatar>
                <ListItemText primary={c.nome} secondary={`${c.cpfCnpj} | ${c.telefone}`} />
              </ListItem>
            ))}
            {customerResults.length === 0 && customerSearch.length >= 2 && (
              <Typography textAlign="center" color="text.secondary" py={2}>Nenhum cliente encontrado</Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* PAYMENT DIALOG - DINHEIRO */}
      <Dialog open={paymentDialog === 'DINHEIRO'} onClose={() => setPaymentDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Money color="success" /> Dinheiro
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3" fontWeight="bold" textAlign="center" color="primary.main" sx={{ my: 2 }}>
            {formatMoney(totalPagar)}
          </Typography>
          <TextField fullWidth label="Valor recebido (Troco para)" type="number"
            value={trocoPara || ''}
            onChange={e => { const v = parseFloat(e.target.value) || 0; setTrocoPara(v); setTroco(v > totalPagar ? v - totalPagar : 0); }}
            autoFocus
            inputProps={{ step: 0.01, min: 0 }}
            sx={{ mt: 1 }}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment>, sx: { fontSize: 24 } }} />
          {trocoPara >= totalPagar && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="h5" fontWeight="bold">Troco: {formatMoney(trocoPara - totalPagar)}</Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPaymentDialog(null)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
          <Button onClick={confirmCashPayment} variant="contained" color="success" disabled={trocoPara < totalPagar - 0.01 && trocoPara > 0}
            sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* PAYMENT DIALOG - CREDIT CARD */}
      <Dialog open={paymentDialog === 'CARTAO_CREDITO'} onClose={() => setPaymentDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCard color="primary" /> Cartão de Crédito
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3" fontWeight="bold" textAlign="center" color="primary.main" sx={{ my: 2 }}>
            {formatMoney(totalPagar)}
          </Typography>
          <TextField select fullWidth label="Parcelas" value={parcelas} onChange={e => setParcelas(Number(e.target.value))} sx={{ mt: 1 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <MenuItem key={n} value={n}>{n}x {n > 1 ? `- ${formatMoney(totalPagar / n)}` : 'à vista'}</MenuItem>
            ))}
          </TextField>
          <TextField select fullWidth label="Bandeira" value={cardBrand} onChange={e => setCardBrand(e.target.value)} sx={{ mt: 2 }}>
            {['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Diners', 'Discover'].map(b => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPaymentDialog(null)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
          <Button onClick={confirmCardPayment} variant="contained" color="primary" sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* PAYMENT DIALOG - DEBIT CARD */}
      <Dialog open={paymentDialog === 'CARTAO_DEBITO'} onClose={() => setPaymentDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance color="primary" /> Cartão de Débito
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3" fontWeight="bold" textAlign="center" color="primary.main" sx={{ my: 2 }}>
            {formatMoney(totalPagar)}
          </Typography>
          <TextField select fullWidth label="Bandeira" value={cardBrand} onChange={e => setCardBrand(e.target.value)} sx={{ mt: 1 }}>
            {['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard'].map(b => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPaymentDialog(null)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
          <Button onClick={confirmCardPayment} variant="contained" color="primary" sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* PAYMENT DIALOG - PIX */}
      <Dialog open={paymentDialog === 'PIX'} onClose={() => setPaymentDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Pix sx={{ color: '#32bcad' }} /> PIX
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
            {formatMoney(totalPagar)}
          </Typography>
          {processingPix ? (
            <LinearProgress />
          ) : (
            <>
              {pixQrCode && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX"
                    style={{ width: 200, height: 200, borderRadius: 8, border: '2px solid #e0e0e0' }} />
                </Box>
              )}
              {pixCopiaCola && (
                <TextField fullWidth multiline rows={2} value={pixCopiaCola}
                  InputProps={{ readOnly: true, sx: { fontSize: 12, fontFamily: 'monospace' } }}
                  label="Copia e Cola" sx={{ mb: 1 }} />
              )}
              <Button variant="outlined" onClick={generatePix} sx={{ mt: 1 }}>
                <QrCode sx={{ mr: 1 }} /> Gerar novo QR Code
              </Button>
              {!pixConfirmed && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Após o pagamento, clique em Confirmar
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPaymentDialog(null)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
          <Button onClick={confirmPixPayment} variant="contained"
            sx={{ flex: 1, py: 1.5, fontSize: 16, bgcolor: '#32bcad', '&:hover': { bgcolor: '#2aa89a' } }}>
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* PAYMENT DIALOG - CONVENIO */}
      <Dialog open={paymentDialog === 'CONVENIO'} onClose={() => setPaymentDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Handshake color="warning" /> Convênio
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3" fontWeight="bold" textAlign="center" color="primary.main" sx={{ my: 2 }}>
            {formatMoney(totalPagar)}
          </Typography>
          <TextField fullWidth label="Buscar convênio" value={convenioSearch}
            onChange={e => { setConvenioSearch(e.target.value); searchConvenios(e.target.value); }} autoFocus sx={{ mt: 1 }} />
          {convenioResults.length > 0 && (
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
              {convenioResults.map((c: any) => (
                <ListItem key={c.id} component="button" onClick={() => { setSelectedConvenio(c); setConvenioResults([]); }}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#fff3e0' }, border: 'none', width: '100%', textAlign: 'left' }}>
                  <ListItemText primary={c.nome} secondary={c.cnpj || c.contrato || ''} />
                </ListItem>
              ))}
            </List>
          )}
          {selectedConvenio && (
            <Alert severity="success" sx={{ mt: 1 }}>{selectedConvenio.nome} selecionado</Alert>
          )}
          <TextField fullWidth label="Nº Contrato (opcional)" value={convenioContract}
            onChange={e => setConvenioContract(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPaymentDialog(null)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
          <Button onClick={confirmConvenioPayment} variant="contained" color="warning" disabled={!selectedConvenio}
            sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIRECT PAYMENT DIALOGS - VALE ALIMENTACAO, VALE REFEICAO, CREDIARIO */}
      {['VALE_ALIMENTACAO', 'VALE_REFEICAO', 'CREDIARIO'].map(method => (
        <Dialog key={method} open={paymentDialog === method} onClose={() => setPaymentDialog(null)} maxWidth="xs" fullWidth>
          <DialogTitle>{paymentMethods.find(p => p.id === method)?.label.replace('\n', ' ')}</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" color="primary.main" sx={{ my: 3 }}>
              {formatMoney(totalPagar)}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setPaymentDialog(null)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
            <Button onClick={() => confirmDirectPayment(method)} variant="contained" sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
              Confirmar Pagamento
            </Button>
          </DialogActions>
        </Dialog>
      ))}

      {/* MISTO DIALOG */}
      <Dialog open={mistoDialog} onClose={() => setMistoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Payments /> Pagamento Misto
        </DialogTitle>
        <DialogContent>
          <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
            Total: {formatMoney(totalPagar)}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
            Restante: {formatMoney(totalPagar - mistoPayments.reduce((a, p) => a + p.valor, 0))}
          </Typography>

          {mistoPayments.map((mp, idx) => (
            <Alert key={idx} severity="info" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
              {mp.method}: {formatMoney(mp.valor)}
            </Alert>
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField select fullWidth label="Método" value={mistoMethod} onChange={e => setMistoMethod(e.target.value)}>
              {paymentMethods.filter(p => p.id !== 'MISTO').map(pm => (
                <MenuItem key={pm.id} value={pm.id}>{pm.label.replace('\n', ' ')}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" onClick={addMistoPayment} disabled={!mistoMethod}>Adicionar</Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setMistoDialog(false)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Cancelar</Button>
          <Button onClick={confirmMistoPayment} variant="contained" color="primary"
            disabled={mistoPayments.reduce((a, p) => a + p.valor, 0) < totalPagar - 0.01}
            sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM CANCEL DIALOG */}
      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancelar Venda</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja cancelar esta venda?</Typography>
          <Typography variant="body2" color="text.secondary">Todos os itens serão removidos.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmCancel(false)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Voltar</Button>
          <Button onClick={cancelSale} variant="contained" color="error" sx={{ flex: 1, py: 1.5 }}>Confirmar Cancelamento</Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM FINALIZE DIALOG */}
      <Dialog open={confirmFinalize} onClose={() => setConfirmFinalize(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Finalizar Venda</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Confirma a finalização da venda?</Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Itens:</Typography>
              <Typography fontWeight="bold">{cartItems.reduce((a, i) => a + i.quantidade, 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Total:</Typography>
              <Typography fontWeight="bold">{formatMoney(totalPagar)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Pago:</Typography>
              <Typography fontWeight="bold">{formatMoney(valorJaPago)}</Typography>
            </Box>
            {troco > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="success.main">Troco:</Typography>
                <Typography fontWeight="bold" color="success.main">{formatMoney(troco)}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmFinalize(false)} variant="outlined" sx={{ flex: 1, py: 1.5 }}>Voltar</Button>
          <Button onClick={finalizeSale} variant="contained" color="success" disabled={finalizing}
            sx={{ flex: 1, py: 1.5, fontSize: 16 }}>
            {finalizing ? 'Finalizando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* RECEIPT / SUCCESS SCREEN */}
      <Dialog open={showReceipt} onClose={() => { }} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
            Venda Finalizada!
          </Typography>

          {receiptData && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Nº Venda: <strong>{receiptData.numero}</strong>
              </Typography>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" fontWeight="bold" gutterBottom>Resumo</Typography>
                {receiptData.itens.map((item: CartItem) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.quantidade}x {item.nome}</Typography>
                    <Typography variant="body2">{formatMoney(item.preco * item.quantidade)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Subtotal</Typography>
                  <Typography>{formatMoney(receiptData.subtotal)}</Typography>
                </Box>
                {receiptData.desconto > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="error">Desconto</Typography>
                    <Typography color="error">-{formatMoney(receiptData.desconto)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">Total</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">{formatMoney(receiptData.total)}</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>Pagamentos</Typography>
                  {receiptData.pagamentos.map((p: PaymentEntry, idx: number) => (
                    <Typography key={idx}>{p.method}: {formatMoney(p.valor)}</Typography>
                  ))}
                </Box>

                {receiptData.troco > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Troco: {formatMoney(receiptData.troco)}
                  </Alert>
                )}

                {receiptData.cliente && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">Cliente: {receiptData.cliente.nome}</Typography>
                  </Box>
                )}

                {receiptData.pix?.pixCopiaCola && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>PIX Copia e Cola:</Typography>
                    <TextField fullWidth multiline rows={2} value={receiptData.pix.pixCopiaCola}
                      InputProps={{ readOnly: true, sx: { fontSize: 11, fontFamily: 'monospace' } }} />
                  </Box>
                )}
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="outlined" startIcon={<Print />} onClick={reprintReceipt}
              sx={{ flex: 1, py: 1.5, fontSize: 15 }}>
              Reimprimir
            </Button>
            <Button variant="contained" color="success" startIcon={<Receipt />} onClick={resetSale}
              sx={{ flex: 1, py: 1.5, fontSize: 15 }}>
              Nova Venda
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
