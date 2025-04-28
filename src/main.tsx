import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Transactions from "./pages/Transactions";

createRoot(document.getElementById("root")!).render(<App />);
