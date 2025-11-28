 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/App.jsx b/src/App.jsx
index 33a5cfae7caeed99e451b0187d1c808ad3f16c21..cbc453fa0515d95859adf5a4437203983657e684 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -1,44 +1,45 @@
+/* global __initial_auth_token */
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
-  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, 
-  serverTimestamp, query, updateDoc, setDoc, writeBatch, orderBy, getDoc 
+  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc,
+  serverTimestamp, query, updateDoc, setDoc, writeBatch
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
@@ -57,168 +58,200 @@ const GOAL_ICONS = [
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
-  try {
-    let entry = ACCOUNT_ICONS.find(i => i.id === iconName);
-    if (!entry) entry = GOAL_ICONS.find(i => i.id === iconName);
-    const IconComponent = entry ? entry.icon : Fallback;
-    return <IconComponent className={className} />;
-  } catch (e) { return <Fallback className={className} />; }
+  const entry = ACCOUNT_ICONS.find(i => i.id === iconName) || GOAL_ICONS.find(i => i.id === iconName);
+  const IconComponent = entry ? entry.icon : Fallback;
+  return <IconComponent className={className} />;
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
 
+const CssPie = ({ data, total, title }) => {
+  if(!data.length) return <div className="h-32 flex items-center justify-center text-gray-300 text-xs">無數據</div>;
+  const colors = ['#7A90A4','#8F9E8B','#C6B8B8','#A69E8F'];
+  const gradient = data.reduce((acc, d, i) => {
+    const pct = (d.value/(total||1))*100;
+    const start = acc.offset;
+    const end = start + pct;
+    acc.parts.push(`${colors[i%colors.length]} ${start}% ${end}%`);
+    acc.offset = end;
+    return acc;
+  }, { offset: 0, parts: [] });
+  const grad = gradient.parts.join(', ');
+  return (
+    <div className="flex flex-col items-center">
+      <div className="w-24 h-24 rounded-full relative" style={{background: `conic-gradient(${grad})`}}>
+        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
+          <span className="text-[9px] text-gray-400">{title}</span>
+          <span className="text-[10px] font-bold text-gray-700">${total.toLocaleString()}</span>
+        </div>
+      </div>
+      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
+        {data.slice(0,3).map((d,i)=>(
+          <div key={i} className="flex items-center gap-1 text-[9px] text-gray-500">
+            <div className="w-1.5 h-1.5 rounded-full" style={{background:colors[i%colors.length]}}></div>
+            {d.name} {Math.round(d.value/(total||1)*100)}%
+          </div>
+        ))}
+      </div>
+    </div>
+  );
+};
+
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
   const [budgetSetting, setBudgetSetting] = useState({ enabled: false, cycle: 'month', type: 'expense', amount: 0 });
   const [loading, setLoading] = useState(true);
   const [editingTransaction, setEditingTransaction] = useState(null);
   const [defaultAccId, setDefaultAccId] = useState(null);
 
   const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
   const [toast, setToast] = useState({ show: false, message: '' });
   const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('theme') || 'blue');
   const theme = THEMES[currentTheme];
   const [fontSize, setFontSize] = useState('medium');
+  const [netCardMetric, setNetCardMetric] = useState(() => localStorage.getItem('dashboardMetric') || 'incomeExpense');
 
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
 
   // 🔥 [新增] 監聽字體設定，動態調整根元素大小
   useEffect(() => {
     const sizeMap = { small: '14px', medium: '16px', large: '18px' };
     document.documentElement.style.fontSize = sizeMap[fontSize] || '16px';
   }, [fontSize]);
 
