import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Plus, List, Wallet, TrendingUp, TrendingDown, Trash2, 
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, DollarSign, 
  Calendar, Settings, Palette, CreditCard, Building2, Banknote, 
  Coins, Edit3, CheckCircle2, X, BarChart3, Target, PiggyBank, 
  Plane, Gift, Car, Home, Smartphone, Smile, AlertCircle, Info, 
  Camera, Music, Coffee, ShoppingBag, Briefcase, LogOut, User, 
  ShieldCheck, Utensils, BookOpen, Bus, Train, Pin, PinOff,
  Search, Download, CheckSquare, Square, Calculator, Tag
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, 
  GoogleAuthProvider, signInWithPopup, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, 
  serverTimestamp, query, updateDoc, setDoc, writeBatch, orderBy, getDoc 
} from 'firebase/firestore';

// 🔥 Config 區塊 (保持不變)
const firebaseConfig = {
  apiKey: "AIzaSyDGrljWTbHrzs7zM-xC02BLCgCpd8ZCTM0",
  authDomain: "money-tracker-a037b.firebaseapp.com",
  projectId: "money-tracker-a037b",
  storageBucket: "money-tracker-a037b.firebasestorage.app",
  messagingSenderId: "792444485926",
  appId: "1:792444485926:web:86d587477d5fb336d701e7",
  measurementId: "G-0SFB1T0DSQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = "smart-wallet";

// --- 圖示集 ---
const ACCOUNT_ICONS = [
  { id: 'coins', icon: Coins, label: '現金' },
  { id: 'bank', icon: Building2, label: '銀行' },
  { id: 'card', icon: CreditCard, label: '卡片' },
  { id: 'wallet', icon: Wallet, label: '錢包' },
  { id: 'bus', icon: Bus, label: '悠遊卡' },
  { id: 'train', icon: Train, label: '捷運' },
  { id: 'piggy', icon: PiggyBank, label: '儲蓄' },
  { id: 'safe', icon: Briefcase, label: '保險' },
  { id: 'smile', icon: Smile, label: '其他' },
];

const GOAL_ICONS = [
  { id: 'target', icon: Target },
  { id: 'plane', icon: Plane },
  { id: 'car', icon: Car },
  { id: 'home', icon: Home },
  { id: 'phone', icon: Smartphone },
  { id: 'camera', icon: Camera },
  { id: 'gift', icon: Gift },
  { id: 'music', icon: Music },
  { id: 'smile', icon: Smile },
];

// --- 預設類別 (保留您的微調) ---
const DEFAULT_CATEGORIES = {
  expense: ['飲食', '交通', '購物', '娛樂', '居住', '自我提升', '我也不知道', '其他'],
  income: ['薪水', '零用錢', '中獎', '初始餘額', '投資', '兼職', '我也不知道', '其他']
};

// --- 主題 ---
const THEMES = {
  blue: { name: '寧靜灰藍', primary: 'bg-[#7A90A4]', accent: 'text-[#5D7387]', light: 'bg-[#F0F4F8]', gradient: 'from-[#7A90A4] to-[#5D7387]', chart: '#7A90A4' },
  green: { name: '鼠尾草綠', primary: 'bg-[#8F9E8B]', accent: 'text-[#6B7A67]', light: 'bg-[#F2F5F1]', gradient: 'from-[#8F9E8B] to-[#6B7A67]', chart: '#8F9E8B' },
  pink: { name: '乾燥玫瑰', primary: 'bg-[#C6B8B8]', accent: 'text-[#9E8B8B]', light: 'bg-[#F9F5F5]', gradient: 'from-[#C6B8B8] to-[#9E8B8B]', chart: '#C6B8B8' },
  brown: { name: '燕麥奶咖', primary: 'bg-[#A69E8F]', accent: 'text-[#857D6F]', light: 'bg-[#F7F5F2]', gradient: 'from-[#A69E8F] to-[#857D6F]', chart: '#A69E8F' },
  purple: { name: '香芋紫', primary: 'bg-[#9D8BA6]', accent: 'text-[#75667D]', light: 'bg-[#F6F4F7]', gradient: 'from-[#9D8BA6] to-[#75667D]', chart: '#9D8BA6' },
  orange: { name: '暖陽橘', primary: 'bg-[#D9A685]', accent: 'text-[#A67558]', light: 'bg-[#FAF6F4]', gradient: 'from-[#D9A685] to-[#A67558]', chart: '#D9A685' }
};

// --- Helper Components ---
const DynamicIcon = ({ iconName, className, fallback: Fallback = Coins }) => {
  try {
    let entry = ACCOUNT_ICONS.find(i => i.id === iconName);
    if (!entry) entry = GOAL_ICONS.find(i => i.id === iconName);
    const IconComponent = entry ? entry.icon : Fallback;
    return <IconComponent className={className} />;
  } catch (e) { return <Fallback className={className} />; }
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger', theme }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${type === 'danger' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
            {type === 'danger' ? <AlertCircle /> : <Info />}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">取消</button>
          <button onClick={onConfirm} className={`flex-1 py-3 text-white font-bold rounded-xl ${type === 'danger' ? 'bg-red-500' : theme.primary}`}>確認</button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ show, message, type = 'success' }) => {
  if (!show) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-5 w-max max-w-[90%]">
      <div className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-xl ${type === 'success' ? 'bg-gray-800 text-white' : 'bg-red-500 text-white'}`}>
        {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span className="text-sm font-bold truncate">{message}</span>
      </div>
    </div>
  );
};

// --- Login View (保留您的微調) ---
const LoginView = ({ onGoogleLogin, onGuestLogin, theme }) => (
  <div className={`flex flex-col items-center justify-center h-screen ${theme.light} p-6`}>
    <div className="text-center mb-10">
      <div className={`w-24 h-24 ${theme.primary} rounded-[2rem] flex items-center justify-center mx-auto shadow-xl rotate-6 mb-6`}><Wallet className="w-12 h-12 text-white" /></div>
      <h1 className="text-3xl font-bold text-gray-700 mb-2">Money Tracker</h1>
      <p className="text-gray-400 font-medium">簡單、優雅的記帳生活</p>
    </div>
    <div className="w-full max-w-xs space-y-4">
      <button onClick={onGoogleLogin} className="w-full py-4 bg-white rounded-2xl shadow-lg border border-gray-100 font-bold text-gray-700 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-red-500 text-white text-[10px] flex items-center justify-center font-bold">G</div>
        使用 Google 帳號
      </button>
      <div className="flex items-center py-2"><div className="flex-1 border-t"></div><span className="px-2 text-xs text-gray-400">或</span><div className="flex-1 border-t"></div></div>
      <button onClick={onGuestLogin} className="w-full py-3 bg-white/50 text-gray-500 font-bold rounded-xl">先試用看看（訪客試用）</button>
    </div>
  </div>
);

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [walletName, setWalletName] = useState('My Wallet');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [defaultAccId, setDefaultAccId] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('theme') || 'blue');
  const theme = THEMES[currentTheme];

  const showToast = (msg, type='success') => { setToast({ show: true, message: msg, type }); setTimeout(() => setToast({ show: false }), 2500); };
  const openConfirm = (title, msg, onConfirm) => setModal({ isOpen: true, title, message: msg, onConfirm: async () => { setModal({ isOpen: false }); await onConfirm(); } });
  const closeModal = () => setModal({ isOpen: false });

  useEffect(() => localStorage.setItem('theme', currentTheme), [currentTheme]);
  
  useEffect(() => {
    const initAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
             await signInWithCustomToken(auth, __initial_auth_token);
        }
    }
    initAuth();
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  // Handlers
  const handleGoogle = async () => { try { await signInWithPopup(auth, googleProvider); } catch { showToast('登入失敗', 'error'); } };
  const handleGuest = async () => { try { await signInAnonymously(auth); } catch { showToast('登入失敗', 'error'); } };
  const handleLogout = () => openConfirm('登出', '確定要登出嗎？', () => signOut(auth));

  useEffect(() => {
  if (!user) return;

  // 跟你之前一樣的路徑：artifacts / smart-wallet / users / {uid} / ...
  const collectionPath = (coll) => 
    collection(db, 'artifacts', appId, 'users', user.uid, coll);
  const docPath = (coll, id) => 
    doc(db, 'artifacts', appId, 'users', user.uid, coll, id);

  // 交易
  const unsubTx = onSnapshot(
    query(collectionPath('transactions')),
    (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() || new Date()
      }));
      docs.sort((a, b) => b.date - a.date);
      setTransactions(docs);
    }
  );

  // 帳戶
  const unsubAcc = onSnapshot(
    query(collectionPath('accounts')),
    (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (docs.length === 0) {
        addDoc(collectionPath('accounts'), { 
          name: '現金', 
          type: 'cash', 
          icon: 'coins', 
          order: 0 
        });
      } else {
        // pinned 優先、再看 order
        docs.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const orderA = a.order ?? 999;
          const orderB = b.order ?? 999;
          return orderA - orderB;
        });
        setAccounts(docs);
      }
    }
  );

  // 目標
  const unsubGoal = onSnapshot(
    query(collectionPath('goals')),
    (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a,b) => (b.isPinned === true) - (a.isPinned === true) || (a.order || 0) - (b.order || 0));
      setGoals(docs);
    }
  );

  // 設定（settings/general）
  const unsubSet = onSnapshot(
    doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general'),
    (d) => {
      if (d.exists()) {
        const data = d.data();
        setWalletName(data.walletName || 'My Wallet');
        if (data.categories) setCategories(data.categories);
      }
    }
  );

  return () => {
    unsubTx();
    unsubAcc();
    unsubGoal();
    unsubSet();
  };
}, [user]);

  // Actions
  const saveTx = async (data) => {
    try {
      const { id, ...dataToSave } = data;
      const payload = { ...dataToSave, amount: Number(dataToSave.amount), accountId: dataToSave.accountId || accounts[0]?.id, createdAt: dataToSave.date };
      if (editingTransaction) { await updateDoc(doc(db, `users/${user.uid}/transactions`, editingTransaction.id), payload); showToast('已更新'); }
      else { await addDoc(collection(db, `users/${user.uid}/transactions`), payload); showToast('新增成功'); }
      setEditingTransaction(null); setView('dashboard');
    } catch { showToast('儲存失敗', 'error'); }
  };
  const delTx = (id) => openConfirm('刪除', '確定刪除此紀錄？', async () => { await deleteDoc(doc(db, `users/${user.uid}/transactions`, id)); showToast('已刪除'); });
  
  const saveAcc = async (accountData) => {
    if(!user) return;
    const { id, ...dataToSave } = accountData;
    try {
      if (id) { await updateDoc(doc(db, `users/${user.uid}/accounts`, id), dataToSave); showToast('帳戶已更新'); }
      else { await addDoc(collection(db, `users/${user.uid}/accounts`), { ...dataToSave, order: accounts.length, isPinned: false }); showToast('帳戶已新增'); }
    } catch (e) { console.error(e); showToast('操作失敗', 'error'); }
  };
  const delAcc = (id) => openConfirm('刪除', '確定刪除此帳戶？(相關紀錄不會被刪除)', async () => { await deleteDoc(doc(db, `users/${user.uid}/accounts`, id)); showToast('已刪除'); });
  
  const togglePin = async (id, currentVal) => await updateDoc(doc(db, `users/${user.uid}/accounts`, id), { isPinned: !currentVal });
  
  const moveAcc = async (idx, dir) => {
      const newAccs = [...accounts];
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newAccs.length) return;
      const itemA = newAccs[idx]; const itemB = newAccs[targetIdx];
      const batch = writeBatch(db);
      batch.update(doc(db, `users/${user.uid}/accounts`, itemA.id), { order: itemB.order ?? targetIdx });
      batch.update(doc(db, `users/${user.uid}/accounts`, itemB.id), { order: itemA.order ?? idx });
      await batch.commit();
  };
  
  const saveGoal = async (goalData) => {
    if(!user) return;
    const { id, target, ...rest } = goalData;
    const dataToSave = { ...rest, targetAmount: Number(target) };
    try {
        if (id) await updateDoc(doc(db, `users/${user.uid}/goals`, id), dataToSave);
        else await addDoc(collection(db, `users/${user.uid}/goals`), { ...dataToSave, currentAmount: 0, createdAt: serverTimestamp(), order: goals.length, isPinned: false });
        showToast('目標已儲存');
    } catch { showToast('失敗', 'error'); }
  };
  const delGoal = (id) => openConfirm('刪除', '放棄此目標？', async () => { await deleteDoc(doc(db, `users/${user.uid}/goals`, id)); showToast('已刪除'); });
  const togglePinGoal = async (g) => await updateDoc(doc(db, `users/${user.uid}/goals`, g.id), { isPinned: !g.isPinned });
  const moveGoal = async (idx, dir) => {
      const newGoals = [...goals];
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newGoals.length) return;
      const itemA = newGoals[idx]; const itemB = newGoals[targetIdx];
      const batch = writeBatch(db);
      batch.update(doc(db, `users/${user.uid}/goals`, itemA.id), { order: itemB.order ?? targetIdx });
      batch.update(doc(db, `users/${user.uid}/goals`, itemB.id), { order: itemA.order ?? idx });
      await batch.commit();
  };
  const depositGoal = async (gid, amt, aid, gname) => {
    const batch = writeBatch(db);
    batch.set(doc(collection(db, `users/${user.uid}/transactions`)), { amount: Number(amt), description: `存入: ${gname}`, category: '儲蓄', type: 'expense', accountId: aid, createdAt: new Date() });
    const g = goals.find(g=>g.id===gid);
    batch.update(doc(db, `users/${user.uid}/goals`, gid), { currentAmount: (g?.currentAmount||0) + Number(amt) });
    await batch.commit(); showToast('存入成功');
  };

  const handleBatchUpdateAccount = (transactionIds, newAccountId, onSuccess) => {
    openConfirm('批量移動', `移動 ${transactionIds.length} 筆資料？`, async () => {
      const batch = writeBatch(db);
      transactionIds.forEach(id => { const ref = doc(db, `users/${user.uid}/transactions`, id); batch.update(ref, { accountId: newAccountId }); });
      await batch.commit(); showToast('更新成功'); if (onSuccess) onSuccess();
    }, 'info');
  };

  const handleBatchDelete = (transactionIds, onSuccess) => {
    openConfirm('批量刪除', `確定要刪除這 ${transactionIds.length} 筆資料嗎？(無法復原)`, async () => {
      const batch = writeBatch(db);
      transactionIds.forEach(id => { const ref = doc(db, `users/${user.uid}/transactions`, id); batch.delete(ref); });
      await batch.commit(); showToast('已批量刪除'); if (onSuccess) onSuccess();
    });
  };

  const saveSettings = async (newName) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/settings`, 'general'), { walletName: newName }, { merge: true });
    setWalletName(newName); showToast('設定已更新');
  };

  const saveCategories = async (newCategories) => {
    if (!user) return;
    await setDoc(doc(db, `users/${user.uid}/settings`, 'general'), { categories: newCategories }, { merge: true });
    setCategories(newCategories); showToast('類別已更新');
  };

  // 🔥 新增：刪除類別功能 (解決 confirm 失效問題)
  const handleDeleteCategory = (targetCat, type) => {
    openConfirm('刪除類別', `確定要刪除「${targetCat}」嗎？`, async () => {
        const newCategories = { 
            ...categories, 
            [type]: categories[type].filter(c => c !== targetCat) 
        };
        await saveCategories(newCategories);
    });
  };
  
  const exportCSV = () => {
      if(!transactions.length) return showToast('無資料可匯出','error');
      const headers = ['日期', '類型', '金額', '類別', '帳戶', '備註'];
      const rows = transactions.map(t => {
          const accName = accounts.find(a=>a.id===t.accountId)?.name || '未知';
          const date = new Date(t.date).toLocaleDateString();
          return [date, t.type==='income'?'收入':'支出', t.amount, t.category, accName, t.description].join(',');
      });
      const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `money_tracker_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showToast('匯出成功');
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0);
    const expense = transactions.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0);
    const balances = {};
    accounts.forEach(a => balances[a.id] = 0);
    transactions.forEach(t => { if(balances[t.accountId] !== undefined) balances[t.accountId] += (t.type==='income'?1:-1)*t.amount; });
    return { income, expense, balance: income-expense, balances };
  }, [transactions, accounts]);

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400">載入中...</div>;
  if (!user) return <LoginView onGoogleLogin={handleGoogle} onGuestLogin={handleGuest} theme={theme} />;

  return (
    <div className={`flex flex-col h-screen ${theme.light} text-gray-700 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden`}>
      <ConfirmModal isOpen={modal.isOpen} {...modal} onCancel={closeModal} theme={theme} />
      <Toast {...toast} />
      
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <button onClick={() => setView(v => v === 'settings' ? 'dashboard' : 'settings')} className={`flex-1 text-left group`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${theme.primary} text-white`}><Wallet className="w-5 h-5"/></div>
            <span className={`text-xl font-bold ${theme.accent} tracking-tight truncate max-w-[200px]`}>{walletName}</span>
          </div>
        </button>
        <button onClick={() => setView(v => v === 'settings' ? 'dashboard' : 'settings')} className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}><Settings className={`w-6 h-6 ${theme.accent}`} /></button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {view === 'add' && <AddView onSave={saveTx} onCancel={()=>{setView('dashboard');setEditingTransaction(null);setDefaultAccId(null)}} theme={theme} accounts={accounts} initData={editingTransaction} defAccId={defaultAccId} categories={categories} />}
        {view === 'history' && <HistoryView txs={transactions} onDel={delTx} onEdit={(t)=>{setEditingTransaction(t);setView('add')}} theme={theme} accounts={accounts} onBatchUpdate={handleBatchUpdateAccount} onBatchDelete={handleBatchDelete} />}
        {view === 'analysis' && <AnalysisView txs={transactions} theme={theme} accounts={accounts} stats={stats} />} 
        {view === 'goals' && <GoalsView goals={goals} accounts={accounts} onSave={saveGoal} onDel={delGoal} onDeposit={depositGoal} onPin={togglePinGoal} onMove={moveGoal} theme={theme} />}
        {/* 🔥 修正：傳遞 onDeleteCategory */}
        {view === 'settings' && <SettingsView theme={theme} name={walletName} onSaveName={saveSettings} accounts={accounts} onSaveAccount={saveAcc} onDeleteAccount={delAcc} onPin={togglePin} onMove={moveAcc} user={user} onLogout={handleLogout} setTheme={setCurrentTheme} curTheme={currentTheme} onExport={exportCSV} categories={categories} onSaveCategories={saveCategories} onDeleteCategory={handleDeleteCategory} />}
        {view === 'dashboard' && <DashboardView stats={stats} recents={transactions.slice(0,5)} onView={setView} theme={theme} hasTx={transactions.length>0} accounts={accounts} onEdit={(t)=>{setEditingTransaction(t);setView('add')}} onDel={delTx} onQuickAdd={(aid)=>{setDefaultAccId(aid);setView('add')}} />}
      </div>

      <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 pb-6 z-20">
        <NavButton icon={<PieChart />} label="總覽" active={view==='dashboard'} theme={theme} onClick={()=>setView('dashboard')} />
        <NavButton icon={<BarChart3 />} label="分析" active={view==='analysis'} theme={theme} onClick={()=>setView('analysis')} />
        <div className="-mt-6"><button onClick={()=>{setEditingTransaction(null);setView('add')}} className={`${theme.primary} text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all`}><Plus className="w-7 h-7" /></button></div>
        <NavButton icon={<Target />} label="夢想" active={view==='goals'} theme={theme} onClick={()=>setView('goals')} />
        <NavButton icon={<List />} label="紀錄" active={view==='history'} theme={theme} onClick={()=>setView('history')} />
      </div>
    </div>
  );
}

