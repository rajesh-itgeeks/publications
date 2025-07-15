var _a;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, Link, useRouteError, useNavigate } from "@remix-run/react";
import { createReadableStreamFromReadable, redirect } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-remix/server";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import { createContext, useContext, useState, useCallback } from "react";
import { PrismaClient } from "@prisma/client";
import { AppProvider, Page, Card, FormLayout, Text, TextField, Button, BlockStack, Thumbnail, SkeletonThumbnail, Icon, InlineStack, DropZone, Layout, PageActions, useSetIndexFiltersMode, IndexTable, EmptyState, Box, IndexFilters, useBreakpoints } from "@shopify/polaris";
import { AppProvider as AppProvider$1 } from "@shopify/shopify-app-remix/react";
import { NavMenu, useAppBridge } from "@shopify/app-bridge-react";
import { XSmallIcon, SearchIcon, NoteIcon } from "@shopify/polaris-icons";
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new MemorySessionStorage(),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.January25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const FileContext = createContext();
function FileProvider({ children }) {
  const [savedItems, setSavedItems] = useState([]);
  const saveItem = (file, product) => {
    setSavedItems((prev) => [...prev, { file, product, id: Date.now() }]);
  };
  return /* @__PURE__ */ jsx(FileContext.Provider, { value: { savedItems, saveItem }, children });
}
function useFileContext() {
  return useContext(FileContext);
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FileProvider,
  useFileContext
}, Symbol.toStringTag, { value: "Module" }));
function App$2() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(FileProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$2
}, Symbol.toStringTag, { value: "Module" }));
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}
const prisma = global.prismaGlobal ?? new PrismaClient();
const action$2 = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
const action$1 = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await prisma.session.deleteMany({ where: { shop } });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = /* @__PURE__ */ JSON.parse('{"ActionMenu":{"Actions":{"moreActions":"More actions"},"RollupActions":{"rollupButton":"View actions"}},"ActionList":{"SearchField":{"clearButtonLabel":"Clear","search":"Search","placeholder":"Search actions"}},"Avatar":{"label":"Avatar","labelWithInitials":"Avatar with initials {initials}"},"Autocomplete":{"spinnerAccessibilityLabel":"Loading","ellipsis":"{content}…"},"Badge":{"PROGRESS_LABELS":{"incomplete":"Incomplete","partiallyComplete":"Partially complete","complete":"Complete"},"TONE_LABELS":{"info":"Info","success":"Success","warning":"Warning","critical":"Critical","attention":"Attention","new":"New","readOnly":"Read-only","enabled":"Enabled"},"progressAndTone":"{toneLabel} {progressLabel}"},"Banner":{"dismissButton":"Dismiss notification"},"Button":{"spinnerAccessibilityLabel":"Loading"},"Common":{"checkbox":"checkbox","undo":"Undo","cancel":"Cancel","clear":"Clear","close":"Close","submit":"Submit","more":"More"},"ContextualSaveBar":{"save":"Save","discard":"Discard"},"DataTable":{"sortAccessibilityLabel":"sort {direction} by","navAccessibilityLabel":"Scroll table {direction} one column","totalsRowHeading":"Totals","totalRowHeading":"Total"},"DatePicker":{"previousMonth":"Show previous month, {previousMonthName} {showPreviousYear}","nextMonth":"Show next month, {nextMonth} {nextYear}","today":"Today ","start":"Start of range","end":"End of range","months":{"january":"January","february":"February","march":"March","april":"April","may":"May","june":"June","july":"July","august":"August","september":"September","october":"October","november":"November","december":"December"},"days":{"monday":"Monday","tuesday":"Tuesday","wednesday":"Wednesday","thursday":"Thursday","friday":"Friday","saturday":"Saturday","sunday":"Sunday"},"daysAbbreviated":{"monday":"Mo","tuesday":"Tu","wednesday":"We","thursday":"Th","friday":"Fr","saturday":"Sa","sunday":"Su"}},"DiscardConfirmationModal":{"title":"Discard all unsaved changes","message":"If you discard changes, you’ll delete any edits you made since you last saved.","primaryAction":"Discard changes","secondaryAction":"Continue editing"},"DropZone":{"single":{"overlayTextFile":"Drop file to upload","overlayTextImage":"Drop image to upload","overlayTextVideo":"Drop video to upload","actionTitleFile":"Add file","actionTitleImage":"Add image","actionTitleVideo":"Add video","actionHintFile":"or drop file to upload","actionHintImage":"or drop image to upload","actionHintVideo":"or drop video to upload","labelFile":"Upload file","labelImage":"Upload image","labelVideo":"Upload video"},"allowMultiple":{"overlayTextFile":"Drop files to upload","overlayTextImage":"Drop images to upload","overlayTextVideo":"Drop videos to upload","actionTitleFile":"Add files","actionTitleImage":"Add images","actionTitleVideo":"Add videos","actionHintFile":"or drop files to upload","actionHintImage":"or drop images to upload","actionHintVideo":"or drop videos to upload","labelFile":"Upload files","labelImage":"Upload images","labelVideo":"Upload videos"},"errorOverlayTextFile":"File type is not valid","errorOverlayTextImage":"Image type is not valid","errorOverlayTextVideo":"Video type is not valid"},"EmptySearchResult":{"altText":"Empty search results"},"Frame":{"skipToContent":"Skip to content","navigationLabel":"Navigation","Navigation":{"closeMobileNavigationLabel":"Close navigation"}},"FullscreenBar":{"back":"Back","accessibilityLabel":"Exit fullscreen mode"},"Filters":{"moreFilters":"More filters","moreFiltersWithCount":"More filters ({count})","filter":"Filter {resourceName}","noFiltersApplied":"No filters applied","cancel":"Cancel","done":"Done","clearAllFilters":"Clear all filters","clear":"Clear","clearLabel":"Clear {filterName}","addFilter":"Add filter","clearFilters":"Clear all","searchInView":"in:{viewName}"},"FilterPill":{"clear":"Clear","unsavedChanges":"Unsaved changes - {label}"},"IndexFilters":{"searchFilterTooltip":"Search and filter","searchFilterTooltipWithShortcut":"Search and filter (F)","searchFilterAccessibilityLabel":"Search and filter results","sort":"Sort your results","addView":"Add a new view","newView":"Custom search","SortButton":{"ariaLabel":"Sort the results","tooltip":"Sort","title":"Sort by","sorting":{"asc":"Ascending","desc":"Descending","az":"A-Z","za":"Z-A"}},"EditColumnsButton":{"tooltip":"Edit columns","accessibilityLabel":"Customize table column order and visibility"},"UpdateButtons":{"cancel":"Cancel","update":"Update","save":"Save","saveAs":"Save as","modal":{"title":"Save view as","label":"Name","sameName":"A view with this name already exists. Please choose a different name.","save":"Save","cancel":"Cancel"}}},"IndexProvider":{"defaultItemSingular":"Item","defaultItemPlural":"Items","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} are selected","selected":"{selectedItemsCount} selected","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}"},"IndexTable":{"emptySearchTitle":"No {resourceNamePlural} found","emptySearchDescription":"Try changing the filters or search term","onboardingBadgeText":"New","resourceLoadingAccessibilityLabel":"Loading {resourceNamePlural}…","selectAllLabel":"Select all {resourceNamePlural}","selected":"{selectedItemsCount} selected","undo":"Undo","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural}","selectItem":"Select {resourceName}","selectButtonText":"Select","sortAccessibilityLabel":"sort {direction} by"},"Loading":{"label":"Page loading bar"},"Modal":{"iFrameTitle":"body markup","modalWarning":"These required properties are missing from Modal: {missingProps}"},"Page":{"Header":{"rollupActionsLabel":"View actions for {title}","pageReadyAccessibilityLabel":"{title}. This page is ready"}},"Pagination":{"previous":"Previous","next":"Next","pagination":"Pagination"},"ProgressBar":{"negativeWarningMessage":"Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.","exceedWarningMessage":"Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."},"ResourceList":{"sortingLabel":"Sort by","defaultItemSingular":"item","defaultItemPlural":"items","showing":"Showing {itemsCount} {resource}","showingTotalCount":"Showing {itemsCount} of {totalItemsCount} {resource}","loading":"Loading {resource}","selected":"{selectedItemsCount} selected","allItemsSelected":"All {itemsLength}+ {resourceNamePlural} in your store are selected","allFilteredItemsSelected":"All {itemsLength}+ {resourceNamePlural} in this filter are selected","selectAllItems":"Select all {itemsLength}+ {resourceNamePlural} in your store","selectAllFilteredItems":"Select all {itemsLength}+ {resourceNamePlural} in this filter","emptySearchResultTitle":"No {resourceNamePlural} found","emptySearchResultDescription":"Try changing the filters or search term","selectButtonText":"Select","a11yCheckboxDeselectAllSingle":"Deselect {resourceNameSingular}","a11yCheckboxSelectAllSingle":"Select {resourceNameSingular}","a11yCheckboxDeselectAllMultiple":"Deselect all {itemsLength} {resourceNamePlural}","a11yCheckboxSelectAllMultiple":"Select all {itemsLength} {resourceNamePlural}","Item":{"actionsDropdownLabel":"Actions for {accessibilityLabel}","actionsDropdown":"Actions dropdown","viewItem":"View details for {itemName}"},"BulkActions":{"actionsActivatorLabel":"Actions","moreActionsActivatorLabel":"More actions"}},"SkeletonPage":{"loadingLabel":"Page loading"},"Tabs":{"newViewAccessibilityLabel":"Create new view","newViewTooltip":"Create view","toggleTabsLabel":"More views","Tab":{"rename":"Rename view","duplicate":"Duplicate view","edit":"Edit view","editColumns":"Edit columns","delete":"Delete view","copy":"Copy of {name}","deleteModal":{"title":"Delete view?","description":"This can’t be undone. {viewName} view will no longer be available in your admin.","cancel":"Cancel","delete":"Delete view"}},"RenameModal":{"title":"Rename view","label":"Name","cancel":"Cancel","create":"Save","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"DuplicateModal":{"title":"Duplicate view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}},"CreateViewModal":{"title":"Create new view","label":"Name","cancel":"Cancel","create":"Create view","errors":{"sameName":"A view with this name already exists. Please choose a different name."}}},"Tag":{"ariaLabel":"Remove {children}"},"TextField":{"characterCount":"{count} characters","characterCountWithMaxLength":"{count} of {limit} characters used"},"TooltipOverlay":{"accessibilityLabel":"Tooltip: {label}"},"TopBar":{"toggleMenuLabel":"Toggle menu","SearchField":{"clearButtonLabel":"Clear","search":"Search"}},"MediaCard":{"dismissButton":"Dismiss","popoverButton":"Actions"},"VideoThumbnail":{"playButtonA11yLabel":{"default":"Play video","defaultWithDuration":"Play video of length {duration}","duration":{"hours":{"other":{"only":"{hourCount} hours","andMinutes":"{hourCount} hours and {minuteCount} minutes","andMinute":"{hourCount} hours and {minuteCount} minute","minutesAndSeconds":"{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hours, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hours, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hours, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hours and {secondCount} seconds","andSecond":"{hourCount} hours and {secondCount} second"},"one":{"only":"{hourCount} hour","andMinutes":"{hourCount} hour and {minuteCount} minutes","andMinute":"{hourCount} hour and {minuteCount} minute","minutesAndSeconds":"{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds","minutesAndSecond":"{hourCount} hour, {minuteCount} minutes, and {secondCount} second","minuteAndSeconds":"{hourCount} hour, {minuteCount} minute, and {secondCount} seconds","minuteAndSecond":"{hourCount} hour, {minuteCount} minute, and {secondCount} second","andSeconds":"{hourCount} hour and {secondCount} seconds","andSecond":"{hourCount} hour and {secondCount} second"}},"minutes":{"other":{"only":"{minuteCount} minutes","andSeconds":"{minuteCount} minutes and {secondCount} seconds","andSecond":"{minuteCount} minutes and {secondCount} second"},"one":{"only":"{minuteCount} minute","andSeconds":"{minuteCount} minute and {secondCount} seconds","andSecond":"{minuteCount} minute and {secondCount} second"}},"seconds":{"other":"{secondCount} seconds","one":"{secondCount} second"}}}}}');
const polarisTranslations = {
  Polaris
};
const polarisStyles = "/assets/styles-BeiPL2RV.css";
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const links$1 = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$3 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors, polarisTranslations };
};
const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, { i18n: loaderData.polarisTranslations, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs(FormLayout, { children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Log in" }),
    /* @__PURE__ */ jsx(
      TextField,
      {
        type: "text",
        name: "shop",
        label: "Shop domain",
        helpText: "example.myshopify.com",
        value: shop,
        onChange: setShop,
        autoComplete: "on",
        error: errors.shop
      }
    ),
    /* @__PURE__ */ jsx(Button, { submit: true, children: "Log in" })
  ] }) }) }) }) });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Auth,
  links: links$1,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_1hqgz_1";
