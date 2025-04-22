import React, { useState } from "react";
import Modal from "../components/Modal/Modal";
import SalvageHistory from "../components/SalvageHistory/SalvageHistory";

const SalvagePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false); // ⚡ nouvel état

  const forceRefresh = () => {
    setRefresh((r) => !r); // ⚡ toggle => déclenche le useEffect
  };

  return (
    <>
      <SalvageHistory onOpenModal={() => setModalOpen(true)} refreshTrigger={refresh} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={forceRefresh} />
    </>
  );
};

export default SalvagePage;
