DROP TABLE IF EXISTS main.article_has_reception;
DROP TABLE IF EXISTS main.report_has_receptions;
DROP TABLE IF EXISTS main.report_has_articles;
DROP TABLE IF EXISTS main.receipts;
DROP TABLE IF EXISTS main.shipments;
DROP TABLE IF EXISTS main.reports;
DROP TABLE IF EXISTS main.articles;
DROP TABLE IF EXISTS main.unit_measurements;

CREATE TABLE main.article_has_reception
(
    article_id      BIGINT                   NOT NULL,
    raw_material_id BIGINT                   NOT NULL,
    amount        DECIMAL(10, 2) DEFAULT 0 NOT NULL,

    PRIMARY KEY (article_id, raw_material_id)
);

CREATE TABLE main.unit_measurements
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name       VARCHAR(32)          NOT NULL UNIQUE,
    is_integer BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE main.articles
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    category                VARCHAR(12)              NOT NULL,
    name                    VARCHAR(64)              NOT NULL UNIQUE,
    code                    VARCHAR(64) UNIQUE,
    in_stock_amount         DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    in_stock_warning_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    unit_measure_id         BIGINT         DEFAULT NULL,
    tags                    VARCHAR(255),

    CHECK (category IN ('COMMERCIAL', 'PRODUCT', 'RAW_MATERIAL')),
    FOREIGN KEY (unit_measure_id) REFERENCES unit_measurements (id) ON DELETE SET DEFAULT
);

CREATE TABLE main.reports
(
    id               INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    type             VARCHAR(7) NOT NULL,
    code             VARCHAR(128) UNIQUE,
    date             DATETIME,
    location_of_publish VARCHAR(128),
    signed_by_name   VARCHAR(128),

    CHECK (type IN ('RECEIPT', 'SHIPMENT'))
);

CREATE TABLE main.receipts
(
    report_id              BIGINT                NOT NULL,
    supplier_company_name  VARCHAR(128),
    supplier_report_code   VARCHAR(128),

    PRIMARY KEY (report_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
);

CREATE TABLE main.report_has_receptions
(
    report_id       BIGINT                   not null,
    article_id      BIGINT                   not null,
    raw_material_id BIGINT                   not null,
    amount        DECIMAL(10, 2) default 0 not null,

    PRIMARY KEY (report_id, article_id, raw_material_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES articles (id) ON DELETE CASCADE
);

CREATE TABLE main.report_has_articles
(
    article_id BIGINT                   NOT NULL,
    report_id  BIGINT                   NOT NULL,
    amount   DECIMAL(10, 2) DEFAULT 0 NOT NULL,

    PRIMARY KEY (report_id, article_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
);

CREATE TABLE main.shipments
(
    report_id            BIGINT NOT NULL,
    receipt_company_name VARCHAR(128),

    PRIMARY KEY (report_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
);

INSERT INTO main.unit_measurements (id, name, is_integer)
VALUES (1, 'Piece', true),
       (2, 'Kilogram', false),
       (3, 'Liter', false);

INSERT INTO main.articles (id, category, name, code, in_stock_amount, in_stock_warning_amount, unit_measure_id, tags)
VALUES (1, 'RAW_MATERIAL', 'Flour', 'FL001', 100.00, 20.00, 2, 'baking,ingredients'),
       (2, 'PRODUCT', 'Bread', 'BR001', 50.00, 10.00, 1, 'bakery,fresh'),
       (3, 'COMMERCIAL', 'Milk', 'ML001', 75.00, 15.00, 3, 'dairy');

INSERT INTO main.reports (id, type, code, date, location_of_publish, signed_by_name)
VALUES (1, 'RECEIPT', 'REC001', '2024-02-20 10:00:00', 'Warehouse A', 'John Doe'),
       (2, 'SHIPMENT', 'SHIP001', '2024-02-20 14:00:00', 'Warehouse B', 'Jane Smith');

INSERT INTO main.receipts (report_id, supplier_company_name, supplier_report_code)
VALUES (1, 'Supplier Co', 'SUP001');

INSERT INTO main.shipments (report_id, receipt_company_name)
VALUES (2, 'Customer LLC');

INSERT INTO main.report_has_articles (article_id, report_id, amount)
VALUES (2, 2, 25.00);

INSERT INTO main.article_has_reception (article_id, raw_material_id, amount)
VALUES (2, 1, 0.5);

INSERT INTO main.report_has_receptions (report_id, article_id, raw_material_id, amount)
VALUES (1, 2, 1, 50.00);