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
  }, [refreshTrigger]); // 🔁 se déclenche à chaque changement

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDelete = (indexToRemove) => {
    const confirmed = window.confirm("Supprimer cette entrée ?");
    if (!confirmed) return;

    const newHistory = history.filter((_, index) => index !== indexToRemove);
    setHistory(newHistory);
    localStorage.setItem("salvageHistory", JSON.stringify(newHistory));
  };

  return (
    <div className="history-wrapper mfd-style">
      <div className="history-header">
        <h2>Journal de salvage</h2>
        <button className="btn-sc" onClick={onOpenModal}>➕ Ajouter une entrée</button>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
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
              <td colSpan="7" style={{ textAlign: "center", opacity: 0.6 }}>
                Aucun enregistrement pour l’instant.
              </td>
            </tr>
          ) : (
            history.map((entry, i) => {
              const scrapStart = parseFloat(entry.scrapStart);
              const scrapEnd = parseFloat(entry.scrapEnd);
              const structuralEnd = parseFloat(entry.structuralEnd);

              const rmc = !isNaN(scrapStart) && !isNaN(scrapEnd)
                ? Math.max(0, scrapEnd - scrapStart).toFixed(1)
                : "-";

              const cm = !isNaN(scrapEnd) && !isNaN(structuralEnd)
                ? Math.max(0, structuralEnd - scrapEnd).toFixed(1)
                : "-";

              const date = new Date(entry.timestamp).toLocaleString("fr-FR");

              return (
                <tr key={i}>
                  <td>{date}</td>
                  <td>{entry.contract ? "✅" : "❌"}</td>
                  <td>{entry.price ? `${entry.price} aUEC` : "-"}</td>
                  <td>{rmc} SCU</td>
                  <td>{cm} SCU</td>
                  <td>{entry.scrapDuration ? formatTime(entry.scrapDuration) : "-"}</td>
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
