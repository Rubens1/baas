CREATE TABLE wallets (
  id VARCHAR(36) NOT NULL,
  merchant_id VARCHAR(36) NOT NULL,
  balance_available DECIMAL(12, 2) NOT NULL DEFAULT 0,
  balance_blocked DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_wallets_merchant_id (merchant_id)
);

CREATE TABLE transactions (
  id VARCHAR(36) NOT NULL,
  wallet_id VARCHAR(36) NOT NULL,
  type ENUM('PIX_IN', 'CARD_IN', 'WITHDRAWAL', 'FEE') NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(12, 2) NOT NULL,
  fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  external_reference VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_external_reference (external_reference),
  KEY idx_transactions_wallet_created (wallet_id, created_at),
  CONSTRAINT fk_transactions_wallet
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE RESTRICT
);