// --- Sub Components ---

const AnalysisView = ({ txs, theme, accounts, stats }) => {
  const [mode, setMode] = useState('month');
  const [date, setDate] = useState(new Date());
  const changeDate = (d) => setDate(p => { const n = new Date(p); if(mode==='year') n.setFullYear(p.getFullYear()+d); else if(mode==='month') n.setMonth(p.getMonth()+d); else n.setDate(p.getDate()+d*(mode==='week'?7:1)); return n; });
  
  const getRange = () => { const y=date.getFullYear(), m=date.getMonth(); if(mode==='year') return {l:`${y}年`,s:new Date(y,0,1),e:new Date(y,11,31,23,59,59)}; if(mode==='month') return {l:`${y}年${m+1}月`,s:new Date(y,m,1),e:new Date(y,m+1,0,23,59,59)}; if(mode==='week') { const d=date.getDay(), diff=date.getDate()-d+(d===0?-6:1); const s=new Date(date); s.setDate(diff); s.setHours(0,0,0,0); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59); return {l:`${s.getMonth()+1}/${s.getDate()} - ${e.getMonth()+1}/${e.getDate()}`,s,e}; } return {l:`${m+1}月${date.getDate()}日`,s:new Date(y,m,date.getDate(),0,0,0),e:new Date(y,m,date.getDate(),23,59,59)}; };
  const { l, s, e } = getRange();

  const data = useMemo(() => {
      const f = txs.filter(t => t.date>=s && t.date<=e);
      const inc = f.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0);
      const exp = f.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0);
      
      const groupCats = (type) => {
          const res = {};
          f.filter(t=>t.type===type).forEach(t => res[t.category]=(res[t.category]||0)+t.amount);
          return Object.entries(res)
            .map(([k,v])=>({name:k, value:v}))
            .sort((a,b)=>b.value-a.value);
      };

      const incData = groupCats('income');
      const expData = groupCats('expense');

      const assets = accounts.map(a=>({name:a.name, value: Math.max(0, stats.balances[a.id]||0)})).filter(a=>a.value>0);

      const top = expData.slice(0, 5); 
      
      return { inc, exp, net: inc-exp, incData, expData, assets, top };
  }, [txs, s, e, accounts, stats, mode]);

  const CssPie = ({ data, total, title }) => {
      if(!data.length) return <div className="h-32 flex items-center justify-center text-gray-300 text-xs">無數據</div>;
      let acc = 0; const grad = data.map((d,i) => { const pct = (d.value/(total||1))*100; const g = `${['#7A90A4','#8F9E8B','#C6B8B8','#A69E8F'][i%4]} ${acc}% ${acc+pct}%`; acc+=pct; return g; }).join(', ');
      return (
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full relative" style={{background: `conic-gradient(${grad})`}}>
            <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
              <span className="text-[9px] text-gray-400">{title}</span>
              <span className="text-[10px] font-bold text-gray-700">${total.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {data.slice(0,3).map((d,i)=>(
              <div key={i} className="flex items-center gap-1 text-[9px] text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full" style={{background:['#7A90A4','#8F9E8B','#C6B8B8','#A69E8F'][i%4]}}></div>
                {d.name} {Math.round(d.value/(total||1)*100)}%
              </div>
            ))}
          </div>
        </div>
      );
  };

  return (
      <div className="p-5 space-y-6 animate-fade-in pb-24">
          <div className="bg-gray-100 p-1 rounded-xl flex mb-2">{['year','month','week','day'].map(m=><button key={m} onClick={()=>setMode(m)} className={`flex-1 py-1 text-xs font-bold rounded-lg ${mode===m?'bg-white shadow-sm':'text-gray-400'}`}>{{year:'年',month:'月',week:'週',day:'日'}[m]}</button>)}</div>
          
          <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100"><button onClick={()=>changeDate(-1)} className="p-2 text-gray-500"><ChevronLeft/></button><span className="font-bold text-gray-700">{l}</span><button onClick={()=>changeDate(1)} className="p-2 text-gray-500"><ChevronRight/></button></div>
          
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 mb-4 flex gap-2"><Wallet className="w-4 h-4"/> 資產分佈</h3>
            <CssPie data={data.assets} total={stats.balance} title="總資產" />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="text-xs font-bold text-gray-400 mb-2 self-start flex gap-1"><TrendingUp className="w-3 h-3"/> 收入</h3>
                <CssPie data={data.incData} total={data.inc} title="總收入" />
             </div>
             <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="text-xs font-bold text-gray-400 mb-2 self-start flex gap-1"><TrendingDown className="w-3 h-3"/> 支出</h3>
                <CssPie data={data.expData} total={data.exp} title="總支出" />
             </div>
          </div>
          
          {data.top.length > 0 && <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-4">支出排行</h3><div className="space-y-4">{data.top.map((d, i) => <div key={i} className="flex justify-between items-center"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gray-300`}>{i + 1}</div><span className="text-gray-700 font-bold text-sm">{d.name}</span></div><span className="text-gray-600 font-bold text-sm">${d.value.toLocaleString()}</span></div>)}</div></div>}
      </div>
  );
};

const DashboardView = ({ stats, recents, onView, theme, hasTx, accounts, onEdit, onDel, onQuickAdd }) => (
  <div className="p-5 space-y-6 animate-fade-in">
    <div onClick={()=>onView('analysis')} className={`bg-gradient-to-br ${theme.gradient} rounded-[32px] p-7 text-white shadow-xl cursor-pointer active:scale-[0.98]`}>
       <p className="text-white/80 text-sm mb-2 flex items-center gap-1"><Wallet className="w-3.5 h-3.5"/> 淨資產 <ChevronRight className="w-4 h-4 opacity-50"/></p>
       <h2 className="text-4xl font-bold mb-8 font-serif">${stats.balance.toLocaleString()}</h2>
       <div className="flex justify-between bg-black/10 rounded-2xl p-4 backdrop-blur-sm">
           <div className="flex gap-2 items-center"><div className="bg-white/20 p-1.5 rounded-full"><TrendingUp className="w-4 h-4"/></div><div><p className="text-xs text-white/80">收入</p><p className="font-bold">+${stats.income.toLocaleString()}</p></div></div>
           <div className="flex gap-2 items-center"><div className="bg-white/20 p-1.5 rounded-full"><TrendingDown className="w-4 h-4"/></div><div><p className="text-xs text-white/80">支出</p><p className="font-bold">-${stats.expense.toLocaleString()}</p></div></div>
       </div>
    </div>
    <div>
       <h3 className="font-bold text-gray-500 text-sm mb-3 px-1 flex justify-between"><span>我的帳戶</span><span onClick={()=>onView('settings')} className={`${theme.accent} cursor-pointer`}>管理</span></h3>
       <div className="grid grid-cols-2 gap-3">{accounts.map(a=>(
           <button key={a.id} onClick={()=>onQuickAdd(a.id)} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-left h-24 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.08] ${theme.primary}`}></div>
              <div className="flex gap-2 items-center"><div className="p-1.5 bg-gray-50 rounded-lg text-gray-500"><DynamicIcon iconName={a.icon} className="w-4 h-4"/></div>{a.isPinned && <Pin className={`w-3 h-3 ${theme.accent}`} fill="currentColor"/>}</div>
              <div><span className="text-xs text-gray-400 block">{a.name}</span><span className="text-lg font-bold text-gray-700">${(stats.balances[a.id]||0).toLocaleString()}</span></div>
           </button>
       ))}</div>
    </div>
    <div>
       <div className="flex justify-between mb-4"><h3 className="font-bold text-gray-500">近期動態</h3>{hasTx && <button onClick={()=>onView('history')} className={`text-xs ${theme.accent} font-bold bg-white px-3 py-1 rounded-full shadow-sm`}>全部 <ChevronRight className="w-3 h-3 inline"/></button>}</div>
       {recents.length===0 ? <EmptyState theme={theme}/> : <div className="space-y-3">{recents.map(t=><TxItem key={t.id} data={t} theme={theme} accs={accounts} onClick={()=>onEdit(t)} onDel={onDel} />)}</div>}
    </div>
  </div>
);

const GoalsView = ({ goals, accounts, onSave, onDel, onDeposit, onPin, onMove, theme }) => {
  const [isAdd, setIsAdd] = useState(false);
  const [depGoal, setDepGoal] = useState(null);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ name:'', target:'', icon:'target' });
  const [dep, setDep] = useState({ amt:'', acc: accounts[0]?.id });

  const openEdit = (g) => { setEditGoal(g); setForm({name:g.name, target:g.targetAmount, icon:g.icon}); setIsAdd(true); };
  const create = () => { 
      if(form.name && form.target) { 
          onSave({id:editGoal?.id, name: form.name, target: form.target, icon: form.icon}); 
          setIsAdd(false); 
          setEditGoal(null); 
          setForm({name:'',target:'',icon:'target'}); 
      }
  };
  const deposit = () => { if(dep.amt && dep.acc) { onDeposit(depGoal.id, dep.amt, dep.acc, depGoal.name); setDepGoal(null); setDep({amt:'', acc:accounts[0]?.id}); }};

  return (
    <div className="p-5 pb-20 animate-fade-in space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800 flex gap-2"><Target className={theme.accent}/> 夢想存錢罐</h2><button onClick={()=>{setIsAdd(!isAdd);setEditGoal(null);setForm({name:'',target:'',icon:'target'})}} className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg ${theme.primary}`}>{isAdd?'取消':'+ 目標'}</button></div>
      {isAdd && (
          <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-400">{editGoal?'編輯目標':'新目標'}</p>
              <input placeholder="目標名稱" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-gray-700 outline-none"/>
              <input type="number" placeholder="金額" value={form.target} onChange={e=>setForm({...form,target:e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-gray-700 outline-none"/>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{GOAL_ICONS.map(i=><button key={i.id} onClick={()=>setForm({...form,icon:i.id})} className={`p-3 rounded-xl transition-all ${form.icon===i.id?`${theme.primary} text-white shadow-md`:'bg-gray-50 text-gray-400'}`}><i.icon className="w-5 h-5"/></button>)}</div>
              <div className="flex gap-2"><button onClick={()=>setIsAdd(false)} className="flex-1 py-3 text-gray-400 font-bold bg-gray-100 rounded-xl">取消</button><button onClick={create} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary}`}>儲存</button></div>
          </div>
      )}
      {goals.length===0 && !isAdd ? <div className="text-center py-20 opacity-50"><Target className="w-16 h-16 mx-auto mb-4 text-gray-300"/><p className="text-gray-400">還沒有目標</p></div> : 
        <div className="space-y-4">{goals.map((g, i) => {
           const target = Number(g.targetAmount) || 1; const current = Number(g.currentAmount) || 0;
           const pct = Math.min(100, Math.round((current / target)*100));
           return (
               <div key={g.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 group">
                   <div className="flex justify-between items-start mb-4">
                       <div className="flex gap-3 items-center flex-1">
                          <button onClick={()=>onPin(g)} className={`p-1 rounded-lg ${g.isPinned?'text-orange-400 bg-orange-50':'text-gray-300 hover:text-gray-400'}`}>{g.isPinned ? <Pin className="w-3.5 h-3.5 fill-current"/> : <PinOff className="w-3.5 h-3.5"/>}</button>
                          <div className={`p-3 rounded-2xl ${theme.light} text-gray-600`}><DynamicIcon iconName={g.icon} className="w-6 h-6" fallback={Target}/></div>
                          <div><h3 className="font-bold text-gray-800">{g.name}</h3><p className="text-xs text-gray-400">目標 ${target.toLocaleString()}</p></div>
                       </div>
                       <div className="flex gap-1 opacity-60 group-hover:opacity-100">
                           <div className="flex flex-col mr-1"><button onClick={()=>onMove(i,'up')} disabled={i===0}><ChevronUp className="w-3 h-3 text-gray-400"/></button><button onClick={()=>onMove(i,'down')} disabled={i===goals.length-1}><ChevronDown className="w-3 h-3 text-gray-400"/></button></div>
                           <button onClick={()=>openEdit(g)} className="text-gray-400 hover:text-blue-500 p-2"><Edit3 className="w-4 h-4"/></button>
                           <button onClick={()=>onDel(g.id)} className="text-gray-400 hover:text-red-400 p-2"><X className="w-4 h-4"/></button>
                       </div>
                   </div>
                   <div className="mb-2 flex justify-between items-end"><span className={`text-2xl font-bold ${theme.accent}`}>${current.toLocaleString()}</span><span className="text-xs font-bold text-gray-400">{pct}%</span></div>
                   <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4"><div className={`h-full rounded-full transition-all duration-1000 ${theme.primary}`} style={{width:`${pct}%`}}></div></div>
                   <button onClick={()=>setDepGoal(g)} className={`w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm ${pct>=100?'border-green-200 text-green-500 bg-green-50':'border-gray-200 text-gray-400 hover:text-gray-600'}`}>{pct>=100?'🎉 達成！':'+ 存入資金'}</button>
               </div>
           );
        })}</div>
      }
      {depGoal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold text-center text-gray-800">存入：{depGoal.name}</h3>
                  <input type="number" autoFocus value={dep.amt} onChange={e=>setDep({...dep,amt:e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-2xl font-bold text-center outline-none" placeholder="0"/>
                  <div><label className="text-xs font-bold text-gray-400 block mb-2">扣款帳戶</label><select value={dep.acc} onChange={e=>setDep({...dep,acc:e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                  <div className="flex gap-3 pt-2"><button onClick={()=>setDepGoal(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">取消</button><button onClick={deposit} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary}`}>確認</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

const AddView = ({ onSave, onCancel, theme, accounts, initData, defAccId, categories }) => {
  const [type, setType] = useState(initData?.type||'expense');
  const [amt, setAmt] = useState(initData?.amount||'');
  const [desc, setDesc] = useState(initData?.description||'');
  const [cat, setCat] = useState(initData?.category||'');
  const [accId, setAccId] = useState(initData?.accountId||defAccId||accounts[0]?.id);
  const [date, setDate] = useState(initData?.date?new Date(initData.date).toISOString().split('T')[0]:new Date().toISOString().split('T')[0]);

  // 🔥 計算機邏輯
  const calculateAmount = () => {
    try {
      if (!amt.toString().match(/^[\d.+\-*/\s]+$/)) return;
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${amt})`)();
      setAmt(result);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { if(!cat && !initData) setCat(type==='expense'?categories.expense[0]:categories.income[0]); }, [type, initData, categories]);
  useEffect(()=> { if (!initData) setAccId(defAccId || (accounts[0]?.id || '')); }, [defAccId, accounts, initData]);

  const currentCats = type === 'expense' ? categories.expense : categories.income;
  
  // 🔥 更新：幽默備注邏輯
  const getPlaceholder = () => { 
    if(cat === '我也不知道') return '既然不知道就算了...'; 
    if(cat === '自我提升') return '我真不錯';
    return `例如：${cat}細項`; 
  };

  return (
    <div className="p-5 pb-10 animate-fade-in space-y-5">
       <div className="flex items-center gap-2 mb-2 text-xl font-bold text-gray-700">{initData?<Edit3 className="w-5 h-5"/>:<Plus className="w-5 h-5"/>} {initData?'編輯':'新增'}</div>
       <div className="bg-gray-200 p-1 rounded-2xl flex"><button onClick={()=>setType('expense')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type==='expense'?'bg-white shadow-md':'text-gray-400'}`}>支出</button><button onClick={()=>setType('income')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type==='income'?'bg-white shadow-md':'text-gray-400'}`}>收入</button></div>
       
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <label className="text-xs font-bold text-gray-400 flex justify-between mb-2">
             <span>金額</span>
             <span className="text-[10px] text-gray-300 bg-gray-100 px-1 rounded flex items-center gap-1"><Calculator className="w-3 h-3"/>可輸入算式 (如 50+20)</span>
           </label>
           <div className="relative flex items-center">
             <DollarSign className={`w-6 h-6 ${theme.accent} mr-2`}/>
             <input 
                type="text" 
                inputMode="decimal" 
                value={amt} 
                onChange={e=>setAmt(e.target.value)} 
                onBlur={calculateAmount}
                onKeyDown={e=>{if(e.key==='Enter')calculateAmount()}}
                className="w-full bg-transparent outline-none text-3xl font-bold text-gray-700 placeholder-gray-200" 
                placeholder="0" 
                autoFocus={!initData}
             />
           </div>
       </div>

       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"><div className="flex-1"><label className="text-xs font-bold text-gray-400 block mb-2">日期</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full font-bold text-gray-700 outline-none bg-transparent"/></div><button onClick={()=>{setDate(new Date().toISOString().split('T')[0]);if(!desc.includes('(日期不詳)'))setDesc(d=>(d?d+' ':'')+'(日期不詳)')}} className="text-xs font-bold text-gray-400 border px-3 py-2 rounded-lg ml-3 whitespace-nowrap hover:bg-gray-50 hover:text-gray-600 transition-colors">我忘了</button></div>
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"><label className="text-xs font-bold text-gray-400 block mb-2">帳戶</label><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{accounts.map(a=><button key={a.id} onClick={()=>setAccId(a.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap border ${accId===a.id?`border-transparent ${theme.primary} text-white font-bold`:'border-gray-200 text-gray-600 font-medium'}`}><DynamicIcon iconName={a.icon} className="w-3 h-3" fallback={Building2}/> {a.name}</button>)}</div></div>
       <div><label className="text-xs font-bold text-gray-400 block mb-3">類別</label><div className="grid grid-cols-4 gap-2">{currentCats.map(c=><button key={c} onClick={()=>setCat(c)} className={`py-2 px-1 text-xs font-bold rounded-xl border truncate ${cat===c?`border-transparent ${theme.primary} text-white shadow-md scale-105`:'bg-white text-gray-500'}`}>{c}</button>)}</div></div>
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative"><label className="text-xs font-bold text-gray-400 block mb-2">備註</label><input value={desc} onChange={e=>e.target.value.length<=50&&setDesc(e.target.value)} className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 font-bold" placeholder={getPlaceholder()} /><span className="absolute bottom-2 right-4 text-[10px] text-gray-300 font-bold">{desc.length}/50</span></div>
       <div className="flex gap-4 pt-4"><button onClick={onCancel} className="flex-1 py-4 text-gray-400 font-bold bg-gray-100 rounded-2xl">取消</button><button onClick={()=>amt && onSave({type,amount:amt,description:desc,category:cat,accountId:accId,date:new Date(date)})} disabled={!amt} className={`flex-1 py-4 ${theme.primary} text-white font-bold rounded-2xl shadow-lg disabled:opacity-50`}>確認</button></div>
    </div>
  );
};

const HistoryView = ({ txs, onDel, onEdit, theme, accounts, onBatchUpdate, onBatchDelete }) => {
  const [search, setSearch] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [targetAccount, setTargetAccount] = useState(accounts[0]?.id || '');

  // 🔍 搜尋功能：篩選紀錄
  const filtered = txs.filter(t => 
    t.description.includes(search) || 
    t.category.includes(search) ||
    t.amount.toString().includes(search)
  );

  const toggleSelection = (id) => {
      const newSet = new Set(selectedIds);
      if(newSet.has(id)) newSet.delete(id); else newSet.add(id);
      setSelectedIds(newSet);
  }

  const handleBatchMove = () => {
      if(selectedIds.size === 0) return;
      onBatchUpdate(Array.from(selectedIds), targetAccount, () => {
          setIsSelectionMode(false);
          setSelectedIds(new Set());
      });
  }

  // 🔥 批量刪除處理
  const handleBatchDel = () => {
      if(selectedIds.size === 0) return;
      onBatchDelete(Array.from(selectedIds), () => {
          setIsSelectionMode(false);
          setSelectedIds(new Set());
      });
  }

  const groups = filtered.reduce((acc, t) => { const k = `${t.date.getFullYear()}年${t.date.getMonth()+1}月`; if(!acc[k]) acc[k]=[]; acc[k].push(t); return acc; }, {});

  return (
      <div className="p-5 pb-24 space-y-6">
          <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">收支紀錄</h2>
              <button 
                onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${isSelectionMode ? `bg-gray-700 text-white border-gray-700` : `border-gray-200 text-gray-500`}`}
              >
                {isSelectionMode ? '取消選取' : '批量操作'}
              </button>
          </div>
          
          {/* 搜尋框 */}
          <div className="bg-white p-3 rounded-xl flex items-center gap-2 shadow-sm border border-gray-100">
              <Search className="w-5 h-5 text-gray-400"/>
              <input 
                  placeholder="搜尋備註、類別或金額..." 
                  className="flex-1 outline-none text-sm font-bold text-gray-700" 
                  value={search} 
                  onChange={e=>setSearch(e.target.value)}
              />
              {search && <button onClick={()=>setSearch('')}><X className="w-4 h-4 text-gray-400"/></button>}
          </div>

          {filtered.length===0 ? <div className="text-center py-10 text-gray-400 text-sm">沒有找到相關紀錄</div> : Object.entries(groups).map(([m,l])=><div key={m}><h3 className={`text-xs font-bold ${theme.accent} mb-3 ml-1`}>{m}</h3><div className="space-y-3">{l.map(t=><TxItem key={t.id} data={t} theme={theme} accs={accounts} onClick={()=>isSelectionMode ? toggleSelection(t.id) : onEdit(t)} onDel={onDel} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(t.id)}/>)}</div></div>)}

          {/* 批量操作 Bar */}
          {isSelectionMode && (
              <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-8 z-30 shadow-lg animate-in slide-in-from-bottom">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">已選 {selectedIds.size} 筆</span></div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <select 
                          className="w-full bg-gray-100 text-sm rounded-lg px-3 py-2 outline-none font-bold text-gray-600" 
                          value={targetAccount} 
                          onChange={(e) => setTargetAccount(e.target.value)}
                        >
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>移至: {acc.name}</option>)}
                        </select>
                        <button 
                          onClick={handleBatchMove} 
                          disabled={selectedIds.size === 0} 
                          className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${theme.primary} disabled:opacity-50 whitespace-nowrap`}
                        >
                            移動
                        </button>
                      </div>
                      <button 
                          onClick={handleBatchDel} 
                          disabled={selectedIds.size === 0} 
                          className={`px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-400 disabled:opacity-50 flex items-center gap-1`}
                      >
                          <Trash2 className="w-4 h-4"/> 刪除
                      </button>
                    </div>
                  </div>
              </div>
          )}
      </div>
  );
};

