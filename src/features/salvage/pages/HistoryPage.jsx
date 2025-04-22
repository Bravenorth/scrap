// src/features/salvage/pages/HistoryPage.jsx
import React, { useState } from "react";
// ← ici on monte d’un dossier, puis on entre dans components
import Modal from "../components/Modal";
import SalvageHistory from "../components/SalvageHistory";

const HistoryPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(false);

  const handleEntryAdded = () => setRefreshKey((r) => !r);

  return (
    <>
      <SalvageHistory
        onOpenModal={() => setModalOpen(true)}
        refreshTrigger={refreshKey}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEntryAdded}
      />
    </>
  );
};

export default HistoryPage;
