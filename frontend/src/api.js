const API_URL = "http://127.0.0.1:8000";

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function makeTransfer(fromUserId, toUserId, amountCents, idemKey) {
  const res = await fetch(`${API_URL}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount_cents: amountCents,
      idem_key: idemKey,
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

// 🔹 NEW
export async function getLedger() {
  const res = await fetch(`${API_URL}/ledger`);
  return res.json();
}
