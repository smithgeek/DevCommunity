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