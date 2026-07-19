import{Navigate,Route,Routes}from'react-router-dom';import{Toaster}from'sonner';import{useAuth}from'./contexts/AuthContext';import{Loading}from'./components/ui';import{AppLayout}from'./layouts/AppLayout';import{Login}from'./pages/Login';import{Dashboard}from'./pages/Dashboard';import{Transactions}from'./pages/Transactions';import{CashRegister}from'./pages/CashRegister';import{Agenda}from'./pages/SingleAgenda';import{PublicBooking}from'./pages/PublicBookingModern';import{ManageBooking}from'./pages/ManageBooking';import{Customers}from'./pages/Customers';import{Reports}from'./pages/Reports';import{Settings}from'./pages/Settings';import{Services}from'./pages/Services';import{AccessDenied,CompleteProfile}from'./pages/CompleteProfile';
function Protected(){const{session,profile,loading}=useAuth();if(loading)return <Loading label="Verificando sessão..."/>;if(!session)return <Navigate to="/login" replace/>;if(!profile||!profile.active)return <AccessDenied/>;if(!profile.phone)return <CompleteProfile/>;return <AppLayout/>}export default function App(){return <><Routes><Route path="/login" element={<Login/>}/><Route path="/agendar" element={<PublicBooking/>}/><Route path="/agendamento/:token" element={<ManageBooking/>}/><Route element={<Protected/>}><Route index element={<Dashboard/>}/><Route path="agenda" element={<Agenda/>}/><Route path="procedimentos" element={<Services/>}/><Route path="receitas" element={<Transactions type="income"/>}/><Route path="despesas" element={<Transactions type="expense"/>}/><Route path="caixa" element={<CashRegister/>}/><Route path="clientes" element={<Customers/>}/><Route path="relatorios" element={<Reports/>}/><Route path="configuracoes" element={<Settings/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes><Toaster richColors position="top-right"/></>}











