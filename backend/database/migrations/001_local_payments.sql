CREATE TABLE checkouts (
  id VARCHAR(36) NOT NULL,
  merchant_id VARCHAR(36) NOT NULL,
  external_reference VARCHAR(100) NOT NULL,
  method ENUM('PIX', 'CARD') NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(12, 2) NOT NULL,
  fee_percent DECIMAL(7, 4) NULL,
  installments INT NULL,
  qr_code_base64 LONGTEXT NULL,
  emv TEXT NULL,
  metadata JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_checkouts_external_reference (external_reference),
  KEY idx_checkouts_merchant_created (merchant_id, created_at),
  KEY idx_checkouts_merchant_status (merchant_id, status)
);

CREATE TABLE withdrawals (
  id VARCHAR(36) NOT NULL,
  merchant_id VARCHAR(36) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(12, 2) NOT NULL,
  destination_type VARCHAR(16) NOT NULL,
  destination_data JSON NOT NULL,
  metadata JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_withdrawals_merchant_created (merchant_id, created_at)
);
