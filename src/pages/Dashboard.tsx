import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Transaction{
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: string;
}

export default function Dashboard(){
    const[transactions, setTransactions] = useState<Transaction[]>([]);
    const[description, setDescription] = useState("");
    const[amount, setAmount] = useState("");
    const[category, setCategory] = useState("");
    const[type, setType] = useState("Expense");
    const[selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const[selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const navigate = useNavigate();

    useEffect(() =>{
        loadTransactions();
    }, []);
     
    const  loadTransactions = async () => {
        try{
            const response = await api.get("/transaction");
            setTransactions(response.data);
        } catch(err){
            navigate("/");
        }
    };

    const handleAdd = async () => {
        try{
            await api.post("/transaction", {
                description,
                amount: parseFloat(amount),
                category,
                type,
            });
            setDescription("");
            setAmount("");
            setCategory("");
            setType("Expense");
            loadTransactions();
        }catch(err){
            alert("Erro ao adicionar transação!");
        }
    };
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/transaction/${id}`);
            loadTransactions();
        }catch (err) {
            alert("Erro ao apagar transação!");
        }
            
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/")
    };
        
    const filteredTransactions = transactions.filter((t) =>{
         const date = new Date(t.date);
        return date.getMonth() + 1 === selectedMonth &&
               date.getFullYear() === selectedYear;
    });

    const totalIncome = filteredTransactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = totalIncome - totalExpense; 

    return(
         <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-600">FinTrack</h1>
                <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex gap-4 items-center">
            <h2 className="font-bold text-gray-700">Filtrar por:</h2>
            <select
                value={selectedMonth}
                 onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border p-2 rounded"
                >
                <option value={1}>Janeiro</option>
                <option value={2}>Fevereiro</option>
                <option value={3}>Março</option>
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
                <option value={7}>Julho</option>
                <option value={8}>Agosto</option>
                <option value={9}>Setembro</option>
                <option value={10}>Outubro</option>
                <option value={11}>Novembro</option>
                <option value={12}>Dezembro</option>
                </select>
                <select
                     value={selectedYear}
                     onChange={(e) =>setSelectedYear(Number(e.target.value))}
                     className="border p-2 rounded"
                     >
                        <option value={2026}>2026</option>
                        <option value={2027}>2027</option>
                        <option value={2028}>2028</option>
                        <option value={2029}>2029</option>
                     </select>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500 text-sm">Total Receitas</p>
                <p className="text-green-500 text-2xl font-bold">+€{totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500 text-sm">Total Despesas</p>
                <p className="text-red-500 text-2xl font-bold">-€{totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500 text-sm">Saldo</p>
                <p className={balance >= 0 ? "text-green-500 text-2xl font-bold" :"text-red-500 text-2xl font-bold"}>
                     €{balance.toFixed(2)}
                </p>
            </div>

        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
         <h2 className="text-xl font-bold mb-4">Nova Transação</h2>
         <div className="grid grid-cols-2 gap-4">
         <input
         type="text"
         placeholder="Descrição"
         value={description}
         onChange={(e) => setDescription(e.target.value)}
         className="border p-2 rounded"
         />
         <input
         type="number"
         placeholder="Valor"
         value={amount}
         onChange={(e) => setAmount(e.target.value)}
         className="border p-2 rounded"
         />
          <input
            type="text"
            placeholder="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          />
         <select
         value={type}
         onChange={(e) => setType(e.target.value)}
         className="border p-2 rounded"
         >
            <option value="Expense">Despesa</option>
            <option value="Income">Receita</option>
         </select>
        </div>
        <button
        onClick={handleAdd}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
            Adicionar
        </button>
    </div>
  
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Transações</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação encontrada.</p>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center border-b py-3"
            >
              <div>
                <p className="font-bold">{t.description}</p>
                <p className="text-sm text-gray-500">{t.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className={t.type === "Income" ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                  {t.type === "Income" ? "+" : "-"}€{t.amount}
                </p>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Apagar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}