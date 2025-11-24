import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, 
  Plus, 
  List, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Calendar,
  Settings,
  Palette,
  CreditCard,
  Building2,
  Banknote,
  Coins,
  Edit3,
  CheckCircle2,
  X,
  BarChart3,
  Target,
  PiggyBank,
  Plane,
  Gift,
  Car,
  Home,
  Smartphone,
  Smile,
  AlertCircle,
  Info,
  Camera,
  Music,
  Coffee,
  ShoppingBag,
  Briefcase,
  LogOut, // 新增登出圖示
  User,   // 新增使用者圖示
  ShieldCheck
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  updateDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';


// 🔥🔥🔥 在這裡貼 config
const firebaseConfig = {
  apiKey: "AIzaSyDGrljWTbHrzs7zM-xC02BLCgCpd8ZCTM0",
  authDomain: "money-tracker-a037b.firebaseapp.com",
  projectId: "money-tracker-a037b",
  storageBucket: "money-tracker-a037b.firebasestorage.app",
  messagingSenderId: "792444485926",
  appId: "1:792444485926:web:86d587477d5fb336d701e7",
  measurementId: "G-0SFB1T0DSQ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const appId = "smart-wallet";   // 你自己取的字串


// --- 擴充圖示集 (供使用者選擇) ---
const ACCOUNT_ICONS = [
  { id: 'coins', icon: Coins, label: '零錢' },
  { id: 'bank', icon: Building2, label: '銀行' },
  { id: 'card', icon: CreditCard, label: '信用卡' },
  { id: 'wallet', icon: Wallet, label: '錢包' },
  { id: 'piggy', icon: PiggyBank, label: '存錢筒' },
  { id: 'safe', icon: Briefcase, label: '保險箱' },
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

// --- 擴充主題色系 ---
const THEMES = {
  blue: {
    name: '寧靜灰藍',
    primary: 'bg-[#7A90A4]',
    secondary: 'bg-[#B4C5D4]',
    accent: 'text-[#5D7387]',
    light: 'bg-[#F0F4F8]',
    gradient: 'from-[#7A90A4] to-[#5D7387]',
    chart: '#7A90A4'
  },
  green: {
    name: '鼠尾草綠',
    primary: 'bg-[#8F9E8B]',
    secondary: 'bg-[#C3D1BF]',
    accent: 'text-[#6B7A67]',
    light: 'bg-[#F2F5F1]',
    gradient: 'from-[#8F9E8B] to-[#6B7A67]',
    chart: '#8F9E8B'
  },
  pink: {
    name: '乾燥玫瑰',
    primary: 'bg-[#C6B8B8]',
    secondary: 'bg-[#E8DCDC]',
    accent: 'text-[#9E8B8B]',
    light: 'bg-[#F9F5F5]',
    gradient: 'from-[#C6B8B8] to-[#9E8B8B]',
    chart: '#C6B8B8'
  },
  brown: {
    name: '燕麥奶咖',
    primary: 'bg-[#A69E8F]',
    secondary: 'bg-[#D4CEC3]',
    accent: 'text-[#857D6F]',
    light: 'bg-[#F7F5F2]',
    gradient: 'from-[#A69E8F] to-[#857D6F]',
    chart: '#A69E8F'
  },
  purple: {
    name: '香芋紫',
    primary: 'bg-[#9D8BA6]',
    secondary: 'bg-[#C8BDCD]',
    accent: 'text-[#75667D]',
    light: 'bg-[#F6F4F7]',
    gradient: 'from-[#9D8BA6] to-[#75667D]',
    chart: '#9D8BA6'
  },
  orange: {
    name: '暖陽橘',
    primary: 'bg-[#D9A685]',
    secondary: 'bg-[#ECCDBA]',
    accent: 'text-[#A67558]',
    light: 'bg-[#FAF6F4]',
    gradient: 'from-[#D9A685] to-[#A67558]',
    chart: '#D9A685'
  }
};

// --- Helper Components ---
const DynamicIcon = ({ iconName, className, fallback = Coins }) => {
  let IconComponent = ACCOUNT_ICONS.find(i => i.id === iconName)?.icon;
  if (!IconComponent) IconComponent = GOAL_ICONS.find(i => i.id === iconName)?.icon;
  if (!IconComponent) IconComponent = fallback;
  return <IconComponent className={className} />;
};

// 自定義 Modal 元件
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger', theme }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            {type === 'danger' ? <AlertCircle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors text-sm"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 text-sm ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : `${theme.primary} hover:brightness-110`}`}
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

// 自定義 Toast
const Toast = ({ show, message, type = 'success' }) => {
  if (!show) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-5 duration-300 w-max max-w-[90%]">
      <div className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-xl ${type === 'success' ? 'bg-gray-800 text-white' : 'bg-red-500 text-white'}`}>
        {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        <span className="text-sm font-bold tracking-wide truncate">{message}</span>
      </div>
    </div>
  );
};

// 新增：登入頁面元件
const LoginView = ({ onGoogleLogin, onGuestLogin, theme }) => (
  <div className={`flex flex-col items-center justify-center h-screen ${theme.light} p-6 space-y-10`}>
    <div className="text-center space-y-4">
      <div className={`w-24 h-24 ${theme.primary} rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-6 transform transition-transform hover:rotate-0`}>
        <Wallet className="w-12 h-12 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-700 font-serif tracking-tight">Money Tracker</h1>
        <p className="text-gray-400 font-medium mt-2">簡單、優雅的記帳生活</p>
      </div>
    </div>

    <div className="w-full max-w-xs space-y-4">
      <button 
        onClick={onGoogleLogin}
        className="w-full py-4 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
      >
        {/* 簡單的 Google G Logo */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-red-500 flex items-center justify-center text-[10px] text-white font-serif font-bold">G</div>
        使用 Google 帳號登入
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <div className="relative flex justify-center text-xs"><span className={`px-2 ${theme.light} text-gray-400`}>或</span></div>
      </div>

      <button 
        onClick={onGuestLogin}
        className="w-full py-3 text-gray-500 font-bold hover:text-gray-700 text-sm bg-white/50 rounded-xl border border-transparent hover:border-gray-200 transition-all"
      >
        先試用看看 (訪客模式)
      </button>
      <p className="text-[10px] text-center text-gray-400 max-w-[200px] mx-auto leading-relaxed">
        <ShieldCheck className="w-3 h-3 inline mr-1" />
        訪客資料僅暫存於本裝置<br/>若清除快取資料將會遺失
      </p>
    </div>
  </div>
);

// --- 主應用程式 ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard'); 
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [walletName, setWalletName] = useState('My Wallet');
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [defaultAccountIdForNew, setDefaultAccountIdForNew] = useState(null);

  
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'danger',
    onConfirm: null,
    onCancel: null,
  });

  const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: 'success' });

  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smartWalletTheme') || 'blue';
    }
    return 'blue';
  });
  const theme = THEMES[currentTheme];
  

  const showToast = (message, type = 'success') => {
    setToastConfig({ show: true, message, type });
    setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 2500);
  };

  // 關閉 modal 的共用函式
  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // 開啟 confirm 視窗：同時把 onCancel 塞進去
  const openConfirm = (title, message, onConfirm, type = 'danger') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: async () => {
        closeModal();
        await onConfirm();
      },
      onCancel: closeModal,
    });
  };

// 0.0 主題變動時存回 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartWalletTheme', currentTheme);
    }
  }, [currentTheme]);
  

  // 1. 認證與登入邏輯
  useEffect(() => {
    // 這裡我們不自動登入，而是等待 onAuthStateChanged 告訴我們狀態
    // 如果這是一個新用戶，user 會是 null，我們會顯示 LoginView
    const initAuth = async () => {
      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
        return () => unsubscribe();
      }, []);
    }
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // 確定狀態後停止 loading
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        showToast("登入成功！");
    } catch (e) {
        console.error(e);
        showToast("登入失敗，請確認網路或設定", "error");
    }
  };

  const handleGuestLogin = async () => {
      try {
          await signInAnonymously(auth);
          showToast("歡迎試用！");
      } catch (e) {
          showToast("訪客登入失敗", "error");
      }
  };

  const handleLogout = () => {
      openConfirm("登出", "確定要登出嗎？", async () => {
          await signOut(auth);
          setUser(null);
          setView('dashboard'); // 重置視圖
          showToast("已登出");
      });
  };

  // 2. 資料監聽
  useEffect(() => {
    if (!user) return;
    
    // 為了支援多用戶 (如果是真實部署)，我們會用 users/{uid}/... 的結構
    // 但為了相容你原本的預覽環境結構 artifacts/.../users/{uid}/...
    // 這裡保持原本的 collection 路徑
    const collectionPath = (coll) => collection(db, 'artifacts', appId, 'users', user.uid, coll);
    const docPath = (coll, id) => doc(db, 'artifacts', appId, 'users', user.uid, coll, id);

    // 交易
    const qTx = query(collectionPath('transactions'));
    const unsubTx = onSnapshot(qTx, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate() || new Date() 
      }));
      docs.sort((a, b) => b.date - a.date);
      setTransactions(docs);
    });

    // 帳戶
    const qAcc = query(collectionPath('accounts'));
    const unsubAcc = onSnapshot(qAcc, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (docs.length === 0) {
         // 自動創建預設帳戶
         addDoc(collectionPath('accounts'), { name: '現金', type: 'cash', icon: 'coins' });
      } else {
        setAccounts(docs);
      }
    });

    // 目標
    const qGoal = query(collectionPath('goals'));
    const unsubGoal = onSnapshot(qGoal, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoals(docs);
    });

    // 設定
    const docRef = docPath('settings', 'general');
    const unsubSettings = onSnapshot(docRef, (doc) => {
      if (doc.exists() && doc.data().walletName) setWalletName(doc.data().walletName);
    });

    return () => {
      unsubTx();
      unsubAcc();
      unsubGoal();
      unsubSettings();
    };
  }, [user]);

  const handleSaveTransaction = async (data) => {
    if (!user) return;
    const collectionPath = collection(db, 'artifacts', appId, 'users', user.uid, 'transactions');
    
    try {
      let accountId = data.accountId;
      if (!accountId && accounts.length > 0) accountId = accounts[0].id;

      const payload = {
        amount: Number(data.amount),
        description: data.description || data.category,
        type: data.type,
        category: data.category,
        accountId: accountId,
        createdAt: data.date ? new Date(data.date) : serverTimestamp()
      };

      if (editingTransaction) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', editingTransaction.id), payload);
        setEditingTransaction(null);
        showToast('紀錄已更新');
      } else {
        await addDoc(collectionPath, payload);
        showToast('新增成功');
      }
      setView('dashboard');
    } catch (e) { showToast("儲存失敗", "error"); }
  };

  const handleDelete = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    openConfirm('刪除紀錄', '確定要刪除這筆紀錄嗎？', async () => {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id));
      showToast('已刪除');
    });
  };

  // 帳戶與目標處理函式 (保持原本邏輯，僅加上 user check)
  const handleAddAccount = async (name, type, icon) => {
    if(!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'accounts'), { name, type, icon });
    showToast('帳戶已新增');
  };

  const handleDeleteAccount = (id) => {
    openConfirm('刪除帳戶', '確定刪除？歷史紀錄將保留但顯示為未知帳戶。', async () => {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'accounts', id));
      showToast('帳戶已刪除');
    });
  };

  const handleAddGoal = async (name, targetAmount, icon) => {
    if(!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'goals'), {
      name, targetAmount: Number(targetAmount), currentAmount: 0, icon, createdAt: serverTimestamp()
    });
    showToast('夢想目標已建立！');
  };

  const handleDeleteGoal = (id) => {
    openConfirm('刪除目標', '確定要放棄這個夢想嗎？', async () => {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', id));
      showToast('目標已刪除');
    });
  };

  const handleDepositToGoal = async (goalId, amount, accountId, goalName) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const txRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));
      batch.set(txRef, {
        amount: Number(amount),
        description: `存入: ${goalName}`,
        category: '儲蓄',
        type: 'expense',
        accountId: accountId,
        createdAt: serverTimestamp(),
        isGoalDeposit: true,
        goalId: goalId
      });
      const goalRef = doc(db, 'artifacts', appId, 'users', user.uid, 'goals', goalId);
      const currentGoal = goals.find(g => g.id === goalId);
      batch.update(goalRef, { currentAmount: (currentGoal?.currentAmount || 0) + Number(amount) });
      await batch.commit();
      showToast(`已成功存入 $${amount}！`);
    } catch(e) { showToast('存入失敗', 'error'); }
  };

  const handleBatchUpdateAccount = (transactionIds, newAccountId, onSuccess) => {
    openConfirm('批量修改', `移動 ${transactionIds.length} 筆資料到新帳戶？`, async () => {
      const batch = writeBatch(db);
      transactionIds.forEach(id => {
          const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id);
          batch.update(ref, { accountId: newAccountId });
      });
      await batch.commit();
      showToast('更新成功');
      if (onSuccess) onSuccess();
    }, 'info');
  };

  const saveSettings = async (newName) => {
    if (!user) return;
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general'), { walletName: newName }, { merge: true });
    setWalletName(newName);
    showToast('設定已更新');
  };

  const toggleSettings = () => setView(v => v === 'settings' ? 'dashboard' : 'settings');

  // 統計
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const accountBalances = {};
    accounts.forEach(acc => accountBalances[acc.id] = 0);
    transactions.forEach(t => {
      const accId = t.accountId || (accounts[0]?.id);
      if (accId) {
        if (!accountBalances[accId]) accountBalances[accId] = 0;
        if (t.type === 'income') accountBalances[accId] += t.amount;
        else accountBalances[accId] -= t.amount;
      }
    });
    return { income, expense, balance: income - expense, accountBalances };
  }, [transactions, accounts]);

  const renderContent = () => {
    switch (view) {
      case 'add':
        return (<AddTransactionView
      onSave={handleSaveTransaction}
      onCancel={() => { setView('dashboard'); setEditingTransaction(null); setDefaultAccountIdForNew(null); }}
      theme={theme}
      accounts={accounts}
      initialData={editingTransaction}
      defaultAccountId={defaultAccountIdForNew}
    />
  );
      case 'history':
        return <HistoryView transactions={transactions} onDelete={handleDelete} onEdit={(t) => { setEditingTransaction(t); setView('add'); }} theme={theme} accounts={accounts} onBatchUpdate={handleBatchUpdateAccount} />;
      case 'analysis':
        return <AnalysisView transactions={transactions} theme={theme} />;
      case 'goals':
        return <GoalsView goals={goals} accounts={accounts} onAddGoal={handleAddGoal} onDeleteGoal={handleDeleteGoal} onDeposit={handleDepositToGoal} theme={theme} />;
      case 'settings':
        // 傳入 user 和 handleLogout
        return <SettingsView currentTheme={currentTheme} onSetTheme={setCurrentTheme} theme={theme} walletName={walletName} onSaveName={saveSettings} accounts={accounts} onAddAccount={handleAddAccount} onDeleteAccount={handleDeleteAccount} user={user} onLogout={handleLogout} />;
      case 'dashboard':
      default:
        return (
          <DashboardView stats={stats} recentTransactions={transactions.slice(0, 5)} onChangeView={setView} theme={theme} hasTransactions={transactions.length > 0} accounts={accounts} onEdit={(t) => { setEditingTransaction(t); setView('add'); }} onDelete={handleDelete} onQuickAddWithAccount={(accId) => { setEditingTransaction(null); setDefaultAccountIdForNew(accId); setView('add');
            }}
          />
        );
        
    }
  };

  // 如果正在載入驗證狀態，顯示 Loading
  if (loading) return <div className={`flex h-screen items-center justify-center ${theme.light} text-gray-400`}>載入中...</div>;

  // 如果未登入，顯示登入頁面
  if (!user) return <LoginView onGoogleLogin={handleGoogleLogin} onGuestLogin={handleGuestLogin} theme={theme} />;

  return (
    <div className={`flex flex-col h-screen ${theme.light} text-gray-700 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative transition-colors duration-500`}>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}  // 🟡 這裡會連到 Cancel 按鈕
        theme={theme}
      />
      <Toast {...toastConfig} />
  

      {/* 頂部導航 */}
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
        <button onClick={toggleSettings} className={`flex-1 text-left group`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${theme.primary} text-white`}>
               <Wallet className="w-5 h-5" /> 
            </div>
            <span className={`text-xl font-bold ${theme.accent} tracking-tight font-serif truncate max-w-[200px] group-hover:opacity-80 transition-opacity`}>{walletName}</span>
          </div>
        </button>
        <button onClick={toggleSettings} className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
          <Settings className={`w-6 h-6 ${theme.accent}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {renderContent()}
      </div>

      {/* 底部導航列 */}
      <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 pb-6 z-20">
        <NavButton icon={<PieChart />} label="總覽" active={view === 'dashboard'} theme={theme} onClick={() => setView('dashboard')} />
        <NavButton icon={<BarChart3 />} label="分析" active={view === 'analysis'} theme={theme} onClick={() => setView('analysis')} />
        <div className="relative -top-6">
          <button onClick={() => { setEditingTransaction(null); setView('add'); }} className={`${theme.primary} text-white p-4 rounded-full shadow-lg hover:brightness-110 hover:scale-105 transition-all active:scale-95`}>
            <Plus className="w-7 h-7" />
          </button>
        </div>
        <NavButton icon={<Target />} label="夢想" active={view === 'goals'} theme={theme} onClick={() => setView('goals')} />
        <NavButton icon={<List />} label="紀錄" active={view === 'history'} theme={theme} onClick={() => setView('history')} />
      </div>
    </div>
  );
}

// --- View Components (大部分保持不變，僅 SettingsView 更新) ---

// SettingsView 更新：加入使用者資訊與登出
function SettingsView({ currentTheme, onSetTheme, theme, walletName, onSaveName, accounts, onAddAccount, onDeleteAccount, user, onLogout }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(walletName);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('bank'); 
  const [newAccIcon, setNewAccIcon] = useState('bank');
  const [isAddingAcc, setIsAddingAcc] = useState(false);

  const handleSaveName = () => { onSaveName(tempName); setIsEditingName(false); };
  const handleAddAcc = () => {
      if(newAccName) {
          onAddAccount(newAccName, newAccType, newAccIcon);
          setNewAccName(''); setIsAddingAcc(false);
      }
  };

  return (
    <div className="p-5 space-y-8 pb-20 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">設定</h2>

      {/* 新增：使用者帳號區塊 */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><User className="w-4 h-4" /> 目前帳號</h3>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${theme.light} flex items-center justify-center font-bold text-gray-500`}>
                    {user?.isAnonymous ? '訪' : (user?.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                <div>
                    <p className="font-bold text-gray-700 text-sm">{user?.isAnonymous ? '訪客模式' : user?.email}</p>
                    <p className="text-[10px] text-gray-400">{user?.isAnonymous ? '資料未備份' : '資料已同步'}</p>
                </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors">
                <LogOut className="w-3 h-3" /> 登出
            </button>
        </div>
      </div>

      {/* 錢包名稱 */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Edit3 className="w-4 h-4" /> 錢包名稱</h3>
        {isEditingName ? (
            <div className="flex gap-2">
                <input value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 border-b-2 border-gray-300 focus:border-gray-500 outline-none pb-1 font-bold text-gray-700" autoFocus />
                <button onClick={handleSaveName} className={`px-4 py-1.5 rounded-xl ${theme.primary} text-white text-sm font-bold`}>儲存</button>
            </div>
        ) : (
             <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors" onClick={() => setIsEditingName(true)}>
                <span className="font-bold text-lg text-gray-700">{walletName}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">修改</span>
            </div>
        )}
      </div>

       {/* 帳戶管理 */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><CreditCard className="w-4 h-4" /> 帳戶管理</h3>
          <button onClick={() => setIsAddingAcc(!isAddingAcc)} className={`text-xs font-bold ${theme.accent} px-2 py-1 rounded-lg hover:bg-gray-50`}>
            {isAddingAcc ? '取消' : '+ 新增'}
          </button>
        </div>
        
        {isAddingAcc && (
          <div className="bg-gray-50 p-4 rounded-2xl mb-4 animate-in fade-in">
             <div className="flex gap-2 mb-3">
               <input placeholder="帳戶名稱 (ex: 玉山)" value={newAccName} onChange={e => setNewAccName(e.target.value)} className="flex-1 p-2 rounded-xl border border-gray-200 outline-none text-sm font-bold" />
               <select value={newAccType} onChange={e => setNewAccType(e.target.value)} className="p-2 rounded-xl border border-gray-200 outline-none text-sm bg-white">
                  <option value="bank">銀行</option>
                  <option value="cash">現金</option>
                  <option value="credit">信用卡</option>
               </select>
             </div>
             <p className="text-xs font-bold text-gray-400 mb-2">選擇圖示</p>
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
                {ACCOUNT_ICONS.map(item => (
                  <button key={item.id} onClick={() => setNewAccIcon(item.id)} className={`p-2 rounded-lg transition-all ${newAccIcon === item.id ? 'bg-white shadow-md ring-2 ring-blue-100' : 'text-gray-400 hover:bg-gray-200'}`}>
                    <item.icon className="w-5 h-5" />
                  </button>
                ))}
             </div>
             <button onClick={handleAddAcc} disabled={!newAccName} className={`w-full py-2 rounded-xl text-sm font-bold text-white ${theme.primary} disabled:opacity-50`}>確認新增</button>
          </div>
        )}

        <div className="space-y-2">
            {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                           <DynamicIcon iconName={acc.icon} className="w-4 h-4" fallback={Building2} />
                        </div>
                        <span className="font-bold text-gray-700">{acc.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAccount(acc.id); }}
                      className="text-gray-300 hover:text-red-400 p-2 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>

                </div>
            ))}
        </div>
      </div>

      {/* 主題選擇 */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2"><Palette className="w-4 h-4" /> 介面風格</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => onSetTheme(key)} className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${currentTheme === key ? `border-gray-200 bg-gray-50` : 'border-transparent hover:bg-gray-50'}`}>
              <div className={`w-8 h-8 rounded-full ${t.primary} shadow-sm border-2 border-white`}></div>
              <span className={`text-sm font-bold ${currentTheme === key ? 'text-gray-800' : 'text-gray-400'}`}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 其他 View Components (保持不變) ---

function DashboardView({ stats, recentTransactions, onChangeView, theme, hasTransactions, accounts, onEdit, onDelete, onQuickAddWithAccount }) {
  return (
    <div className="p-5 space-y-6 animate-fade-in">
      <div className={`bg-gradient-to-br ${theme.gradient} rounded-[32px] p-7 text-white shadow-xl transform transition-all relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <p className="text-white/80 text-sm mb-2 font-medium tracking-wide flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> 淨資產總額</p>
        <h2 className="text-4xl font-bold mb-8 tracking-tight font-serif">${stats.balance.toLocaleString()}</h2>
        <div className="flex justify-between bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><TrendingUp className="w-4 h-4 text-white" /></div>
            <div><p className="text-xs text-white/80">總收入</p><p className="font-semibold text-sm">+${stats.income.toLocaleString()}</p></div>
          </div>
          <div className="w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><TrendingDown className="w-4 h-4 text-white" /></div>
            <div><p className="text-xs text-white/80">總支出</p><p className="font-semibold text-sm">-${stats.expense.toLocaleString()}</p></div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-gray-500 text-sm mb-3 px-1 flex justify-between items-center">
            <span>我的帳戶</span>
            <span onClick={() => onChangeView('settings')} className={`text-xs ${theme.accent} cursor-pointer hover:underline`}>管理</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
        {accounts.map(acc => {
  const balance = stats.accountBalances[acc.id] || 0;
  return (
    <button
      key={acc.id}
      type="button"
      onClick={() => onQuickAddWithAccount && onQuickAddWithAccount(acc.id)}
      className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-all text-left"
    >
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.08] ${theme.primary} transition-transform group-hover:scale-150`}></div>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-gray-50 rounded-xl text-gray-500">
          <DynamicIcon iconName={acc.icon} className="w-4 h-4" />
        </div>
      </div>
      <div>
        <span className="font-bold text-sm text-gray-400 block mb-0.5">{acc.name}</span>
        <span className={`text-lg font-bold ${balance < 0 ? 'text-red-500' : 'text-gray-800'}`}>${balance.toLocaleString()}</span>
      </div>
    </button>
  );
})}

        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-500 text-lg">近期動態</h3>
          {hasTransactions && (
            <button onClick={() => onChangeView('history')} className={`text-xs ${theme.accent} hover:opacity-80 flex items-center font-bold bg-white px-3 py-1 rounded-full shadow-sm`}>
              全部 <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>
        {recentTransactions.length === 0 ? (
          <EmptyState theme={theme} />
        ) : (
          <div className="space-y-3">
            {recentTransactions.map(t => (
              <TransactionItem key={t.id} data={t} theme={theme} accounts={accounts} onClick={() => onEdit(t)} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalsView({ goals, accounts, onAddGoal, onDeleteGoal, onDeposit, theme }) {
  const [isAdding, setIsAdding] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null); 
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('target');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccount, setDepositAccount] = useState(accounts[0]?.id || '');

  const handleCreate = () => {
    if (newGoalName && newGoalTarget) {
      onAddGoal(newGoalName, newGoalTarget, newGoalIcon);
      setIsAdding(false);
      setNewGoalName(''); setNewGoalTarget('');
    }
  };

  const handleConfirmDeposit = () => {
    if (depositAmount && depositAccount && depositGoal) {
      onDeposit(depositGoal.id, depositAmount, depositAccount, depositGoal.name);
      setDepositGoal(null);
      setDepositAmount('');
    }
  };

  return (
    <div className="p-5 pb-20 animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className={`w-7 h-7 ${theme.accent}`} /> 夢想存錢罐
        </h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className={`px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg ${theme.primary}`}>
            + 新目標
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">建立新夢想</h3>
          <div className="space-y-3">
            <input placeholder="目標名稱 (ex: 日本旅遊)" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-gray-700" autoFocus />
            <input type="number" placeholder="目標金額" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl outline-none font-bold text-gray-700" />
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {GOAL_ICONS.map(item => (
                <button key={item.id} onClick={() => setNewGoalIcon(item.id)} className={`p-3 rounded-xl transition-all ${newGoalIcon === item.id ? `${theme.primary} text-white shadow-md scale-105` : 'bg-gray-50 text-gray-400'}`}>
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-400 font-bold bg-gray-100 rounded-xl">取消</button>
              <button onClick={handleCreate} disabled={!newGoalName || !newGoalTarget} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary} disabled:opacity-50`}>建立</button>
            </div>
          </div>
        </div>
      )}

      {goals.length === 0 && !isAdding ? (
        <div className="text-center py-20 opacity-50">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-400">還沒有夢想目標<br/>快建立一個吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div key={goal.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${theme.light} text-gray-600`}>
                      <DynamicIcon iconName={goal.icon} className="w-6 h-6" fallback={Target} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{goal.name}</h3>
                      <p className="text-xs text-gray-400 font-medium">目標 ${goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-300 hover:text-red-400 p-2"><X className="w-4 h-4" /></button>
                </div>

                <div className="mb-2 flex justify-between items-end">
                   <span className={`text-2xl font-bold ${theme.accent}`}>${goal.currentAmount.toLocaleString()}</span>
                   <span className="text-xs font-bold text-gray-400 mb-1">{percent}%</span>
                </div>
                
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                   <div className={`h-full rounded-full transition-all duration-1000 ${theme.primary}`} style={{ width: `${percent}%` }}></div>
                </div>

                <button 
                  onClick={() => setDepositGoal(goal)}
                  className={`w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm transition-colors ${percent >= 100 ? 'border-green-200 text-green-500 bg-green-50' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}
                >
                  {percent >= 100 ? '🎉 目標達成！' : '+ 存入資金'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
             <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">存入：{depositGoal.name}</h3>
             <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">金額</label>
                  <input type="number" autoFocus value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full border-b-2 border-gray-200 focus:border-gray-400 outline-none py-2 text-2xl font-bold text-center" placeholder="0" />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">從哪裡扣款？</label>
                  <select value={depositAccount} onChange={e => setDepositAccount(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl outline-none text-sm font-bold">
                     {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
               </div>
               <div className="flex gap-3 pt-2">
                  <button onClick={() => setDepositGoal(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">取消</button>
                  <button onClick={handleConfirmDeposit} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary}`}>確認存入</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisView({ transactions, theme }) {
    const [selectedDate, setSelectedDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const changeMonth = (delta) => setSelectedDate(p => new Date(p.getFullYear(), p.getMonth() + delta, 1));
    
    const data = useMemo(() => {
        const targetYear = selectedDate.getFullYear();
        const targetMonth = selectedDate.getMonth();
        const filteredTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
        });

        const income = filteredTx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
        const expense = filteredTx.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        const net = income - expense;
        const maxVal = Math.max(income, expense);
        
        const catMap = {};
        filteredTx.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
        const topCats = Object.entries(catMap).sort((a,b) => b[1] - a[1]).slice(0, 4); // Show top 4
        
        return { income, expense, net, maxVal, topCats, count: filteredTx.length };
    }, [transactions, selectedDate]);

    return (
        <div className="p-5 space-y-6 animate-fade-in">
             <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronLeft className="w-5 h-5" /></button>
                <span className="font-bold text-gray-700 text-lg">{selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月</span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronRight className="w-5 h-5" /></button>
             </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">收支對比</h3>
                {data.count === 0 ? <div className="text-center py-8 text-gray-300 text-sm font-bold">本月無交易</div> : (
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500 font-bold">收入</span><span className="font-bold text-gray-700">${data.income.toLocaleString()}</span></div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-300 rounded-full transition-all duration-500" style={{ width: `${(data.income / (data.maxVal || 1)) * 100}%` }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500 font-bold">支出</span><span className="font-bold text-gray-700">${data.expense.toLocaleString()}</span></div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${theme.primary}`} style={{ width: `${(data.expense / (data.maxVal || 1)) * 100}%` }}></div></div>
                        </div>
                    </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">結餘</span>
                    <span className={`text-xl font-bold ${data.net >= 0 ? 'text-gray-700' : 'text-red-500'}`}>{data.net >= 0 ? '+' : ''}{data.net.toLocaleString()}</span>
                </div>
            </div>

            {data.topCats.length > 0 && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">支出排行</h3>
                    <div className="space-y-4">
                        {data.topCats.map(([cat, amount], idx) => (
                            <div key={cat} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500'}`}>{idx + 1}</div>
                                    <span className="text-gray-700 font-bold text-sm">{cat}</span>
                                </div>
                                <span className="text-gray-600 font-bold text-sm">${amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AddTransactionView({ onSave, onCancel, theme, accounts, initialData, defaultAccountId }) {
  const [type, setType] = useState(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || defaultAccountId || (accounts[0]?.id || ''));
  const [dateStr, setDateStr] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  
  useEffect(() => { if (!category && !initialData) setCategory(type === 'expense' ? '飲食' : '薪水'); }, [type, initialData]);
// 0.1 defaultAccountId 改變時，沒有在編輯舊資料的情況也會跟著更新
  useEffect(()=> {
    if (!initialData) {
      setAccountId(defaultAccountId || (accounts[0]?.id || ''));
    }
  }, [defaultAccountId, accounts, initialData]);
  const expenseCategories = ['飲食', '交通', '購物', '娛樂', '居住', '自我提升', '我也不知道', '其他'];
  const incomeCategories = ['薪水', '零用錢', '中獎', '初始餘額', '投資', '兼職', '我也不知道', '其他'];
  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    onSave({ type, amount, description, category, accountId, date: new Date(dateStr) });
  };

  const handleDescriptionChange = (e) => {
    if (e.target.value.length <= 50) setDescription(e.target.value);
  }

  const handleForget = () => {
    setDateStr(new Date().toISOString().split('T')[0]);
    if (!description.includes('(日期不詳)')) {
        setDescription(prev => (prev ? prev + ' ' : '') + '(日期不詳)');
    }
  };

  const getPlaceholder = () => {
    if (category === '我也不知道') return '既然不知道就算了...';
    if (category === '自我提升') return '我真不錯';
    return `例如：${category}細項`;
  };

  return (
    <div className="p-5 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
        {initialData ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
        {initialData ? '編輯紀錄' : '新增紀錄'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gray-200 p-1 rounded-2xl flex">
          <button type="button" className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-gray-700 shadow-md' : 'text-gray-400'}`} onClick={() => setType('expense')}>支出</button>
          <button type="button" className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-gray-700 shadow-md' : 'text-gray-400'}`} onClick={() => setType('income')}>收入</button>
        </div>

        {/* 金額輸入 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">金額</label>
          <div className="relative flex items-center">
            <DollarSign className={`w-6 h-6 ${theme.accent} mr-2`} />
            <input type="number" inputMode="decimal" min="0" value={amount} onChange={e => e.target.value >= 0 && setAmount(e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" className="w-full bg-transparent outline-none text-3xl font-bold text-gray-700 placeholder-gray-200" autoFocus={!initialData} />
          </div>
        </div>

        {/* 日期選擇 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex-1">
             <label className="block text-xs font-bold text-gray-400 uppercase mb-2">日期</label>
             <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="bg-transparent outline-none text-gray-700 font-bold w-full" />
          </div>
          <button type="button" onClick={handleForget} className="text-xs font-bold text-gray-400 border border-gray-200 px-3 py-2 rounded-lg ml-3 whitespace-nowrap hover:bg-gray-50 hover:text-gray-600 transition-colors">我忘了</button>
        </div>

         {/* 帳戶選擇 */}
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{type === 'expense' ? '扣款帳戶' : '入帳帳戶'}</label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {accounts.map(acc => (
                <button key={acc.id} type="button" onClick={() => setAccountId(acc.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap border transition-all ${accountId === acc.id ? `border-transparent ${theme.primary} text-white font-bold` : 'border-gray-200 text-gray-600 font-medium'}`}>
                    <DynamicIcon iconName={acc.icon} className="w-3 h-3" fallback={Building2} /> {acc.name}
                </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-3">選擇類別</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setCategory(cat)} className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all truncate ${category === cat ? `border-transparent ${theme.primary} text-white shadow-md transform scale-105` : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">備註</label>
          <input type="text" value={description} onChange={handleDescriptionChange} placeholder={getPlaceholder()} className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 font-bold" />
          <span className="absolute bottom-2 right-4 text-[10px] text-gray-300 font-bold">{description.length}/50</span>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-100 rounded-2xl transition-colors">取消</button>
          <button type="submit" disabled={!amount} className={`flex-1 py-4 ${theme.primary} text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-transform active:scale-95 disabled:opacity-50`}>確認儲存</button>
        </div>
      </form>
    </div>
  );
}

function HistoryView({ transactions, onDelete, onEdit, theme, accounts, onBatchUpdate }) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [targetAccount, setTargetAccount] = useState(accounts[0]?.id || '');

  const toggleSelection = (id) => {
      const newSet = new Set(selectedIds);
      if(newSet.has(id)) newSet.delete(id); else newSet.add(id);
      setSelectedIds(newSet);
  }

  const handleBatchSubmit = () => {
      if(selectedIds.size === 0) return;
      onBatchUpdate(Array.from(selectedIds), targetAccount, () => {
          setIsSelectionMode(false);
          setSelectedIds(new Set());
      });
  }

  const grouped = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [transactions]);

  return (
    <div className="p-5 relative min-h-full">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">收支紀錄</h2>
          <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }} className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${isSelectionMode ? `bg-gray-700 text-white border-gray-700` : `border-gray-200 text-gray-500`}`}>
              {isSelectionMode ? '取消選取' : '批量修改'}
          </button>
      </div>

      {transactions.length === 0 ? <EmptyState theme={theme} /> : (
        <div className="space-y-6 pb-24">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <h3 className={`text-xs font-bold ${theme.accent} mb-3 ml-1`}>{month}</h3>
              <div className="space-y-3">
                {items.map(t => (
                  <TransactionItem key={t.id} data={t} onDelete={onDelete} onClick={() => isSelectionMode ? toggleSelection(t.id) : onEdit(t)} canDelete={!isSelectionMode} theme={theme} accounts={accounts} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(t.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isSelectionMode && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-8 z-30 shadow-lg animate-in slide-in-from-bottom">
              <div className="max-w-md mx-auto flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap">已選 {selectedIds.size} 筆</span>
                  <select className="flex-1 bg-gray-100 text-sm rounded-lg px-3 py-2 outline-none font-bold text-gray-600" value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)}>
                      {accounts.map(acc => <option key={acc.id} value={acc.id}>移動到: {acc.name}</option>)}
                  </select>
                  <button onClick={handleBatchSubmit} disabled={selectedIds.size === 0} className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${theme.primary} disabled:opacity-50`}>確認</button>
              </div>
          </div>
      )}
    </div>
  );
}

function TransactionItem({ data, onDelete, onClick, canDelete, theme, accounts, isSelectionMode, isSelected }) {
  const isIncome = data.type === 'income';
  const account = accounts.find(a => a.id === data.accountId);
  
  return (
    <div onClick={onClick} className={`bg-white p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer active:scale-[0.99] relative ${isSelectionMode && isSelected ? `border-[${theme.chart}] shadow-md ring-1 ring-offset-1` : 'border-gray-100 shadow-sm'}`} style={{ borderColor: isSelected ? theme.chart : undefined }}>
      <div className="flex items-center gap-4">
        {isSelectionMode ? (
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${isSelected ? `${theme.primary} border-transparent` : 'border-gray-300'}`}>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
        ) : (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-orange-50' : 'bg-gray-50'}`}>
               {isIncome ? <TrendingUp className="w-5 h-5 text-orange-400" /> : <div className={`w-2 h-2 rounded-full ${theme.primary}`}></div>}
            </div>
        )}
        <div>
          <p className="font-bold text-gray-700 text-sm">{data.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-500 font-bold">{data.category}</span>
            <span className={`px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1`}>
                <DynamicIcon iconName={account?.icon} className="w-3 h-3" />
                {account?.name || '未知'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
             <span className={`font-bold text-lg block ${isIncome ? 'text-orange-500' : 'text-gray-700'}`}>{isIncome ? '+' : '-'}{data.amount.toLocaleString()}</span>
             <span className="text-[10px] text-gray-300 font-bold">{new Date(data.date).toLocaleDateString()}</span>
        </div>
        {canDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(data.id, e); }} className="text-gray-300 hover:text-red-500 transition-colors p-3 -mr-3 relative z-10"><Trash2 className="w-5 h-5" /></button>}
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick, theme }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${active ? `${theme.accent} scale-110` : 'text-gray-300 hover:text-gray-400'}`}>
      {React.cloneElement(icon, { className: `w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}` })}
      <span>{label}</span>
    </button>
  );
}

function EmptyState({ theme }) {
  return (
    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 mx-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.light}`}><Calendar className={`w-8 h-8 ${theme.accent}`} /></div>
      <p className="text-gray-400 font-bold">還沒有任何紀錄</p>
      <p className="text-xs text-gray-300 mt-2 font-medium">點擊「+」開始記下第一筆</p>
    </div>
  );
}