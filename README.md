# Admin Iframe Container 2.x

Iframe that loads every VTEX admin application.

## 📦 Instaling

This a VTEX IO app that works in conjuntion with [`admin-proxy`](https://github.com/vtex/admin-proxy), so you need to install both:

```sh
vtex install vtex.admin-proxy
vtex install vtex.admin-iframe-container@2.x
```

## 👨🏾‍💻 Development

> If you don't have [`admin-proxy`](https://github.com/vtex/admin-proxy) installed, you must do so with `vtex install admin-proxy`.

You just need to to make the changes and link the app with `vtex link`.

### 🌎 Important peer apps

While developing, you should be aware of important apps:

- [admin](https://github.com/vtex/admin) - Application that uses this app. It will pass all props to `IframeContainer`.
- [admin-proxy](https://github.com/vtex/admin-proxy) - Rewrite requests from vtexcommerce urls to myvtex, so that the iframe can be displayed on modern browsers.
- [admin-iframe-compatibility](https://github.com/vtex/admin-iframe-compatibility) - Static jquery code that runs on legacy apps.

### 🏗 File structure

About this app files

```
/react - main source
../components - compose vtex io with core components
../..Iframe.ts - loads admin v2 & v3 apps
../..IframeContainer.ts - selects the correct iframe to load
../..IframeLegacy.ts - loads admin v1 apps
../..LegacyHeader.ts - header of admin v1 apps
../core - components that use admin-ui library
../../Navbar - renders the app title & back link of legacy apps
../../PageHeader - renders Navbar + Tabs
../../Tabs - renders Tabs of legacy apps
../hooks
../..useLoading.ts - triggers frame loading bar
../..useForceUpdate.ts - force updates a component
../util - common utilities
.Iframe.ts - exports components/IframeContainer
```
