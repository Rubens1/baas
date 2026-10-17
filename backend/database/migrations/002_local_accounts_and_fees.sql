CREATE TABLE merchants (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  document VARCHAR(20) NOT NULL,
  type ENUM('PF', 'PJ') NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  password_salt VARCHAR(64) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_merchants_email (email),
  UNIQUE KEY uq_merchants_document (document)
);

CREATE TABLE auth_sessions (
  id VARCHAR(36) NOT NULL,
  merchant_id VARCHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_auth_sessions_token_hash (token_hash),
  KEY idx_auth_sessions_merchant (merchant_id),
  CONSTRAINT fk_auth_sessions_merchant
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

CREATE TABLE fees (
  id VARCHAR(36) NOT NULL,
  method ENUM('PIX', 'CARD') NOT NULL,
  brand VARCHAR(32) NOT NULL DEFAULT 'ALL',
  installments INT NOT NULL DEFAULT 1,
  fee_percent DECIMAL(7, 4) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fees_method_brand_installments (method, brand, installments)
);

ALTER TABLE wallets
  ADD CONSTRAINT fk_wallets_merchant
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

ALTER TABLE checkouts
  ADD CONSTRAINT fk_checkouts_merchant
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

ALTER TABLE withdrawals
  ADD CONSTRAINT fk_withdrawals_merchant
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

INSERT INTO fees (id, method, brand, installments, fee_percent) VALUES
  (UUID(), 'PIX', 'ALL', 1, 0),
  (UUID(), 'CARD', 'ALL', 1, 0),
  (UUID(), 'CARD', 'ALL', 2, 0),
  (UUID(), 'CARD', 'ALL', 3, 0),
  (UUID(), 'CARD', 'ALL', 4, 0),
  (UUID(), 'CARD', 'ALL', 5, 0),
  (UUID(), 'CARD', 'ALL', 6, 0),
  (UUID(), 'CARD', 'ALL', 7, 0),
  (UUID(), 'CARD', 'ALL', 8, 0),
  (UUID(), 'CARD', 'ALL', 9, 0),
  (UUID(), 'CARD', 'ALL', 10, 0),
  (UUID(), 'CARD', 'ALL', 11, 0),
  (UUID(), 'CARD', 'ALL', 12, 0);
