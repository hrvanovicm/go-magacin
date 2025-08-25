export namespace article {
	
	export class Article {
	    id: number;
	    name: string;
	    code: sql.NullString;
	    tags: string;
	    category: string;
	    inStockAmount: number;
	    inStockWarningAmount: number;
	    unitMeasure: unit.UnitMeasure;
	
	    static createFrom(source: any = {}) {
	        return new Article(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.code = this.convertValues(source["code"], sql.NullString);
	        this.tags = source["tags"];
	        this.category = source["category"];
	        this.inStockAmount = source["inStockAmount"];
	        this.inStockWarningAmount = source["inStockWarningAmount"];
	        this.unitMeasure = this.convertValues(source["unitMeasure"], unit.UnitMeasure);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Summary {
	    id: number;
	    name: string;
	    code: sql.NullString;
	    inStockAmount: number;
	    unitMeasure: unit.UnitMeasure;
	
	    static createFrom(source: any = {}) {
	        return new Summary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.code = this.convertValues(source["code"], sql.NullString);
	        this.inStockAmount = source["inStockAmount"];
	        this.unitMeasure = this.convertValues(source["unitMeasure"], unit.UnitMeasure);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Reception {
	    rawMaterial: Summary;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new Reception(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rawMaterial = this.convertValues(source["rawMaterial"], Summary);
	        this.amount = source["amount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace report {
	
	export class ArticleReceipt {
	    rawMaterial: Article;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new ArticleReceipt(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rawMaterial = this.convertValues(source["rawMaterial"], Article);
	        this.amount = source["amount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Article {
	    article: article.Article;
	    amount: number;
	    usedReceipts: ArticleReceipt[];
	
	    static createFrom(source: any = {}) {
	        return new Article(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.article = this.convertValues(source["article"], article.Article);
	        this.amount = source["amount"];
	        this.usedReceipts = this.convertValues(source["usedReceipts"], ArticleReceipt);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Receipt {
	    isSupplierProducton: boolean;
	    supplierCompanyName: string;
	    supplierReportCode: string;
	
	    static createFrom(source: any = {}) {
	        return new Receipt(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isSupplierProducton = source["isSupplierProducton"];
	        this.supplierCompanyName = source["supplierCompanyName"];
	        this.supplierReportCode = source["supplierReportCode"];
	    }
	}
	export class Shipment {
	    receiptCompanyName: string;
	
	    static createFrom(source: any = {}) {
	        return new Shipment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.receiptCompanyName = source["receiptCompanyName"];
	    }
	}
	export class Report {
	    id: number;
	    type: string;
	    code: string;
	    date: string;
	    placeOfPublish: string;
	    signedByName: string;
	    receipt: Receipt;
	    shipment: Shipment;
	
	    static createFrom(source: any = {}) {
	        return new Report(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.code = source["code"];
	        this.date = source["date"];
	        this.placeOfPublish = source["placeOfPublish"];
	        this.signedByName = source["signedByName"];
	        this.receipt = this.convertValues(source["receipt"], Receipt);
	        this.shipment = this.convertValues(source["shipment"], Shipment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace sql {
	
	export class NullString {
	    String: string;
	    Valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NullString(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.String = source["String"];
	        this.Valid = source["Valid"];
	    }
	}

}

export namespace unit {
	
	export class UnitMeasure {
	    id: number;
	    name: string;
	    isInteger: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UnitMeasure(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.isInteger = source["isInteger"];
	    }
	}

}

