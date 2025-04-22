// src/features/salvage/components/Modal.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useScrapTimer } from "../hooks/useScrapTimer";
import "./Modal.css";

const initialFormData = {
  shipName: "",
  contract: false,
  price: "",
  scrapStart: "",
  scrapEnd: "",
  scrapDuration: 0,
  structuralEnd: "",
};

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const {
    time: scrapTime,
    running: scrapRunning,
    stopped: scrapStopped,
    start,
    pause,
    stop,
    reset: resetTimer,
  } = useScrapTimer();

  const updateForm = useCallback((partial) => {
    setFormData((f) => ({ ...f, ...partial }));
  }, []);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData(initialFormData);
      resetTimer();
    }
  }, [isOpen, resetTimer]);

  // Auto‑stop timer when leaving step 2
  useEffect(() => {
    if (step !== 2 && scrapRunning) {
      stop();
      updateForm({ scrapDuration: scrapTime });
    }
  }, [step, scrapRunning, scrapTime, stop, updateForm]);

  // Validity checks
  const hasShipName = formData.shipName.trim() !== "";
  const scrapStartVal = parseFloat(formData.scrapStart);
  const isStartValid =
    formData.scrapStart !== "" && !isNaN(scrapStartVal);
  const skippedScrap = formData.scrapStart.trim() === "";

  // Memoized formatTime
  const formatTime = useCallback((sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  // Calculated values for recap & display
  const rmc = useMemo(() => {
    if (!skippedScrap) {
      const se = parseFloat(formData.scrapEnd);
      return !isNaN(scrapStartVal) && !isNaN(se)
        ? (se - scrapStartVal).toFixed(1)
        : null;
    }
    return null;
  }, [scrapStartVal, formData.scrapEnd, skippedScrap]);

  const cm = useMemo(() => {
    const st = parseFloat(formData.structuralEnd);
    if (skippedScrap) {
      return !isNaN(st) ? st.toFixed(1) : null;
    }
    if (!isNaN(scrapStartVal) && !isNaN(st)) {
      return (st - parseFloat(formData.scrapEnd)).toFixed(1);
    }
    return null;
  }, [scrapStartVal, formData.scrapEnd, formData.structuralEnd, skippedScrap]);

  // Submit handler
  const handleSubmit = () => {
    const history =
      JSON.parse(localStorage.getItem("salvageHistory") || "[]");
    const newEntry = {
      ...formData,
      scrapDuration: scrapTime,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(
      "salvageHistory",
      JSON.stringify([newEntry, ...history])
    );
    onSubmit?.();
    onClose();
  };

  // Step definitions
  const steps = useMemo(
    () => [
      {
        label: "Contrat",
        content: (
          <>
            <div className="form-group">
              <label>Nom du vaisseau (obligatoire) :</label>
              <input
                type="text"
                value={formData.shipName}
                onChange={(e) =>
                  updateForm({ shipName: e.target.value })
                }
                placeholder="Ex : Polaris"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.contract}
                  onChange={(e) =>
                    updateForm({ contract: e.target.checked })
                  }
                />{" "}
                Contrat activé
              </label>
              {formData.contract && (
                <div style={{ marginTop: "1rem" }}>
                  <label>Prix du contrat :</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      updateForm({ price: e.target.value })
                    }
                    placeholder="Ex : 12000"
                  />
                </div>
              )}
            </div>
          </>
        ),
        canNext: hasShipName,
      },
      {
        label: "Scrap",
        content: (
          <>
            <div className="form-group">
              <label>Quantité de filler (début) :</label>
              <input
                type="number"
                value={formData.scrapStart}
                onChange={(e) =>
                  updateForm({ scrapStart: e.target.value })
                }
                placeholder="Ex : 0"
              />
            </div>
            <div className="form-group">
              <strong>⏱ Temps : {formatTime(scrapTime)}</strong>
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <button
                  className="btn-sc"
                  onClick={start}
                  disabled={!isStartValid || scrapRunning}
                >
                  ▶ Start
                </button>
                <button
                  className="btn-sc"
                  onClick={pause}
                  disabled={!isStartValid || !scrapRunning}
                >
                  ⏸ Pause
                </button>
                <button
                  className="btn-sc"
                  onClick={() => {
                    stop();
                    updateForm({ scrapDuration: scrapTime });
                  }}
                  disabled={!isStartValid}
                >
                  🛑 Stop
                </button>
                <button
                  className="btn-sc danger"
                  onClick={() => {
                    resetTimer();
                    updateForm({ scrapDuration: 0 });
                  }}
                  disabled={!isStartValid}
                >
                  🔁 Reset
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Quantité de filler (fin) :</label>
              <input
                type="number"
                value={formData.scrapEnd}
                onChange={(e) =>
                  updateForm({ scrapEnd: e.target.value })
                }
                placeholder="Ex : 10"
                disabled={!scrapStopped}
              />
            </div>
          </>
        ),
        canNext: true,
      },
      {
        label: "Structural salvage",
        content: (
          <div className="form-group">
            <label>
              {skippedScrap
                ? "Quantité de CM récupéré (direct) :"
                : "Quantité de filler (post-struct) :"}
            </label>
            <input
              type="number"
              value={formData.structuralEnd}
              onChange={(e) =>
                updateForm({ structuralEnd: e.target.value })
              }
              placeholder={skippedScrap ? "Ex : 4.2" : "Ex : 6.0"}
            />
          </div>
        ),
        canNext: true,
      },
    ],
    [
      formData,
      scrapTime,
      scrapRunning,
      scrapStopped,
      hasShipName,
      isStartValid,
      skippedScrap,
      start,
      pause,
      stop,
      resetTimer,
      updateForm,
      formatTime,
    ]
  );

  // Recap items
  const recapItems = useMemo(() => {
    const recaps = [
      { label: "Vaisseau :", value: formData.shipName || "-" },
      {
        label: "Contrat :",
        value: formData.contract ? "✅ Oui" : "❌ Non",
        status: formData.contract ? "success" : "error",
      },
    ];
    if (formData.contract) {
      recaps.push({
        label: "Prix :",
        value: formData.price ? `${formData.price} aUEC` : "-",
      });
    }
    if (!skippedScrap) {
      recaps.push(
        { label: "RMC récupéré :", value: rmc ? `${rmc} SCU` : "-" },
        { label: "Temps :", value: formData.scrapDuration ? formatTime(formData.scrapDuration) : "-" }
      );
    }
    recaps.push({
      label: skippedScrap ? "CM récupéré :" : "Filler post-struct :",
      value: cm ? `${cm} SCU` : "-",
    });
    return recaps;
  }, [formData, skippedScrap, rmc, cm, formatTime]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content mfd-style">
        <div className="modal-header">
          <h2>Formulaire de salvage</h2>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>

        <div className="modal-stepper">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`step ${step === i + 1 ? "active" : ""}`}
            >
              {i + 1}. {s.label}
            </div>
          ))}
        </div>

        <div className="modal-body split">
          <div className="form-section">{steps[step - 1].content}</div>
          <div className="recap-section">
            <h3>Récapitulatif</h3>
            {recapItems.map((item, i) => (
              <div className="recap-item" key={i}>
                <span className="recap-label">{item.label}</span>
                <span className={`recap-value ${item.status || ""}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn-sc" onClick={() => setStep((s) => s - 1)}>
              ⬅ Précédent
            </button>
          )}
          {step < steps.length && (
            <button
              className="btn-sc"
              onClick={() => setStep((s) => s + 1)}
              disabled={!steps[step - 1].canNext}
            >
              {step === 1 ? "Étape suivante ➡" : "Suivant ➡"}
            </button>
          )}
          {step === steps.length && (
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
