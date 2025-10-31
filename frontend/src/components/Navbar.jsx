import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-slate-700">Dashboard</h1>
      <div className="text-slate-600">
        Olá, <span className="font-medium">{user?.name || user?.email || "Utilizador"}</span>
      </div>
    </header>
  );
}
