import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function Drivers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users", { params: { role: "driver" } }).then((r) => setUsers(r.data.users));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="kicker">People</div>
          <h1>Drivers</h1>
        </div>
      </div>
      <div className="panel">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Licence</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>{u.licenceNumber || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
