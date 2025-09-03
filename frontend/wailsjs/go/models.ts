export namespace article {
	
	export class Article {
	    id: number;
	    name: string;
	    code?: string;
	    tags: string;
	    category: string;
	    inStockAmount: number;
	    inStockWarningAmount: number;
	    unitMeasure?: unit.UnitMeasure;
	
	    static createFrom(source: any = {}) {
	        return new Article(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.code = source["code"];
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
	export class Recipe {
	    rawMaterial: Article;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new Recipe(source);
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

}

export namespace company {
	
	export class Company {
	    name?: string;
	    inHouseProduction: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Company(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.inHouseProduction = source["inHouseProduction"];
	    }
	}

}

export namespace report {
	
	export class Receipt {
	    isSupplierProducton?: boolean;
	    supplierCompany: company.Company;
	    supplierReportCode?: string;
	
	    static createFrom(source: any = {}) {
	        return new Receipt(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isSupplierProducton = source["isSupplierProducton"];
	        this.supplierCompany = this.convertValues(source["supplierCompany"], company.Company);
	        this.supplierReportCode = source["supplierReportCode"];
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
	export class Shipment {
	    receiptCompany: company.Company;
	
	    static createFrom(source: any = {}) {
	        return new Shipment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.receiptCompany = this.convertValues(source["receiptCompany"], company.Company);
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
	export class Report {
	    id: number;
	    type: string;
	    code?: string;
	    signedAt?: string;
	    signedAtLocation?: string;
	    signedBy?: string;
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
	        this.signedAt = source["signedAt"];
	        this.signedAtLocation = source["signedAtLocation"];
	        this.signedBy = source["signedBy"];
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
	export class ReportRecipe {
	    rawMaterial: article.Article;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new ReportRecipe(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rawMaterial = this.convertValues(source["rawMaterial"], article.Article);
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
	export class ReportArticle {
	    article: article.Article;
	    amount: number;
	    usedRecipes: ReportRecipe[];
	
	    static createFrom(source: any = {}) {
	        return new ReportArticle(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.article = this.convertValues(source["article"], article.Article);
	        this.amount = source["amount"];
	        this.usedRecipes = this.convertValues(source["usedRecipes"], ReportRecipe);
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

