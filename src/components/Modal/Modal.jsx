import React, { useEffect, useState, useCallback } from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    contract: false,
    price: "",
    scrapStart: "",
    scrapEnd: "",
    scrapDuration: 0,
    structuralEnd: "",
  });

  const [scrapRunning, setScrapRunning] = useState(false);
  const [scrapTime, setScrapTime] = useState(0);
  const [scrapInterval, setScrapInterval] = useState(null);
  const [scrapStopped, setScrapStopped] = useState(false);

  const steps = ["Contrat", "Scrap", "Structural salvage"];

  const updateForm = useCallback((partialData) => {
    setFormData((prev) => ({ ...prev, ...partialData }));
  }, []);

  const handleScrapStop = useCallback(() => {
    clearInterval(scrapInterval);
    setScrapInterval(null);
    setScrapRunning(false);
    setScrapStopped(true);
    updateForm({ scrapDuration: scrapTime });
  }, [scrapInterval, scrapTime, updateForm]);

  useEffect(() => {
    if (step !== 2 && scrapRunning) {
      handleScrapStop();
    }
  }, [step, scrapRunning, handleScrapStop]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleScrapStart = () => {
    if (scrapInterval) return;
    const interval = setInterval(() => {
      setScrapTime((t) => t + 1);
    }, 1000);
    setScrapInterval(interval);
    setScrapRunning(true);
  };

  const handleScrapPause = () => {
    clearInterval(scrapInterval);
    setScrapInterval(null);
    setScrapRunning(false);
  };

  const handleScrapReset = () => {
    clearInterval(scrapInterval);
    setScrapInterval(null);
    setScrapRunning(false);
    setScrapStopped(false);
    setScrapTime(0);
    updateForm({ scrapDuration: 0 });
  };

  const isStartValid =
    formData.scrapStart !== "" && !isNaN(parseFloat(formData.scrapStart));

    const handleSubmit = () => {
      console.log("Formulaire validé avec :", formData); // ✅ log des données
    
      const history = JSON.parse(localStorage.getItem("salvageHistory") || "[]");
      const newEntry = {
        ...formData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("salvageHistory", JSON.stringify([newEntry, ...history]));
      onSubmit?.();
      onClose(); // ✅ ferme le modal
    };
    

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.contract}
                onChange={(e) => updateForm({ contract: e.target.checked })}
              />{" "}
              Contrat activé
            </label>

            {formData.contract && (
              <div style={{ marginTop: "1rem" }}>
                <label>Prix du contrat :</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateForm({ price: e.target.value })}
                  placeholder="Ex: 12000"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="form-group">
            <label>Quantité de filler (début) :</label>
            <input
              type="number"
              value={formData.scrapStart}
              onChange={(e) => updateForm({ scrapStart: e.target.value })}
              placeholder="Ex: 0"
            />

            <div style={{ margin: "1rem 0" }}>
              <strong>⏱ Temps : {formatTime(scrapTime)}</strong>
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn-sc"
                  onClick={handleScrapStart}
                  disabled={!isStartValid || scrapRunning}
                >
                  ▶ Start
                </button>
                <button
                  className="btn-sc"
                  onClick={handleScrapPause}
                  disabled={!isStartValid || !scrapRunning}
                >
                  ⏸ Pause
                </button>
                <button
                  className="btn-sc"
                  onClick={handleScrapStop}
                  disabled={!isStartValid}
                >
                  🛑 Stop
                </button>
                <button
                  className="btn-sc danger"
                  onClick={handleScrapReset}
                  disabled={!isStartValid}
                >
                  🔁 Reset
                </button>
              </div>
            </div>

            <label>Quantité de filler (fin) :</label>
            <input
              type="number"
              value={formData.scrapEnd}
              onChange={(e) => updateForm({ scrapEnd: e.target.value })}
              placeholder="Ex: 10"
              disabled={!scrapStopped}
            />
          </div>
        );

      case 3:
        return (
          <div className="form-group">
            <label>Quantité de filler (après structural salvage) :</label>
            <input
              type="number"
              value={formData.structuralEnd}
              onChange={(e) => updateForm({ structuralEnd: e.target.value })}
              placeholder="Ex: 6.0"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderRecap = () => {
    const recap = [];

    if (step >= 1) {
      recap.push(
        <div className="recap-item" key="contrat">
          <span className="recap-label">Contrat :</span>
          <span className={`recap-value ${formData.contract ? "success" : "error"}`}>
            {formData.contract ? "✅ Oui" : "❌ Non"}
          </span>
        </div>
      );

      if (formData.contract) {
        recap.push(
          <div className="recap-item" key="prix">
            <span className="recap-label">Prix :</span>
            <span className="recap-value">
              {formData.price ? `${formData.price} aUEC` : "-"}
            </span>
          </div>
        );
      }
    }

    if (step >= 2) {
      const start = parseFloat(formData.scrapStart);
      const end = parseFloat(formData.scrapEnd);
      const rmc =
        !isNaN(start) && !isNaN(end)
          ? Math.max(0, end - start).toFixed(1)
          : null;

      recap.push(
        <div className="recap-item" key="rmc">
          <span className="recap-label">RMC récupéré :</span>
          <span className="recap-value">{rmc ? `${rmc} SCU` : "-"}</span>
        </div>
      );

      recap.push(
        <div className="recap-item" key="temps">
          <span className="recap-label">Temps de scrap :</span>
          <span className="recap-value">
            {formData.scrapDuration ? formatTime(formData.scrapDuration) : "-"}
          </span>
        </div>
      );
    }

    if (step >= 3) {
      const scrapEnd = parseFloat(formData.scrapEnd);
      const structuralEnd = parseFloat(formData.structuralEnd);
      const cm =
        !isNaN(scrapEnd) && !isNaN(structuralEnd)
          ? Math.max(0, structuralEnd - scrapEnd).toFixed(1)
          : null;

      recap.push(
        <div className="recap-item" key="cm">
          <span className="recap-label">CM récupéré :</span>
          <span className="recap-value">{cm ? `${cm} SCU` : "-"}</span>
        </div>
      );
    }

    return recap;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content mfd-style">
        <div className="modal-header">
          <h2>Formulaire de salvage</h2>
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="modal-stepper">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`step ${step === index + 1 ? "active" : ""}`}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        <div className="modal-body split">
          <div className="form-section">{renderStep()}</div>
          <div className="recap-section">
            <h3>Récapitulatif</h3>
            {renderRecap()}
          </div>
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn-sc" onClick={() => setStep(step - 1)}>
              ⬅ Précédent
            </button>
          )}
          {step < 3 && (
            <button className="btn-sc" onClick={() => setStep(step + 1)}>
              Suivant ➡
            </button>
          )}
          {step === 3 && (
            <button className="btn-sc danger" onClick={handleSubmit}>
              ✅ Valider
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