+  useEffect(() => {
+    localStorage.setItem('dashboardMetric', netCardMetric);
+  }, [netCardMetric]);
+
   // Handlers
   const handleGoogle = async () => { try { await signInWithPopup(auth, googleProvider); } catch { showToast('登入失敗', 'error'); } };
   const handleGuest = async () => { try { await signInAnonymously(auth); } catch { showToast('登入失敗', 'error'); } };
   const handleLogout = () => openConfirm('登出', '確定要登出嗎？', () => signOut(auth));
 
   useEffect(() => {
   if (!user) return;
 
   // 跟你之前一樣的路徑：artifacts / smart-wallet / users / {uid} / ...
-  const collectionPath = (coll) => 
+  const collectionPath = (coll) =>
     collection(db, 'artifacts', appId, 'users', user.uid, coll);
-  const docPath = (coll, id) => 
-    doc(db, 'artifacts', appId, 'users', user.uid, coll, id);
 
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
@@ -272,52 +305,52 @@ export default function App() {
     unsubAcc();
     unsubGoal();
     unsubSet();
   };
 }, [user]);
 
 // Actions
   // 🔥 [修正 2] 新增這個函式來儲存主題
   const handleSetTheme = async (newTheme) => {
     setCurrentTheme(newTheme);
     if (user) {
       await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general'), { theme: newTheme }, { merge: true });
     }
   };
   
   //增加字體儲存設定
   const handleSetFontSize = async (size) => {
     setFontSize(size);
     if (user) {
       await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general'), { fontSize: size }, { merge: true });
     }
   };
 
   const saveTx = async (data) => {
     try {
-      const { id, ...dataToSave } = data;
-      const payload = { ...dataToSave, amount: Number(dataToSave.amount), accountId: dataToSave.accountId || accounts[0]?.id, createdAt: dataToSave.date };
+      const { id: _ignoreId, ...dataToSave } = data;
+      const payload = { ...dataToSave, amount: Number(dataToSave.amount), accountId: dataToSave.accountId || accounts[0]?.id, createdAt: dataToSave.date, excludeFromMonthly: dataToSave.type === 'expense' ? Boolean(dataToSave.excludeFromMonthly) : false };
       // 🔥 [修正路徑]
       if (editingTransaction) { 
         await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', editingTransaction.id), payload); 
         showToast('已更新'); 
       } else { 
         await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), payload); 
         showToast('新增成功'); 
       }
       setEditingTransaction(null); setView('dashboard');
     } catch { showToast('儲存失敗', 'error'); }
   };
 
   const delTx = (id) => openConfirm('刪除', '確定刪除此紀錄？', async () => { 
     // 🔥 [修正路徑]
     await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id)); 
     showToast('已刪除'); 
   });
   
   const saveAcc = async (accountData) => {
     if(!user) return;
     const { id, ...dataToSave } = accountData;
     try {
       // 🔥 [修正路徑]
       if (id) { 
         await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'accounts', id), dataToSave); 
@@ -371,50 +404,67 @@ export default function App() {
   const togglePinGoal = async (g) => 
     // 🔥 [修正路徑]
     await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', g.id), { isPinned: !g.isPinned });
 
   const moveGoal = async (idx, dir) => {
       const newGoals = [...goals];
       const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
       if (targetIdx < 0 || targetIdx >= newGoals.length) return;
       const itemA = newGoals[idx]; const itemB = newGoals[targetIdx];
       const batch = writeBatch(db);
       // 🔥 [修正路徑]
       batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', itemA.id), { order: itemB.order ?? targetIdx });
       batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', itemB.id), { order: itemA.order ?? idx });
       await batch.commit();
   };
 
   const depositGoal = async (gid, amt, aid, gname) => {
     const batch = writeBatch(db);
     // 🔥 [修正路徑] (兩處)
     batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions')), { amount: Number(amt), description: `存入: ${gname}`, category: '儲蓄', type: 'expense', accountId: aid, createdAt: new Date() });
     const g = goals.find(g=>g.id===gid);
     batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', gid), { currentAmount: (g?.currentAmount||0) + Number(amt) });
     await batch.commit(); showToast('存入成功');
   };
 
+  const withdrawGoal = async (gid, amt, aid, gname) => {
+    const amount = Math.max(0, Number(amt));
+    if (!amount) return;
+    const batch = writeBatch(db);
+    batch.set(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions')), { amount, description: `提領: ${gname}`, category: '儲蓄提領', type: 'income', accountId: aid, createdAt: new Date() });
+    const g = goals.find(item => item.id === gid);
+    const newAmount = Math.max(0, (g?.currentAmount || 0) - amount);
+    batch.update(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', gid), { currentAmount: newAmount });
+    await batch.commit(); showToast('已提領');
+  };
+
+  const adjustGoalBalance = async (gid, amt) => {
+    const targetAmount = Math.max(0, Number(amt) || 0);
+    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', gid), { currentAmount: targetAmount });
+    showToast('儲蓄餘額已更新');
+  };
+
   const handleBatchUpdateAccount = (transactionIds, newAccountId, onSuccess) => {
     openConfirm('批量移動', `移動 ${transactionIds.length} 筆資料？`, async () => {
       const batch = writeBatch(db);
       // 🔥 [修正路徑]
       transactionIds.forEach(id => { const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id); batch.update(ref, { accountId: newAccountId }); });
       await batch.commit(); showToast('更新成功'); if (onSuccess) onSuccess();
     }, 'info');
   };
 
   const handleBatchDelete = (transactionIds, onSuccess) => {
     openConfirm('批量刪除', `確定要刪除這 ${transactionIds.length} 筆資料嗎？(無法復原)`, async () => {
       const batch = writeBatch(db);
       // 🔥 [修正路徑]
       transactionIds.forEach(id => { const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id); batch.delete(ref); });
       await batch.commit(); showToast('已批量刪除'); if (onSuccess) onSuccess();
     });
   };
 
   const saveSettings = async (newName) => {
     if (!user) return;
     // 🔥 [修正路徑]
     await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'general'), { walletName: newName }, { merge: true });
     setWalletName(newName); showToast('設定已更新');
   };
 
