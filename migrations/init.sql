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