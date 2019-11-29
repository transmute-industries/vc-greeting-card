import jsonld from "jsonld";

const _nodejs =
  // tslint:disable-next-line
  typeof process !== "undefined" && process.versions && process.versions.node;
const _browser =
  // tslint:disable-next-line
  // eslint-disable-next-line
  !_nodejs && (typeof window !== "undefined" || typeof self !== "undefined");

const documentLoader = _browser
  ? jsonld.documentLoaders.xhr()
  : jsonld.documentLoaders.node();

const wrappedDocumentLoader = args => {
  return async url => {
    console.log("wrappedDocumentLoader...", url);
    return documentLoader(url);
  };
};

export default wrappedDocumentLoader;