@@ -470,124 +520,101 @@ export default function App() {
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
-        {view === 'analysis' && <AnalysisView txs={transactions} theme={theme} accounts={accounts} stats={stats} />} 
-        {view === 'goals' && <GoalsView goals={goals} accounts={accounts} onSave={saveGoal} onDel={delGoal} onDeposit={depositGoal} onPin={togglePinGoal} onMove={moveGoal} theme={theme} />}
+        {view === 'analysis' && <AnalysisView txs={transactions} accounts={accounts} stats={stats} />}
+        {view === 'goals' && <GoalsView goals={goals} accounts={accounts} onSave={saveGoal} onDel={delGoal} onDeposit={depositGoal} onWithdraw={withdrawGoal} onAdjust={adjustGoalBalance} onPin={togglePinGoal} onMove={moveGoal} theme={theme} />}
         {/* 🔥 修正：傳遞 onDeleteCategory */}
         {view === 'settings' && <SettingsView theme={theme} name={walletName} onSaveName={saveSettings} accounts={accounts} onSaveAccount={saveAcc} onDeleteAccount={delAcc} onPin={togglePin} onMove={moveAcc} user={user} onLogout={handleLogout} setTheme={handleSetTheme} curTheme={currentTheme} onExport={exportCSV} categories={categories} onSaveCategories={saveCategories} onDeleteCategory={handleDeleteCategory} fontSize={fontSize} onSetFontSize={handleSetFontSize} budgetSetting={budgetSetting} onSaveBudget={saveBudgetSetting} />}
-        {view === 'dashboard' && <DashboardView stats={stats} recents={transactions.slice(0,5)} onView={setView} theme={theme} hasTx={transactions.length>0} accounts={accounts} onEdit={(t)=>{setEditingTransaction(t);setView('add')}} onDel={delTx} onQuickAdd={(aid)=>{setDefaultAccId(aid);setView('add')}} transactions={transactions} budgetSetting={budgetSetting} />}
+        {view === 'dashboard' && <DashboardView stats={stats} recents={transactions.slice(0,5)} onView={setView} theme={theme} hasTx={transactions.length>0} accounts={accounts} onEdit={(t)=>{setEditingTransaction(t);setView('add')}} onDel={delTx} onQuickAdd={(aid)=>{setDefaultAccId(aid);setView('add')}} transactions={transactions} budgetSetting={budgetSetting} netCardMetric={netCardMetric} onChangeMetric={setNetCardMetric} />}
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
 
-const AnalysisView = ({ txs, theme, accounts, stats }) => {
+const AnalysisView = ({ txs, accounts, stats }) => {
   const [mode, setMode] = useState('month');
   const [date, setDate] = useState(new Date());
   const changeDate = (d) => setDate(p => { const n = new Date(p); if(mode==='year') n.setFullYear(p.getFullYear()+d); else if(mode==='month') n.setMonth(p.getMonth()+d); else n.setDate(p.getDate()+d*(mode==='week'?7:1)); return n; });
   
   const getRange = () => { const y=date.getFullYear(), m=date.getMonth(); if(mode==='year') return {l:`${y}年`,s:new Date(y,0,1),e:new Date(y,11,31,23,59,59)}; if(mode==='month') return {l:`${y}年${m+1}月`,s:new Date(y,m,1),e:new Date(y,m+1,0,23,59,59)}; if(mode==='week') { const d=date.getDay(), diff=date.getDate()-d+(d===0?-6:1); const s=new Date(date); s.setDate(diff); s.setHours(0,0,0,0); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59); return {l:`${s.getMonth()+1}/${s.getDate()} - ${e.getMonth()+1}/${e.getDate()}`,s,e}; } return {l:`${m+1}月${date.getDate()}日`,s:new Date(y,m,date.getDate(),0,0,0),e:new Date(y,m,date.getDate(),23,59,59)}; };
   const { l, s, e } = getRange();
 
   const data = useMemo(() => {
-      const f = txs.filter(t => t.date>=s && t.date<=e);
+      const f = txs.filter(t => t.date>=s && t.date<=e && !(mode==='month' && t.type==='expense' && t.excludeFromMonthly));
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
 
-  const CssPie = ({ data, total, title }) => {
-      if(!data.length) return <div className="h-32 flex items-center justify-center text-gray-300 text-xs">無數據</div>;
-      let acc = 0; const grad = data.map((d,i) => { const pct = (d.value/(total||1))*100; const g = `${['#7A90A4','#8F9E8B','#C6B8B8','#A69E8F'][i%4]} ${acc}% ${acc+pct}%`; acc+=pct; return g; }).join(', ');
-      return (
-        <div className="flex flex-col items-center">
-          <div className="w-24 h-24 rounded-full relative" style={{background: `conic-gradient(${grad})`}}>
-            <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
-              <span className="text-[9px] text-gray-400">{title}</span>
-              <span className="text-[10px] font-bold text-gray-700">${total.toLocaleString()}</span>
-            </div>
-          </div>
-          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
-            {data.slice(0,3).map((d,i)=>(
-              <div key={i} className="flex items-center gap-1 text-[9px] text-gray-500">
-                <div className="w-1.5 h-1.5 rounded-full" style={{background:['#7A90A4','#8F9E8B','#C6B8B8','#A69E8F'][i%4]}}></div>
-                {d.name} {Math.round(d.value/(total||1)*100)}%
-              </div>
-            ))}
-          </div>
-        </div>
-      );
-  };
-
   return (
       <div className="p-5 space-y-6 animate-fade-in pb-24">
           <div className="bg-gray-100 p-1 rounded-xl flex mb-2">{['year','month','week','day'].map(m=><button key={m} onClick={()=>setMode(m)} className={`flex-1 py-1 text-xs font-bold rounded-lg ${mode===m?'bg-white shadow-sm':'text-gray-400'}`}>{{year:'年',month:'月',week:'週',day:'日'}[m]}</button>)}</div>
           
           <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100"><button onClick={()=>changeDate(-1)} className="p-2 text-gray-500"><ChevronLeft/></button><span className="font-bold text-gray-700">{l}</span><button onClick={()=>changeDate(1)} className="p-2 text-gray-500"><ChevronRight/></button></div>
     
         {/* 🔥 新增：收支結餘分析卡片 */}
           <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-gray-400">本期結餘 (收 - 支)</span>
                 <span className={`text-2xl font-bold ${data.net < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                   {data.net >= 0 ? '+' : ''}{data.net.toLocaleString()}
                 </span>
              </div>
 
              {/* 視覺化長條圖 (收入vs支出 比例) */}
              <div className="h-2 w-full bg-gray-100 rounded-full flex overflow-hidden">
                 <div 
                   style={{ width: `${(data.inc + data.exp) === 0 ? 0 : (data.inc / (data.inc + data.exp)) * 100}%` }} 
                   className="h-full bg-emerald-700" 
                 />
                 <div 
                   style={{ width: `${(data.inc + data.exp) === 0 ? 0 : (data.exp / (data.inc + data.exp)) * 100}%` }} 
                   className="h-full bg-red-700" 
                 />
@@ -607,90 +634,198 @@ const AnalysisView = ({ txs, theme, accounts, stats }) => {
 
         
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
 
 
 // 記得參數要加： transactions, budgetSetting
-const DashboardView = ({ stats, recents, onView, theme, hasTx, accounts, onEdit, onDel, onQuickAdd, transactions, budgetSetting }) => {
+const DashboardView = ({ stats, recents, onView, theme, hasTx, accounts, onEdit, onDel, onQuickAdd, transactions, budgetSetting, netCardMetric, onChangeMetric }) => {
+
+  const metricOptions = useMemo(() => {
+      const now = new Date();
+      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
+      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
+      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
+      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
+      const weekStart = new Date(now);
+      const day = weekStart.getDay() || 7;
+      weekStart.setDate(weekStart.getDate() - day + 1);
+      weekStart.setHours(0, 0, 0, 0);
+      const weekEnd = new Date(weekStart);
+      weekEnd.setDate(weekEnd.getDate() + 6);
+      weekEnd.setHours(23, 59, 59);
+
+      const monthExpenseTx = transactions.filter(t =>
+        t.type === 'expense' &&
+        t.date >= monthStart &&
+        t.date <= monthEnd &&
+        !t.excludeFromMonthly
+      );
+      const monthExpense = monthExpenseTx.reduce((sum, t) => sum + t.amount, 0);
+      const monthIncome = transactions
+        .filter(t => t.type === 'income' && t.date >= monthStart && t.date <= monthEnd)
+        .reduce((sum, t) => sum + t.amount, 0);
+      const lastMonthExpense = transactions
+        .filter(t => t.type === 'expense' && t.date >= lastMonthStart && t.date <= lastMonthEnd && !t.excludeFromMonthly)
+        .reduce((sum, t) => sum + t.amount, 0);
+      const daysInMonth = monthEnd.getDate();
+      const weekCount = Math.ceil(daysInMonth / 7);
+      const monthlyWeeklyAvg = weekCount ? monthExpense / weekCount : 0;
+      const monthlyDailyAvg = daysInMonth ? monthExpense / daysInMonth : 0;
+      const monthExpenseDiff = monthExpense - lastMonthExpense;
+      const monthlyMaxExpense = monthExpenseTx.reduce((max, t) => Math.max(max, t.amount), 0);
+      const weeklyMaxExpense = transactions
+        .filter(t => t.type === 'expense' && t.date >= weekStart && t.date <= weekEnd)
+        .reduce((max, t) => Math.max(max, t.amount), 0);
+
+      const formatMoney = (val) => `$${Math.round(val).toLocaleString()}`;
+
+      return {
+        incomeExpense: {
+          label: '本月收支',
+          value: `+${monthIncome.toLocaleString()} / -${monthExpense.toLocaleString()}`,
+          helper: '可選擇排除的支出不會被計入'
+        },
+        monthlyWeeklyAvg: {
+          label: '本月每週平均消費',
+          value: formatMoney(monthlyWeeklyAvg)
+        },
+        monthlyDailyAvg: {
+          label: '本月每日平均消費',
+          value: formatMoney(monthlyDailyAvg)
+        },
+        monthVsLastExpense: {
+          label: '比上月多支出金額',
+          value: `${monthExpenseDiff >= 0 ? '+' : '-'}${formatMoney(Math.abs(monthExpenseDiff))}`,
+          helper: lastMonthExpense === 0 ? '上月無支出記錄，提供相對差異' : undefined
+        },
+        monthIncome: {
+          label: '本月總收入',
+          value: formatMoney(monthIncome)
+        },
+        monthExpense: {
+          label: '本月總支出',
+          value: formatMoney(monthExpense)
+        },
+        monthMaxExpense: {
+          label: '本月最高支出',
+          value: formatMoney(monthlyMaxExpense)
+        },
+        weekMaxExpense: {
+          label: '本週最高支出',
+          value: formatMoney(weeklyMaxExpense)
+        }
+      };
+  }, [transactions]);
+
+  const selectedMetric = metricOptions[netCardMetric] || metricOptions.incomeExpense;
+  const monthIncomeText = metricOptions.incomeExpense ? metricOptions.incomeExpense.value.split(' / ')[0] : `+${stats.income.toLocaleString()}`;
+  const monthExpenseText = metricOptions.incomeExpense ? metricOptions.incomeExpense.value.split(' / ')[1] : `-${stats.expense.toLocaleString()}`;
 
   const budgetData = useMemo(() => {
       if (!budgetSetting?.enabled || !budgetSetting.amount) return null;
-      
+
       const now = new Date();
       const start = new Date(now);
-      start.setHours(0, 0, 0, 0); 
+      start.setHours(0, 0, 0, 0);
 
       if (budgetSetting.cycle === 'week') {
           const day = start.getDay() || 7; 
           start.setDate(start.getDate() - day + 1); 
       } else if (budgetSetting.cycle === 'month') {
           start.setDate(1); 
       } else if (budgetSetting.cycle === 'year') {
           start.setMonth(0, 1);
       }
 
       const current = transactions
-        .filter(t => new Date(t.date) >= start && t.type === budgetSetting.type)
+        .filter(t => new Date(t.date) >= start && t.type === budgetSetting.type && !(budgetSetting.cycle === 'month' && t.type === 'expense' && t.excludeFromMonthly))
         .reduce((sum, t) => sum + t.amount, 0);
       
       const pct = Math.min(100, (current / budgetSetting.amount) * 100);
       const isExp = budgetSetting.type === 'expense';
       
       // 顏色：支出用深紅，收入用深綠
       const color = isExp ? 'bg-red-700' : 'bg-emerald-700';
 
       return { current, target: budgetSetting.amount, pct, color, label: isExp ? '剩餘預算' : '距離目標', diff: budgetSetting.amount - current };
   }, [transactions, budgetSetting]);
 
   return (
     <div className="p-5 space-y-6 animate-fade-in">
       {/* 淨資產大卡片 */}
       <div onClick={()=>onView('analysis')} className={`bg-gradient-to-br ${theme.gradient} rounded-[32px] p-7 text-white shadow-xl cursor-pointer active:scale-[0.98]`}>
-         <p className="text-white/80 text-sm mb-2 flex items-center gap-1"><Wallet className="w-3.5 h-3.5"/> 淨資產 <ChevronRight className="w-4 h-4 opacity-50"/></p>
-         <h2 className="text-4xl font-bold mb-8 font-serif">${stats.balance.toLocaleString()}</h2>
-         <div className="flex justify-between bg-black/10 rounded-2xl p-4 backdrop-blur-sm">
-             <div className="flex gap-2 items-center"><div className="bg-white/20 p-1.5 rounded-full"><TrendingUp className="w-4 h-4"/></div><div><p className="text-xs text-white/80">收入</p><p className="font-bold">+${stats.income.toLocaleString()}</p></div></div>
-             <div className="flex gap-2 items-center"><div className="bg-white/20 p-1.5 rounded-full"><TrendingDown className="w-4 h-4"/></div><div><p className="text-xs text-white/80">支出</p><p className="font-bold">-${stats.expense.toLocaleString()}</p></div></div>
+         <div className="flex justify-between items-start mb-2">
+           <p className="text-white/80 text-sm flex items-center gap-1"><Wallet className="w-3.5 h-3.5"/> 淨資產 <ChevronRight className="w-4 h-4 opacity-50"/></p>
+           <select
+             value={netCardMetric}
+             onChange={(e)=>onChangeMetric(e.target.value)}
+             onClick={(e)=>e.stopPropagation()}
+             className="bg-white/20 text-white text-xs font-bold rounded-lg px-2 py-1 border border-white/30 backdrop-blur-sm"
+           >
+             {Object.entries(metricOptions).map(([key, opt]) => (
+               <option key={key} value={key} className="text-gray-700">{opt.label}</option>
+             ))}
+           </select>
+         </div>
+         <h2 className="text-4xl font-bold mb-6 font-serif">${stats.balance.toLocaleString()}</h2>
+         <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
+             <div className="flex items-center justify-between gap-3">
+               <div>
+                 <p className="text-xs text-white/80">{selectedMetric.label}</p>
+                 <p className="font-bold text-lg">{selectedMetric.value}</p>
+               </div>
+               <div className="text-right text-sm font-bold space-y-1">
+                  <div>
+                    <p className="text-white/80 text-[11px]">本月收入</p>
+                    <p>{monthIncomeText}</p>
+                  </div>
+                  <div>
+                    <p className="text-white/80 text-[11px]">本月支出</p>
+                    <p>{monthExpenseText}</p>
+                  </div>
+               </div>
+             </div>
+             {selectedMetric.helper && <p className="text-[11px] text-white/70 mt-2 leading-relaxed">{selectedMetric.helper}</p>}
          </div>
       </div>
 
       {/* 預算區塊 */}
       {budgetSetting?.enabled && budgetData ? (
         <div className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex justify-between items-end mb-2 relative z-10">
                 <div>
                     <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                         {budgetSetting.cycle === 'day' ? '今日' : budgetSetting.cycle === 'week' ? '本週' : budgetSetting.cycle === 'month' ? '本月' : '今年'}
                         {budgetSetting.type === 'expense' ? '支出上限' : '收入目標'}
                     </p>
                     <h3 className="text-xl font-bold text-gray-700 mt-1">
                         ${budgetData.current.toLocaleString()} <span className="text-sm text-gray-300">/ ${budgetData.target.toLocaleString()}</span>
                     </h3>
                 </div>
                 
                 {/* 🔥 [修正區塊] 文字與顏色邏輯 */}
                 <div className="text-right">
                     <p className="text-xs font-bold text-gray-400">{budgetData.label}</p>
                     <p className={`font-bold ${
                         budgetData.diff < 0 
                             ? (budgetSetting.type === 'expense' ? 'text-red-700' : 'text-emerald-700') // 超支紅，超存綠
                             : 'text-gray-600'
                     }`}>
@@ -731,180 +866,242 @@ const DashboardView = ({ stats, recents, onView, theme, hasTx, accounts, onEdit,
       <div>
          <h3 className="font-bold text-gray-500 text-sm mb-3 px-1 flex justify-between"><span>我的帳戶</span><span onClick={()=>onView('settings')} className={`${theme.accent} cursor-pointer`}>管理</span></h3>
          <div className="grid grid-cols-2 gap-3">{accounts.map(a=>(
              <button key={a.id} onClick={()=>onQuickAdd(a.id)} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-left h-24 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                 <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.08] ${theme.primary}`}></div>
                 <div className="flex gap-2 items-center"><div className="p-1.5 bg-gray-50 rounded-lg text-gray-500"><DynamicIcon iconName={a.icon} className="w-4 h-4"/></div>{a.isPinned && <Pin className={`w-3 h-3 ${theme.accent}`} fill="currentColor"/>}</div>
                 <div>
                   <span className="text-xs text-gray-400 block">{a.name}</span>
                   <span className={`text-lg font-bold ${(stats.balances[a.id]||0) < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                     ${(stats.balances[a.id]||0).toLocaleString()}
                   </span>
                 </div>
              </button>
          ))}</div>
       </div>
 
       {/* 近期動態 */}
       <div>
          <div className="flex justify-between mb-4"><h3 className="font-bold text-gray-500">近期動態</h3>{hasTx && <button onClick={()=>onView('history')} className={`text-xs ${theme.accent} font-bold bg-white px-3 py-1 rounded-full shadow-sm`}>全部 <ChevronRight className="w-3 h-3 inline"/></button>}</div>
          {recents.length===0 ? <EmptyState theme={theme}/> : <div className="space-y-3">{recents.map(t=><TxItem key={t.id} data={t} theme={theme} accs={accounts} onClick={()=>onEdit(t)} onDel={onDel} />)}</div>}
       </div>
     </div>
   );
 };
 
-const GoalsView = ({ goals, accounts, onSave, onDel, onDeposit, onPin, onMove, theme }) => {
+const GoalsView = ({ goals, accounts, onSave, onDel, onDeposit, onWithdraw, onAdjust, onPin, onMove, theme }) => {
   const [isAdd, setIsAdd] = useState(false);
-  const [depGoal, setDepGoal] = useState(null);
+  const [cashflow, setCashflow] = useState(null);
+  const [adjustGoal, setAdjustGoal] = useState(null);
+  const [adjustAmount, setAdjustAmount] = useState('');
   const [editGoal, setEditGoal] = useState(null);
   const [form, setForm] = useState({ name:'', target:'', icon:'target' });
   const [dep, setDep] = useState({ amt:'', acc: accounts[0]?.id });
 
   const openEdit = (g) => { setEditGoal(g); setForm({name:g.name, target:g.targetAmount, icon:g.icon}); setIsAdd(true); };
-  const create = () => { 
-      if(form.name && form.target) { 
-          onSave({id:editGoal?.id, name: form.name, target: form.target, icon: form.icon}); 
-          setIsAdd(false); 
-          setEditGoal(null); 
-          setForm({name:'',target:'',icon:'target'}); 
+  const create = () => {
+      if(form.name && form.target) {
+          onSave({id:editGoal?.id, name: form.name, target: form.target, icon: form.icon});
+          setIsAdd(false);
+          setEditGoal(null);
+          setForm({name:'',target:'',icon:'target'});
       }
   };
-  const deposit = () => { if(dep.amt && dep.acc) { onDeposit(depGoal.id, dep.amt, dep.acc, depGoal.name); setDepGoal(null); setDep({amt:'', acc:accounts[0]?.id}); }};
+  const openCashflow = (goal, mode) => {
+    setCashflow({ goal, mode });
+    setDep({ amt:'', acc: accounts[0]?.id });
+  };
+
+  const submitCashflow = () => {
+    if (!cashflow || !dep.amt || !dep.acc) return;
+    if (cashflow.mode === 'deposit') {
+      onDeposit(cashflow.goal.id, dep.amt, dep.acc, cashflow.goal.name);
+    } else {
+      onWithdraw(cashflow.goal.id, dep.amt, dep.acc, cashflow.goal.name);
+    }
+    setCashflow(null);
+    setDep({ amt:'', acc: accounts[0]?.id });
+  };
+
+  const openAdjust = (goal) => {
+    setAdjustGoal(goal);
+    setAdjustAmount(goal.currentAmount || 0);
+  };
+
+  const submitAdjust = () => {
+    if (!adjustGoal) return;
+    onAdjust(adjustGoal.id, adjustAmount);
+    setAdjustGoal(null);
+    setAdjustAmount('');
+  };
   
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
-                   <button onClick={()=>setDepGoal(g)} className={`w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm ${pct>=100?'border-green-200 text-green-500 bg-green-50':'border-gray-200 text-gray-400 hover:text-gray-600'}`}>{pct>=100?'🎉 達成！':'+ 存入資金'}</button>
+                   <div className="grid grid-cols-3 gap-2">
+                      <button onClick={()=>openCashflow(g,'deposit')} className={`py-3 rounded-xl border-2 border-dashed font-bold text-sm ${pct>=100?'border-green-200 text-green-600 bg-green-50':'border-gray-200 text-gray-500 hover:text-gray-700'}`}>{pct>=100?'🎉 達成！':'+ 存入'}</button>
+                      <button onClick={()=>openCashflow(g,'withdraw')} className="py-3 rounded-xl border font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100">提領</button>
+                      <button onClick={()=>openAdjust(g)} className="py-3 rounded-xl border font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100">修改餘額</button>
+                   </div>
                </div>
            );
         })}</div>
       }
-      {depGoal && (
+      {cashflow && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
               <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
-                  <h3 className="text-lg font-bold text-center text-gray-800">存入：{depGoal.name}</h3>
+                  <h3 className="text-lg font-bold text-center text-gray-800">{cashflow.mode === 'deposit' ? '存入' : '提領'}：{cashflow.goal.name}</h3>
                   <input type="number" autoFocus value={dep.amt} onChange={e=>setDep({...dep,amt:e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-2xl font-bold text-center outline-none" placeholder="0"/>
-                  <div><label className="text-xs font-bold text-gray-400 block mb-2">扣款帳戶</label><select value={dep.acc} onChange={e=>setDep({...dep,acc:e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
-                  <div className="flex gap-3 pt-2"><button onClick={()=>setDepGoal(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">取消</button><button onClick={deposit} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary}`}>確認</button></div>
+                  <div><label className="text-xs font-bold text-gray-400 block mb-2">{cashflow.mode === 'deposit' ? '扣款帳戶' : '入帳帳戶'}</label><select value={dep.acc} onChange={e=>setDep({...dep,acc:e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-sm">{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
+                  <div className="flex gap-3 pt-2"><button onClick={()=>setCashflow(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">取消</button><button onClick={submitCashflow} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary}`}>確認</button></div>
+              </div>
+          </div>
+      )}
+      {adjustGoal && (
+          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
+              <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-3">
+                  <h3 className="text-lg font-bold text-center text-gray-800">修改餘額：{adjustGoal.name}</h3>
+                  <p className="text-xs text-gray-500 text-center">直接覆蓋當前存入金額，適合修正歷史紀錄或同步外部帳本。</p>
+                  <input type="number" autoFocus value={adjustAmount} onChange={e=>setAdjustAmount(e.target.value)} className="w-full border-b-2 border-gray-200 py-2 text-2xl font-bold text-center outline-none" placeholder="0"/>
+                  <div className="flex gap-3 pt-2"><button onClick={()=>setAdjustGoal(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">取消</button><button onClick={submitAdjust} className={`flex-1 py-3 text-white font-bold rounded-xl ${theme.primary}`}>確認</button></div>
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
+  const [excludeMonthly, setExcludeMonthly] = useState(initData?.excludeFromMonthly || false);
 
   // 🔥 計算機邏輯
   const calculateAmount = () => {
     try {
       if (!amt.toString().match(/^[\d.+\-*/\s]+$/)) return;
-      // eslint-disable-next-line no-eval
       const result = Function(`'use strict'; return (${amt})`)();
       setAmt(result);
-    } catch (e) { /* ignore */ }
+    } catch { /* ignore */ }
   };
 
-  useEffect(() => { if(!cat && !initData) setCat(type==='expense'?categories.expense[0]:categories.income[0]); }, [type, initData, categories]);
-  useEffect(()=> { if (!initData) setAccId(defAccId || (accounts[0]?.id || '')); }, [defAccId, accounts, initData]);
-
   const currentCats = type === 'expense' ? categories.expense : categories.income;
+  const resolvedCat = currentCats.includes(cat) ? cat : currentCats[0];
+  const resolvedAccId = accId || defAccId || accounts[0]?.id || '';
+
+  const handleTypeChange = (nextType) => {
+    setType(nextType);
+    if (nextType === 'income') setExcludeMonthly(false);
+    const nextCats = nextType === 'expense' ? categories.expense : categories.income;
+    if (!initData && (!cat || !nextCats.includes(cat))) setCat(nextCats[0]);
+  };
   
   // 🔥 更新：幽默備注邏輯
   const getPlaceholder = () => { 
     if(cat === '我也不知道') return '既然不知道就算了...'; 
     if(cat === '自我提升') return '我真不錯';
     return `例如：${cat}細項`; 
   };
 
   return (
     <div className="p-5 pb-10 animate-fade-in space-y-5">
        <div className="flex items-center gap-2 mb-2 text-xl font-bold text-gray-700">{initData?<Edit3 className="w-5 h-5"/>:<Plus className="w-5 h-5"/>} {initData?'編輯':'新增'}</div>
-       <div className="bg-gray-200 p-1 rounded-2xl flex"><button onClick={()=>setType('expense')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type==='expense'?'bg-white shadow-md':'text-gray-400'}`}>支出</button><button onClick={()=>setType('income')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type==='income'?'bg-white shadow-md':'text-gray-400'}`}>收入</button></div>
+       <div className="bg-gray-200 p-1 rounded-2xl flex"><button onClick={()=>handleTypeChange('expense')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type==='expense'?'bg-white shadow-md':'text-gray-400'}`}>支出</button><button onClick={()=>handleTypeChange('income')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type==='income'?'bg-white shadow-md':'text-gray-400'}`}>收入</button></div>
        
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
-       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"><label className="text-xs font-bold text-gray-400 block mb-2">帳戶</label><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{accounts.map(a=><button key={a.id} onClick={()=>setAccId(a.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap border ${accId===a.id?`border-transparent ${theme.primary} text-white font-bold`:'border-gray-200 text-gray-600 font-medium'}`}><DynamicIcon iconName={a.icon} className="w-3 h-3" fallback={Building2}/> {a.name}</button>)}</div></div>
-       <div><label className="text-xs font-bold text-gray-400 block mb-3">類別</label><div className="grid grid-cols-4 gap-2">{currentCats.map(c=><button key={c} onClick={()=>setCat(c)} className={`py-2 px-1 text-xs font-bold rounded-xl border truncate ${cat===c?`border-transparent ${theme.primary} text-white shadow-md scale-105`:'bg-white text-gray-500'}`}>{c}</button>)}</div></div>
-       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative"><label className="text-xs font-bold text-gray-400 block mb-2">備註</label><input value={desc} onChange={e=>e.target.value.length<=50&&setDesc(e.target.value)} className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 font-bold" placeholder={getPlaceholder()} /><span className="absolute bottom-2 right-4 text-[10px] text-gray-300 font-bold">{desc.length}/50</span></div>
-       <div className="flex gap-4 pt-4"><button onClick={onCancel} className="flex-1 py-4 text-gray-400 font-bold bg-gray-100 rounded-2xl">取消</button><button onClick={()=>amt && onSave({type,amount:amt,description:desc,category:cat,accountId:accId,date:new Date(date)})} disabled={!amt} className={`flex-1 py-4 ${theme.primary} text-white font-bold rounded-2xl shadow-lg disabled:opacity-50`}>確認</button></div>
+       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"><label className="text-xs font-bold text-gray-400 block mb-2">帳戶</label><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">{accounts.map(a=><button key={a.id} onClick={()=>setAccId(a.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap border ${resolvedAccId===a.id?`border-transparent ${theme.primary} text-white font-bold`:'border-gray-200 text-gray-600 font-medium'}`}><DynamicIcon iconName={a.icon} className="w-3 h-3" fallback={Building2}/> {a.name}</button>)}</div></div>
+      <div><label className="text-xs font-bold text-gray-400 block mb-3">類別</label><div className="grid grid-cols-4 gap-2">{currentCats.map(c=><button key={c} onClick={()=>setCat(c)} className={`py-2 px-1 text-xs font-bold rounded-xl border truncate ${resolvedCat===c?`border-transparent ${theme.primary} text-white shadow-md scale-105`:'bg-white text-gray-500'}`}>{c}</button>)}</div></div>
+      {type==='expense' && (
+        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between gap-3">
+          <div>
+            <p className="text-xs font-bold text-gray-500">排除本月消費</p>
+            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">不納入「本月支出」統計與相關平均值，可用於分期、長期費用。</p>
+          </div>
+          <button
+            onClick={()=>setExcludeMonthly(v=>!v)}
+            className={`w-11 h-6 rounded-full p-1 transition-colors ${excludeMonthly ? theme.primary : 'bg-gray-200'}`}
+          >
+            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${excludeMonthly ? 'translate-x-4' : ''}`}></div>
+          </button>
+        </div>
+      )}
+      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative"><label className="text-xs font-bold text-gray-400 block mb-2">備註</label><input value={desc} onChange={e=>e.target.value.length<=50&&setDesc(e.target.value)} className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 font-bold" placeholder={getPlaceholder()} /><span className="absolute bottom-2 right-4 text-[10px] text-gray-300 font-bold">{desc.length}/50</span></div>
+      <div className="flex gap-4 pt-4"><button onClick={onCancel} className="flex-1 py-4 text-gray-400 font-bold bg-gray-100 rounded-2xl">取消</button><button onClick={()=>amt && onSave({type,amount:amt,description:desc,category:resolvedCat,accountId:resolvedAccId,date:new Date(date),excludeFromMonthly:excludeMonthly})} disabled={!amt} className={`flex-1 py-4 ${theme.primary} text-white font-bold rounded-2xl shadow-lg disabled:opacity-50`}>確認</button></div>
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
@@ -1122,48 +1319,48 @@ const SettingsView = ({ theme, name, onSaveName, accounts, onSaveAccount, onDele
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
-           <div><p className="font-bold text-gray-700 text-sm">{data.description}</p><div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5"><span className="bg-gray-50 px-2 py-0.5 rounded font-bold">{data.category}</span><span className="px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1"><DynamicIcon iconName={acc?.icon} className="w-3 h-3"/>{acc?.name}</span></div></div>
+           <div><p className="font-bold text-gray-700 text-sm">{data.description}</p><div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5"><span className="bg-gray-50 px-2 py-0.5 rounded font-bold">{data.category}</span>{data.excludeFromMonthly && <span className="px-1.5 py-0.5 rounded border border-amber-200 text-amber-600 bg-amber-50 font-bold">不計本月</span>}<span className="px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1"><DynamicIcon iconName={acc?.icon} className="w-3 h-3"/>{acc?.name}</span></div></div>
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
 
EOF
)