const heading = "_heading_1hqgz_21";
const text = "_text_1hqgz_23";
const content = "_content_1hqgz_43";
const form = "_form_1hqgz_53";
const label = "_label_1hqgz_69";
const input = "_input_1hqgz_85";
const button = "_button_1hqgz_93";
const list = "_list_1hqgz_101";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$1 = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return { showForm: Boolean(login) };
};
function App$1() {
  const { showForm } = useLoaderData();
  return /* @__PURE__ */ jsx("div", { className: styles.index, children: /* @__PURE__ */ jsxs("div", { className: styles.content, children: [
    /* @__PURE__ */ jsx("h1", { className: styles.heading, children: "A short heading about [your app]" }),
    /* @__PURE__ */ jsx("p", { className: styles.text, children: "A tagline about [your app] that describes your value proposition." }),
    showForm && /* @__PURE__ */ jsxs(Form, { className: styles.form, method: "post", action: "/auth/login", children: [
      /* @__PURE__ */ jsxs("label", { className: styles.label, children: [
        /* @__PURE__ */ jsx("span", { children: "Shop domain" }),
        /* @__PURE__ */ jsx("input", { className: styles.input, type: "text", name: "shop" }),
        /* @__PURE__ */ jsx("span", { children: "e.g: my-shop-domain.myshopify.com" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: styles.button, type: "submit", children: "Log in" })
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: styles.list, children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] })
    ] })
  ] }) });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider$1, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs(NavMenu, { children: [
      /* @__PURE__ */ jsx(Link, { to: "/app", rel: "home", children: "Home" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/add_file", children: "Add product" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader
}, Symbol.toStringTag, { value: "Module" }));
function SelectProducts({ product, setSelectProducts, setSelectProIds, selectProIds, selectProducts }) {
  var _a2;
  function removeProduct(event) {
    let id = event.target.closest("button").id;
    selectProIds = selectProIds.filter((ele, i) => ele.id != id);
    selectProducts = selectProducts.filter((ele, i) => ele.id != id);
    setSelectProducts([]);
    setSelectProIds([]);
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(BlockStack, { gap: "100", children: /* @__PURE__ */ jsx(Card, { padding: "300", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: "15px" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", maxWidth: "calc(100% - 115px)" }, children: [
      ((_a2 = product.images) == null ? void 0 : _a2.length) ? /* @__PURE__ */ jsx(
        Thumbnail,
        {
          source: product.images[0].originalSrc,
          alt: "Black choker necklace",
          size: "small"
        }
      ) : /* @__PURE__ */ jsx(SkeletonThumbnail, { size: "small" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", marginLeft: "15px", justifyContent: "center" }, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", fontWeight: "medium", children: product.title }),
        product.hasOnlyDefaultVariant ? /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodySm", children: product.variants[0].price }) : /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodySm", children: [
          "(",
          product.variants.length,
          " of ",
          product.totalVariants,
          " variants selected)"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", maxWidth: "100px", width: "100%", justifyContent: "flex-end", gap: "25px" }, children: /* @__PURE__ */ jsx(Button, { icon: XSmallIcon, onClick: removeProduct, id: product.id, variant: "plain" }) })
  ] }) }) }) });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SelectProducts
}, Symbol.toStringTag, { value: "Module" }));
function ProductSelector({ shopify: shopify2, onProductsChange }) {
  const [selectProducts, setSelectProducts] = useState([]);
  const [selectProIds, setSelectProIds] = useState([]);
  const handleTextFieldChange = useCallback(async () => {
    const products = await shopify2.resourcePicker({
      type: "product",
      action: "select",
      multiple: false,
      selectionIds: selectProIds
    });
    if (products) {
      setSelectProducts(products);
      const selProId = products.map((product) => ({ id: product.id }));
      setSelectProIds(selProId);
      onProductsChange(products);
    }
  }, [shopify2, selectProIds, onProductsChange]);
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
    /* @__PURE__ */ jsx(
      TextField,
      {
        label: "Search",
        type: "text",
        onFocus: handleTextFieldChange,
        autoComplete: "off",
        connectedRight: /* @__PURE__ */ jsx(Button, { onClick: handleTextFieldChange, children: "Browse" }),
        prefix: /* @__PURE__ */ jsx(Icon, { source: SearchIcon, tone: "subdued" })
      }
    ),
    selectProducts.length > 0 && selectProducts.map((pro, i) => /* @__PURE__ */ jsx(
      SelectProducts,
      {
        product: pro,
        setSelectProducts,
        selectProIds,
        selectProducts,
        setSelectProIds
      },
      i
    ))
  ] }) });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProductSelector
}, Symbol.toStringTag, { value: "Module" }));
function FileUpload({ onFileChange }) {
  const [file, setFile] = useState(null);
  const [selectfile_outline, setselectfile_outline] = useState(true);
  const handleDropZoneDrop = useCallback(
    (_, acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile && selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setselectfile_outline(false);
        onFileChange(selectedFile);
      } else {
        setFile(null);
        setselectfile_outline(true);
        alert("Only PDF files are allowed.");
      }
    },
    [onFileChange]
  );
  const uploadedFile = file && /* @__PURE__ */ jsxs(InlineStack, { alignment: "center", gap: "200", wrap: "true", children: [
    /* @__PURE__ */ jsx(
      Thumbnail,
      {
        size: "small",
        alt: file.name,
        source: NoteIcon
      }
    ),
    /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
      /* @__PURE__ */ jsx(Text, { children: file.name }),
      /* @__PURE__ */ jsxs(Text, { variant: "bodySm", as: "p", children: [
        (file.size / 1024).toFixed(2),
        " KB"
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsx(Card, { title: "Select file details", sectioned: true, children: /* @__PURE__ */ jsx(
    DropZone,
    {
      accept: "application/pdf",
      allowMultiple: false,
      outline: selectfile_outline,
      label: "Select PDF File",
      onDrop: handleDropZoneDrop,
      children: uploadedFile ? /* @__PURE__ */ jsx(Card, { children: uploadedFile }) : /* @__PURE__ */ jsx(DropZone.FileUpload, {})
    }
  ) });
}
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: FileUpload
}, Symbol.toStringTag, { value: "Module" }));
function SelectFiles() {
  const { saveItem } = useFileContext();
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const shopify2 = useAppBridge();
  const navigate = useNavigate();
  let isSaveDisabled;
  const handleFileChange = useCallback((selectedFile) => {
    setFile(selectedFile);
    isSaveDisabled = !file || products.length === 0;
  }, [file]);
  const handleProductsChange = useCallback((selectedProducts) => {
    setProducts(selectedProducts);
    isSaveDisabled = !file || products.length === 0;
  }, [products]);
  const handleSave = useCallback(() => {
    if (file && products.length > 0) {
      saveItem(file, products[0]);
      navigate("/app");
    }
  }, [file, products, saveItem]);
  isSaveDisabled = !file || products.length === 0;
  return /* @__PURE__ */ jsx(Page, { class: "Polaris-Page", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsxs(Layout.Section, { children: [
      /* @__PURE__ */ jsx(FileUpload, { onFileChange: handleFileChange }),
      /* @__PURE__ */ jsx(ProductSelector, { shopify: shopify2, onProductsChange: handleProductsChange }),
      /* @__PURE__ */ jsx(
        PageActions,
        {
          primaryAction: {
            content: "Save",
            disabled: isSaveDisabled,
            onAction: handleSave
          },
          secondaryActions: [
            {
              content: "Cancel",
              destructive: true,
              onAction: () => {
                setFile(null);
                setProducts([]);
              }
            }
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxs(Card, { title: "fileTags", sectioned: true, children: [
      /* @__PURE__ */ jsx("p", { children: "Details" }),
      file ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "File: ",
          file.name
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Size: ",
          file.size,
          " bytes"
        ] })
      ] }) : /* @__PURE__ */ jsx("p", { children: "No file selected" })
    ] }) })
  ] }) });
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SelectFiles
}, Symbol.toStringTag, { value: "Module" }));
function IndexPage() {
  const { savedItems } = useFileContext();
  const navigate = useNavigate();
  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(["name asc"]);
  const { mode: mode2, setMode } = useSetIndexFiltersMode();
  const handleFiltersQueryChange = useCallback((value) => setQueryValue(value), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const tabs = [
    {
      content: "All",
      index: 0,
      id: "All-0"
    }
  ];
  const [selected, setSelected] = useState(0);
  const resourceName = {
    singular: "file",
    plural: "files"
  };
  const filteredItems = savedItems.filter(
    ({ file, product }) => {
      var _a2, _b;
      return file.name.toLowerCase().includes(queryValue.toLowerCase()) || ((_a2 = file.type) == null ? void 0 : _a2.toLowerCase().includes(queryValue.toLowerCase())) || ((_b = product == null ? void 0 : product.title) == null ? void 0 : _b.toLowerCase().includes(queryValue.toLowerCase()));
    }
  );
  const rowMarkup = filteredItems.map(({ id, file, product }, index2) => /* @__PURE__ */ jsxs(
    IndexTable.Row,
    {
      id,
      position: index2,
      children: [
        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: "200", blockAlign: "center", children: [
          /* @__PURE__ */ jsx(
            Thumbnail,
            {
              source: ["image/gif", "image/jpeg", "image/png"].includes(file.type) ? window.URL.createObjectURL(file) : NoteIcon,
              alt: file.name,
              size: "small"
            }
          ),
          /* @__PURE__ */ jsx(Text, { variant: "bodyMd", fontWeight: "bold", as: "span", children: file.name })
        ] }) }),
        /* @__PURE__ */ jsx(IndexTable.Cell, { children: /* @__PURE__ */ jsxs(Text, { as: "span", alignment: "end", numeric: true, children: [
          (file.size / 1024).toFixed(2),
          " KB"
        ] }) }),
        /* @__PURE__ */ jsx(IndexTable.Cell, { children: file.type }),
        /* @__PURE__ */ jsx(IndexTable.Cell, { children: product ? product.title || product.id : "No Product" })
      ]
    },
    id
  ));
  return /* @__PURE__ */ jsxs(Page, { sectioned: true, children: [
    savedItems.length < 1 && /* @__PURE__ */ jsx(
      EmptyState,
      {
        heading: "Manage your inventory transfers",
        action: { content: "Add First File", url: "/app/add_file" },
        image: "https://cdn.shopify.com/s/files/1/0909/0206/9619/files/emptystate-files.avif?width=500&v=1750777601",
        children: /* @__PURE__ */ jsx("p", { children: "Track and receive your incoming inventory from suppliers." })
      }
    ),
    savedItems.length > 0 && /* @__PURE__ */ jsxs(Box, { children: [
      /* @__PURE__ */ jsx(InlineStack, { align: "end", gap: "400", paddingBlockEnd: "200", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/app/add_file"),
          style: {
            backgroundColor: "#008060",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            margin: "20px 0"
          },
          children: "+ Add File"
        }
      ) }),
      /* @__PURE__ */ jsx(
        IndexFilters,
        {
          queryValue,
          queryPlaceholder: "Search files",
          onQueryChange: handleFiltersQueryChange,
          onQueryClear: handleQueryValueRemove,
          onSort: setSortSelected,
          tabs,
          selected,
          onSelect: setSelected,
          canCreateNewView: false,
          mode: mode2,
          setMode,
          filters: [],
          appliedFilters: []
        }
      ),
      /* @__PURE__ */ jsx(
        IndexTable,
        {
          condensed: useBreakpoints().smDown,
          resourceName,
          itemCount: filteredItems.length,
          selectedItemsCount: 0,
          selectable: false,
          headings: [
            { title: "File Name" },
            { title: "Size", alignment: "end" },
            { title: "File Type" },
            { title: "Product" }
          ],
          children: rowMarkup
        }
      )
    ] })
  ] });
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: IndexPage
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-qfIU9X2R.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/index-BtM0mGov.js", "/assets/components-CgiT7Y74.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DvDW7XKj.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/index-BtM0mGov.js", "/assets/components-CgiT7Y74.js", "/assets/FileContext-DmFvwVpW.js"], "css": [] }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/FileContext": { "id": "routes/FileContext", "parentId": "root", "path": "FileContext", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/FileContext-DmFvwVpW.js", "imports": ["/assets/index-7zqVQZSl.js"], "css": [] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CarN-ssa.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/styles-CBcRQJtp.js", "/assets/components-CgiT7Y74.js", "/assets/Page-E05rCjVO.js", "/assets/Card-CBmA3d8m.js", "/assets/FormLayout-Dokohhgb.js", "/assets/BlockStack-yzVWW-Wn.js", "/assets/TextField-tplV-Sz1.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js", "/assets/context-ldBvQp3i.js", "/assets/debounce-BHiWcPok.js", "/assets/context-nAT6LI_3.js", "/assets/EventListener-CBOuXQew.js", "/assets/index-BtM0mGov.js", "/assets/Labelled-BtZgj0AZ.js", "/assets/use-component-did-mount-CJAKqZ06.js"], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-D0ancwi0.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/components-CgiT7Y74.js", "/assets/index-BtM0mGov.js"], "css": ["/assets/route-Cnm7FvdT.css"] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-6ZxLY05k.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/components-CgiT7Y74.js", "/assets/styles-CBcRQJtp.js", "/assets/index-BtM0mGov.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js", "/assets/context-ldBvQp3i.js", "/assets/debounce-BHiWcPok.js", "/assets/context-nAT6LI_3.js", "/assets/EventListener-CBOuXQew.js"], "css": [] }, "routes/app.ProductSelector": { "id": "routes/app.ProductSelector", "parentId": "routes/app", "path": "ProductSelector", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.ProductSelector-Dncw00xx.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/app.SelectProducts-D1gvSQUh.js", "/assets/Card-CBmA3d8m.js", "/assets/BlockStack-yzVWW-Wn.js", "/assets/TextField-tplV-Sz1.js", "/assets/Thumbnail-BbgnN8DA.js", "/assets/XSmallIcon.svg-smtEa8NW.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js", "/assets/Labelled-BtZgj0AZ.js", "/assets/EventListener-CBOuXQew.js"], "css": [] }, "routes/app.SelectProducts": { "id": "routes/app.SelectProducts", "parentId": "routes/app", "path": "SelectProducts", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.SelectProducts-D1gvSQUh.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/BlockStack-yzVWW-Wn.js", "/assets/Card-CBmA3d8m.js", "/assets/Thumbnail-BbgnN8DA.js", "/assets/XSmallIcon.svg-smtEa8NW.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js"], "css": [] }, "routes/app.FileUpload": { "id": "routes/app.FileUpload", "parentId": "routes/app", "path": "FileUpload", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.FileUpload-GZJ_-uRv.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/use-component-did-mount-CJAKqZ06.js", "/assets/Thumbnail-BbgnN8DA.js", "/assets/NoteIcon.svg-e2kWmJZg.js", "/assets/BlockStack-yzVWW-Wn.js", "/assets/Card-CBmA3d8m.js", "/assets/debounce-BHiWcPok.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js", "/assets/Labelled-BtZgj0AZ.js"], "css": [] }, "routes/app.add_file": { "id": "routes/app.add_file", "parentId": "routes/app", "path": "add_file", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.add_file-AQTtl0-8.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/app.FileUpload-GZJ_-uRv.js", "/assets/app.ProductSelector-Dncw00xx.js", "/assets/FileContext-DmFvwVpW.js", "/assets/index-BtM0mGov.js", "/assets/Page-E05rCjVO.js", "/assets/BlockStack-yzVWW-Wn.js", "/assets/Labelled-BtZgj0AZ.js", "/assets/LegacyStack-Df93zAV5.js", "/assets/Card-CBmA3d8m.js", "/assets/use-component-did-mount-CJAKqZ06.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js", "/assets/Thumbnail-BbgnN8DA.js", "/assets/NoteIcon.svg-e2kWmJZg.js", "/assets/debounce-BHiWcPok.js", "/assets/app.SelectProducts-D1gvSQUh.js", "/assets/XSmallIcon.svg-smtEa8NW.js", "/assets/TextField-tplV-Sz1.js", "/assets/EventListener-CBOuXQew.js", "/assets/context-ldBvQp3i.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-Dg8lvgip.js", "imports": ["/assets/index-7zqVQZSl.js", "/assets/FileContext-DmFvwVpW.js", "/assets/index-BtM0mGov.js", "/assets/debounce-BHiWcPok.js", "/assets/Labelled-BtZgj0AZ.js", "/assets/BlockStack-yzVWW-Wn.js", "/assets/context-ldBvQp3i.js", "/assets/LegacyStack-Df93zAV5.js", "/assets/Thumbnail-BbgnN8DA.js", "/assets/use-component-did-mount-CJAKqZ06.js", "/assets/Page-E05rCjVO.js", "/assets/use-is-after-initial-mount-DRO0Qq26.js", "/assets/EventListener-CBOuXQew.js", "/assets/NoteIcon.svg-e2kWmJZg.js", "/assets/TextField-tplV-Sz1.js", "/assets/context-nAT6LI_3.js", "/assets/FormLayout-Dokohhgb.js", "/assets/XSmallIcon.svg-smtEa8NW.js"], "css": [] } }, "url": "/assets/manifest-761860e6.js", "version": "761860e6" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": true, "v3_singleFetch": false, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/FileContext": {
    id: "routes/FileContext",
    parentId: "root",
    path: "FileContext",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app.ProductSelector": {
    id: "routes/app.ProductSelector",
    parentId: "routes/app",
    path: "ProductSelector",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/app.SelectProducts": {
    id: "routes/app.SelectProducts",
    parentId: "routes/app",
    path: "SelectProducts",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/app.FileUpload": {
    id: "routes/app.FileUpload",
    parentId: "routes/app",
    path: "FileUpload",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/app.add_file": {
    id: "routes/app.add_file",
    parentId: "routes/app",
    path: "add_file",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route12
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
