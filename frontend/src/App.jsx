import { useEffect, useState } from "react";
import { getUsers, makeTransfer, getLedger } from "./api";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState("dashboard"); // 🔹 dashboard | history

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleTransfer = async () => {
    try {
      const idemKey = Date.now().toString(); // unique key
      const result = await makeTransfer(
        Number(from),
        Number(to),
        Number(amount),
        idemKey
      );
      setStatus(
        ` ${result.from_user.name} sent $${(
          result.amount_cents / 100
        ).toFixed(2)} to ${result.to_user.name}`
      );
      getUsers().then(setUsers);
      getLedger().then(setLedger);
      setAmount("");
    } catch (err) {
      setStatus("Error Occured " + err.message);
    }
  };

  const showHistory = () => {
    getLedger().then(setLedger);
    setView("history");
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1> PAY FLOW</h1>
        <nav>
          <button onClick={() => setView("dashboard")}>Dashboard</button>
          <button onClick={() => setView("transfer")}>Transfers</button>
          <button onClick={showHistory}>History</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        {view === "dashboard" && (
          <>
            <header>
              <h1>Dashboard</h1>
              <h2>Welcome back </h2>
            </header>
            <div className="cards">
              {users.map((u) => (
                <div key={u.id} className="card">
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                  <p className="balance">
                    ${(u.balance_cents / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {view === "transfer" && (
          <div className="form-card">
            <h3>Send Money</h3>
            <select onChange={(e) => setFrom(e.target.value)} value={from}>
              <option value="">From</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select onChange={(e) => setTo(e.target.value)} value={to}>
              <option value="">To</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount in cents"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <button onClick={handleTransfer}>Send</button>
            {status && <p className="status">{status}</p>}
          </div>
        )}

        {view === "history" && (
          <div className="form-card">
            <h3>Transaction History</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.from_user_id}</td>
                    <td>{tx.to_user_id}</td>
                    <td>${(tx.amount_cents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
