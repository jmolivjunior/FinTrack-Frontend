import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Charts from "../components/Charts";
import { jwtDecode } from "jwt-decode"

interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: string;
    isFixed: boolean;
}

interface Budget {
    id: number;
    category: string;
    limit: number;
    month: number;
    year: number;
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("Expense");
    const [isFixed, setIsFixed] = useState(false);
    const [installments, setInstallments] = useState(1);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetCategory, setBudgetCategory] = useState("");
    const [budgetLimit, setBudgetLimit] = useState("");
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [darkMode, setDarkMode] = useState(false)
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = token ? jwtDecode<{ "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string }>(token) : null;

    useEffect(() => {
        loadTransactions();
        loadBudgets();
    }, []);

    const loadTransactions = async () => {
        try {
            const response = await api.get("/transaction");
            setTransactions(response.data);
        } catch (err) {
            navigate("/");
        }
    };

    const loadBudgets = async () => {
        try {
            const response = await api.get("/budget");
            setBudgets(response.data);
        } catch (err) {
            console.log("Erro ao carregar orçamentos")
        }
    };

    const handleAddBudget = async () => {
        try {
            await api.post("/budget", {
                category: budgetCategory,
                limit: parseFloat(budgetLimit),
                month: selectedMonth,
                year: selectedYear,
            });
            setBudgetCategory("");
            setBudgetLimit("");
            setShowBudgetForm(false);
            loadBudgets();
        } catch (err) {
            alert("Erro ao adicionar orçamento!");
        }
    };

    const handleDeleteBudget = async (id: number) => {
        try {
            await api.delete(`/budget/${id}`);
            loadBudgets();
        } catch (err) {
            alert("Erro ao apagar orçamento!");
        }
    };

    const handleAdd = async () => {
        try {
            await api.post("/transaction", {
                description,
                amount: parseFloat(amount),
                category,
                type,
                isFixed,
                installments
            });
            setDescription("");
            setAmount("");
            setCategory("");
            setType("Expense");
            loadTransactions();
            setIsFixed(false);
            setInstallments(1);
            alert("Transação adicionada com sucesso! ✅");
        } catch (err) {
            alert("Erro ao adicionar transação!");
        }
    };
    const handleDelete = async (id: number) => {
        const confirm = window.confirm("Tens a certeza que queres apagar esta transação?");
        if (!confirm) return;
        try {
            await api.delete(`/transaction/${id}`);
            loadTransactions();
        } catch (err) {
            alert("Erro ao apagar Transação")
        }

    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/")
    };

    const filteredTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        const sameMonth = date.getMonth() + 1 === selectedMonth &&
            date.getFullYear() === selectedYear;
        return sameMonth || t.isFixed;
    });

    const totalIncome = filteredTransactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className={`min-h-screen p-8 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600">FinTrack</h1>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                        Olá, {user?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]}! 👋
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        {darkMode ? "☀️ Claro" : "🌙 Escuro"}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className={`p-4 rounded-lg shadow-md mb-8 flex gap-4 items-center ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}>
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
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="border p-2 rounded"
                >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                    <option value={2029}>2029</option>
                </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className={`p-6 rounded-lg shadow-md text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <p className="text-gray-500 text-sm">Total Receitas</p>
                    <p className="text-green-500 text-2xl font-bold">+€{totalIncome.toFixed(2)}</p>
                </div>
                <div className={`p-6 rounded-lg shadow-md text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <p className="text-gray-500 text-sm">Total Despesas</p>
                    <p className="text-red-500 text-2xl font-bold">-€{totalExpense.toFixed(2)}</p>
                </div>
                <div className={`p-6 rounded-lg shadow-md text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <p className="text-gray-500 text-sm">Saldo</p>
                    <p className={balance >= 0 ? "text-green-500 text-2xl font-bold" : "text-red-500 text-2xl font-bold"}>
                        €{balance.toFixed(2)}
                    </p>
                </div>

            </div>
            <Charts transactions={filteredTransactions} />
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Orçamentos</h2>
                    <button
                        onClick={() => setShowBudgetForm(!showBudgetForm)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        {showBudgetForm ? "Cancelar" : "+ Novo Orçamento"}
                    </button>
                </div>

                {showBudgetForm && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Categoria (ex: Food)"
                            value={budgetCategory}
                            onChange={(e) => setBudgetCategory(e.target.value)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Limite (€)"
                            value={budgetLimit}
                            onChange={(e) => setBudgetLimit(e.target.value)}
                            className="border p-2 rounded"
                        />
                        <button
                            onClick={handleAddBudget}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Guardar Orçamento
                        </button>
                    </div>
                )}

                {budgets.filter((b) => b.month === selectedMonth && b.year === selectedYear).map((b) => {
                    const spent = filteredTransactions
                        .filter((t) => t.category === b.category && t.type === "Expense")
                        .reduce((sum, t) => sum + t.amount, 0);
                    const percentage = Math.min((spent / b.limit) * 100, 100);
                    const isOver = spent > b.limit;
                    return (
                        <div key={b.id} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold">{b.category}</span>
                                <div className="flex items-center gap-2">
                                    <span className={isOver ? "text-red-500 font-bold" : "text-gray-600"}>
                                        €{spent.toFixed(2)} / €{b.limit.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteBudget(b.id)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full ${isOver ? "bg-red-500" : "bg-green-500"}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            {isOver && (
                                <p className="text-red-500 text-sm mt-1">
                                    ⚠️ Ultrapassaste o orçamento em €{(spent - b.limit).toFixed(2)}!
                                </p>
                            )}
                        </div>
                    );
                })}

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
                <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-4 mt-4">
                        <label className="text-gray-700 font-bold">Parcelas</label>
                        <input
                            type="number"
                            min={1}
                            max={48}
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                            className="border p-2 rounded w-20"
                        />
                        <span className="text-gray-500 text-sm">
                            {installments > 1 ? `${installments}x de €${amount ? (parseFloat(amount) / installments).toFixed(2) : "0.00"}` : "Pagamento único"}
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        id="isFixed"
                        checked={isFixed}
                        onChange={(e) => setIsFixed(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="isFixed" className="text-gray-700">
                        Despesa Fixa Mensal
                    </label>
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
                {filteredTransactions.length === 0 ? (
                    <p className="text-gray-500">Nenhuma transação encontrada.</p>
                ) : (
                    filteredTransactions.map((t) => (
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