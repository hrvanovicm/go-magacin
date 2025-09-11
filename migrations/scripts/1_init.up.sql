CREATE TABLE main.in_house_companies
(
    name VARCHAR(128) PRIMARY KEY NOT NULL
);

CREATE TABLE main.article_has_recipes
(
    article_id      INTEGER                  NOT NULL,
    raw_material_id INTEGER                  NOT NULL,
    amount          DECIMAL(10, 2) DEFAULT 0 NOT NULL,

    PRIMARY KEY (article_id, raw_material_id)
);

CREATE TABLE main.unit_measurements
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name       VARCHAR(32)                       NOT NULL UNIQUE,
    is_integer BOOLEAN DEFAULT TRUE              NOT NULL
);

CREATE TABLE main.articles
(
    id                      INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    category                VARCHAR(12)                       NOT NULL,
    name                    VARCHAR(64)                       NOT NULL UNIQUE,
    code                    VARCHAR(64) UNIQUE,
    in_stock_amount         DECIMAL(10, 2) DEFAULT 0          NOT NULL,
    in_stock_warning_amount DECIMAL(10, 2) DEFAULT 0          NOT NULL,
    unit_measure_id         INTEGER        DEFAULT NULL,
    tags                    VARCHAR(255)   DEFAULT ''         NOT NULL,

    CHECK (category IN ('COMMERCIAL', 'PRODUCT', 'RAW_MATERIAL')),
    FOREIGN KEY (unit_measure_id) REFERENCES unit_measurements (id) ON DELETE SET DEFAULT
);

CREATE TABLE main.reports
(
    id                 INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    type               VARCHAR(7)                        NOT NULL,
    code               VARCHAR(128) UNIQUE,
    signed_at          DATETIME,
    signed_at_location VARCHAR(128),
    signed_by          VARCHAR(128),

    CHECK (type IN ('RECEIPT', 'SHIPMENT'))
);

CREATE TABLE main.receipts
(
    report_id             INTEGER NOT NULL,
    supplier_company_name VARCHAR(128),
    supplier_report_code  VARCHAR(128),

    PRIMARY KEY (report_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
);

CREATE TABLE main.report_has_recipes
(
    report_id       INTEGER                  not null,
    article_id      INTEGER                  not null,
    raw_material_id INTEGER                  not null,
    amount          DECIMAL(10, 2) default 0 not null,

    PRIMARY KEY (report_id, article_id, raw_material_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES articles (id) ON DELETE CASCADE
);

CREATE TABLE main.report_has_articles
(
    article_id INTEGER                  NOT NULL,
    report_id  INTEGER                  NOT NULL,
    amount     DECIMAL(10, 2) DEFAULT 0 NOT NULL,

    PRIMARY KEY (report_id, article_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
);

CREATE TABLE main.shipments
(
    report_id            INTEGER NOT NULL,
    receipt_company_name VARCHAR(128),

    PRIMARY KEY (report_id),
    FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
);
