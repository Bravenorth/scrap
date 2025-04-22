// src/features/salvage/components/SalvageHistory.jsx
import React, { useEffect, useState } from "react";
import "./SalvageHistory.css";

const SalvageHistory = ({ onOpenModal, refreshTrigger }) => {
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem("salvageHistory") || "[]");
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDelete = (indexToRemove) => {
    if (!window.confirm("Supprimer cette entrée ?")) return;
    const newHistory = history.filter((_, i) => i !== indexToRemove);
    setHistory(newHistory);
    localStorage.setItem("salvageHistory", JSON.stringify(newHistory));
  };

  return (
    <div className="history-wrapper mfd-style">
      <div className="history-header">
        <h2>Journal de salvage</h2>
        <button className="btn-sc" onClick={onOpenModal}>
          ➕ Ajouter une entrée
        </button>
      </div>
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vaisseau</th>
            <th>Contrat</th>
            <th>Prix</th>
            <th>RMC</th>
            <th>CM</th>
            <th>Durée</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", opacity: 0.6 }}>
                Aucun enregistrement.
              </td>
            </tr>
          ) : (
            history.map((e, i) => {
              const s = parseFloat(e.scrapStart);
              const se = parseFloat(e.scrapEnd);
              const st = parseFloat(e.structuralEnd);

              // Calcul RMC seulement si scrapStart rempli
              const rmc =
                e.scrapStart.trim() !== "" &&
                !isNaN(s) &&
                !isNaN(se)
                  ? Math.max(0, se - s).toFixed(1)
                  : "-";

              // Si on a scrapStart, CM = structuralEnd - scrapEnd ; sinon structuralEnd est CM direct
              const cm =
                e.scrapStart.trim() !== "" &&
                !isNaN(se) &&
                !isNaN(st)
                  ? Math.max(0, st - se).toFixed(1)
                  : e.scrapStart.trim() === "" && !isNaN(st)
                  ? st.toFixed(1)
                  : "-";

              const date = new Date(e.timestamp).toLocaleString("fr-FR");

              return (
                <tr key={i}>
                  <td>{date}</td>
                  <td>{e.shipName || "-"}</td>
                  <td>{e.contract ? "✅" : "❌"}</td>
                  <td>{e.price ? `${e.price} aUEC` : "-"}</td>
                  <td>{rmc !== "-" ? `${rmc} SCU` : "-"}</td>
                  <td>{cm !== "-" ? `${cm} SCU` : "-"}</td>
                  <td>
                    {e.scrapDuration
                      ? formatTime(e.scrapDuration)
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="btn-sc danger"
                      onClick={() => handleDelete(i)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalvageHistory;
