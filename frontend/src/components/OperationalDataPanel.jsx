import React from 'react';

function OperationalDataPanel({ operationalData }) {
  if (!operationalData) {
    return (
      <div className="operational-card">
        <h3>Operational Data</h3>
        <p>No operational data available.</p>
      </div>
    );
  }

  // Helper to safely format boolean
  const formatBool = (val) => (val ? 'Yes' : 'No');

  return (
    <div className="operational-card">
      <h3>Operational Data {operationalData.isSynthetic && <span className="synthetic-badge">(Synthetic/Demo)</span>}</h3>
      <div className="operational-content">
        <p><strong>Category:</strong> {operationalData.category || 'N/A'}</p>
        <p><strong>Region:</strong> {operationalData.region || 'N/A'}</p>
        <p><strong>Inventory Units:</strong> {operationalData.inventoryUnits != null ? operationalData.inventoryUnits : 'N/A'}</p>
        <p><strong>Reorder Point:</strong> {operationalData.reorderPointUnits != null ? operationalData.reorderPointUnits : 'N/A'}</p>
        <p><strong>Supplier Lead Time:</strong> {operationalData.supplierLeadTimeDays != null ? `${operationalData.supplierLeadTimeDays} days` : 'N/A'}</p>
        <p><strong>Expiry Days Remaining:</strong> {operationalData.expiryDaysRemaining != null ? operationalData.expiryDaysRemaining : 'N/A'}</p>
        <p><strong>Patient Impact Score:</strong> {operationalData.patientImpactScore != null ? operationalData.patientImpactScore : 'N/A'}</p>
        <p><strong>Substitute Available:</strong> {operationalData.substituteAvailable != null ? formatBool(operationalData.substituteAvailable) : 'N/A'}</p>
        <p><strong>Unit Price (INR):</strong> {operationalData.unitPriceInr != null ? `₹${operationalData.unitPriceInr.toFixed(2)}` : 'N/A'}</p>
        <p><strong>Promotion Active:</strong> {operationalData.promotionActive != null ? formatBool(operationalData.promotionActive) : 'N/A'}</p>
      </div>
      {operationalData.disclaimer && (
        <div className="disclaimer-banner">
          <strong>Disclaimer:</strong> {operationalData.disclaimer}
        </div>
      )}
    </div>
  );
}

export default OperationalDataPanel;
