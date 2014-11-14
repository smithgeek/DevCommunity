interface JQuery {
    readmore(data: ReadmoreOptions): JQuery;
}

interface ReadmoreOptions {
    speed?: number;
    maxHeight?: number;
    heightMargin?: number;
    moreLink?: string;
    lessLink?: string;
    embedCSS?: boolean;
    sectionCss?: string;
    startOpen?: boolean;
    expandedClass?: string;
    collapsedClass?: string;
    beforeToggle?: any;
    afterToggle?: any;
}

interface JQuery {
    timeago(): JQuery;
}

interface QRCodeObj {
    makeCode(value: string);
}

interface qrcodeFactory {
    new (id: string, options?: any): QRCodeObj;
}
declare var QRCode: qrcodeFactory;