// 🔥 修正：接收 onDeleteCategory
const SettingsView = ({ theme, name, onSaveName, accounts, onSaveAccount, onDeleteAccount, onPin, onMove, user, onLogout, setTheme, curTheme, onExport, categories, onSaveCategories, onDeleteCategory }) => {
  const [editName, setEditName] = useState(false);
  const [tmpName, setTmpName] = useState(name);
  const [addAcc, setAddAcc] = useState(false);
  const [editAccData, setEditAccData] = useState(null);
  const [accForm, setAccForm] = useState({name:'',type:'bank',icon:'bank'});

  // 類別編輯狀態
  const [newCat, setNewCat] = useState('');
  const [catType, setCatType] = useState('expense');

  const handleSaveName = () => { onSaveName(tmpName); setEditName(false); };
  const startEditAccount = (acc) => { setEditAccData(acc); setAccForm({name:acc.name,type:acc.type,icon:acc.icon}); setAddAcc(true); };
  const startAddAccount = () => { setEditAccData(null); setAccForm({name:'',type:'bank',icon:'bank'}); setAddAcc(true); };
  
  const submitAcc = () => { if(accForm.name) { onSaveAccount({id:editAccData?.id,...accForm}); setAddAcc(false); }};

  const addCategory = () => {
    if (newCat && !categories[catType].includes(newCat)) {
      onSaveCategories({ ...categories, [catType]: [...categories[catType], newCat] });
      setNewCat('');
    }
  };
  
  // 🔥 修正：使用傳入的 onDeleteCategory，而不是 confirm()
  const removeCategory = (cToRemove, type) => {
    onDeleteCategory(cToRemove, type);
  };

  return (
    <div className="p-5 space-y-8 pb-20 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">設定</h2>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
         <h3 className="text-xs font-bold text-gray-400 mb-4 flex gap-2"><User className="w-4 h-4"/> 帳號</h3>
         <div className="flex justify-between items-center"><div className="flex gap-3 items-center"><div className={`w-10 h-10 rounded-full ${theme.light} flex items-center justify-center font-bold text-gray-500`}>{user?.isAnonymous?'訪':'U'}</div><div><p className="font-bold text-gray-700 text-sm">{user?.isAnonymous?'訪客':user?.email}</p><p className="text-[10px] text-gray-400">{user?.isAnonymous?'未備份':'已同步'}</p></div></div><button onClick={onLogout} className="flex gap-1 text-xs font-bold text-red-400 bg-red-50 px-3 py-2 rounded-xl"><LogOut className="w-3 h-3"/> 登出</button></div>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 mb-4 flex gap-2"><Briefcase className="w-4 h-4"/> 資料管理</h3>
          <button onClick={onExport} className="w-full py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-100"><Download className="w-4 h-4"/> 匯出 CSV (Excel)</button>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
         <h3 className="text-xs font-bold text-gray-400 mb-4 flex gap-2"><Edit3 className="w-4 h-4"/> 名稱</h3>
         {editName ? <div className="flex gap-2"><input value={tmpName} onChange={e=>setTmpName(e.target.value)} className="flex-1 border-b-2 font-bold text-gray-700 outline-none"/><button onClick={handleSaveName} className={`px-4 py-1.5 rounded-xl ${theme.primary} text-white text-sm font-bold`}>儲存</button></div> : <div onClick={()=>setEditName(true)} className="flex justify-between cursor-pointer"><span className="font-bold text-lg text-gray-700">{name}</span><span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">修改</span></div>}
      </div>

       {/* 🔥 新增：類別管理 */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 mb-4 flex gap-2"><Tag className="w-4 h-4"/> 類別管理</h3>
        <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
           <button onClick={()=>setCatType('expense')} className={`flex-1 text-xs font-bold py-1.5 rounded-md ${catType==='expense'?'bg-white shadow-sm':'text-gray-400'}`}>支出</button>
           <button onClick={()=>setCatType('income')} className={`flex-1 text-xs font-bold py-1.5 rounded-md ${catType==='income'?'bg-white shadow-sm':'text-gray-400'}`}>收入</button>
        </div>
        <div className="flex gap-2 mb-3">
          <input placeholder="新增類別..." value={newCat} onChange={e=>setNewCat(e.target.value)} className="flex-1 bg-gray-50 border px-3 rounded-xl text-sm font-bold outline-none"/>
          <button onClick={addCategory} disabled={!newCat} className={`px-3 py-2 rounded-xl text-white font-bold text-xs ${theme.primary} disabled:opacity-50`}>新增</button>
        </div>
        <div className="flex flex-wrap gap-2">
           {categories[catType].map(c => (
             <div key={c} className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2 border border-gray-100">
               {c} <button onClick={()=>removeCategory(c, catType)} className="text-gray-300 hover:text-red-400"><X className="w-3 h-3"/></button>
             </div>
           ))}
        </div>
       </div>

       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-bold text-gray-400 uppercase flex gap-2"><CreditCard className="w-4 h-4"/> 帳戶管理</h3><button onClick={()=>{if(addAcc)setAddAcc(false); else startAddAccount()}} className={`text-xs font-bold ${theme.accent} px-2 py-1 rounded-lg bg-gray-50`}>{addAcc?'取消':'+ 新增'}</button></div>
        {addAcc && (
          <div className="bg-gray-50 p-4 rounded-2xl mb-4 animate-in fade-in border border-gray-200">
             <p className="text-xs font-bold text-gray-400 mb-2">{editAccData?'編輯':'新增'}</p>
             <div className="flex gap-2 mb-3"><input placeholder="名稱" value={accForm.name} onChange={e=>setAccForm({...accForm,name:e.target.value})} className="flex-1 p-2 rounded-xl border text-sm font-bold"/><select value={accForm.type} onChange={e=>setAccForm({...accForm,type:e.target.value})} className="p-2 rounded-xl border text-sm bg-white"><option value="bank">銀行</option><option value="cash">現金</option><option value="credit">信用卡</option><option value="other">其他</option></select></div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">{ACCOUNT_ICONS.map(i=>(
                 <button key={i.id} onClick={()=>setAccForm({...accForm,icon:i.id})} className={`p-2 rounded-lg flex flex-col items-center min-w-[60px] ${accForm.icon===i.id?'bg-white shadow-md ring-2 ring-blue-100':'text-gray-400 hover:bg-gray-200'}`}>
                     <i.icon className="w-5 h-5 mb-1"/>
                     <span className="text-[10px] truncate w-full text-center">{i.label}</span>
                 </button>
             ))}</div>
             <button onClick={submitAcc} disabled={!accForm.name} className={`w-full py-2 rounded-xl text-sm font-bold text-white ${theme.primary} disabled:opacity-50`}>確認</button></div>)}
         {/* 🔥 修正：正確傳遞參數 */}
         <div className="space-y-2">{accounts.map((a,i)=><div key={a.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl group"><div className="flex gap-3 items-center flex-1"><button onClick={()=>onPin(a.id, a.isPinned)} className={`p-1 rounded-lg ${a.isPinned?'text-orange-400 bg-orange-50':'text-gray-300'}`}>{a.isPinned?<Pin className="w-3.5 h-3.5 fill-current"/>:<PinOff className="w-3.5 h-3.5"/>}</button><div className="p-2 bg-gray-100 rounded-lg text-gray-500"><DynamicIcon iconName={a.icon} className="w-4 h-4"/></div><span className="font-bold text-gray-700">{a.name}</span></div><div className="flex gap-1 opacity-60 group-hover:opacity-100"><div className="flex flex-col mr-2"><button onClick={()=>onMove(i,'up')} disabled={i===0}><ChevronUp className="w-3 h-3 text-gray-400"/></button><button onClick={()=>onMove(i,'down')} disabled={i===accounts.length-1}><ChevronDown className="w-3 h-3 text-gray-400"/></button></div><button onClick={()=>{startEditAccount(a)}} className="text-gray-400 hover:text-blue-500 p-2"><Edit3 className="w-4 h-4"/></button><button onClick={()=>onDeleteAccount(a.id)} className="text-gray-400 hover:text-red-500 p-2"><X className="w-4 h-4"/></button></div></div>)}</div>
      </div>
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"><h3 className="text-xs font-bold text-gray-400 mb-4 flex gap-2"><Palette className="w-4 h-4"/> 風格</h3><div className="grid grid-cols-2 gap-3">{Object.entries(THEMES).map(([k,t])=><button key={k} onClick={()=>setTheme(k)} className={`p-3 rounded-2xl border-2 flex items-center gap-3 ${curTheme===k?'border-gray-200 bg-gray-50':'border-transparent'}`}><div className={`w-8 h-8 rounded-full ${t.primary} shadow-sm border-2 border-white`}></div><span className="text-sm font-bold text-gray-600">{t.name}</span></button>)}</div></div>
    </div>
  );
};

const TxItem = ({ data, onClick, onDel, theme, accs, isSelectionMode, isSelected }) => {
  const isInc = data.type==='income';
  const acc = accs.find(a=>a.id===data.accountId);
  return (
    <div onClick={onClick} className={`bg-white p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer active:scale-[0.99] relative ${isSelectionMode && isSelected ? `border-[${theme.chart}] shadow-md ring-1 ring-offset-1` : 'border-gray-100 shadow-sm'}`} style={{ borderColor: isSelected ? theme.chart : undefined }}>
       <div className="flex items-center gap-4">
           {isSelectionMode ? (
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${isSelected ? `${theme.primary} border-transparent` : 'border-gray-300'}`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
           ) : (
               <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isInc?'bg-orange-50':'bg-gray-50'}`}>{isInc?<TrendingUp className="w-5 h-5 text-orange-400"/>:<div className={`w-2 h-2 rounded-full ${theme.primary}`}></div>}</div>
           )}
           <div><p className="font-bold text-gray-700 text-sm">{data.description}</p><div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5"><span className="bg-gray-50 px-2 py-0.5 rounded font-bold">{data.category}</span><span className="px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1"><DynamicIcon iconName={acc?.icon} className="w-3 h-3"/>{acc?.name}</span></div></div>
       </div>
       <div className="flex items-center gap-3">
           <div className="text-right"><span className={`font-bold text-lg block ${isInc?'text-orange-500':'text-gray-700'}`}>{isInc?'+':'-'}{data.amount.toLocaleString()}</span><span className="text-[10px] text-gray-300 font-bold">{new Date(data.date).toLocaleDateString()}</span></div>
           {!isSelectionMode && <button onClick={e=>{e.stopPropagation();onDel(data.id)}} className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>}
       </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick, theme }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${active ? `${theme.accent} scale-110` : 'text-gray-300 hover:text-gray-400'}`}>
    {React.cloneElement(icon, { className: `w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}` })}<span>{label}</span>
  </button>
);

const EmptyState = ({ theme }) => (
  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 mx-4">
    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.light}`}><Calendar className={`w-8 h-8 ${theme.accent}`} /></div>
    <p className="text-gray-400 font-bold">還沒有任何紀錄</p>
    <p className="text-xs text-gray-300 mt-2 font-medium">點擊「+」開始記下第一筆</p>
  </div>
);
