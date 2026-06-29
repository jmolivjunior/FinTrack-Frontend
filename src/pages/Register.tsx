import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await api.post("/auth/register", {
                name,
                email,
                passwordHash: password
            });
            alert("Conta criada com sucesso! ✅");
            navigate("/")
        } catch (err) {
            setError("Erro ao criar conta. Email já existe!");
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
                    FinTrack
                </h1>
                <h2 className="text-lg font-bold text-center mb-6 text-gray-700">
                    Criar Conta
                </h2>
                <input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    onClick={handleRegister}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4"
                >
                    Criar Conta
                </button>
                <p className="text-center text-gray-500">
                    Já tens conta?{" "}
                    <span
                        onClick={() => navigate("/")}
                        className="text-blue-600 cursor-pointer hover:underline"
                    >
                        Fazer Login
                    </span>
                </p>
            </div>
        </div>
    );
}