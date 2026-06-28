import {
    PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, Tooltip
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: string;
    isFixed: boolean;
}

interface ChartsProps {
    transactions: Transaction[];
}

export default function Charts({ transactions }: ChartsProps) {
    const expensesByCategory = transactions
        .filter((t) => t.type === "Expense")
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
    }));

    const totalIncome = transactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const barData = [
        { name: "Receitas", value: parseFloat(totalIncome.toFixed(2)), fill: "#22c55e" },
        { name: "Despesas", value: parseFloat(totalExpense.toFixed(2)), fill: "#ef4444" },
        { name: "Saldo", value: parseFloat((totalIncome - totalExpense).toFixed(2)), fill: "#3b82f6" }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Despesas por Categoria</h2>
                {pieData.length === 0 ? (
                    <p className="text-gray-500">Sem despesas este mês.</p>
                ) : (
                    <PieChart width={400} height={250}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: €${value}`}
                        >
                            {pieData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Balanço do Mês</h2>
                <BarChart width={400} height={250} data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                        {barData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </div>
        </div>
    );
}